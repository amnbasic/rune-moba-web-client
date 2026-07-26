import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import SkillshotOverlay from '#/client/SkillshotOverlay.js';
import IfType from '#/config/IfType.js';
import Pix2D from '#/graphics/Pix2D.js';
import PixLoader from '#/graphics/PixLoader.js';
import type SoftwarePix32 from '#/graphics/SoftwarePix32.js';
import VarCache from '#/var/VarCache.js';

/**
 * AbilityBarOverlay — the League-style ability bar, RS-skinned. Direct port of the
 * Java client's AbilityBarOverlay.java.
 *
 * Four bevelled slots bottom-centre of the 3D viewport, labelled with the PHYSICAL
 * keys (Q / E / R + an inert T box reserved for the ult). Everything shown is SERVER
 * DATA over varps — no per-champion knowledge is hardcoded here:
 *  - Icons: %moba_icon_q/w/e (varps 1296-1298) = packed cache sprite ids
 *    (groupId<<8, the raw IF3 `sprite=` value) — unpacked with >>8 for the js5
 *    group loader, file 0. 0 = empty slot (dim box).
 *  - Cooldowns: %moba_cd_q/w/e (varps 1289-1291) = the map_clock tick the slot is
 *    ready again; %moba_clock (varp 1299) anchors the client's local 600ms/tick
 *    extrapolation for the darkened sweep + seconds text.
 *  - Armed state: SkillshotOverlay.armedAbility highlights the armed slot's border.
 *  - HP + mana bars above the slots: HP mirrors the stat arrays (skill 3); mana
 *    reads %moba_mana / %moba_mana_max (varps 1307/1308, reserved — renders full
 *    until the server stamps them).
 *
 * Clicking a slot goes through the STANDARD menu system: a "Cast Q/E/R" row is
 * injected when a slot is hovered (menu build pass) and dispatched in doAction.
 */
export default class AbilityBarOverlay {
    private static readonly CD_VARP: number[] = [1289, 1290, 1291];
    private static readonly ICON_VARP: number[] = [1296, 1297, 1298];
    /** %moba_clock — map_clock baseline stamped at every cast commit. */
    private static readonly CLOCK_VARP: number = 1299;

    /** Menu action ids (unused 1700-1999 range): 1751/1752/1753 = cast slot 1/2/3. */
    private static readonly ACTION_CAST_SLOT_BASE: number = 1750;

    /** Slot geometry: box size fits the 24x24 spellbook sprites with RS-style padding. */
    private static readonly SLOT: number = 34;
    private static readonly GAP: number = 3;
    private static readonly SLOT_COUNT: number = 4; // 3 kit slots + the inert T (ult) box
    private static readonly BOTTOM_MARGIN: number = 6;

    /** HP + mana bars stacked above the slot row (League layout). */
    private static readonly BAR_H: number = 13;
    private static readonly BAR_GAP: number = 1;
    private static readonly BARS_TO_SLOTS: number = 8;
    private static readonly BARS_BLOCK: number = AbilityBarOverlay.BAR_H * 2 + AbilityBarOverlay.BAR_GAP + AbilityBarOverlay.BARS_TO_SLOTS;
    private static readonly HP_SKILL: number = 3;
    private static readonly MANA_VARP: number = 1307;
    private static readonly MANA_MAX_VARP: number = 1308;

    /** RS "stone panel" palette (classic interface browns). */
    private static readonly COL_FILL: number = 0x3e3529;
    private static readonly COL_BEVEL_LIGHT: number = 0x6a5c46;
    private static readonly COL_BEVEL_DARK: number = 0x2a2419;
    private static readonly COL_ARMED: number = 0xffff00;
    private static readonly COL_CD_TEXT: number = 0xffff00;
    private static readonly COL_KEY_TEXT: number = 0xffcc33;
    private static readonly COL_HP_FILL: number = 0x1fa24a;
    private static readonly COL_HP_MISS: number = 0x3a1010;
    private static readonly COL_MANA_FILL: number = 0x2458b0;
    private static readonly COL_MANA_MISS: number = 0x141e32;
    private static readonly COL_BAR_TEXT: number = 0xffffff;

    /** Physical key labels per slot (kit slots 1-3 = Q/E/R; T reserved for ult). */
    private static readonly KEY_LABELS: string[] = ['Q', 'E', 'R', 'T'];
    private static readonly MENU_CAST: string[] = ['Cast Q', 'Cast E', 'Cast R'];

    /** Bar rect in window coords, stored each render for the hover/click hit-tests
     *  (public: the cast/channel bar anchors just above this block). */
    static barX: number = -1000;
    static barY: number = -1000;
    static barW: number = 0;
    private static barH: number = 0;

    /** Icon sprite cache per slot (reloaded when the slot's icon varp changes). */
    private static readonly loadedIconId: number[] = [0, 0, 0];
    private static readonly iconSprite: (SoftwarePix32 | null)[] = [null, null, null];

    /** map_clock extrapolation: %moba_clock value + the wall-clock ms it arrived. */
    private static clockBase: number = 0;
    private static clockBaseMs: number = 0;

    /** Per-slot cooldown total (ticks), inferred at arm time for a proportional sweep. */
    private static readonly cdTotal: number[] = [0, 0, 0];
    private static readonly cdPrevLeft: number[] = [0, 0, 0];

    private static varp(id: number): number {
        return VarCache.var[id];
    }

    /**
     * Estimated current map_clock: the last %moba_clock anchor + elapsed wall-clock
     * ticks. PUBLIC: SkillshotOverlay's predicted cast bar gates on the same
     * cooldown estimate this bar renders (one predictor, not two).
     */
    static estimatedClock(): number {
        const anchor = AbilityBarOverlay.varp(AbilityBarOverlay.CLOCK_VARP);
        const now = Date.now();
        if (anchor !== AbilityBarOverlay.clockBase) {
            AbilityBarOverlay.clockBase = anchor;
            AbilityBarOverlay.clockBaseMs = now;
        }
        return AbilityBarOverlay.clockBase + (((now - AbilityBarOverlay.clockBaseMs) / 600) | 0);
    }

    /** Remaining cooldown ticks for a kit slot (0-2), 0 = ready. PUBLIC: see estimatedClock. */
    static cooldownLeft(slot: number, estClock: number): number {
        const left = AbilityBarOverlay.varp(AbilityBarOverlay.CD_VARP[slot]) - estClock;
        return left > 0 ? left : 0;
    }

    // =====================================================================
    // Hit-tests (window coords — the same space as the engine mouse fields).
    // =====================================================================
    static mouseOverBar(x: number, y: number): boolean {
        return x >= AbilityBarOverlay.barX && x < AbilityBarOverlay.barX + AbilityBarOverlay.barW && y >= AbilityBarOverlay.barY && y < AbilityBarOverlay.barY + AbilityBarOverlay.barH;
    }

    /** Kit slot index (0-2) under the point, or -1 (bars, the inert T box and gaps). */
    private static slotAt(x: number, y: number): number {
        if (!AbilityBarOverlay.mouseOverBar(x, y) || y < AbilityBarOverlay.barY + AbilityBarOverlay.BARS_BLOCK) {
            return -1;
        }
        const rel = x - AbilityBarOverlay.barX;
        const idx = (rel / (AbilityBarOverlay.SLOT + AbilityBarOverlay.GAP)) | 0;
        if (idx > 2 || rel - idx * (AbilityBarOverlay.SLOT + AbilityBarOverlay.GAP) >= AbilityBarOverlay.SLOT) {
            return -1;
        }
        return idx;
    }

    // =====================================================================
    // Menu integration — rows injected during the per-frame menu build.
    // =====================================================================
    static addMenuItemsIfHovered(mouseX: number, mouseY: number): void {
        const slot = AbilityBarOverlay.slotAt(mouseX, mouseY);
        if (slot === -1 || AbilityBarOverlay.varp(AbilityBarOverlay.ICON_VARP[slot]) === 0) {
            return;
        }
        Client.addMenuOption(0, AbilityBarOverlay.MENU_CAST[slot], AbilityBarOverlay.ACTION_CAST_SLOT_BASE + 1 + slot, 0, '', 0);
    }

    /** Called from Client.doAction. True if the action was ours. */
    static dispatchMenuAction(actionId: number): boolean {
        const slot = actionId - AbilityBarOverlay.ACTION_CAST_SLOT_BASE; // 1-3
        if (slot < 1 || slot > 3) {
            return false;
        }
        SkillshotOverlay.slotPressed(slot);
        return true;
    }

    // =====================================================================
    // Rendering (gameDrawMain overlay pass: viewport left/top/width/height).
    // =====================================================================
    /** Latched champ state: the client WIPES temp varps on every region change, so
     *  reading %champ_class live made the bar vanish mid-game — latch until logout. */
    private static champLatch: boolean = false;
    private static readonly latchedIcon: number[] = [0, 0, 0];

    static resetForLogout(): void {
        AbilityBarOverlay.champLatch = false;
        AbilityBarOverlay.latchedIcon[0] = 0;
        AbilityBarOverlay.latchedIcon[1] = 0;
        AbilityBarOverlay.latchedIcon[2] = 0;
        AbilityBarOverlay.barX = -1000;
        AbilityBarOverlay.barY = -1000;
    }

    static render(left: number, top: number, width: number, height: number): void {
        // No champion picked (%champ_class 1292 never seen) = no ability bar at all —
        // the reserved mana varps can hold garbage until ::champ stamps the kit.
        if (VarCache.var[1292] !== 0) {
            AbilityBarOverlay.champLatch = true;
        }
        if (!AbilityBarOverlay.champLatch) {
            AbilityBarOverlay.barX = -1000;
            AbilityBarOverlay.barY = -1000;
            return;
        }
        AbilityBarOverlay.barW = AbilityBarOverlay.SLOT_COUNT * AbilityBarOverlay.SLOT + (AbilityBarOverlay.SLOT_COUNT - 1) * AbilityBarOverlay.GAP;
        AbilityBarOverlay.barH = AbilityBarOverlay.BARS_BLOCK + AbilityBarOverlay.SLOT;
        AbilityBarOverlay.barX = left + (((width - AbilityBarOverlay.barW) / 2) | 0);
        AbilityBarOverlay.barY = top + height - AbilityBarOverlay.SLOT - AbilityBarOverlay.BOTTOM_MARGIN - AbilityBarOverlay.BARS_BLOCK;
        const slotsY = AbilityBarOverlay.barY + AbilityBarOverlay.BARS_BLOCK;
        const SLOT = AbilityBarOverlay.SLOT;

        // HP bar (top), mirroring the overhead health bar; mana bar (below), server WIP.
        const hpMax = Client.statBaseLevel[AbilityBarOverlay.HP_SKILL];
        const hpCur = Client.statEffectiveLevel[AbilityBarOverlay.HP_SKILL];
        AbilityBarOverlay.drawStatBar(AbilityBarOverlay.barY, hpCur, hpMax, AbilityBarOverlay.COL_HP_FILL, AbilityBarOverlay.COL_HP_MISS);
        AbilityBarOverlay.drawStatBar(AbilityBarOverlay.barY + AbilityBarOverlay.BAR_H + AbilityBarOverlay.BAR_GAP, AbilityBarOverlay.varp(AbilityBarOverlay.MANA_VARP), AbilityBarOverlay.varp(AbilityBarOverlay.MANA_MAX_VARP), AbilityBarOverlay.COL_MANA_FILL, AbilityBarOverlay.COL_MANA_MISS);

        const estClock = AbilityBarOverlay.estimatedClock();
        const mx = ClientMouseListener.mouseX;
        const my = ClientMouseListener.mouseY;

        for (let slot = 0; slot < AbilityBarOverlay.SLOT_COUNT; slot++) {
            const x = AbilityBarOverlay.barX + slot * (SLOT + AbilityBarOverlay.GAP);
            const kitSlot = slot < 3;
            let icon = kitSlot ? AbilityBarOverlay.varp(AbilityBarOverlay.ICON_VARP[slot]) : 0;
            if (kitSlot) {
                // region-change varp wipe: fall back to the last stamped icon
                if (icon !== 0) {
                    AbilityBarOverlay.latchedIcon[slot] = icon;
                } else {
                    icon = AbilityBarOverlay.latchedIcon[slot];
                }
            }
            const empty = icon === 0;

            // Box: 1px black outer, bevel (light top/left, dark bottom/right), stone fill.
            Pix2D.drawRect(x, slotsY, SLOT, SLOT, 0x000000);
            Pix2D.fillRect(x + 1, slotsY + 1, SLOT - 2, 1, AbilityBarOverlay.COL_BEVEL_LIGHT);
            Pix2D.fillRect(x + 1, slotsY + 1, 1, SLOT - 2, AbilityBarOverlay.COL_BEVEL_LIGHT);
            Pix2D.fillRect(x + 1, slotsY + SLOT - 2, SLOT - 2, 1, AbilityBarOverlay.COL_BEVEL_DARK);
            Pix2D.fillRect(x + SLOT - 2, slotsY + 1, 1, SLOT - 2, AbilityBarOverlay.COL_BEVEL_DARK);
            // Translucent fill so the scene ghosts through, League-HUD style.
            Pix2D.fillRectTrans(x + 2, slotsY + 2, SLOT - 4, SLOT - 4, AbilityBarOverlay.COL_FILL, 100);

            if (!empty) {
                const sprite = AbilityBarOverlay.iconFor(slot, icon);
                if (sprite !== null) {
                    sprite.plotSprite(x + (((SLOT - 24) / 2) | 0), slotsY + (((SLOT - 24) / 2) | 0));
                }
                const leftTicks = AbilityBarOverlay.cooldownLeft(slot, estClock);
                if (leftTicks > 0) {
                    // Track the cooldown total (an increase over last frame = a fresh arm).
                    if (leftTicks > AbilityBarOverlay.cdPrevLeft[slot]) {
                        AbilityBarOverlay.cdTotal[slot] = leftTicks;
                    }
                    // Proportional darkening sweep from the top (remaining fraction covered).
                    const total = AbilityBarOverlay.cdTotal[slot] > 0 ? AbilityBarOverlay.cdTotal[slot] : leftTicks;
                    let cover = (((SLOT - 4) * leftTicks) / total) | 0;
                    if (cover < 1) {
                        cover = 1;
                    }
                    Pix2D.fillRectTrans(x + 2, slotsY + 2, SLOT - 4, cover, 0x000000, 90);
                    // Seconds remaining, RS small font (right-anchored draw), 0.6s/tick rounded up.
                    if (Client.p12 !== null) {
                        const secs = ((leftTicks * 3 + 4) / 5) | 0;
                        Client.p12.rightString(String(secs), x + ((SLOT / 2) | 0) + 4, slotsY + ((SLOT / 2) | 0) + 4, AbilityBarOverlay.COL_CD_TEXT, 0x000000);
                    }
                }
                AbilityBarOverlay.cdPrevLeft[slot] = leftTicks;
                // Armed slot: bright border (the aim overlay is up for this slot).
                if (kitSlot && SkillshotOverlay.armedAbility === slot + 1) {
                    Pix2D.drawRect(x, slotsY, SLOT, SLOT, AbilityBarOverlay.COL_ARMED);
                    Pix2D.drawRect(x + 1, slotsY + 1, SLOT - 2, SLOT - 2, AbilityBarOverlay.COL_ARMED);
                } else if (AbilityBarOverlay.slotAt(mx, my) === slot) {
                    // Hover: light border feedback.
                    Pix2D.drawRect(x, slotsY, SLOT, SLOT, AbilityBarOverlay.COL_BEVEL_LIGHT);
                }
            } else {
                // Empty/inert slot: extra dark wash.
                Pix2D.fillRectTrans(x + 2, slotsY + 2, SLOT - 4, SLOT - 4, 0x000000, 120);
            }

            // Key label, bottom-right corner (shadowed; dimmer on empty slots).
            if (Client.p12 !== null) {
                Client.p12.rightString(AbilityBarOverlay.KEY_LABELS[slot], x + SLOT - 3, slotsY + SLOT - 3, empty ? 0x7a6e55 : AbilityBarOverlay.COL_KEY_TEXT, 0x000000);
            }
        }
    }

    /**
     * One stat bar (full module width): 1px black outline, fill = remaining
     * fraction, missColor = the spent portion, "cur/max" centred in the small
     * font. max <= 0 means the value hasn't arrived — draw a full bar with no
     * text rather than an alarming empty one.
     */
    private static drawStatBar(y: number, cur: number, max: number, fillColor: number, missColor: number): void {
        const barX = AbilityBarOverlay.barX;
        const barW = AbilityBarOverlay.barW;
        const BAR_H = AbilityBarOverlay.BAR_H;
        Pix2D.drawRect(barX, y, barW, BAR_H, 0x000000);
        const innerW = barW - 2;
        const innerH = BAR_H - 2;
        const fillW = max > 0 ? ((innerW * (cur < 0 ? 0 : cur > max ? max : cur)) / max) | 0 : innerW;
        if (fillW > 0) {
            Pix2D.fillRect(barX + 1, y + 1, fillW, innerH, fillColor);
        }
        if (fillW < innerW) {
            Pix2D.fillRect(barX + 1 + fillW, y + 1, innerW - fillW, innerH, missColor);
        }
        // Glassy depth: light wash on the top third, dark wash on the bottom half.
        Pix2D.fillRectTrans(barX + 1, y + 1, innerW, (innerH / 3) | 0, 0xffffff, 40);
        Pix2D.fillRectTrans(barX + 1, y + 1 + ((innerH / 2) | 0), innerW, innerH - ((innerH / 2) | 0), 0x000000, 50);
        const font = Client.p12;
        if (max > 0 && font !== null) {
            const text = cur + '/' + max;
            // rightString draws right-anchored at x, so centre = midpoint + half width.
            // Vertical: baseline = top + ascent + (boxH - ascent - descent) / 2.
            const tw = font.stringWid(text);
            // used-ascent (maxAscent) + descent — the engine's own box-centring pair
            const baseline = y + font.maxAscent + (((BAR_H - font.maxAscent - font.maxDescent) / 2) | 0);
            font.rightString(text, barX + ((barW / 2) | 0) + ((tw / 2) | 0), baseline, AbilityBarOverlay.COL_BAR_TEXT, 0x000000);
        }
    }

    /**
     * The slot's icon sprite via the interface-component js5 loader, cached until
     * the varp changes. The dbrow stores the RAW IF3 `sprite=` field (groupId<<8)
     * but the loader wants the js5 GROUP id — unpack with >>8, file 0. A null
     * return means the js5 group is still downloading — retry every frame.
     */
    private static iconFor(slot: number, iconId: number): SoftwarePix32 | null {
        if (AbilityBarOverlay.loadedIconId[slot] !== iconId) {
            AbilityBarOverlay.iconSprite[slot] = PixLoader.makeSoftwarePix32(IfType.field1176, 0, iconId >> 8);
            if (AbilityBarOverlay.iconSprite[slot] !== null) {
                AbilityBarOverlay.loadedIconId[slot] = iconId; // only latch once the group actually loaded
            }
        }
        return AbilityBarOverlay.iconSprite[slot];
    }
}
