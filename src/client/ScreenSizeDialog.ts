import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import ScreenMode from '#/client/ScreenMode.js';
import Pix2D from '#/graphics/Pix2D.js';

/**
 * ScreenSizeDialog — a clickable in-viewport picker for the display size (::fs).
 * Direct port of the Java client's ScreenSizeDialog.java.
 *
 * Opened by typing ::fs (intercepted client-side in doCheat). A modal panel lists
 * size presets; clicking one applies it via ScreenMode.applyPreset — the click IS
 * the user gesture the browser Fullscreen API needs. The point is an FPS lever:
 * this is a software renderer, so cost scales with pixel count.
 *
 * While open the dialog is MODAL — mouseLoop routes the click here and consumes
 * it, so a click never leaks to the scene or the menus.
 */
export default class ScreenSizeDialog {
    /** Toggled by ::fs. While true the panel draws and captures all clicks. */
    static open: boolean = false;

    private static readonly TITLE: string = 'Screen Size';
    private static readonly LABELS: string[] = ['Fixed  765 x 503', '1024 x 768', '1280 x 720', '1600 x 900', 'Fullscreen (native)', 'Cancel'];
    /** Per-row target mode; -1 = cancel (just close). */
    private static readonly MODES: number[] = [ScreenMode.FIXED, ScreenMode.RESIZABLE, ScreenMode.RESIZABLE, ScreenMode.RESIZABLE, ScreenMode.FULLSCREEN, -1];
    private static readonly WS: number[] = [0, 1024, 1280, 1600, 0, 0];
    private static readonly HS: number[] = [0, 768, 720, 900, 0, 0];

    private static readonly COL_FILL: number = 0x2e2519;
    private static readonly COL_BORDER: number = 0x000000;
    private static readonly COL_BEVEL: number = 0x6a5c46;
    private static readonly COL_TITLE: number = 0xffcc33;
    private static readonly COL_TEXT: number = 0xe0d6c0;
    private static readonly COL_HOVER: number = 0xffff00;

    private static readonly PANEL_W: number = 200;
    private static readonly TITLE_H: number = 24;
    private static readonly ROW_H: number = 24;
    private static readonly PAD: number = 5;

    private static panelX: number = -1000;
    private static panelY: number = -1000;

    private static panelH(): number {
        return ScreenSizeDialog.TITLE_H + ScreenSizeDialog.LABELS.length * ScreenSizeDialog.ROW_H + ScreenSizeDialog.PAD;
    }

    /** Row index under (x, y): 0..n-1 a preset row, -1 in the panel but not a row, -2 outside. */
    private static rowAt(x: number, y: number): number {
        if (x < ScreenSizeDialog.panelX || x >= ScreenSizeDialog.panelX + ScreenSizeDialog.PANEL_W || y < ScreenSizeDialog.panelY || y >= ScreenSizeDialog.panelY + ScreenSizeDialog.panelH()) {
            return -2;
        }
        const rel = y - (ScreenSizeDialog.panelY + ScreenSizeDialog.TITLE_H);
        if (rel < 0) {
            return -1; // title strip
        }
        const row = (rel / ScreenSizeDialog.ROW_H) | 0;
        return row < ScreenSizeDialog.LABELS.length ? row : -1;
    }

    /** Modal click handler (mouseLoop). Applies or closes. */
    static handleClick(clickX: number, clickY: number): void {
        const row = ScreenSizeDialog.rowAt(clickX, clickY);
        if (row === -2) {
            ScreenSizeDialog.open = false; // click outside the panel = cancel
            return;
        }
        if (row < 0) {
            return; // title/padding: ignore, stay open
        }
        ScreenSizeDialog.open = false;
        const mode = ScreenSizeDialog.MODES[row];
        if (mode >= 0) {
            ScreenMode.applyPreset(mode, ScreenSizeDialog.WS[row], ScreenSizeDialog.HS[row]);
        }
    }

    /** Draw the panel (gameDrawMain overlay pass, on top of everything). */
    static render(left: number, top: number, width: number, height: number): void {
        if (!ScreenSizeDialog.open) {
            return;
        }
        const font = Client.p12;
        const h = ScreenSizeDialog.panelH();
        ScreenSizeDialog.panelX = left + (((width - ScreenSizeDialog.PANEL_W) / 2) | 0);
        ScreenSizeDialog.panelY = top + (((height - h) / 2) | 0);
        const panelX = ScreenSizeDialog.panelX;
        const panelY = ScreenSizeDialog.panelY;

        // Dim the viewport behind the panel (modal feel), then the bevelled panel.
        Pix2D.fillRectTrans(left, top, width, height, 0x000000, 120);
        Pix2D.fillRect(panelX, panelY, ScreenSizeDialog.PANEL_W, h, ScreenSizeDialog.COL_FILL);
        Pix2D.drawRect(panelX, panelY, ScreenSizeDialog.PANEL_W, h, ScreenSizeDialog.COL_BORDER);
        Pix2D.drawRect(panelX + 1, panelY + 1, ScreenSizeDialog.PANEL_W - 2, h - 2, ScreenSizeDialog.COL_BEVEL);

        if (font === null) {
            return;
        }
        const cx = panelX + ((ScreenSizeDialog.PANEL_W / 2) | 0);
        const tw = font.stringWid(ScreenSizeDialog.TITLE);
        font.rightString(ScreenSizeDialog.TITLE, cx + ((tw / 2) | 0), panelY + ScreenSizeDialog.TITLE_H - 7, ScreenSizeDialog.COL_TITLE, ScreenSizeDialog.COL_BORDER);
        Pix2D.fillRect(panelX + ScreenSizeDialog.PAD, panelY + ScreenSizeDialog.TITLE_H - 2, ScreenSizeDialog.PANEL_W - 2 * ScreenSizeDialog.PAD, 1, ScreenSizeDialog.COL_BEVEL);

        const hover = ScreenSizeDialog.rowAt(ClientMouseListener.mouseX, ClientMouseListener.mouseY);
        for (let i = 0; i < ScreenSizeDialog.LABELS.length; i++) {
            const ry = panelY + ScreenSizeDialog.TITLE_H + i * ScreenSizeDialog.ROW_H;
            if (i === hover) {
                Pix2D.fillRectTrans(panelX + 2, ry, ScreenSizeDialog.PANEL_W - 4, ScreenSizeDialog.ROW_H, 0xffffff, 40);
            }
            const lw = font.stringWid(ScreenSizeDialog.LABELS[i]);
            const baseline = ry + font.maxAscent + (((ScreenSizeDialog.ROW_H - font.maxAscent - font.maxDescent) / 2) | 0);
            font.rightString(ScreenSizeDialog.LABELS[i], cx + ((lw / 2) | 0), baseline, i === hover ? ScreenSizeDialog.COL_HOVER : ScreenSizeDialog.COL_TEXT, ScreenSizeDialog.COL_BORDER);
        }
    }
}
