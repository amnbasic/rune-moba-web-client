import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import GameShell from '#/client/GameShell.js';
import { ClientProt } from '#/client/ClientProt.js';
import type ClientEntity from '#/dash3d/ClientEntity.js';
import ClientProj from '#/dash3d/ClientProj.js';
import ClientProjNode from '#/dash3d/ClientProjNode.js';
import MapSpotAnim from '#/dash3d/MapSpotAnim.js';
import MapSpotAnimNode from '#/dash3d/MapSpotAnimNode.js';

/**
 * FineStream — client side of the continuous combat plane. Direct port of the Java
 * client's FineStream.java (the byte oracle).
 *
 * Consumes fine-position packets carrying ABSOLUTE fine coordinates (128 units per
 * tile) and interpolates the streamed entity every 20ms client cycle, replacing the
 * tile walk interpolator (Client.routeMove) for entities flagged fineStreamed. Stream
 * state is stored in absolute fine units so region rebuilds (which rebase scene-local
 * coords) cannot corrupt it — the scene-local position is recomputed from the current
 * map base every frame.
 *
 * Opcode 210 (10 bytes): u16 BE npc worldIndex, i32 LE absFineX/absFineZ.
 * Opcode 211 (8 bytes): i32 LE absFineX/absFineZ for the LOCAL PLAYER.
 * Opcode 215 (10 bytes): u16 BE player index, i32 LE absFineX/absFineZ (remote players).
 * absFineX == -1 is the end-of-stream sentinel: the entity adopts its CURRENT streamed
 * position into the tile grid (the server guarantees it streamed the authoritative tile
 * centre immediately before) and normal interpolation resumes.
 *
 * LAYERING CONTRACT: the vanilla SYNC channel owns the LOGICAL tile (routeX/Z[0]) —
 * the server emits normal walk/run bits for glide steps and the sync readers apply
 * them unguarded (queue-only bookkeeping). The stream owns nothing but the RENDER
 * position. Viewer-relative ADD records depend on this: client and server must agree
 * on the viewer's tile at sync time, which only the sync channel itself can guarantee.
 */
export default class FineStream {
    /** Server stream cadence (100ms) divided by the 20ms client cycle. */
    static readonly STREAM_CYCLES: number = 5;

    /**
     * Stream LEASE: the fineStreamed flag expires if no packet refreshes it (movers
     * stream at 100ms, idle movers keepalive at 600ms — 2s means the server-side state
     * is gone or this client missed the sentinel). An edge-triggered flag diverges
     * forever on a missed edge; the lease makes staleness transient — the entity adopts
     * its last streamed position and vanilla sync resumes.
     */
    static readonly LEASE_CYCLES: number = 100;

    // 3D viewport rect on the canvas, stamped by gameDrawMain each frame — needed to
    // compare getOverlayPos projections (viewport-centred) against canvas mouse coords.
    static viewportX: number = 4;
    static viewportY: number = 4;
    static viewportW: number = 512;
    static viewportH: number = 334;

    static onFinePos(index: number, absFineX: number, absFineZ: number): void {
        if (index < 0 || index >= Client.npc.length) {
            return;
        }
        const npc = Client.npc[index];
        if (npc === null) {
            return;
        }
        FineStream.applyFinePos(npc, absFineX, absFineZ);
    }

    static onLocalFinePos(absFineX: number, absFineZ: number): void {
        const player = Client.localPlayer;
        if (player === null) {
            return;
        }
        FineStream.applyFinePos(player, absFineX, absFineZ);
    }

    static onRemotePlayerFinePos(index: number, absFineX: number, absFineZ: number): void {
        if (index < 0 || index >= Client.players.length) {
            return;
        }
        const player = Client.players[index];
        if (player === null || player === Client.localPlayer) {
            return; // self only ever streams via opcode 211
        }
        FineStream.applyFinePos(player, absFineX, absFineZ);
    }

    private static applyFinePos(entity: ClientEntity, absFineX: number, absFineZ: number): void {
        if (absFineX === -1) {
            FineStream.applyEndOfStream(entity);
            return;
        }
        if (!entity.fineStreamed) {
            entity.fineStreamed = true;
            entity.fineStreamFromX = absFineX;
            entity.fineStreamFromZ = absFineZ;
            // zero queue residue from before the stream — while streamed, walk bits
            // step routeX/Z[0] directly and never consume a queue
            entity.abortRoute();
        } else {
            entity.fineStreamFromX = FineStream.currentAbsX(entity);
            entity.fineStreamFromZ = FineStream.currentAbsZ(entity);
            // teleport-scale delta: snap instead of lerping across the map
            // (same idea as the walk interpolator's >256-fine-unit snap)
            if (Math.abs(absFineX - entity.fineStreamFromX) > 512 || Math.abs(absFineZ - entity.fineStreamFromZ) > 512) {
                entity.fineStreamFromX = absFineX;
                entity.fineStreamFromZ = absFineZ;
            }
        }
        entity.fineStreamToX = absFineX;
        entity.fineStreamToZ = absFineZ;
        entity.fineStreamStartCycle = Client.loopCycle;
        // routeX/Z[0] (the LOGICAL tile) is deliberately NOT touched: it is maintained
        // by the vanilla sync channel (the server emits walk bits for shadow steps),
        // which viewer-relative ADD records depend on. The stream owns only the RENDER
        // position.
    }

    private static applyEndOfStream(entity: ClientEntity): void {
        if (!entity.fineStreamed) {
            return;
        }
        entity.fineStreamed = false;
        // snap the render position to the LOGICAL tile (routeX/Z[0]) — it is
        // sync-maintained (walk bits flow even while streamed) and therefore
        // authoritative; vanilla interpolation resumes from exactly there
        const size = entity.size;
        entity.x = entity.routeX[0] * 128 + size * 64;
        entity.z = entity.routeZ[0] * 128 + size * 64;
        // clear stale walk state so routeMove/exactMove can't resume against
        // pre-stream waypoints or a stale forced-move window
        entity.spotanimId = -1;
        entity.exactMoveEnd = 0;
        entity.exactMoveStart = 0;
        entity.abortRoute();
    }

    /**
     * Per-frame replacement for the walk interpolator on streamed entities. Called
     * from Client.moveEntity instead of routeMove; the yaw smoother (entityFace) and
     * seq frame ticker (entityAnim) still run after it as normal.
     */
    static interpolate(entity: ClientEntity): void {
        // Sub-tick lerp: whole ticks + the fractional time into the current tick at
        // DRAW time, so 60-80Hz displays get smooth motion instead of beating
        // against the 50Hz logic clock (positions still land exactly on the Java
        // client's per-tick values at each tick boundary).
        const elapsed = Client.loopCycle - entity.fineStreamStartCycle + GameShell.tickFraction;
        if (elapsed > FineStream.LEASE_CYCLES) {
            FineStream.applyEndOfStream(entity);
            return;
        }
        let absX: number;
        let absZ: number;
        if (elapsed >= FineStream.STREAM_CYCLES) {
            absX = entity.fineStreamToX;
            absZ = entity.fineStreamToZ;
        } else if (elapsed <= 0) {
            absX = entity.fineStreamFromX;
            absZ = entity.fineStreamFromZ;
        } else {
            absX = entity.fineStreamFromX + ((((entity.fineStreamToX - entity.fineStreamFromX) * elapsed) / FineStream.STREAM_CYCLES) | 0);
            absZ = entity.fineStreamFromZ + ((((entity.fineStreamToZ - entity.fineStreamFromZ) * elapsed) / FineStream.STREAM_CYCLES) | 0);
        }
        entity.x = absX - Client.mapBuildBaseX * 128;
        entity.z = absZ - Client.mapBuildBaseZ * 128;
        const dx = entity.fineStreamToX - entity.fineStreamFromX;
        const dz = entity.fineStreamToZ - entity.fineStreamFromZ;
        if (dx !== 0 || dz !== 0) {
            // (self - target) argument order, matching the face-entity yaw math
            // (facing persists while standing — only movement updates it)
            entity.dstYaw = ((325.949 * Math.atan2(-dx, -dz)) | 0) & 0x7ff;
        }
        // moving = the segment has displacement AND is still fresh. The recency gate is
        // load-bearing: a settle/final packet can capture its 'from' mid-lerp (client
        // cycle phase race), leaving a tiny displacement that would otherwise loop the
        // walk anim forever on a standing entity.
        if ((dx !== 0 || dz !== 0) && elapsed <= FineStream.STREAM_CYCLES + 2) {
            let seq = entity.walkanim !== -1 ? entity.walkanim : entity.readyanim;
            // Gait pick with %moba_ms speeds living BETWEEN walk (21 fine per segment)
            // and run (43): flip at the ~1.5 tiles/tick midpoint with hysteresis —
            // engage run at >=34 fine/segment (34^2=1156), drop back to walk below 30
            // (30^2=900). The 4-unit band absorbs server coord rounding + clock jitter
            // that made a single threshold flap the seq walk<->run at up to 10Hz near
            // the boundary.
            const wasRun = entity.secondarySeqId === entity.runanim;
            if (dx * dx + dz * dz >= (wasRun ? 900 : 1156) && entity.runanim !== -1) {
                seq = entity.runanim;
            }
            entity.secondarySeqId = seq;
        } else {
            entity.secondarySeqId = entity.readyanim;
        }
    }

    private static currentAbsX(entity: ClientEntity): number {
        return entity.x + Client.mapBuildBaseX * 128;
    }

    private static currentAbsZ(entity: ClientEntity): number {
        return entity.z + Client.mapBuildBaseZ * 128;
    }

    // ---- M3: client-flown fine missiles (opcodes 212 spawn / 213 detonate) ----
    // The server sends fine endpoints once; the native projectile integrates the flight
    // itself (arc 0 + equal heights + no lockon = exactly linear, constant speed). The
    // registry maps wire ids to live projectile nodes for early detonation.

    private static readonly missiles: Map<number, ClientProjNode> = new Map();

    static onMissileSpawn(id: number, absStartX: number, absStartZ: number, absEndX: number, absEndZ: number, durationCycles: number, spotanimId: number, heightOff: number): void {
        FineStream.purgeDeadMissiles();
        const plane = Client.minusedlevel;
        const sx = absStartX - Client.mapBuildBaseX * 128;
        const sz = absStartZ - Client.mapBuildBaseZ * 128;
        const ex = absEndX - Client.mapBuildBaseX * 128;
        const ez = absEndZ - Client.mapBuildBaseZ * 128;
        if (sx < 0 || sx > 13311 || sz < 0 || sz > 13311 || ex < 0 || ex > 13311 || ez < 0 || ez > 13311) {
            return;
        }
        // x4 = the vanilla opcode-218 flight-height convention (the projectile decode
        // scales both height bytes by 4) — keeps the fine missile at the same altitude
        // as the tile sweep's bolt for the same ^moba_q_proj_h byte
        const sh = Client.getAvH(sx, sz, plane) - heightOff * 4;
        const eh = Client.getAvH(ex, ez, plane) - heightOff * 4;
        const missile = new ClientProj(spotanimId, plane, sx, sz, sh, Client.loopCycle, Client.loopCycle + durationCycles, 0, 0, 0, 0);
        missile.setTarget(ex, Client.loopCycle, eh, ez);
        const node = new ClientProjNode(missile);
        Client.projectiles.push(node);
        FineStream.missiles.set(id, node);
    }

    /**
     * Impact burst at a hit point. keepFlying = the missile PIERCED this target: play
     * the impact graphic but leave the projectile in flight so it carries on to the
     * next body (League: penetrating projectiles). Otherwise this is the terminal hit
     * and the projectile is removed.
     */
    static onMissileImpact(id: number, absX: number, absZ: number, impactSpotanim: number, height: number, keepFlying: boolean): void {
        FineStream.purgeDeadMissiles();
        if (!keepFlying) {
            const node = FineStream.missiles.get(id);
            FineStream.missiles.delete(id);
            if (node !== undefined && node.isLinked()) {
                node.unlink();
            }
        }
        const plane = Client.minusedlevel;
        const fx = absX - Client.mapBuildBaseX * 128;
        const fz = absZ - Client.mapBuildBaseZ * 128;
        if (fx < 0 || fx > 13311 || fz < 0 || fz > 13311) {
            return;
        }
        Client.spotanims.push(new MapSpotAnimNode(new MapSpotAnim(impactSpotanim, plane, fx, fz, Client.getAvH(fx, fz, plane) - height, 0, Client.loopCycle)));
    }

    /** Registry hygiene: expired projectiles and wholesale list clears (map rebuild,
     *  login reset) leave tombstones (unlinked nodes). */
    private static purgeDeadMissiles(): void {
        for (const [id, node] of FineStream.missiles) {
            if (!node.isLinked() || Client.loopCycle > node.proj.t2) {
                FineStream.missiles.delete(id);
            }
        }
    }

    /**
     * Sub-tile pick: the fine (subX,subZ) in [0,127] under the cursor within the given
     * LOCAL tile, chosen by projecting the tile interior (9x9 grid, 16-fine steps) and
     * taking the point whose screen projection lands nearest the click pixel. Returns
     * (subX << 8) | subZ; falls back to the tile centre (64,64) on projection failure.
     * Shared by the fine-move click (opcode 61) and the FLUID skillshot aim (opcode 60)
     * so a cast aims at the exact cursor point, not the tile-centre angle.
     */
    static fineSubForTile(tileX: number, tileZ: number): number {
        const mouseX = ClientMouseListener.mouseClickX;
        const mouseY = ClientMouseListener.mouseClickY;
        let bestSubX = 64;
        let bestSubZ = 64;
        let bestDist = 2147483647;
        for (let sz = 0; sz <= 128; sz += 16) {
            for (let sx = 0; sx <= 128; sx += 16) {
                Client.getOverlayPos(FineStream.viewportH >> 1, 0, tileX * 128 + sx, FineStream.viewportW >> 1, tileZ * 128 + sz);
                if (Client.projectX === -1 || Client.projectY === -1) {
                    continue;
                }
                const dx = FineStream.viewportX + Client.projectX - mouseX;
                const dy = FineStream.viewportY + Client.projectY - mouseY;
                const d = dx * dx + dy * dy;
                if (d < bestDist) {
                    bestDist = d;
                    bestSubX = sx;
                    bestSubZ = sz;
                }
            }
        }
        return (Math.min(bestSubX, 127) << 8) | Math.min(bestSubZ, 127);
    }

    /** Sub-tile ground click for fine-move mode (opcode 61: u16 LE absTileX, u8 subX,
     *  u16 LE absTileZ, u8 subZ). */
    static sendFineClick(tileX: number, tileZ: number): boolean {
        const sub = FineStream.fineSubForTile(tileX, tileZ);
        const subX = sub >> 8;
        const subZ = sub & 0xff;
        Client.out.p1Enc(ClientProt.FINEMOVE_CLICK);
        Client.out.p2_alt1(Client.mapBuildBaseX + tileX);
        Client.out.p1(subX);
        Client.out.p2_alt1(Client.mapBuildBaseZ + tileZ);
        Client.out.p1(subZ);
        return true;
    }

    // ---- debug overlay (::fm 6, opcode 216): label every rendered entity with
    // identity + LOGICAL tile + a '*' when fineStreamed. Two clients' screenshots
    // become directly comparable against the ::fm 5 server dump — whichever label
    // disagrees with the dump is the stale entity, and the '*' says whether a stream
    // flag is involved.

    static debugOverlay: boolean = false;

    /** Called from the post-scene overlay pass (gameDrawMain). */
    static renderDebug(left: number, top: number): void {
        if (!FineStream.debugOverlay || Client.p12 === null) {
            return;
        }
        for (let i = 0; i < Client.npcCount; i++) {
            const idx = Client.npcIds[i];
            const npc = Client.npc[idx];
            if (npc !== null) {
                FineStream.drawEntityLabel(left, top, npc, 'N' + idx);
            }
        }
        for (let i = 0; i < Client.playerCount; i++) {
            const idx = Client.playerIds[i];
            const player = Client.players[idx];
            if (player !== null) {
                FineStream.drawEntityLabel(left, top, player, 'P' + idx);
            }
        }
        const self = Client.localPlayer;
        if (self !== null) {
            FineStream.drawEntityLabel(left, top, self, 'ME');
        }
    }

    private static drawEntityLabel(left: number, top: number, entity: ClientEntity, tag: string): void {
        Client.getOverlayPos(FineStream.viewportH >> 1, 220, entity.x, FineStream.viewportW >> 1, entity.z);
        if (Client.projectX === -1 || Client.projectY === -1) {
            return;
        }
        // LOGICAL sync tile (routeX/Z[0]) — the client's authoritative-state mirror.
        // Must equal the server dump whenever the entity stands still; the render tile
        // (fine>>7) legitimately differs +-1 mid-step, so it is useless for divergence
        // detection.
        const tileX = Client.mapBuildBaseX + entity.routeX[0];
        const tileZ = Client.mapBuildBaseZ + entity.routeZ[0];
        const label = tag + (entity.fineStreamed ? '*' : '') + ' ' + tileX + ',' + tileZ;
        Client.p12!.drawString(label, left + Client.projectX + 45, top + Client.projectY, 0x00ffff, 0);
    }
}
