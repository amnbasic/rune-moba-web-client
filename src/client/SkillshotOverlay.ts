import AbilityBarOverlay from '#/client/AbilityBarOverlay.js';
import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import { ClientProt } from '#/client/ClientProt.js';
import FineStream from '#/client/FineStream.js';
import type ClientEntity from '#/dash3d/ClientEntity.js';
import type ClientNpc from '#/dash3d/ClientNpc.js';
import World from '#/dash3d/World.js';
import Pix2D from '#/graphics/Pix2D.js';
import VarCache from '#/var/VarCache.js';

/**
 * SkillshotOverlay — LoL-style skillshot aim indicator. Direct port of the Java
 * client's SkillshotOverlay.java.
 *
 * While an ability is ARMED (Q/E/R), draws the ability's range RING around the
 * champion + a direction LINE / blast reticle / unit brackets at the cursor. MOBA
 * controls: LEFT-click over ground = FIRE (cast opcode 60, intercepted at the
 * walk-dispatch level in Client.doAction / the groundX block); Q again = cancel.
 *
 * Everything is DATA-DRIVEN from server varps — no per-champion knowledge here:
 * SHAPE varps 1301-1303 (slot Q/W/E targeting shape, -1 = no ability), RANGE varps
 * 1304-1306 (tiles), stamped by ~moba_kit_icons_stamp on champion pick + login.
 */
export default class SkillshotOverlay {
    /**
     * Key SLOT ids sent in the cast packet (= ^moba_slot_q/w/e): WHICH KEY was
     * pressed, NOT which ability — the server resolves slot -> ability via the
     * moba_champ_kit dbtable. Physical keys: Q=SLOT_Q, E=SLOT_W, R=SLOT_E (the W
     * key is eaten by the WASD camera remap).
     */
    static readonly SLOT_Q: number = 1;
    static readonly SLOT_W: number = 2;
    static readonly SLOT_E: number = 3;

    static readonly SHAPE_VARP_BASE: number = 1300; // + slot -> 1301..1303
    static readonly RANGE_VARP_BASE: number = 1303; // + slot -> 1304..1306
    static readonly CAST_VARP_BASE: number = 1310; // + slot -> 1311..1313 (cast_time, ticks)
    static readonly CHAN_VARP_BASE: number = 1313; // + slot -> 1314..1316 (channel_time, ticks)
    /** %moba_cast_until (varp 1317): server's cast/channel completion tick; 0 = idle/interrupted. */
    static readonly CAST_UNTIL_VARP: number = 1317;

    /** Fallback range ring (tiles) if a slot's range varp is unstamped (0). */
    static readonly DEFAULT_RANGE: number = 7;
    /** Blast reticle radius (tiles) for a ground-AoE (circle) shape. */
    static readonly CIRCLE_RADIUS: number = 2;

    /** ^moba_shape_* ids (constant.pack) — mirror the server's shape dispatch. */
    static readonly SHAPE_LINE: number = 0;
    static readonly SHAPE_CIRCLE: number = 1;
    static readonly SHAPE_UNIT: number = 2;
    static readonly SHAPE_SELF: number = 3;
    static readonly SHAPE_CHARGE: number = 4;
    static readonly SHAPE_DASH: number = 5;

    /** Projection heights (fine units): hovered unit's model top (bracket box) and mid-body (hover pick). */
    private static readonly UNIT_MODEL_TOP: number = 160;
    private static readonly UNIT_MODEL_MID: number = 80;

    /** Hover pick radius in screen px. */
    private static readonly HOVER_PIXELS: number = 32;

    /** Currently-armed key SLOT (SLOT_Q/W/E), or 0 if none. */
    static armedAbility: number = 0;

    // =====================================================================
    // PREDICTED CAST STATE (the overhead cast bar + instant facing). Started at
    // fire-click from the per-slot cast/channel varps — a server round trip can
    // never beat a locally-known 600ms duration. The server stays authoritative:
    // %moba_cast_until (varp 1317) zeroing early kills the bar (CC interrupt /
    // actual launch), own movement during the channel phase kills it (mirrors
    // the server's weak-queue wipe), death clears it. One active cast max.
    // =====================================================================
    /** Wall-clock ms bounds of the predicted cast: 0 = no active bar. */
    private static castStartMs: number = 0;
    private static castFillEndMs: number = 0; // end of the FILL phase (cast time)
    private static castEndMs: number = 0; // end of the DEPLETE phase (channel); == fill end if none
    /** True once varp 1317 has been seen carrying THIS cast's completion tick (arms the kill-signal). */
    private static castSawUntil: boolean = false;
    /** estimatedClock() at bar start — a 1317 value must exceed this to belong to this cast. */
    private static castBaseClock: number = 0;
    /** Local player's fine position at channel-phase entry (movement-cancel anchor); -1 = unset. */
    private static castAnchorX: number = -1;
    private static castAnchorZ: number = -1;

    /** Bar geometry/colours (the overhead HP bar's 30x5 look, slightly wider). */
    private static readonly CAST_BAR_W: number = 34;
    private static readonly CAST_BAR_H: number = 5;
    private static readonly CAST_FILL: number = 0xffcc33; // windup fills yellow
    private static readonly CAST_CHAN_FILL: number = 0xff3300; // channel depletes red
    private static readonly CAST_MISS: number = 0x1a140a;
    /** Facing-hold floor for instant casts (yaw snap must survive one glide segment). */
    private static readonly YAW_HOLD_MIN_MS: number = 400;

    /** Toggle-arm a slot; pressing the same key again disarms (cancel). */
    static toggleArm(ability: number): void {
        SkillshotOverlay.armedAbility = SkillshotOverlay.armedAbility === ability ? 0 : ability;
    }

    /**
     * Fire-click feedback: instantly SNAP the local champion's yaw toward the
     * fine aim point (League: you face the cast direction the moment you cast —
     * the server's facesquare arrives a sync tick later and agrees) + start the
     * predicted cast bar. Gated on the predicted cooldown (an on-cd press is
     * rejected server-side — no false turn, no false bar) and, for the
     * ground-AoE, on the range ring (out-of-range W walks first; the commit
     * tick is unknowable client-side, so no bar — accepted v1 limitation).
     * aimFineX/Z = -1 skips facing (aimless self cast).
     */
    private static applyCastFeedback(slot: number, aimFineX: number, aimFineZ: number): void {
        const player = Client.localPlayer;
        if (player === null) {
            return;
        }
        // cast_time N = N ticks of server lock (the RS2 side runs p_delay(N-1)).
        const castTicks = SkillshotOverlay.castTimeOf(slot);
        const chanTicks = SkillshotOverlay.chanTimeOf(slot);
        const castMs = castTicks * 600;
        const chanMs = chanTicks * 600;
        const shape = SkillshotOverlay.shapeOf(slot);
        let inRange = true;
        if (aimFineX >= 0) {
            const dx = aimFineX - player.x;
            const dz = aimFineZ - player.z;
            if (shape === SkillshotOverlay.SHAPE_CIRCLE || shape === SkillshotOverlay.SHAPE_UNIT) {
                const r = SkillshotOverlay.rangeOf(slot) << 7;
                inRange = dx * dx + dz * dz <= r * r;
            }
            // Facing is UNGATED by cooldown: a wrongly-suppressed turn was the original
            // complaint, and a brief turn on a server-rejected press is harmless.
            if (inRange && (dx !== 0 || dz !== 0)) {
                const yaw = ((325.949 * Math.atan2(-dx, -dz)) | 0) & 0x7ff;
                player.dstYaw = yaw;
                player.yaw = yaw;
                FineStream.castYawHoldUntilMs = Date.now() + Math.max(castMs + chanMs, SkillshotOverlay.YAW_HOLD_MIN_MS);
            }
        }
        // Bar: only when the commit is predictable (in range, known windup). The
        // UNIT shape's engine route (auto-walk) is never predictable — no bar
        // (its kit rows carry cast_time 0 until the v2 unit cast time lands).
        if (castTicks + chanTicks === 0 || !inRange || shape === SkillshotOverlay.SHAPE_UNIT) {
            return;
        }
        // Cooldown gate with 1 tick of tolerance: estimatedClock extrapolates wall-clock
        // between %moba_clock anchors and drifts up to a tick, which suppressed REAL bars
        // ("the bar isn't always showing up", user 2026-07-26). A boundary press the server
        // does reject now shows a 600ms bar that self-expires — the better failure.
        if (AbilityBarOverlay.cooldownLeft(slot - 1, AbilityBarOverlay.estimatedClock()) >= 2) {
            return;
        }
        const now = Date.now();
        SkillshotOverlay.castStartMs = now;
        SkillshotOverlay.castFillEndMs = now + castMs;
        SkillshotOverlay.castEndMs = now + castMs + chanMs;
        SkillshotOverlay.castSawUntil = false;
        // Clock stamp for the varp-1317 kill-signal: only a completion tick in the FUTURE
        // of this press belongs to THIS cast — %moba_cast_until is one global varp, and a
        // PREVIOUS cast's zero arriving late must not kill this bar.
        SkillshotOverlay.castBaseClock = AbilityBarOverlay.estimatedClock();
        SkillshotOverlay.castAnchorX = -1;
        SkillshotOverlay.castAnchorZ = -1;
    }

    private static clearCastBar(): void {
        SkillshotOverlay.castStartMs = 0;
        SkillshotOverlay.castFillEndMs = 0;
        SkillshotOverlay.castEndMs = 0;
        SkillshotOverlay.castSawUntil = false;
        SkillshotOverlay.castAnchorX = -1;
        SkillshotOverlay.castAnchorZ = -1;
    }

    /**
     * Overhead cast bar (League channel-bar style): floats just above the local
     * champion's head (above the overhead HP bar line), FILLS yellow over the
     * cast time, then DEPLETES red over the channel. Drawn from the gameDrawMain
     * MOBA overlay pass. Kill rules: predicted end reached; varp 1317 zeroed
     * after being seen non-zero (server launch OR CC interrupt — both end the
     * cast); own movement during the channel phase (the server channel died to
     * the weak-queue wipe); death.
     */
    static renderCastBar(left: number, top: number, width: number, height: number): void {
        if (SkillshotOverlay.castEndMs === 0) {
            return;
        }
        const player = Client.localPlayer;
        const now = Date.now();
        if (player === null || now >= SkillshotOverlay.castEndMs || Client.statEffectiveLevel[3] === 0) {
            SkillshotOverlay.clearCastBar();
            return;
        }
        // Server kill-signal: 1317 goes non-zero at commit (+1 sync tick), back to 0
        // at launch or interrupt. Only trust the zero once THIS cast's non-zero was
        // seen — the value must be a completion tick beyond the press-time clock, or
        // it's a stale value from a previous cast whose zero would kill this bar.
        const until = VarCache.var[SkillshotOverlay.CAST_UNTIL_VARP];
        if (until > SkillshotOverlay.castBaseClock) {
            SkillshotOverlay.castSawUntil = true;
        } else if (until === 0 && SkillshotOverlay.castSawUntil) {
            SkillshotOverlay.clearCastBar();
            return;
        }
        const inChannel = now >= SkillshotOverlay.castFillEndMs;
        if (inChannel) {
            // Movement-cancel anchor: capture the fine position entering the channel;
            // any real displacement after that means the player moved (right-click,
            // fine click or WASD) and the server's weak channel queue is gone.
            if (SkillshotOverlay.castAnchorX < 0) {
                SkillshotOverlay.castAnchorX = player.x;
                SkillshotOverlay.castAnchorZ = player.z;
            } else {
                const mdx = player.x - SkillshotOverlay.castAnchorX;
                const mdz = player.z - SkillshotOverlay.castAnchorZ;
                if (mdx * mdx + mdz * mdz > 64) {
                    // > 8 fine units (~1/16 tile): real movement, not rounding jitter
                    SkillshotOverlay.clearCastBar();
                    return;
                }
            }
        }
        const W = SkillshotOverlay.CAST_BAR_W;
        const H = SkillshotOverlay.CAST_BAR_H;
        let bx: number;
        let by: number;
        if (AbilityBarOverlay.barY > -1000) {
            // Fixed HUD anchor: centred just above the ability bar — the overhead
            // position collided with the HP/mana bars at some camera angles.
            bx = AbilityBarOverlay.barX + ((AbilityBarOverlay.barW - W) >> 1);
            by = AbilityBarOverlay.barY - H - 6;
        } else {
            // no bar on screen (kit not latched) — overhead fallback
            Client.getOverlayPos(height >> 1, player.getHeight() + 28, player.x, width >> 1, player.z);
            if (Client.projectX === -1 || Client.projectY === -1) {
                return;
            }
            bx = left + Client.projectX - (W >> 1);
            by = top + Client.projectY;
        }
        let frac: number;
        let fill: number;
        if (inChannel) {
            frac = 1 - (now - SkillshotOverlay.castFillEndMs) / (SkillshotOverlay.castEndMs - SkillshotOverlay.castFillEndMs);
            fill = SkillshotOverlay.CAST_CHAN_FILL;
        } else {
            frac = (now - SkillshotOverlay.castStartMs) / (SkillshotOverlay.castFillEndMs - SkillshotOverlay.castStartMs);
            fill = SkillshotOverlay.CAST_FILL;
        }
        let fillW = (W * frac) | 0;
        if (fillW < 0) {
            fillW = 0;
        }
        if (fillW > W) {
            fillW = W;
        }
        Pix2D.drawRect(bx - 1, by - 1, W + 2, H + 2, 0x000000);
        if (fillW > 0) {
            Pix2D.fillRect(bx, by, fillW, H, fill);
        }
        if (fillW < W) {
            Pix2D.fillRect(bx + fillW, by, W - fillW, H, SkillshotOverlay.CAST_MISS);
        }
    }

    /** Kit latches: temp varps wipe on region change; a stamped kit writes shape+
     *  range+icon together, so validity is keyed on the slot's icon varp. */
    private static readonly latchedShape: number[] = [-1, -1, -1];
    private static readonly latchedRange: number[] = [0, 0, 0];

    static resetKit(): void {
        for (let i = 0; i < 3; i++) {
            SkillshotOverlay.latchedShape[i] = -1;
            SkillshotOverlay.latchedRange[i] = 0;
        }
    }

    /** The kit ability SHAPE on this slot (^moba_shape_*), or -1 if no ability. */
    static shapeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return -1;
        }
        if (VarCache.var[1295 + slot] !== 0) {
            // icon varp stamped -> the shape varp is live; latch it
            SkillshotOverlay.latchedShape[slot - 1] = VarCache.var[SkillshotOverlay.SHAPE_VARP_BASE + slot];
        }
        return SkillshotOverlay.latchedShape[slot - 1];
    }

    /** The kit ability RANGE (tiles) on this slot; DEFAULT_RANGE if unstamped. */
    static rangeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return SkillshotOverlay.DEFAULT_RANGE;
        }
        if (VarCache.var[1295 + slot] !== 0) {
            SkillshotOverlay.latchedRange[slot - 1] = VarCache.var[SkillshotOverlay.RANGE_VARP_BASE + slot];
        }
        const r = SkillshotOverlay.latchedRange[slot - 1];
        return r > 0 ? r : SkillshotOverlay.DEFAULT_RANGE;
    }

    /** The kit ability CAST TIME (ticks) on this slot; 0 = instant. */
    static castTimeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return 0;
        }
        const t = VarCache.var[SkillshotOverlay.CAST_VARP_BASE + slot];
        return t > 0 ? t : 0;
    }

    /** The kit ability CHANNEL TIME (ticks) on this slot; 0 = none. */
    static chanTimeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return 0;
        }
        const t = VarCache.var[SkillshotOverlay.CHAN_VARP_BASE + slot];
        return t > 0 ? t : 0;
    }

    /** True if the current champion's kit has an ability on this slot. */
    static hasAbility(slot: number): boolean {
        return SkillshotOverlay.shapeOf(slot) >= 0;
    }

    /** True if this slot is an INSTANT SELF-cast — no aim, fires immediately. */
    static isInstantSelf(slot: number): boolean {
        return SkillshotOverlay.shapeOf(slot) === SkillshotOverlay.SHAPE_SELF;
    }

    /** True for slots whose ability targets a UNIT (point-and-click). */
    static isUnitTarget(ability: number): boolean {
        return SkillshotOverlay.shapeOf(ability) === SkillshotOverlay.SHAPE_UNIT;
    }

    /**
     * Slot keypress entry point: instant self-cast slots fire now; others
     * toggle-arm. (The Java client deferred the instant cast to the game loop
     * because AWT keys arrive on another thread; JS is single-threaded and the
     * key queue is drained inside the game loop, so firing directly is safe.)
     */
    static slotPressed(slot: number): void {
        if (!SkillshotOverlay.hasAbility(slot)) {
            return;
        }
        if (SkillshotOverlay.isInstantSelf(slot)) {
            SkillshotOverlay.castInstant(slot);
        } else {
            SkillshotOverlay.toggleArm(slot);
        }
    }

    /**
     * Opcode-60 cast for an instant (aimless) slot, aimed at the champion's OWN
     * tile — the same 8-byte wire the armed fire uses: [u8 slot][u8 plane]
     * [u16 LE absX][u16 LE absY][u8 subX][u8 subZ]. Sub-aim = tile centre; the
     * server ignores it for the self shape.
     */
    private static castInstant(slot: number): void {
        const player = Client.localPlayer;
        if (player === null) {
            return;
        }
        const absX = Client.mapBuildBaseX + (player.x >> 7);
        const absY = Client.mapBuildBaseZ + (player.z >> 7);
        Client.out.p1Enc(ClientProt.SKILLSHOT_CAST);
        Client.out.p1(slot);
        Client.out.p1(Client.minusedlevel);
        Client.out.p2_alt1(absX);
        Client.out.p2_alt1(absY);
        Client.out.p1(64);
        Client.out.p1(64);
        SkillshotOverlay.armedAbility = 0; // an instant cast also cancels any armed aim
        SkillshotOverlay.applyCastFeedback(slot, -1, -1); // aimless: bar only (if windup'd), no facing
    }

    /**
     * Armed GROUND fire at the clicked tile (Java GroundDecoration armed-fire
     * branch): FLUID sub-tile aim from the cursor via FineStream.fineSubForTile
     * so the shot direction isn't snapped to tile-centre angles.
     */
    static fireAtTile(tileX: number, tileZ: number): void {
        const slot = SkillshotOverlay.armedAbility;
        if (slot === 0) {
            return;
        }
        const sub = FineStream.fineSubForTile(tileX, tileZ);
        Client.out.p1Enc(ClientProt.SKILLSHOT_CAST);
        Client.out.p1(slot);
        Client.out.p1(Client.minusedlevel);
        Client.out.p2_alt1(Client.mapBuildBaseX + tileX);
        Client.out.p2_alt1(Client.mapBuildBaseZ + tileZ);
        Client.out.p1(sub >> 8);
        Client.out.p1(sub & 0xff);
        SkillshotOverlay.armedAbility = 0;
        // Instant facing + predicted cast bar toward the EXACT fine aim the packet carries.
        SkillshotOverlay.applyCastFeedback(slot, (tileX << 7) + (sub >> 8), (tileZ << 7) + (sub & 0xff));
    }

    /**
     * Armed UNIT-TARGET fire: send the hovered unit's WORLD INDEX + the
     * unit-cast sentinel (absY = 0xFFFF) — the server routes this through the
     * engine NPC_AP_T path (auto-walk into range, auto-face, LOS). CHAMPION
     * target: no unit under the cursor -> try the hovered enemy PLAYER, sent
     * with the champion sentinel (absY = 0xFFFE) -> the server's PLAYER_AP_T
     * route fires [applayert,magic:moba_unit_bolt]. Neither hovered = no fire;
     * the arm stays up (Java behaviour).
     */
    static fireUnitTarget(): void {
        const slot = SkillshotOverlay.armedAbility;
        if (slot === 0) {
            return;
        }
        let absX: number;
        let absY: number;
        let target: ClientEntity | null;
        const npcIdx = SkillshotOverlay.hoveredNpcIndex();
        if (npcIdx !== -1) {
            absX = npcIdx;
            absY = 0xffff;
            target = Client.npc[npcIdx];
        } else {
            const playerIdx = SkillshotOverlay.hoveredPlayerIndex();
            if (playerIdx === -1) {
                return;
            }
            absX = playerIdx;
            absY = 0xfffe;
            target = Client.players[playerIdx];
        }
        Client.out.p1Enc(ClientProt.SKILLSHOT_CAST);
        Client.out.p1(slot);
        Client.out.p1(Client.minusedlevel);
        Client.out.p2_alt1(absX);
        Client.out.p2_alt1(absY);
        Client.out.p1(64);
        Client.out.p1(64);
        SkillshotOverlay.armedAbility = 0;
        // Face the clicked unit instantly (the engine route auto-faces server-side, a sync tick
        // later). No bar: the engine may auto-walk first, so the commit tick is unpredictable.
        if (target !== null) {
            SkillshotOverlay.applyCastFeedback(slot, target.x, target.z);
        }
    }

    /** Per-frame draw from the gameDrawMain overlay pass (viewport rect). */
    static render(left: number, top: number, width: number, height: number): void {
        if (SkillshotOverlay.armedAbility === 0) {
            return;
        }
        const player = Client.localPlayer;
        if (player === null) {
            return;
        }
        // Champion FINE scene coords (sub-tile) — the exact values the engine
        // projects the local player with, so the ring/line pin pixel-perfectly.
        const champX = player.x;
        const champZ = player.z;
        Client.getOverlayPos(height >> 1, 0, champX, width >> 1, champZ);
        const champPx = Client.projectX;
        const champPy = Client.projectY;

        const ringColor = 0x33ccff; // light-blue range ring
        const lineColor = 0x00ff00; // green aim line + cursor marker

        // Range RING: max range as a dotted circle around the champion (32 points).
        const r = SkillshotOverlay.rangeOf(SkillshotOverlay.armedAbility) << 7;
        for (let k = 0; k < 32; k++) {
            const a = (Math.PI * 2.0 * k) / 32.0;
            const rx = champX + Math.round(Math.cos(a) * r);
            const rz = champZ + Math.round(Math.sin(a) * r);
            Client.getOverlayPos(height >> 1, 0, rx, width >> 1, rz);
            if (Client.projectX !== -1 && Client.projectY !== -1) {
                Pix2D.fillRect(left + Client.projectX - 1, top + Client.projectY - 1, 2, 2, ringColor);
            }
        }

        // UNIT-TARGET highlight: corner brackets around the hovered unit, or the
        // hovered enemy champion (2026-07-26 champion targeting).
        if (SkillshotOverlay.isUnitTarget(SkillshotOverlay.armedAbility)) {
            const hovered = SkillshotOverlay.hoveredNpc();
            if (hovered !== null) {
                SkillshotOverlay.drawUnitBrackets(left, top, width, height, hovered);
            } else {
                const hoveredP = SkillshotOverlay.hoveredPlayerIndex();
                if (hoveredP !== -1 && Client.players[hoveredP] !== null) {
                    SkillshotOverlay.drawUnitBrackets(left, top, width, height, Client.players[hoveredP]!);
                }
            }
        }

        // Cursor tile = the aim point (per-frame hover pick). -1 = cursor not over
        // the ground (ring stays, no line/marker).
        const tileX = World.hoverGroundX;
        const tileZ = World.hoverGroundZ;
        if (tileX === -1 || tileZ === -1) {
            return;
        }
        const worldX = (tileX << 7) + 64;
        const worldZ = (tileZ << 7) + 64;
        Client.getOverlayPos(height >> 1, 0, worldX, width >> 1, worldZ);
        if (Client.projectX === -1 || Client.projectY === -1) {
            return;
        }
        const sx = left + Client.projectX;
        const sy = top + Client.projectY;
        // FLUID reticle: a DIRECTION ability's aim line + marker track the raw
        // mouse pixel (zero quantization); an AoE lands on a tile, so its reticle
        // stays tile-anchored to match where it hits.
        const mouseSx = ClientMouseListener.mouseX;
        const mouseSy = ClientMouseListener.mouseY;
        const shape = SkillshotOverlay.shapeOf(SkillshotOverlay.armedAbility);
        const aimAtCursor = shape === SkillshotOverlay.SHAPE_LINE || shape === SkillshotOverlay.SHAPE_CHARGE || shape === SkillshotOverlay.SHAPE_DASH;
        const markerX = aimAtCursor ? mouseSx : sx;
        const markerY = aimAtCursor ? mouseSy : sy;

        const blast = SkillshotOverlay.abilityBlastRadius(SkillshotOverlay.armedAbility) << 7;
        if (blast > 0) {
            // BLAST RADIUS reticle (ground-AoE): dotted circle AT the cursor tile.
            const blastColor = 0xff3300;
            for (let k = 0; k < 32; k++) {
                const a = (Math.PI * 2.0 * k) / 32.0;
                const bx = worldX + Math.round(Math.cos(a) * blast);
                const bz = worldZ + Math.round(Math.sin(a) * blast);
                Client.getOverlayPos(height >> 1, 0, bx, width >> 1, bz);
                if (Client.projectX !== -1 && Client.projectY !== -1) {
                    Pix2D.fillRect(left + Client.projectX - 1, top + Client.projectY - 1, 2, 2, blastColor);
                }
            }
        } else if (aimAtCursor) {
            // Direction LINE: champion -> cursor as screen-space dots (~6px apart).
            if (champPx !== -1 && champPy !== -1) {
                const x0 = left + champPx;
                const y0 = top + champPy;
                const dx = mouseSx - x0;
                const dy = mouseSy - y0;
                let steps = (Math.max(Math.abs(dx), Math.abs(dy)) / 6) | 0;
                if (steps < 1) {
                    steps = 1;
                }
                for (let s = 1; s <= steps; s++) {
                    const lx = x0 + (((dx * s) / steps) | 0);
                    const ly = y0 + (((dy * s) / steps) | 0);
                    Pix2D.fillRect(lx - 1, ly - 1, 2, 2, lineColor);
                }
            }
        }

        // Cursor MARKER: a box + centre dot.
        const s = 6;
        Pix2D.fillRect(markerX - s, markerY - s, 2 * s, 2, lineColor);
        Pix2D.fillRect(markerX - s, markerY + s - 2, 2 * s, 2, lineColor);
        Pix2D.fillRect(markerX - s, markerY - s, 2, 2 * s, lineColor);
        Pix2D.fillRect(markerX + s - 2, markerY - s, 2, 2 * s, lineColor);
        Pix2D.fillRect(markerX - 1, markerY - 1, 3, 3, lineColor);
    }

    /** Blast radius (tiles) for a ground-AoE (circle) ability, 0 otherwise. */
    private static abilityBlastRadius(ability: number): number {
        return SkillshotOverlay.shapeOf(ability) === SkillshotOverlay.SHAPE_CIRCLE ? SkillshotOverlay.CIRCLE_RADIUS : 0;
    }

    /**
     * Index (into Client.npc) of the NPC under the cursor, or -1. SCREEN-SPACE
     * pick: the active NPC whose projected mid-body is nearest the mouse, within
     * HOVER_PIXELS — robust to camera pitch and works for unclickable units
     * (vislevel=hide dummies). The SERVER decides which units are valid.
     */
    static hoveredNpcIndex(): number {
        const mx = ClientMouseListener.mouseX - FineStream.viewportX;
        const my = ClientMouseListener.mouseY - FineStream.viewportY;
        if (mx < 0 || my < 0 || mx >= FineStream.viewportW || my >= FineStream.viewportH) {
            return -1; // mouse not over the 3D viewport
        }
        let best = -1;
        let bestDist = SkillshotOverlay.HOVER_PIXELS * SkillshotOverlay.HOVER_PIXELS;
        for (let i = 0; i < Client.npcCount; i++) {
            const idx = Client.npcIds[i];
            const n = Client.npc[idx];
            if (n === null) {
                continue;
            }
            Client.getOverlayPos(FineStream.viewportH >> 1, SkillshotOverlay.UNIT_MODEL_MID, n.x, FineStream.viewportW >> 1, n.z);
            if (Client.projectX === -1 || Client.projectY === -1) {
                continue;
            }
            const dx = Client.projectX - mx;
            const dy = Client.projectY - my;
            const d = dx * dx + dy * dy;
            if (d < bestDist) {
                bestDist = d;
                best = idx;
            }
        }
        return best;
    }

    /** The NPC under the cursor, or null. */
    static hoveredNpc(): ClientNpc | null {
        const idx = SkillshotOverlay.hoveredNpcIndex();
        return idx === -1 ? null : Client.npc[idx];
    }

    /**
     * Index of the enemy PLAYER under the cursor, or -1 — same screen-space
     * nearest-mid-body pick as hoveredNpcIndex, over the rendered player list,
     * excluding the local champion. The SERVER decides validity (team gates in
     * [applayert,magic:moba_unit_bolt]).
     */
    static hoveredPlayerIndex(): number {
        const mx = ClientMouseListener.mouseX - FineStream.viewportX;
        const my = ClientMouseListener.mouseY - FineStream.viewportY;
        if (mx < 0 || my < 0 || mx >= FineStream.viewportW || my >= FineStream.viewportH) {
            return -1;
        }
        let best = -1;
        let bestDist = SkillshotOverlay.HOVER_PIXELS * SkillshotOverlay.HOVER_PIXELS;
        for (let i = 0; i < Client.playerCount; i++) {
            const idx = Client.playerIds[i];
            const p = Client.players[idx];
            if (p === null || p === Client.localPlayer) {
                continue;
            }
            Client.getOverlayPos(FineStream.viewportH >> 1, SkillshotOverlay.UNIT_MODEL_MID, p.x, FineStream.viewportW >> 1, p.z);
            if (Client.projectX === -1 || Client.projectY === -1) {
                continue;
            }
            const dx = Client.projectX - mx;
            const dy = Client.projectY - my;
            const d = dx * dx + dy * dy;
            if (d < bestDist) {
                bestDist = d;
                best = idx;
            }
        }
        return best;
    }

    /**
     * Corner-bracket highlight around a hovered unit: project feet + model-top,
     * draw four L-shaped brackets bounding the model (auto-scales with camera
     * distance).
     */
    private static drawUnitBrackets(left: number, top: number, width: number, height: number, n: ClientEntity): void {
        Client.getOverlayPos(height >> 1, 0, n.x, width >> 1, n.z);
        const baseX = Client.projectX;
        const baseY = Client.projectY;
        Client.getOverlayPos(height >> 1, SkillshotOverlay.UNIT_MODEL_TOP, n.x, width >> 1, n.z);
        const topX = Client.projectX;
        const topY = Client.projectY;
        if (baseX === -1 || baseY === -1 || topX === -1 || topY === -1) {
            return;
        }
        const cx = left + (((baseX + topX) / 2) | 0);
        const sBaseY = top + baseY;
        const sTopY = top + topY;
        let boxTop = Math.min(sTopY, sBaseY);
        const boxBot = Math.max(sTopY, sBaseY);
        let h = boxBot - boxTop;
        if (h < 16) {
            h = 16;
            boxTop = boxBot - h;
        }
        let halfW = (h / 3) | 0;
        if (halfW < 8) {
            halfW = 8;
        }
        let arm = (h / 4) | 0;
        if (arm < 5) {
            arm = 5;
        }
        if (arm > 16) {
            arm = 16;
        }
        const color = 0xffff00;
        SkillshotOverlay.drawBracket(cx - halfW, boxTop, 1, 1, arm, color);
        SkillshotOverlay.drawBracket(cx + halfW, boxTop, -1, 1, arm, color);
        SkillshotOverlay.drawBracket(cx - halfW, boxBot, 1, -1, arm, color);
        SkillshotOverlay.drawBracket(cx + halfW, boxBot, -1, -1, arm, color);
    }

    /** One L-shaped corner bracket: 2px horizontal + vertical arms meeting at (x,y). */
    private static drawBracket(x: number, y: number, dx: number, dy: number, len: number, color: number): void {
        const hx = dx > 0 ? x : x - len;
        Pix2D.fillRect(hx, y, len, 2, color);
        const vy = dy > 0 ? y : y - len;
        Pix2D.fillRect(x, vy, 2, len, color);
    }
}
