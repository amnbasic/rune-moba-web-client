import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import ScreenMode from '#/client/ScreenMode.js';
import Pix2D from '#/graphics/Pix2D.js';
import SoftwarePix32 from '#/graphics/SoftwarePix32.js';

/**
 * XpDropOverlay — right-side gameframe XP UI. Direct port of the Java client's
 * XpDropOverlay.java:
 *   - small circular OSRS button in the chrome strip between viewport and minimap
 *   - floating "+N" XP drops in the upper-right of the viewport (fade in/out)
 *
 * Button is an on/off toggle for the drops: left-click flips state; right-click
 * shows a single menu row to do the same (standard menu system, action 1748).
 * XP delta tracking via onUpdateSkill (the opcode-190/204 skill handler).
 *
 * Sprites are the same PNG assets the Java client ships (sprites/xp_on|off.png,
 * sprites/skills/*.png), served from public/ and decoded through a canvas into
 * SoftwarePix32 (alpha<128 -> 0 = the blitters' transparent sentinel).
 */
export default class XpDropOverlay {
    static readonly STAT_COUNT: number = 23;

    /** Menu action id — unused 1700-1999 range (survives the >=2000 shift). */
    static readonly ACTION_TOGGLE_DROPS: number = 1748;

    /** Anchor: minimap group left edge - 24 (fixed mode resolves to the classic 526). */
    private static buttonX(): number {
        return ScreenMode.xpButtonX();
    }
    private static readonly BUTTON_Y: number = 48;

    private static readonly LIFETIME_MS: number = 1500;
    private static readonly FADE_IN_MS: number = 200;
    private static readonly FADE_OUT_MS: number = 350;
    private static readonly LINE_HEIGHT: number = 22;
    private static readonly MAX_DROPS: number = 8;
    private static readonly ICON_SIZE: number = 18;
    private static readonly ICON_TEXT_GAP: number = 4;
    private static readonly DROP_TEXT_COLOR: number = 0xffff00;
    private static readonly DROP_SHADOW_COLOR: number = 0x000000;
    private static readonly DROP_RIGHT_MARGIN: number = 18;
    private static readonly DROP_TOP_MARGIN: number = 16;
    private static readonly XP_BUTTON_SIZE: number = 27;

    private static readonly SKILL_NAMES_RAW: (string | null)[] = [
        'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer',
        'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking',
        'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving',
        'Slayer', 'Farming', 'Runecraft', null, 'Construction'
    ];

    private static readonly prevExp: number[] = new Array(XpDropOverlay.STAT_COUNT).fill(-1);
    private static readonly drops: { skillId: number; amount: number; spawnTimeMs: number }[] = [];

    private static readonly skillIcons: (SoftwarePix32 | null)[] = new Array(XpDropOverlay.STAT_COUNT).fill(null);
    private static iconsLoaded: boolean = false;
    /** [0] = xp_off.png (shown while drops ON), [1] = xp_on.png (shown while OFF) — Java indexing kept. */
    private static xpButtons: (SoftwarePix32 | null)[] = [null, null];
    private static xpButtonsLoaded: boolean = false;

    static dropsEnabled: boolean = true;

    /** Live button bounds (set each render from sprite size) for hit-test. */
    private static buttonW: number = 25;
    private static buttonH: number = 25;

    // =====================================================================
    // XP event tracking (called from the opcode-204 skill handler).
    // =====================================================================
    static onUpdateSkill(skillId: number, newExp: number): void {
        if (skillId < 0 || skillId >= XpDropOverlay.STAT_COUNT) {
            return;
        }
        const prev = XpDropOverlay.prevExp[skillId];
        XpDropOverlay.prevExp[skillId] = newExp >>> 0;
        if (prev < 0) {
            return;
        }
        const delta = (newExp >>> 0) - prev;
        if (delta <= 0) {
            return;
        }
        if (XpDropOverlay.dropsEnabled) {
            XpDropOverlay.enqueueDrop(skillId, delta);
        }
    }

    private static enqueueDrop(skillId: number, amount: number): void {
        if (XpDropOverlay.drops.length >= XpDropOverlay.MAX_DROPS) {
            XpDropOverlay.drops.shift();
        }
        XpDropOverlay.drops.push({ skillId: skillId, amount: amount, spawnTimeMs: Date.now() });
    }

    static resetForLogout(): void {
        XpDropOverlay.prevExp.fill(-1);
        XpDropOverlay.drops.length = 0;
    }

    // =====================================================================
    // Menu integration with the standard right-click system.
    // =====================================================================
    static addMenuItemsIfHovered(mouseX: number, mouseY: number): void {
        if (!XpDropOverlay.mouseOverButton(mouseX, mouseY)) {
            return;
        }
        Client.addMenuOption(0, XpDropOverlay.dropsEnabled ? 'Turn XP drops off' : 'Turn XP drops on', XpDropOverlay.ACTION_TOGGLE_DROPS, 0, '', 0);
    }

    /** Called from Client.doAction. Returns true if the action was ours. */
    static dispatchMenuAction(actionId: number): boolean {
        if (actionId === XpDropOverlay.ACTION_TOGGLE_DROPS) {
            XpDropOverlay.dropsEnabled = !XpDropOverlay.dropsEnabled;
            if (!XpDropOverlay.dropsEnabled) {
                XpDropOverlay.drops.length = 0;
            }
            return true;
        }
        return false;
    }

    static mouseOverButton(mouseX: number, mouseY: number): boolean {
        return mouseX >= XpDropOverlay.buttonX() && mouseX < XpDropOverlay.buttonX() + XpDropOverlay.buttonW && mouseY >= XpDropOverlay.BUTTON_Y && mouseY < XpDropOverlay.BUTTON_Y + XpDropOverlay.buttonH;
    }

    // =====================================================================
    // Rendering (every viewport paint from the gameDrawMain overlay pass).
    // =====================================================================
    static render(viewportLeft: number, viewportTop: number, viewportWidth: number): void {
        const font = Client.p12;
        if (font === null) {
            return;
        }

        if (!XpDropOverlay.xpButtonsLoaded) {
            XpDropOverlay.initXpButtons();
            XpDropOverlay.xpButtonsLoaded = true;
        }
        if (!XpDropOverlay.iconsLoaded) {
            XpDropOverlay.initSkillIcons();
            XpDropOverlay.iconsLoaded = true;
        }

        // Save the viewport clip so the button can draw into the chrome strip.
        const savedMinX = Pix2D.clipMinX;
        const savedMinY = Pix2D.clipMinY;
        const savedMaxX = Pix2D.clipMaxX;
        const savedMaxY = Pix2D.clipMaxY;
        Pix2D.setClipping(0, 0, Pix2D.width, Pix2D.height);
        XpDropOverlay.renderButton();
        Pix2D.setClipping(savedMinX, savedMinY, savedMaxX, savedMaxY);

        // Drops stay viewport-relative.
        if (XpDropOverlay.dropsEnabled) {
            XpDropOverlay.renderDrops(viewportLeft, viewportTop, viewportWidth);
        } else {
            XpDropOverlay.drops.length = 0;
        }
    }

    private static renderButton(): void {
        const sprite = XpDropOverlay.xpButtons[XpDropOverlay.dropsEnabled ? 0 : 1];
        if (sprite === null) {
            return;
        }
        XpDropOverlay.buttonW = sprite.wi;
        XpDropOverlay.buttonH = sprite.hi;
        sprite.plotSprite(XpDropOverlay.buttonX(), XpDropOverlay.BUTTON_Y);
    }

    private static renderDrops(vL: number, vT: number, vW: number): void {
        const font = Client.p12!;
        const now = Date.now();
        for (let i = XpDropOverlay.drops.length - 1; i >= 0; i--) {
            if (now - XpDropOverlay.drops[i].spawnTimeMs >= XpDropOverlay.LIFETIME_MS) {
                XpDropOverlay.drops.splice(i, 1);
            }
        }
        if (XpDropOverlay.drops.length === 0) {
            return;
        }

        const rightEdge = vL + vW - XpDropOverlay.DROP_RIGHT_MARGIN;
        const topEdge = vT + XpDropOverlay.DROP_TOP_MARGIN;

        for (let i = 0; i < XpDropOverlay.drops.length; i++) {
            const d = XpDropOverlay.drops[i];
            const age = now - d.spawnTimeMs;
            const alpha = XpDropOverlay.computeAlpha(age);

            const rowY = topEdge + i * XpDropOverlay.LINE_HEIGHT + 10;
            const text = '+' + d.amount;

            const color = XpDropOverlay.applyAlpha(XpDropOverlay.DROP_TEXT_COLOR, alpha);
            const shadow = XpDropOverlay.applyAlpha(XpDropOverlay.DROP_SHADOW_COLOR, alpha);

            const icon = d.skillId >= 0 && d.skillId < XpDropOverlay.STAT_COUNT ? XpDropOverlay.skillIcons[d.skillId] : null;
            const iconX = rightEdge - XpDropOverlay.ICON_SIZE;
            const iconY = rowY - XpDropOverlay.ICON_SIZE + 2;

            // Text sits to the LEFT of the icon; icon is right-anchored.
            const textRight = icon !== null ? iconX - XpDropOverlay.ICON_TEXT_GAP : rightEdge;
            font.rightString(text, textRight, rowY, color, shadow);

            if (icon !== null) {
                icon.plotSprite(iconX, iconY);
            }
        }
    }

    /** Triangular envelope: fade-in, hold, fade-out. */
    private static computeAlpha(age: number): number {
        if (age < XpDropOverlay.FADE_IN_MS) {
            return ((age * 255) / XpDropOverlay.FADE_IN_MS) | 0;
        }
        const fadeOutStart = XpDropOverlay.LIFETIME_MS - XpDropOverlay.FADE_OUT_MS;
        if (age > fadeOutStart) {
            const a = 255 - ((((age - fadeOutStart) * 255) / XpDropOverlay.FADE_OUT_MS) | 0);
            return Math.max(a, 0);
        }
        return 255;
    }

    private static applyAlpha(rgb: number, alpha: number): number {
        if (alpha >= 255) {
            return rgb;
        }
        const r = ((((rgb >> 16) & 0xff) * alpha) / 255) | 0;
        const g = ((((rgb >> 8) & 0xff) * alpha) / 255) | 0;
        const b = (((rgb & 0xff) * alpha) / 255) | 0;
        return (r << 16) | (g << 8) | b;
    }

    // =====================================================================
    // Sprite loading (async browser images -> SoftwarePix32; renders skip
    // missing sprites until their load lands, like the js5 icon retry).
    // =====================================================================
    private static initXpButtons(): void {
        XpDropOverlay.loadPngSprite('sprites/xp_off.png', XpDropOverlay.XP_BUTTON_SIZE, XpDropOverlay.XP_BUTTON_SIZE, (off: SoftwarePix32 | null): void => {
            if (off !== null) {
                XpDropOverlay.xpButtons[0] = off;
            }
        });
        XpDropOverlay.loadPngSprite('sprites/xp_on.png', XpDropOverlay.XP_BUTTON_SIZE, XpDropOverlay.XP_BUTTON_SIZE, (on: SoftwarePix32 | null): void => {
            if (on !== null) {
                XpDropOverlay.xpButtons[1] = on;
            }
        });
    }

    private static initSkillIcons(): void {
        for (let i = 0; i < XpDropOverlay.STAT_COUNT; i++) {
            const name = XpDropOverlay.SKILL_NAMES_RAW[i];
            if (name === null) {
                continue;
            }
            const idx = i;
            XpDropOverlay.loadPngSprite('sprites/skills/' + name.toLowerCase() + '.png', XpDropOverlay.ICON_SIZE, XpDropOverlay.ICON_SIZE, (sprite: SoftwarePix32 | null): void => {
                XpDropOverlay.skillIcons[idx] = sprite;
            });
        }
    }

    /**
     * PNG -> SoftwarePix32 via a canvas: aspect-fit centred into the target box,
     * bilinear when shrinking / nearest when growing (the Java loader's rules),
     * alpha<128 -> 0 (transparent sentinel), opaque black -> 1 like the Java
     * palette mapper so it isn't treated as transparent.
     */
    private static loadPngSprite(path: string, targetW: number, targetH: number, out: (sprite: SoftwarePix32 | null) => void): void {
        const img = new Image();
        img.onload = (): void => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d')!;
                const scale = Math.min(targetW / img.width, targetH / img.height);
                const drawW = Math.max(1, Math.round(img.width * scale));
                const drawH = Math.max(1, Math.round(img.height * scale));
                ctx.imageSmoothingEnabled = scale < 1.0;
                ctx.drawImage(img, ((targetW - drawW) / 2) | 0, ((targetH - drawH) / 2) | 0, drawW, drawH);
                const data = ctx.getImageData(0, 0, targetW, targetH).data;
                const pixels = new Int32Array(targetW * targetH);
                for (let i = 0; i < pixels.length; i++) {
                    if (data[i * 4 + 3] < 128) {
                        pixels[i] = 0;
                        continue;
                    }
                    let rgb = (data[i * 4] << 16) | (data[i * 4 + 1] << 8) | data[i * 4 + 2];
                    if (rgb === 0) {
                        rgb = 1;
                    }
                    pixels[i] = rgb;
                }
                out(new SoftwarePix32(targetW, targetH, 0, 0, targetW, targetH, pixels));
            } catch {
                out(null);
            }
        };
        img.onerror = (): void => out(null);
        img.src = path;
    }
}
