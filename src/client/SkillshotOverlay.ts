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

    /** Toggle-arm a slot; pressing the same key again disarms (cancel). */
    static toggleArm(ability: number): void {
        SkillshotOverlay.armedAbility = SkillshotOverlay.armedAbility === ability ? 0 : ability;
    }

    /** The kit ability SHAPE on this slot (^moba_shape_*), or -1 if no ability. */
    static shapeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return -1;
        }
        return VarCache.var[SkillshotOverlay.SHAPE_VARP_BASE + slot];
    }

    /** The kit ability RANGE (tiles) on this slot; DEFAULT_RANGE if unstamped. */
    static rangeOf(slot: number): number {
        if (slot < SkillshotOverlay.SLOT_Q || slot > SkillshotOverlay.SLOT_E) {
            return SkillshotOverlay.DEFAULT_RANGE;
        }
        const r = VarCache.var[SkillshotOverlay.RANGE_VARP_BASE + slot];
        return r > 0 ? r : SkillshotOverlay.DEFAULT_RANGE;
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
        const npcIdx = SkillshotOverlay.hoveredNpcIndex();
        if (npcIdx !== -1) {
            absX = npcIdx;
            absY = 0xffff;
        } else {
            const playerIdx = SkillshotOverlay.hoveredPlayerIndex();
            if (playerIdx === -1) {
                return;
            }
            absX = playerIdx;
            absY = 0xfffe;
        }
        Client.out.p1Enc(ClientProt.SKILLSHOT_CAST);
        Client.out.p1(slot);
        Client.out.p1(Client.minusedlevel);
        Client.out.p2_alt1(absX);
        Client.out.p2_alt1(absY);
        Client.out.p1(64);
        Client.out.p1(64);
        SkillshotOverlay.armedAbility = 0;
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
