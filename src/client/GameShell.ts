import Pix3D from '#/dash3d/Pix3D.js';
import PixMap from '#/graphics/PixMap.js';

import JagException from '#/callstack/JagException.js';
import JagString from '#/jstring/JagString.js';
import MonotonicTime from '#/util/MonotonicTime.js';
import ThreadSleep from '#/util/ThreadSleep.js';
import Timer from '#/util/Timer.js';

// jag::oldscape::javapal::GameShell
export default abstract class GameShell {
    static shell: GameShell | null = null;
    static loaded: number = 0;
    static killtime = 0;
    static alreadyshutdown = false;
    alreadyerrored = false;

    // jag::oldscape::javapal::GameShell::m_updateCount
    static updateCount = 0;

    static deltime = 20;
    static mindel = 1;
    static fps = 0;
    static timer: Timer | null = null;

    // jag::oldscape::javapal::GameShell::m_drawTime
    static drawTime: number[] = new Array(32).fill(0);

    static drawPos = 0;

    // jag::oldscape::javapal::GameShell::m_updateTime
    static updateTime: number[] = new Array(32).fill(0);

    static updatePos = 0;
    static sWid = 0;
    static sHei = 0;
    static drawArea: PixMap;
    static canvas: HTMLCanvasElement;
    static ctx: CanvasRenderingContext2D;
    static fullredraw = true;
    static redrawNum = 500;
    static lastCanvasReplace: number = 0;
    static focus_in = true;
    static focus = false;
    static loadingText: string | null = null;
    static readonly field1673: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    static readonly field658: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // com.jagex.game.runetek6.client.GameShell3.startCommon
    public startCommon(width: number, height: number, revision: number): void {
        try {
            if (GameShell.shell === null) {
                GameShell.sWid = width;
                GameShell.sHei = height;
                GameShell.shell = this;
                JagException.revision = revision;
                void this.run();
            } else {
                GameShell.loaded++;
                if (GameShell.loaded >= 3) {
                    this.error('alreadyloaded');
                } else {
                    this.getAppletContext()?.showDocument(this.getDocumentBase(), '_self');
                }
            }
        } catch (e) {
            JagException.report(null, e);
            this.error('crash');
        }
    }

    // com.jagex.game.runetek6.client.GameShell3.addcanvas
    public addcanvas(): void {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;

        GameShell.canvas = canvas;
        GameShell.ctx = GameShell.canvas.getContext('2d', {
            // alpha REQUIRED: the GPU scene renders on #glcanvas UNDERNEATH and shows
            // through the viewport's transparent hole (PixMap.GL_TRANSPARENT).
            alpha: true
        }) as CanvasRenderingContext2D;
        GameShell.canvas.width = GameShell.sWid;
        GameShell.canvas.height = GameShell.sHei;

        GameShell.canvas.tabIndex = -1;
        GameShell.canvas.onfocus = this.focusGained.bind(this);
        GameShell.canvas.onblur = this.focusLost.bind(this);
        GameShell.canvas.oncontextmenu = (e: MouseEvent): void => {
            e.preventDefault();
        };
        GameShell.canvas.focus();

        GameShell.fullredraw = true;
        GameShell.lastCanvasReplace = MonotonicTime.currentTime();
    }

    // com.jagex.game.runetek6.client.GameShell3.checkhost
    public checkhost(): boolean {
        let host = this.getDocumentBase().hostname.toLowerCase();
        if (host === 'localhost' || host === 'jagex.com' || host.endsWith('.jagex.com')) {
            return true;
        } else if (host === 'runescape.com' || host.endsWith('.runescape.com')) {
            return true;
        } else if (host.endsWith('127.0.0.1')) {
            return true;
        }
        while (host.length > 0) {
            const code = host.charCodeAt(host.length - 1);
            if (code < 48 || code > 57) {
                break;
            }
            host = host.substring(0, host.length - 1);
        }
        if (host.endsWith('192.168.1.')) {
            return true;
        }
        this.error('invalidhost');
        return false;
    }

    async run() {
        try {
            this.addcanvas();
            GameShell.drawArea = new PixMap(GameShell.sHei, GameShell.sWid, GameShell.ctx);
            await this.maininit();
            GameShell.timer = new Timer();

            while (GameShell.killtime === 0 || MonotonicTime.currentTime() < GameShell.killtime) {
                GameShell.updateCount = await GameShell.timer.count(GameShell.mindel, GameShell.deltime);

                for (let i: number = 0; i < GameShell.updateCount; i++) {
                    await this.mainloopwrapper();
                }

                // Fractional position between game ticks (0..1) at draw time — lets
                // renderers interpolate BETWEEN 20ms ticks so 60-80Hz displays don't
                // beat against the 50Hz logic (the MOBA glide judder).
                GameShell.tickFraction = Math.min(1, Math.max(0, 1 - (GameShell.timer.ntime - performance.now() * 1000000) / (GameShell.deltime * 1000000)));

                await this.mainredrawwrapper();
            }
        } catch (e) {
            JagException.report(null, e);
            this.error('crash');
        }

        this.shutdown(true);
    }

    // com.jagex.game.runetek6.client.GameShell3.mainloopwrapper
    protected async mainloopwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.updateTime[GameShell.updatePos];
        GameShell.updateTime[GameShell.updatePos] = time;
        GameShell.updatePos = (GameShell.updatePos + 1) & 0x1f;

        GameShell.focus = GameShell.focus_in;
        const perfT0: number = performance.now();
        await this.mainloop();
        GameShell.perfLogicMs = GameShell.perfLogicMs * 0.9 + (performance.now() - perfT0) * 0.1;
    }

    /** Smoothed per-stage frame timings (ms) for the ::perf overlay. */
    static perfLogicMs: number = 0;
    static perfDrawMs: number = 0;

    /** Fraction (0..1) of the current 20ms tick elapsed at draw time (sub-tick render lerp). */
    static tickFraction: number = 0;

    // com.jagex.game.runetek6.client.GameShell3.mainredrawwrapper
    protected async mainredrawwrapper(): Promise<void> {
        const time: number = MonotonicTime.currentTime();
        const previous: number = GameShell.drawTime[GameShell.drawPos];
        GameShell.drawTime[GameShell.drawPos] = time;
        GameShell.drawPos = (GameShell.drawPos + 1) & 0x1f;

        if (previous !== 0 && previous < time) {
            const delta: number = time - previous;
            GameShell.fps = (((delta >> 1) + 32000) / delta) | 0;
        }

        if (GameShell.redrawNum++ > 50) {
            GameShell.redrawNum -= 50;
            GameShell.fullredraw = true;
        }

        const perfT0: number = performance.now();
        await this.mainredraw();
        GameShell.perfDrawMs = GameShell.perfDrawMs * 0.9 + (performance.now() - perfT0) * 0.1;
    }

    // com.jagex.game.runetek6.client.GameShell3.shutdown
    public shutdown(clean: boolean): void {
        if (GameShell.alreadyshutdown) {
            return;
        }

        GameShell.alreadyshutdown = true;

        try {
            this.mainquit();
        } catch {}

        GameShell.canvas.onfocus = null;
        GameShell.canvas.onblur = null;
        GameShell.canvas.oncontextmenu = null;
        window.oncontextmenu = null;
        this.onKilled();
        console.log('Shutdown complete - clean:' + clean);
    }

    // com.jagex.game.runetek6.client.GameShell3.doneslowupdate
    public static doneslowupdate(): void {
        GameShell.timer?.reset();
        for (let i: number = 0; i < 32; i++) {
            GameShell.drawTime[i] = 0;
        }
        for (let i: number = 0; i < 32; i++) {
            GameShell.updateTime[i] = 0;
        }
        GameShell.updateCount = 0;
    }

    protected start() {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = 0;
        }
    }

    protected stop() {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = MonotonicTime.currentTime() + 4000;
        }
    }

    public destroy(): void {
        if (GameShell.shell === this && !GameShell.alreadyshutdown) {
            GameShell.killtime = MonotonicTime.currentTime();
            this.shutdown(false);
        }
    }

    public focusGained(_event?: FocusEvent): void {
        GameShell.focus_in = true;
        GameShell.fullredraw = true;
    }

    public focusLost(_event?: FocusEvent): void {
        GameShell.focus_in = false;
    }

    public windowActivated(_event?: unknown): void {}

    public windowClosed(_event?: unknown): void {}

    public windowClosing(_event?: unknown): void {
        this.destroy();
    }

    public windowDeactivated(_event?: unknown): void {}

    public windowDeiconified(_event?: unknown): void {}

    public windowIconified(_event?: unknown): void {}

    public windowOpened(_event?: unknown): void {}

    public error(message: string): void {
        if (this.alreadyerrored) {
            return;
        }

        this.alreadyerrored = true;

        if (!process.env.BUILD_DEV) {
            const page = `error_game_${message}`;
            globalThis.console.log(page);
            try {
                this.getAppletContext()?.showDocument(new URL(`${page}.ws`, this.getCodeBase()), '_self');
            } catch {
                // ignore browser navigation failures
            }
        }
    }

    abstract mainquit(): void;
    abstract maininit(): Promise<void> | void;
    abstract mainloop(): Promise<void> | void;
    abstract onKilled(): void;
    abstract mainredraw(): Promise<void> | void;
    abstract init(): void;

    static drawProgress(colour: string | null, message: string, redraw: boolean, progress: number): void {
        if (redraw) {
            GameShell.ctx.fillStyle = 'black';
            GameShell.ctx.fillRect(0, 0, GameShell.sWid, GameShell.sHei);
        }

        if (colour === null) {
            colour = 'rgb(140, 17, 17)';
        }

        try {
            const x = ((GameShell.sWid / 2) | 0) - 152;
            const y = ((GameShell.sHei / 2) | 0) - 18;

            GameShell.ctx.fillStyle = colour;
            GameShell.ctx.fillRect(x, y, 304, 34);

            GameShell.ctx.fillStyle = 'black';
            GameShell.ctx.fillRect(x + 1, y + 1, 302, 32);

            GameShell.ctx.fillStyle = colour;
            GameShell.ctx.fillRect(x + 2, y + 2, progress * 3, 30);

            GameShell.ctx.fillStyle = 'black';
            GameShell.ctx.fillRect(x + 2 + progress * 3, y + 2, 300 - progress * 3, 30);

            GameShell.ctx.font = 'bold 13px Helvetica, sans-serif';
            GameShell.ctx.fillStyle = 'white';
            GameShell.ctx.textAlign = 'left';
            GameShell.ctx.fillText(message, (x + (304 - GameShell.ctx.measureText(message).width) / 2) | 0, y + 22);

            if (GameShell.loadingText !== null) {
                GameShell.ctx.font = 'bold 13px Helvetica, sans-serif';

                const metrics = GameShell.ctx.measureText(GameShell.loadingText);
                const loadX = ((GameShell.sWid / 2) | 0) - ((metrics.width / 2) | 0);
                const loadY = ((GameShell.sHei / 2) | 0) - 26;

                if (!redraw) {
                    // custom: anti-aliasing starts stacking on fast updates (no fullredraw), so if we don't do at least a partial redraw it looks bad
                    GameShell.ctx.fillStyle = 'black';
                    GameShell.ctx.fillRect(Math.floor(loadX - 2), Math.floor(loadY - metrics.actualBoundingBoxAscent - 2), Math.ceil(metrics.width + 2 * 2), Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 2 * 2));
                }

                GameShell.ctx.fillStyle = 'white';
                GameShell.ctx.textAlign = 'left';
                GameShell.ctx.fillText(GameShell.loadingText, loadX, loadY);
            }
        } catch {}
    }

    constructor() {
        this.init();
    }

    public static pushUID192(packet: { pdata(length: number, src: Uint8Array): void }): void {
        const bytes = new Uint8Array(24);
        // todo: write to local storage
        packet.pdata(24, bytes);
    }

    public static updateUID192(packet: { data: Uint8Array; pos: number }): void {
        // todo: write to localStorage
        packet.pos += 24;
    }

    public static setFramerate(rate: number): void {
        GameShell.deltime = (1000 / rate) | 0;
    }

    public static openUrl(url: JagString | string | URL): void {
        try {
            const href = url instanceof URL ? url.href : url.toString();
            globalThis.open?.(new URL(href, GameShell.shell?.getCodeBase() ?? globalThis.location?.href).href, '_blank');
        } catch {}
    }

    // method1132
    public static setCookie(value: JagString | string): void {
        if (typeof document === 'undefined') {
            return;
        }
        try {
            const cookieValue = value.toString();
            const prefix = GameShell.shell?.getParameter('cookieprefix') ?? '';
            const host = GameShell.shell?.getParameter('cookiehost') ?? globalThis.location?.hostname ?? '';
            let cookie = `${prefix}settings=${cookieValue}; version=1; path=/; domain=${host}`;
            if (cookieValue.length === 0) {
                cookie += '; Expires=Thu, 01-Jan-1970 00:00:00 GMT; Max-Age=0';
            } else {
                cookie += `; Expires=${GameShell.getFormattedDate(MonotonicTime.currentTime() + 94608000000).toString()}; Max-Age=94608000`;
            }
            document.cookie = cookie;
        } catch {}
    }

    // method1139
    public static getFormattedDate(time: number): JagString {
        const date = new Date(time);
        const day = date.getUTCDay();
        const dateOfMonth = date.getUTCDate();
        const month = date.getUTCMonth();
        const year = date.getUTCFullYear();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        return JagString.join([
            JagString.wrap(GameShell.field1673[day]),
            JagString.wrap(', '),
            JagString.parseInt((dateOfMonth / 10) | 0),
            JagString.parseInt(dateOfMonth % 10),
            JagString.wrap('-'),
            JagString.wrap(GameShell.field658[month]),
            JagString.wrap('-'),
            JagString.parseInt(year),
            JagString.wrap(' '),
            JagString.parseInt((hour / 10) | 0),
            JagString.parseInt(hour % 10),
            JagString.wrap(':'),
            JagString.parseInt((minute / 10) | 0),
            JagString.parseInt(minute % 10),
            JagString.wrap(':'),
            JagString.parseInt((second / 10) | 0),
            JagString.parseInt(second % 10),
            JagString.wrap(' GMT')
        ]);
    }

    // custom
    public getCodeBase(): URL {
        return new URL(globalThis.location?.href ?? 'http://localhost/');
    }

    // custom
    public getDocumentBase(): URL {
        return new URL(globalThis.location?.href ?? 'http://localhost/');
    }

    // custom
    public getAppletContext(): { showDocument: (url: URL, target?: string) => void } | null {
        return {
            showDocument: (url: URL, target?: string): void => {
                if (target === '_self') {
                    globalThis.location.href = url.href;
                } else {
                    globalThis.open?.(url.href, target ?? '_blank');
                }
            }
        };
    }

    // custom
    public getParameter(name: string): string | null {
        try {
            return new URL(globalThis.location?.href ?? 'http://localhost/').searchParams.get(name);
        } catch {
            return null;
        }
    }
}
