import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import ScreenMode from '#/client/ScreenMode.js';
import IfType from '#/config/IfType.js';
import Pix2D from '#/graphics/Pix2D.js';
import PixLoader from '#/graphics/PixLoader.js';
import type SoftwarePix32 from '#/graphics/SoftwarePix32.js';

/**
 * HudPanelOverlay — the MOBA HUD's panel-button grid. Direct port of the Java
 * client's HudPanelOverlay.java.
 *
 * In resizable/fullscreen mode the classic 14-tab strips are parked off-screen by
 * ScreenMode.applyLayout and the side panel keeps showing the INVENTORY. This
 * overlay draws a 3x2 grid of bevelled buttons directly BELOW that panel;
 * clicking one sends opcode 64 (byte panel id) and the server opens that
 * interface centred in the main window ([queue,moba_hud_open]) — WHICH interface
 * a button opens is content, not client code.
 *
 * Clicks go through the STANDARD menu system (rows injected on hover, dispatched
 * in doAction), like the ability bar / XP button.
 */
export default class HudPanelOverlay {
    /** Menu action ids — the unused 1700-1999 range (XP 1748, bar 1750-1753). */
    private static readonly ACTION_HUD_BASE: number = 1760;

    /** Outbound "open HUD panel" packet — byte panel id. Server: moba-hud-handler.ts. */
    private static readonly OPCODE_HUD_OPEN: number = 64;

    private static readonly SLOT: number = ScreenMode.HUD_SLOT;
    private static readonly GAP: number = ScreenMode.HUD_GAP;
    private static readonly COLS: number = ScreenMode.INV_COLS;
    private static readonly ROWS: number = ScreenMode.INV_ROWS;
    private static readonly GRID_W: number = HudPanelOverlay.COLS * HudPanelOverlay.SLOT + (HudPanelOverlay.COLS - 1) * HudPanelOverlay.GAP;
    private static readonly GRID_H: number = HudPanelOverlay.ROWS * HudPanelOverlay.SLOT + (HudPanelOverlay.ROWS - 1) * HudPanelOverlay.GAP;
    private static readonly PANEL_GAP: number = ScreenMode.HUD_BLOCK_GAP;
    /** Nominal tab-icon size the buttons centre on (the stock icons are ~32px). */
    private static readonly ICON_NOMINAL: number = 32;

    /** RS "stone panel" palette — identical to AbilityBarOverlay. */
    private static readonly COL_FILL: number = 0x3e3529;
    private static readonly COL_BEVEL_LIGHT: number = 0x6a5c46;
    private static readonly COL_BEVEL_DARK: number = 0x2a2419;

    /**
     * Button icons: cache sprite GROUP ids for the stock 464 tab icons, loaded
     * through the same js5 loader interface components use. Wrong picture = a
     * one-number fix here; what the button DOES is server-side (panel id).
     */
    private static readonly ICON_GROUP: number[] = [901, 898, 902, 903, 908, 907];

    /** Menu row text, parallel to ICON_GROUP. Panel id sent = index + 1. */
    private static readonly MENU_LABEL: string[] = ['Equipment', 'Stats', 'Prayer', 'Magic', 'Settings', 'Logout'];

    private static readonly COUNT: number = 6;

    /** Grid rect in window coords, stored each render for the hover/click hit-tests. */
    private static gridX: number = -1000;
    private static gridY: number = -1000;

    private static readonly loadedIconId: number[] = [0, 0, 0, 0, 0, 0];
    private static readonly iconSprite: (SoftwarePix32 | null)[] = [null, null, null, null, null, null];

    /**
     * The grid only exists in the resizable HUD — FIXED mode keeps the stock tab
     * strips. Also requires the GAMEFRAME (548) to be the root pane so it never
     * paints over the welcome screen (549).
     */
    private static active(): boolean {
        return ScreenMode.mode !== ScreenMode.FIXED && Client.toplevelinterface === 548;
    }

    // =====================================================================
    // Hit-tests (window coords).
    // =====================================================================
    static mouseOverGrid(x: number, y: number): boolean {
        return HudPanelOverlay.active() && x >= HudPanelOverlay.gridX && x < HudPanelOverlay.gridX + HudPanelOverlay.GRID_W && y >= HudPanelOverlay.gridY && y < HudPanelOverlay.gridY + HudPanelOverlay.GRID_H;
    }

    /** Button index (0-5) under the point, or -1 for the gaps. */
    private static buttonAt(x: number, y: number): number {
        if (!HudPanelOverlay.mouseOverGrid(x, y)) {
            return -1;
        }
        const relX = x - HudPanelOverlay.gridX;
        const relY = y - HudPanelOverlay.gridY;
        const col = (relX / (HudPanelOverlay.SLOT + HudPanelOverlay.GAP)) | 0;
        const row = (relY / (HudPanelOverlay.SLOT + HudPanelOverlay.GAP)) | 0;
        if (col >= HudPanelOverlay.COLS || row >= HudPanelOverlay.ROWS) {
            return -1;
        }
        if (relX - col * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP) >= HudPanelOverlay.SLOT || relY - row * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP) >= HudPanelOverlay.SLOT) {
            return -1;
        }
        const idx = row * HudPanelOverlay.COLS + col;
        return idx < HudPanelOverlay.COUNT ? idx : -1;
    }

    // =====================================================================
    // Menu integration — the XpDropOverlay / AbilityBarOverlay pattern.
    // =====================================================================
    static addMenuItemsIfHovered(mouseX: number, mouseY: number): void {
        const idx = HudPanelOverlay.buttonAt(mouseX, mouseY);
        if (idx === -1) {
            return;
        }
        Client.addMenuOption(0, HudPanelOverlay.MENU_LABEL[idx], HudPanelOverlay.ACTION_HUD_BASE + 1 + idx, 0, '', 0);
    }

    /** Called from Client.doAction. True if the action was ours. */
    static dispatchMenuAction(actionId: number): boolean {
        const panel = actionId - HudPanelOverlay.ACTION_HUD_BASE; // 1-6
        if (panel < 1 || panel > HudPanelOverlay.COUNT) {
            return false;
        }
        Client.out.p1Enc(HudPanelOverlay.OPCODE_HUD_OPEN);
        Client.out.p1(panel);
        return true;
    }

    // =====================================================================
    // Rendering. renderBacking() paints the item container's cell marks and is
    // hooked where the inventory component draws (so it sits UNDER the items);
    // render() draws the button grid in the overlay pass.
    // =====================================================================

    /**
     * CELL MARKS for the six item slots — com_83 (the stock 190x261 panel sprite)
     * is parked in this mode, so without this the items render on bare scene.
     * One bevelled box PER SLOT, the same box as the buttons below.
     */
    static renderBacking(): void {
        if (!HudPanelOverlay.active()) {
            return;
        }
        for (let idx = 0; idx < HudPanelOverlay.COLS * HudPanelOverlay.ROWS; idx++) {
            HudPanelOverlay.drawStoneBox(ScreenMode.tabPanelX + (idx % HudPanelOverlay.COLS) * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP), ScreenMode.tabPanelY + ((idx / HudPanelOverlay.COLS) | 0) * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP), HudPanelOverlay.SLOT, HudPanelOverlay.SLOT);
        }
    }

    static render(): void {
        if (!HudPanelOverlay.active()) {
            return;
        }
        // Anchor to the item container ScreenMode stamped this frame.
        HudPanelOverlay.gridX = ScreenMode.tabPanelX + (((ScreenMode.INV_PANEL_W - HudPanelOverlay.GRID_W) / 2) | 0);
        HudPanelOverlay.gridY = ScreenMode.tabPanelY + ScreenMode.INV_PANEL_H + HudPanelOverlay.PANEL_GAP;

        const hovered = HudPanelOverlay.buttonAt(ClientMouseListener.mouseX, ClientMouseListener.mouseY);

        for (let idx = 0; idx < HudPanelOverlay.COUNT; idx++) {
            const x = HudPanelOverlay.gridX + (idx % HudPanelOverlay.COLS) * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP);
            const y = HudPanelOverlay.gridY + ((idx / HudPanelOverlay.COLS) | 0) * (HudPanelOverlay.SLOT + HudPanelOverlay.GAP);

            HudPanelOverlay.drawStoneBox(x, y, HudPanelOverlay.SLOT, HudPanelOverlay.SLOT);

            const sprite = HudPanelOverlay.iconFor(idx);
            if (sprite !== null) {
                // Centre on the nominal tab-icon size; plotSprite applies the
                // sprite's own baked offsets, so measuring it here would double-shift.
                sprite.plotSprite(x + (((HudPanelOverlay.SLOT - HudPanelOverlay.ICON_NOMINAL) / 2) | 0), y + (((HudPanelOverlay.SLOT - HudPanelOverlay.ICON_NOMINAL) / 2) | 0));
            }
            if (hovered === idx) {
                Pix2D.drawRect(x, y, HudPanelOverlay.SLOT, HudPanelOverlay.SLOT, HudPanelOverlay.COL_BEVEL_LIGHT);
            }
        }
    }

    /** The shared HUD box: 1px black outer, bevel, translucent stone fill. */
    private static drawStoneBox(x: number, y: number, w: number, h: number): void {
        Pix2D.drawRect(x, y, w, h, 0x000000);
        Pix2D.fillRect(x + 1, y + 1, w - 2, 1, HudPanelOverlay.COL_BEVEL_LIGHT);
        Pix2D.fillRect(x + 1, y + 1, 1, h - 2, HudPanelOverlay.COL_BEVEL_LIGHT);
        Pix2D.fillRect(x + 1, y + h - 2, w - 2, 1, HudPanelOverlay.COL_BEVEL_DARK);
        Pix2D.fillRect(x + w - 2, y + 1, 1, h - 2, HudPanelOverlay.COL_BEVEL_DARK);
        Pix2D.fillRectTrans(x + 2, y + 2, w - 4, h - 4, HudPanelOverlay.COL_FILL, 100);
    }

    private static iconFor(idx: number): SoftwarePix32 | null {
        const group = HudPanelOverlay.ICON_GROUP[idx];
        if (HudPanelOverlay.loadedIconId[idx] !== group) {
            HudPanelOverlay.iconSprite[idx] = PixLoader.makeSoftwarePix32(IfType.field1176, 0, group);
            if (HudPanelOverlay.iconSprite[idx] !== null) {
                HudPanelOverlay.loadedIconId[idx] = group; // latch once the js5 group loaded
            }
        }
        return HudPanelOverlay.iconSprite[idx];
    }
}
