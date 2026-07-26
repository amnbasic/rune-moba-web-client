import { Client } from '#/client/Client.js';
import GameShell from '#/client/GameShell.js';
import IfType from '#/config/IfType.js';
import Pix2D from '#/graphics/Pix2D.js';
import PixMap from '#/graphics/PixMap.js';
import VarCache from '#/var/VarCache.js';

/**
 * ScreenMode — FIXED / RESIZABLE / FULLSCREEN display modes. Direct port of the
 * Java client's ScreenMode.java, adapted to the browser surface model:
 *
 *  - The Java frame/canvas/GraphicsBuffer resize becomes canvas.width/height +
 *    a fresh PixMap master buffer (its ctor re-points Pix2D at the new pixels).
 *  - FULLSCREEN = the browser Fullscreen API on the canvas, sized to the screen.
 *  - The 464 gameframe is interface-driven (pane 548): the 3D viewport is the
 *    ct-1337 child (com_63), the minimap group ct-1338 (com_72). applyLayout()
 *    re-stamps pane 548's children every frame for the current mode — idempotent,
 *    survives interface re-decodes; FIXED stamps the cache baseline.
 *  - The scene projection centre is already clip-derived in this port
 *    (Pix3D.setClipping computes size/origin from the Pix2D clip), so no
 *    projection-centre patch is needed. The FOCAL stays the engine's baked 512
 *    for now (the Java sceneFocal constant-vertical-FOV refinement is a
 *    follow-up) — very wide windows render with a wider-angle look.
 *
 * The title/login screens stay fixed 765x503 (their art is hardcoded): any
 * non-FIXED mode auto-reverts off the game pane and the preferred window is
 * restored when the world pane comes back.
 */
export default class ScreenMode {
    static readonly FIXED: number = 0;
    static readonly RESIZABLE: number = 1;
    static readonly FULLSCREEN: number = 2;

    /** Varp id of %client_screenmode (::fs stamps mode+1; 0 = no opinion). */
    static readonly SCREENMODE_VARP: number = 1295;

    private static readonly PANE_ID: number = 548;

    static readonly FIXED_W: number = 765;
    static readonly FIXED_H: number = 503;
    static readonly FIXED_VP_W: number = 512;
    static readonly FIXED_VP_H: number = 334;

    /** X used to park border-art children off-screen in resizable modes. */
    private static readonly OFFSCREEN: number = -2000;

    static mode: number = ScreenMode.FIXED;

    /** The window restored every time you enter the world (process-scoped). */
    static preferredMode: number = ScreenMode.RESIZABLE;
    static preferredW: number = 1280;
    static preferredH: number = 720;

    /** Game pane visible last frame — detects the transition INTO the world. */
    private static prevInGame: boolean = false;
    /** Last screen-mode varp value acted on (obey only CHANGES — it is scope=temp). */
    private static lastSeenVarp: number = -1;

    /** Live 3D-viewport size (stamped by applyLayout). */
    static viewportWidth: number = ScreenMode.FIXED_VP_W;
    static viewportHeight: number = ScreenMode.FIXED_VP_H;

    /** Left edge of the minimap group after relayout (fixed: 550). */
    static minimapX: number = 550;

    /** Side (tab) panel rect after relayout — pane 548 com_82 (the inventory container). */
    static readonly TAB_PANEL_W: number = 190;
    static readonly TAB_PANEL_H: number = 261;
    static tabPanelX: number = 553;
    static tabPanelY: number = 205;

    /** MOBA HUD slot metric — ONE source of truth for items, cell marks and buttons. */
    static readonly HUD_SLOT: number = 34;
    static readonly HUD_GAP: number = 3;
    static readonly HUD_PITCH: number = ScreenMode.HUD_SLOT + ScreenMode.HUD_GAP;
    static readonly ITEM_SPRITE: number = 32;
    static readonly INV_SLOT_PAD: number = ScreenMode.HUD_PITCH - ScreenMode.ITEM_SPRITE;
    static readonly ITEM_INSET: number = (ScreenMode.HUD_SLOT - ScreenMode.ITEM_SPRITE) / 2;

    /** Inventory cropped to LoL's SIX item slots (3x2) — see the 149 patch below. */
    static readonly INV_COLS: number = 3;
    static readonly INV_ROWS: number = 2;
    static readonly INV_PANEL_W: number = ScreenMode.INV_COLS * ScreenMode.HUD_SLOT + (ScreenMode.INV_COLS - 1) * ScreenMode.HUD_GAP;
    static readonly INV_PANEL_H: number = ScreenMode.INV_ROWS * ScreenMode.HUD_SLOT + (ScreenMode.INV_ROWS - 1) * ScreenMode.HUD_GAP;

    static readonly HUD_BLOCK_GAP: number = 4;
    static readonly HUD_GRID_H: number = ScreenMode.INV_PANEL_H + ScreenMode.HUD_BLOCK_GAP;

    /** Fixed-mode XP button x = minimap left edge - 24; keep that relation in every mode. */
    static xpButtonX(): number {
        return ScreenMode.minimapX - 24;
    }

    /**
     * World-scene focal for CONSTANT VERTICAL FOV (OSRS-style): 512 * vh / 334, so a
     * wide window widens the view by its aspect ratio instead of the focal-512
     * fisheye. Full-res value — overlays project with this; the raster pass divides
     * by renderScale. Stamped by applyLayout.
     */
    static sceneFocal: number = 512;

    /**
     * 3D raster scale in non-FIXED modes: 2 = the scene renders at half resolution
     * into a scratch buffer and 2x-upscales (a software raster's cost is pixel
     * count — this is THE fullscreen perf lever). HUD/overlays stay full-res.
     * Toggled in the ScreenSizeDialog; FIXED mode always rasters 1:1.
     */
    static renderScale: number = 2;

    /** Half-res scene scratch buffer (lazily sized). */
    private static sceneBuffer: Int32Array | null = null;
    private static sceneBufferW: number = 0;
    private static sceneBufferH: number = 0;

    /** The scale the scene pass should raster at THIS frame. */
    static activeScale(): number {
        return ScreenMode.mode === ScreenMode.FIXED ? 1 : ScreenMode.renderScale;
    }

    /** Point Pix2D at the half-res scene scratch (clip = whole scratch). */
    static bindSceneBuffer(w: number, h: number): Int32Array {
        if (ScreenMode.sceneBuffer === null || ScreenMode.sceneBufferW !== w || ScreenMode.sceneBufferH !== h) {
            ScreenMode.sceneBuffer = new Int32Array(w * h + 1);
            ScreenMode.sceneBufferW = w;
            ScreenMode.sceneBufferH = h;
        }
        Pix2D.setPixels(ScreenMode.sceneBuffer, w, h);
        return ScreenMode.sceneBuffer;
    }

    /**
     * Nearest-neighbour upscale of the scene scratch into the frame rect
     * (x, y, w*scale, h*scale). Row-doubling keeps it a straight memory copy.
     */
    static blitSceneBuffer(frame: Int32Array, frameWidth: number, x: number, y: number, scale: number): void {
        const src = ScreenMode.sceneBuffer;
        if (src === null) {
            return;
        }
        const sw = ScreenMode.sceneBufferW;
        const sh = ScreenMode.sceneBufferH;
        for (let row = 0; row < sh; row++) {
            let si = row * sw;
            let di = (y + row * scale) * frameWidth + x;
            if (scale === 2) {
                for (let col = 0; col < sw; col++) {
                    const p = src[si++];
                    frame[di] = p;
                    frame[di + 1] = p;
                    di += 2;
                }
                // duplicate the doubled row
                frame.copyWithin(di - sw * 2 + frameWidth, di - sw * 2, di);
            } else {
                for (let col = 0; col < sw; col++) {
                    const p = src[si++];
                    for (let k = 0; k < scale; k++) {
                        frame[di + k] = p;
                    }
                    di += scale;
                }
                for (let k = 1; k < scale; k++) {
                    frame.copyWithin(di - sw * scale + frameWidth * k, di - sw * scale, di);
                }
            }
        }
    }

    private static fullscreenListenerBound: boolean = false;

    private static inGame(): boolean {
        // pane 548 (world) or 549 (welcome screen shown while already logged in)
        return Client.toplevelinterface === 548 || Client.toplevelinterface === 549;
    }

    /** Per-frame driver (start of gameDraw). */
    static tick(): void {
        if (!ScreenMode.fullscreenListenerBound) {
            ScreenMode.fullscreenListenerBound = true;
            document.addEventListener('fullscreenchange', (): void => {
                if (document.fullscreenElement === null && ScreenMode.mode === ScreenMode.FULLSCREEN) {
                    // user pressed ESC / left browser fullscreen — land on a windowed size
                    ScreenMode.applyPreset(ScreenMode.RESIZABLE, ScreenMode.preferredW, ScreenMode.preferredH);
                }
            });
        }
        const inGame = ScreenMode.inGame();
        if (inGame) {
            if (!ScreenMode.prevInGame) {
                // Just entered the world: restore the preferred window instead of
                // inheriting the title screen's forced FIXED. (FULLSCREEN cannot be
                // auto-restored — the browser requires a user gesture — so it lands
                // on the preferred RESIZABLE size instead.)
                const restore = ScreenMode.preferredMode === ScreenMode.FULLSCREEN ? ScreenMode.RESIZABLE : ScreenMode.preferredMode;
                ScreenMode.applyPreset(restore, ScreenMode.preferredW, ScreenMode.preferredH);
                ScreenMode.lastSeenVarp = VarCache.var[ScreenMode.SCREENMODE_VARP];
            } else {
                const want = VarCache.var[ScreenMode.SCREENMODE_VARP];
                if (want !== ScreenMode.lastSeenVarp) {
                    ScreenMode.lastSeenVarp = want;
                    // 0 = NO OPINION (scope=temp varps zero on login/region change);
                    // wire values are mode + 1 so FIXED stays commandable.
                    if (want !== 0) {
                        const wanted = want - 1;
                        if (wanted >= ScreenMode.FIXED && wanted <= ScreenMode.FULLSCREEN && wanted !== ScreenMode.mode) {
                            ScreenMode.setMode(wanted);
                        }
                    }
                }
            }
        } else if (ScreenMode.mode !== ScreenMode.FIXED) {
            // Title/login screens draw fixed 765x503 art.
            ScreenMode.setMode(ScreenMode.FIXED);
        }
        ScreenMode.prevInGame = inGame;
    }

    /**
     * Apply a preset chosen in the ScreenSizeDialog. Writes the varp locally so
     * tick() agrees and does not revert the choice (pure client concern).
     */
    static applyPreset(newMode: number, w: number, h: number): void {
        VarCache.var[ScreenMode.SCREENMODE_VARP] = newMode + 1;
        ScreenMode.lastSeenVarp = newMode + 1;
        ScreenMode.preferredMode = newMode;
        if (newMode === ScreenMode.RESIZABLE && w > 0 && h > 0) {
            ScreenMode.preferredW = w;
            ScreenMode.preferredH = h;
        }
        ScreenMode.setMode(newMode, true);
    }

    private static setMode(newMode: number, force: boolean = false): void {
        if (newMode === ScreenMode.mode && !force) {
            return;
        }
        ScreenMode.mode = newMode;
        if (newMode === ScreenMode.FULLSCREEN) {
            const sw = window.screen.width;
            const sh = window.screen.height;
            if (document.fullscreenElement === null) {
                // must run inside the user-gesture window (::fs Enter / dialog click)
                GameShell.canvas.requestFullscreen().catch((): void => {});
            }
            ScreenMode.applySize(Math.max(ScreenMode.FIXED_W, sw), Math.max(ScreenMode.FIXED_H, sh));
        } else {
            if (document.fullscreenElement !== null) {
                void document.exitFullscreen().catch((): void => {});
            }
            if (newMode === ScreenMode.RESIZABLE) {
                ScreenMode.applySize(Math.max(ScreenMode.FIXED_W, ScreenMode.preferredW), Math.max(ScreenMode.FIXED_H, ScreenMode.preferredH));
            } else {
                ScreenMode.applySize(ScreenMode.FIXED_W, ScreenMode.FIXED_H);
            }
        }
        // re-focus the canvas so QER/WASD keys keep working after mode flips
        GameShell.canvas.focus();
    }

    /** Resize the client surfaces: canvas + the master PixMap (re-points Pix2D). */
    private static applySize(w: number, h: number): void {
        if (GameShell.sWid === w && GameShell.sHei === h) {
            return;
        }
        GameShell.sWid = w;
        GameShell.sHei = h;
        GameShell.canvas.width = w;
        GameShell.canvas.height = h;
        GameShell.drawArea = new PixMap(h, w, GameShell.ctx);
        Client.redrawAllComponents();
    }

    /**
     * Stamp pane 548's top-level child geometry for the current mode/size. Runs
     * every frame before the pane draw — immune to interface cache re-decodes,
     * no restore bookkeeping (FIXED stamps the cache-baseline values).
     */
    static applyLayout(): void {
        // Interfaces only exist in-game (pane 548 / welcome 549); the title screens
        // draw without an interface tree — touching IfType there crashed gameDraw.
        if (Client.toplevelinterface !== 548 && Client.toplevelinterface !== 549) {
            ScreenMode.sceneFocal = 512;
            return;
        }
        // MOBA: crop the INVENTORY (cache interface 149 child 0) to LoL's SIX item
        // slots, 3x2, on the shared HUD pitch — cropping the REAL container keeps
        // clicks/drags/options/inv_transmit for free. Shrinking the arrays is safe:
        // inbound inv writes bounds-check, so items past slot 6 are dropped
        // client-side. Idempotent (guarded on the array length).
        // NOTE IfType.get(packed id) — the two-arg overload is (subId, id), NOT
        // (group, file), and a missing file yields UNDEFINED (not null): use ! guards.
        const inv = IfType.get((149 << 16) + 0);
        if (inv && inv.linkObjNumber !== null && inv.linkObjNumber.length !== ScreenMode.INV_COLS * ScreenMode.INV_ROWS) {
            inv.width = ScreenMode.INV_COLS;
            inv.height = ScreenMode.INV_ROWS;
            inv.linkObjType = new Int32Array(ScreenMode.INV_COLS * ScreenMode.INV_ROWS);
            inv.linkObjNumber = new Int32Array(ScreenMode.INV_COLS * ScreenMode.INV_ROWS);
            inv.marginX = ScreenMode.INV_SLOT_PAD;
            inv.marginY = ScreenMode.INV_SLOT_PAD;
            // Origin at the container's top-left + the inset that centres a 32px item
            // in a 34px cell — the stock origin is what made items look off-centre.
            inv.x = ScreenMode.ITEM_INSET;
            inv.y = ScreenMode.ITEM_INSET;
            inv.renderWidth = 0; // recomputed by the layout pass from the new grid
            inv.renderHeight = 0;
        }

        const w = GameShell.sWid;
        const h = GameShell.sHei;
        let vw: number;
        let vh: number;
        if (ScreenMode.mode === ScreenMode.FIXED) {
            vw = ScreenMode.FIXED_VP_W;
            vh = ScreenMode.FIXED_VP_H;
            ScreenMode.minimapX = 550;
        } else {
            vw = w;
            vh = h;
            ScreenMode.minimapX = w - 172; // minimap group is 172 wide — flush top-right
        }
        if (IfType.openInterface(ScreenMode.PANE_ID)) {
            if (ScreenMode.mode === ScreenMode.FIXED) {
                ScreenMode.pos(0, 0, 453); // chat buttons row
                ScreenMode.pos(10, 496, 466); // bottom-right icon strip
                ScreenMode.pos(27, 516, 160); // tab icon row
                ScreenMode.pos(44, 0, 338); // viewport/chat divider art
                ScreenMode.pos(46, 0, 4); // left border art
                ScreenMode.pos(48, 0, 357); // chatbox left art
                ScreenMode.pos(50, 722, 4); // border right of minimap
                ScreenMode.pos(52, 743, 205); // border right of tab panel
                ScreenMode.pos(54, 0, 0); // top border art
                ScreenMode.pos(56, 516, 4); // strip between viewport and minimap
                ScreenMode.pos(58, 516, 205); // strip between viewport and tab panel
                ScreenMode.pos(60, 496, 357); // strip between chatbox and tab panel
                ScreenMode.rect(62, 4, 4, ScreenMode.FIXED_VP_W, ScreenMode.FIXED_VP_H); // viewport cluster
                ScreenMode.size(63, ScreenMode.FIXED_VP_W, ScreenMode.FIXED_VP_H); // 3D viewport (ct 1337)
                ScreenMode.pos(64, 0, 0); // main-screen modal target
                ScreenMode.pos(65, 472, 296);
                for (let i = 66; i <= 70; i++) {
                    ScreenMode.pos(i, 0, 265 + (i - 66) * 13); // viewport-bottom text lines
                }
                ScreenMode.size(71, ScreenMode.FIXED_VP_W, ScreenMode.FIXED_VP_H);
                ScreenMode.pos(72, 550, 4); // minimap group (ct 1338)
                ScreenMode.pos(73, 17, 357); // chatbox main area
                ScreenMode.pos(82, 553, 205); // tab panel
                ScreenMode.size(82, ScreenMode.TAB_PANEL_W, ScreenMode.TAB_PANEL_H);
                ScreenMode.pos(83, 553, 205);
                ScreenMode.size(84, ScreenMode.TAB_PANEL_W, ScreenMode.TAB_PANEL_H);
                ScreenMode.size(85, ScreenMode.TAB_PANEL_W, ScreenMode.TAB_PANEL_H);
                ScreenMode.tabPanelX = 553;
                ScreenMode.tabPanelY = 205;
                ScreenMode.reparent(0, -1);
                ScreenMode.reparent(10, -1);
                ScreenMode.reparent(27, -1);
            } else {
                const dy = h - ScreenMode.FIXED_H;
                const vdy = h - ScreenMode.FIXED_VP_H;
                ScreenMode.pos(0, 0, 453 + dy);
                // The two stock TAB STRIPS are parked off-screen in the MOBA HUD: the
                // side panel keeps showing the inventory and HudPanelOverlay's button
                // grid replaces tab switching. Hidden, never unbound — FIXED mode is
                // untouched and no tab script breaks.
                ScreenMode.pos(10, ScreenMode.OFFSCREEN, 466 + dy);
                ScreenMode.pos(27, ScreenMode.OFFSCREEN, 160 + dy);
                ScreenMode.pos(44, ScreenMode.OFFSCREEN, 338);
                ScreenMode.pos(46, ScreenMode.OFFSCREEN, 4);
                ScreenMode.pos(48, 0, 357 + dy);
                ScreenMode.pos(50, ScreenMode.OFFSCREEN, 4);
                ScreenMode.pos(52, ScreenMode.OFFSCREEN, 205);
                ScreenMode.pos(54, ScreenMode.OFFSCREEN, 0);
                ScreenMode.pos(56, ScreenMode.OFFSCREEN, 4);
                ScreenMode.pos(58, ScreenMode.OFFSCREEN, 205);
                ScreenMode.pos(60, ScreenMode.OFFSCREEN, 357);
                ScreenMode.rect(62, 0, 0, w, h);
                ScreenMode.size(63, w, h);
                ScreenMode.pos(64, ((w - ScreenMode.FIXED_VP_W) / 2) | 0, ((h - ScreenMode.FIXED_VP_H) / 2) | 0); // centre modals
                ScreenMode.pos(65, 472 + (w - ScreenMode.FIXED_VP_W), 296 + vdy);
                for (let i = 66; i <= 70; i++) {
                    ScreenMode.pos(i, 0, 265 + (i - 66) * 13 + vdy);
                }
                ScreenMode.size(71, w, h);
                ScreenMode.pos(72, ScreenMode.minimapX, 4);
                ScreenMode.pos(73, 17, 357 + dy);
                // MOBA item container: cropped to the six-slot footprint, docked
                // bottom-right with the button grid directly beneath it.
                ScreenMode.tabPanelX = w - ScreenMode.INV_PANEL_W - 8;
                ScreenMode.tabPanelY = h - 8 - ScreenMode.HUD_GRID_H - ScreenMode.INV_PANEL_H;
                ScreenMode.pos(82, ScreenMode.tabPanelX, ScreenMode.tabPanelY);
                ScreenMode.size(82, ScreenMode.INV_PANEL_W, ScreenMode.INV_PANEL_H);
                // com_83 is the 190x261 stone background sprite — park it; the HUD
                // paints bevelled cell marks instead.
                ScreenMode.pos(83, ScreenMode.OFFSCREEN, 0);
                // The tab render targets are com_82's children — crop with it.
                ScreenMode.size(84, ScreenMode.INV_PANEL_W, ScreenMode.INV_PANEL_H);
                ScreenMode.size(85, ScreenMode.INV_PANEL_W, ScreenMode.INV_PANEL_H);
                // Chat buttons (0), bottom-right strip (10) and the tab icon row (27)
                // have draw indices BELOW the viewport (62) — the full-window scene
                // paints over them. Hang them under com_71 (full-window layer drawn
                // after the scene); absolute coords unchanged, clicks follow the tree.
                ScreenMode.reparent(0, (ScreenMode.PANE_ID << 16) + 71);
                ScreenMode.reparent(10, (ScreenMode.PANE_ID << 16) + 71);
                ScreenMode.reparent(27, (ScreenMode.PANE_ID << 16) + 71);
            }
        }
        ScreenMode.viewportWidth = vw;
        ScreenMode.viewportHeight = vh;
        // Constant vertical FOV: scale the scene focal with viewport height (OSRS-style).
        ScreenMode.sceneFocal = ScreenMode.mode === ScreenMode.FIXED ? 512 : Math.max(512, ((512 * vh) / ScreenMode.FIXED_VP_H) | 0);
        if (ScreenMode.mode !== ScreenMode.FIXED) {
            // The full-window scene repaints every frame and would erase the HUD,
            // whose components only redraw when flagged dirty — force component
            // redraw each frame. The web present is a single putImageData, so
            // there is no per-region blit storm to avoid (Java round-3 lesson).
            Client.redrawAllComponents();
        }
    }

    /**
     * True when the cursor is over a HUD CLUSTER RECT in non-FIXED mode — used to
     * keep the camera wheel-zoom off the chat / side panel / minimap. The MOBA
     * overlay rects (ability bar, HUD grid, size dialog) are checked by the
     * caller — they cannot be imported here without a module-eval cycle.
     */
    static cursorOverHud(x: number, y: number): boolean {
        if (ScreenMode.mode === ScreenMode.FIXED) {
            return false; // fixed mode: the viewport rect gate already excludes the HUD
        }
        const w = GameShell.sWid;
        const h = GameShell.sHei;
        const dx = w - ScreenMode.FIXED_W;
        const dy = h - ScreenMode.FIXED_H;
        if (x >= ScreenMode.minimapX && y < 165) {
            return true; // minimap cluster (top-right)
        }
        if (x >= 516 + dx && y >= ScreenMode.tabPanelY) {
            return true; // side panel + button grid (bottom-right)
        }
        if (x < 553 && y >= 338 + dy) {
            return true; // chatbox + button rows (bottom-left)
        }
        return false;
    }

    /** Set a pane child's position (render coords — the layout walk re-derives the rest). */
    private static pos(child: number, x: number, y: number): void {
        const c = IfType.get((ScreenMode.PANE_ID << 16) + child);
        if (!c) {
            return;
        }
        c.x = x;
        c.y = y;
    }

    private static size(child: number, w: number, h: number): void {
        const c = IfType.get((ScreenMode.PANE_ID << 16) + child);
        if (!c) {
            return;
        }
        if (c.width !== w || c.height !== h) {
            c.width = w;
            c.height = h;
            c.renderWidth = w;
            c.renderHeight = h;
        }
    }

    private static rect(child: number, x: number, y: number, w: number, h: number): void {
        ScreenMode.pos(child, x, y);
        ScreenMode.size(child, w, h);
    }

    /** Re-hang a pane child under another layer's packed id (-1 = pane root). */
    private static reparent(child: number, parentId: number): void {
        const c = IfType.get((ScreenMode.PANE_ID << 16) + child);
        if (c) {
            c.layerId = parentId;
        }
    }
}
