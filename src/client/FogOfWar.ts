import { Client } from '#/client/Client.js';
import VarCache from '#/var/VarCache.js';
import Pix2D from '#/graphics/Pix2D.js';
import Pix3D from '#/dash3d/Pix3D.js';
import type ClientNpc from '#/dash3d/ClientNpc.js';
import type ClientPlayer from '#/dash3d/ClientPlayer.js';
import type IfType from '#/config/IfType.js';

/**
 * FogOfWar — client-side League-style fog of war. Direct port of the Java client's
 * FogOfWar.java (the spec): a per-scene visibility grid computed from the LOCAL team's
 * sight sources; enemy entities on fogged tiles are skipped at scene-insert time
 * (Client.addNpcs / addPlayers) so they can't be seen, hovered or clicked; minimap dots
 * are gated in minimapDraw, which also calls drawMinimapFog() to darken unseen tiles.
 * Projectiles/spotanims fired from fog stay VISIBLE by design (League behaviour).
 *
 * SIGHT MODEL: sources are the local player (13.5t), allied minions (12t) and allied
 * structures (13.5t), radial + cut off by sight-blocking edges: a tile is visible if a
 * source is in radius AND a cardinal-stepped Bresenham over the collision flags crosses
 * no blocking edge. Sight = PROJECTILE LINE, pure cache data (user ruling 2026-07-25):
 * only the projectile bits block vision, so every loc follows its own cache blockrange
 * flag — low fences see-over, tall fences/walls/doors/trees block.
 *
 * NPC teams are a hard-coded table (npc params don't survive the NpcType->LocType JS5
 * converter); player teams ride the custom team byte appended to the appearance block
 * (ClientPlayer.mobaTeam). Enable gate: %champ_team (varp 1300) != 0 — fully inert
 * outside MOBA play.
 */
export default class FogOfWar {
    private static readonly TEAM_VARP = 1300; // %champ_team, 0 = no team = fog off
    private static readonly TEAM_SPLIT_X = 2560; // structures: west = red

    // squared sight radii in tiles: champ/turret 1350u = 13.5t, minion 1200u = 12t
    private static readonly SIGHT_SQ_CHAMP = 182;
    private static readonly SIGHT_SQ_MINION = 144;
    private static readonly SIGHT_MAX = 14;

    private static readonly RECOMPUTE_MS = 100;

    // near-black shadow wash; density ramps with chamfer distance from the sight edge
    static readonly FOG_COLOR = 0x0a0a0c;
    private static readonly FOG_ALPHA_BY_DIST = [0, 60, 130, 185, 224];
    private static readonly FOG_DIST_MAX = FogOfWar.FOG_ALPHA_BY_DIST.length - 1;

    // sight-blocking edge masks: projectile-wall + projectile-loc bits ONLY
    private static readonly SIGHT_X_MINUS = 0x21000; // stepping x-1: dest east
    private static readonly SIGHT_X_PLUS = 0x30000; // stepping x+1: dest west
    private static readonly SIGHT_Y_MINUS = 0x20400; // stepping y-1: dest north
    private static readonly SIGHT_Y_PLUS = 0x24000; // stepping y+1: dest south

    /** visible[x][z], scene-local tiles — same index order as CollisionMap.flags. */
    private static readonly visible: boolean[][] = Array.from({ length: 104 }, () => new Array(104).fill(false));
    /** per-tile veil alpha (0-256) from the chamfer distance field — 0 on visible tiles */
    private static readonly tileAlpha: Int32Array[] = Array.from({ length: 104 }, () => new Int32Array(104));
    private static readonly fogDist: Int32Array[] = Array.from({ length: 104 }, () => new Int32Array(104));
    private static lastCompute = 0;
    private static lastBaseX = -1;
    private static lastBaseZ = -1;

    static enabled(): boolean {
        return VarCache.var[FogOfWar.TEAM_VARP] !== 0;
    }

    /** team of an npc: 1 red / 2 green / 0 neutral-unknown (neutral hides in fog too) */
    private static npcTeam(npcId: number, worldTileX: number): number {
        if (npcId === 4479 || npcId === 4480) {
            return 1;
        }
        if (npcId === 4488 || npcId === 4491) {
            return 2;
        }
        if (npcId === 4412 || npcId === 4420 || npcId === 4421) {
            return worldTileX < FogOfWar.TEAM_SPLIT_X ? 1 : 2;
        }
        return 0;
    }

    /** true = this npc is a fogged non-ally: skip its scene insert / minimap dot */
    static hideNpc(npc: ClientNpc | null): boolean {
        if (!FogOfWar.enabled() || npc === null || npc.type === null) {
            return false;
        }
        const lx = npc.x >> 7;
        const lz = npc.z >> 7;
        if (lx < 0 || lx > 103 || lz < 0 || lz > 103) {
            return false;
        }
        FogOfWar.maybeRecompute();
        const team = FogOfWar.npcTeam(npc.type.id, Client.mapBuildBaseX + lx);
        if (team !== 0 && team === VarCache.var[FogOfWar.TEAM_VARP]) {
            return false; // allies are always visible
        }
        return !FogOfWar.visible[lx][lz];
    }

    /** true = this player is fogged: never the local player, never an ally */
    static hidePlayer(player: ClientPlayer | null): boolean {
        if (!FogOfWar.enabled() || player === null || player === Client.localPlayer) {
            return false;
        }
        if (player.mobaTeam !== 0 && player.mobaTeam === VarCache.var[FogOfWar.TEAM_VARP]) {
            return false; // allies are always visible
        }
        const lx = player.x >> 7;
        const lz = player.z >> 7;
        if (lx < 0 || lx > 103 || lz < 0 || lz > 103) {
            return false;
        }
        FogOfWar.maybeRecompute();
        return !FogOfWar.visible[lx][lz];
    }

    /**
     * Darken fogged tiles on the minimap. Called from minimapDraw after the entity dots,
     * with the virtual map com rect (x, y = map origin; centre = renderWidth/2, renderHeight/2).
     * Mirrors minimapDrawDot's transform; culled to the map circle (the frame is drawn FIRST
     * on the web, so there is no mask-on-top — the radius cull keeps the wash inside).
     */
    static drawMinimapFog(x: number, y: number, com: IfType): void {
        const me = Client.localPlayer;
        if (!FogOfWar.enabled() || me === null) {
            return;
        }
        FogOfWar.maybeRecompute();
        const angle = (Client.macroMinimapAngle + Client.orbitCameraYaw) & 0x7ff;
        const zoom = Client.macroMinimapZoom + 256;
        const sin = ((Pix3D.sinTable[angle] * 256) / zoom) | 0;
        const cos = ((Pix3D.cosTable[angle] * 256) / zoom) | 0;
        const size = (((4 * 256 + zoom - 1) / zoom) | 0) + 1;
        const cx = x + ((com.renderWidth / 2) | 0);
        const cy = y + ((com.renderHeight / 2) | 0);
        const px = me.x >> 7;
        const pz = me.z >> 7;
        const x0 = px < 22 ? 0 : px - 22;
        const x1 = px > 81 ? 103 : px + 22;
        const z0 = pz < 22 ? 0 : pz - 22;
        const z1 = pz > 81 ? 103 : pz + 22;
        for (let tx = x0; tx <= x1; tx++) {
            for (let tz = z0; tz <= z1; tz++) {
                const a = FogOfWar.tileAlpha[tx][tz];
                if (a === 0) {
                    continue;
                }
                const u = (((tx << 7) + 64 - me.x) / 32) | 0;
                const v = (((tz << 7) + 64 - me.z) / 32) | 0;
                if (u * u + v * v > 6400) {
                    continue; // coarse cull (Java parity)
                }
                const ry = (cos * v - u * sin) >> 16;
                const rx = (sin * v + u * cos) >> 16;
                const rectX = cx + rx + 4 - ((size / 2) | 0);
                const rectY = cy - ry - 4 - ((size / 2) | 0);
                const offs = com.graphicMaskLineOffsets;
                const lens = com.graphicMaskLineLengths;
                if (offs === null || lens === null) {
                    Pix2D.fillRectTrans(rectX, rectY, size, size, FogOfWar.FOG_COLOR, a);
                } else {
                    // clip each row to the map-circle mask (frame is drawn FIRST on the web,
                    // so there is no mask-on-top — this reaches the true circle edge cleanly)
                    for (let py = rectY; py < rectY + size; py++) {
                        const row = py - y;
                        if (row < 0 || row >= lens.length) {
                            continue;
                        }
                        const rowX0 = x + offs[row];
                        const rowX1 = rowX0 + lens[row];
                        const sx0 = rectX > rowX0 ? rectX : rowX0;
                        const sx1 = rectX + size < rowX1 ? rectX + size : rowX1;
                        if (sx1 > sx0) {
                            Pix2D.fillRectTrans(sx0, py, sx1 - sx0, 1, FogOfWar.FOG_COLOR, a);
                        }
                    }
                }
            }
        }
    }

    static maybeRecompute(): void {
        const now = performance.now();
        if (now - FogOfWar.lastCompute < FogOfWar.RECOMPUTE_MS && FogOfWar.lastBaseX === Client.mapBuildBaseX && FogOfWar.lastBaseZ === Client.mapBuildBaseZ) {
            return;
        }
        FogOfWar.lastCompute = now;
        FogOfWar.lastBaseX = Client.mapBuildBaseX;
        FogOfWar.lastBaseZ = Client.mapBuildBaseZ;
        FogOfWar.recompute();
    }

    private static recompute(): void {
        for (let x = 0; x < 104; x++) {
            for (let z = 0; z < 104; z++) {
                FogOfWar.visible[x][z] = false;
            }
        }
        const me = Client.localPlayer;
        if (me === null) {
            return;
        }
        const plane = Client.minusedlevel;
        const clip = plane >= 0 && plane < Client.collision.length && Client.collision[plane] !== null ? Client.collision[plane]!.flags : null;
        FogOfWar.stamp(clip, me.x >> 7, me.z >> 7, FogOfWar.SIGHT_SQ_CHAMP);
        const myTeam = VarCache.var[FogOfWar.TEAM_VARP];
        for (let i = 0; i < Client.npcCount; i++) {
            const npc = Client.npc[Client.npcIds[i]];
            if (npc === null || npc.type === null || !npc.ready()) {
                continue;
            }
            const lx = npc.x >> 7;
            const lz = npc.z >> 7;
            if (lx < 0 || lx > 103 || lz < 0 || lz > 103) {
                continue;
            }
            const id = npc.type.id;
            if (FogOfWar.npcTeam(id, Client.mapBuildBaseX + lx) !== myTeam) {
                continue;
            }
            const minion = id === 4479 || id === 4480 || id === 4488 || id === 4491;
            FogOfWar.stamp(clip, lx, lz, minion ? FogOfWar.SIGHT_SQ_MINION : FogOfWar.SIGHT_SQ_CHAMP);
        }
        // allied CHAMPIONS share sight (team byte via appearance — ClientPlayer.mobaTeam)
        for (let i = 0; i < Client.playerCount; i++) {
            const p = Client.players[Client.playerIds[i]];
            if (p === null || p === me || p.mobaTeam === 0 || p.mobaTeam !== myTeam || !p.ready()) {
                continue;
            }
            const lx = p.x >> 7;
            const lz = p.z >> 7;
            if (lx < 0 || lx > 103 || lz < 0 || lz > 103) {
                continue;
            }
            FogOfWar.stamp(clip, lx, lz, FogOfWar.SIGHT_SQ_CHAMP);
        }
        // soft-edge veil field: exact 4-neighbour chamfer distance from the visible set
        for (let x = 0; x < 104; x++) {
            for (let z = 0; z < 104; z++) {
                FogOfWar.fogDist[x][z] = FogOfWar.visible[x][z] ? 0 : 99;
            }
        }
        for (let x = 0; x < 104; x++) {
            for (let z = 0; z < 104; z++) {
                let d = FogOfWar.fogDist[x][z];
                if (x > 0 && FogOfWar.fogDist[x - 1][z] + 1 < d) {
                    d = FogOfWar.fogDist[x - 1][z] + 1;
                }
                if (z > 0 && FogOfWar.fogDist[x][z - 1] + 1 < d) {
                    d = FogOfWar.fogDist[x][z - 1] + 1;
                }
                FogOfWar.fogDist[x][z] = d;
            }
        }
        for (let x = 103; x >= 0; x--) {
            for (let z = 103; z >= 0; z--) {
                let d = FogOfWar.fogDist[x][z];
                if (x < 103 && FogOfWar.fogDist[x + 1][z] + 1 < d) {
                    d = FogOfWar.fogDist[x + 1][z] + 1;
                }
                if (z < 103 && FogOfWar.fogDist[x][z + 1] + 1 < d) {
                    d = FogOfWar.fogDist[x][z + 1] + 1;
                }
                FogOfWar.tileAlpha[x][z] = FogOfWar.FOG_ALPHA_BY_DIST[d > FogOfWar.FOG_DIST_MAX ? FogOfWar.FOG_DIST_MAX : d];
                FogOfWar.fogDist[x][z] = d;
            }
        }
    }

    /** mark every tile in radius of a sight source that the source has line-of-sight to */
    private static stamp(clip: Int32Array[] | null, sx: number, sz: number, radiusSq: number): void {
        const x0 = sx < FogOfWar.SIGHT_MAX ? 0 : sx - FogOfWar.SIGHT_MAX;
        const x1 = sx > 103 - FogOfWar.SIGHT_MAX ? 103 : sx + FogOfWar.SIGHT_MAX;
        const z0 = sz < FogOfWar.SIGHT_MAX ? 0 : sz - FogOfWar.SIGHT_MAX;
        const z1 = sz > 103 - FogOfWar.SIGHT_MAX ? 103 : sz + FogOfWar.SIGHT_MAX;
        for (let x = x0; x <= x1; x++) {
            const dx = x - sx;
            for (let z = z0; z <= z1; z++) {
                if (FogOfWar.visible[x][z]) {
                    continue;
                }
                const dz = z - sz;
                if (dx * dx + dz * dz > radiusSq) {
                    continue;
                }
                if (clip === null || FogOfWar.los(clip, sx, sz, x, z)) {
                    FogOfWar.visible[x][z] = true;
                }
            }
        }
    }

    /** cardinal-stepped Bresenham LOS: checks the edge crossed into each next tile */
    private static los(clip: Int32Array[], x0: number, z0: number, x1: number, z1: number): boolean {
        const dx = x1 > x0 ? x1 - x0 : x0 - x1;
        const dz = z1 > z0 ? z1 - z0 : z0 - z1;
        const sx = x1 > x0 ? 1 : -1;
        const sz = z1 > z0 ? 1 : -1;
        let x = x0;
        let z = z0;
        let err = dx - dz;
        while (x !== x1 || z !== z1) {
            const e2 = 2 * err;
            if (x !== x1 && (e2 > -dz || z === z1)) {
                const nx = x + sx;
                if ((clip[nx][z] & (sx > 0 ? FogOfWar.SIGHT_X_PLUS : FogOfWar.SIGHT_X_MINUS)) !== 0) {
                    return false;
                }
                x = nx;
                err -= dz;
            } else {
                const nz = z + sz;
                if ((clip[x][nz] & (sz > 0 ? FogOfWar.SIGHT_Y_PLUS : FogOfWar.SIGHT_Y_MINUS)) !== 0) {
                    return false;
                }
                z = nz;
                err += dx;
            }
        }
        return true;
    }

    // ---- Stage B: 3D ground veil — ground tiles darken their corner colours as they draw ----

    /** fog alpha at tile corner (cx, cz): average of the 4 tiles sharing it */
    private static cornerFogAlpha(cx: number, cz: number): number {
        const xa = cx > 0 ? cx - 1 : 0;
        const xb = cx < 104 ? cx : 103;
        const za = cz > 0 ? cz - 1 : 0;
        const zb = cz < 104 ? cz : 103;
        return (FogOfWar.tileAlpha[xa][za] + FogOfWar.tileAlpha[xb][za] + FogOfWar.tileAlpha[xa][zb] + FogOfWar.tileAlpha[xb][zb]) >> 2;
    }

    /**
     * Darken a ground vertex HSL colour by the fog at tile corner (cornerX, cornerZ).
     * light = (256-a)/2 scales the HSL luminance by (256-a)/256 via the engine's own
     * shade (World.adjustHslLightness). 12345678 (hidden-tile sentinel) passes through.
     * Caller gates on enabled().
     */
    static shadeGround(hsl: number, cornerX: number, cornerZ: number): number {
        if (hsl === 12345678) {
            return hsl;
        }
        const a = FogOfWar.cornerFogAlpha(cornerX, cornerZ);
        if (a <= 0) {
            return hsl;
        }
        return FogOfWar.adjustHslLightness((256 - a) >> 1, hsl);
    }

    /** Java GroundDecoration.method1043(light, hsl, 128): scale HSL luminance by light/128 */
    private static adjustHslLightness(light: number, hsl: number): number {
        if (hsl === -2) {
            return 12345678;
        }
        if (hsl === -1) {
            const l = light < 2 ? 2 : light > 126 ? 126 : light;
            return l;
        }
        let l = ((hsl & 0x7f) * light) >> 7;
        if (l < 2) {
            l = 2;
        } else if (l > 126) {
            l = 126;
        }
        return (hsl & 0xff80) + l;
    }
}
