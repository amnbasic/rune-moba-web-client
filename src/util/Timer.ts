import ThreadSleep from '#/util/ThreadSleep.js';

export default class Timer {
    /**
     * Align frame wake-ups to the display refresh (requestAnimationFrame) instead of
     * setTimeout. Browsers clamp/jitter setTimeout (>=4ms, unaligned to vsync), which
     * makes the 20ms game ticks land unevenly against the display — visible judder.
     * With rAF the present is vsync-aligned and logic ticks run only when DUE (no
     * forced tick), so game speed is unchanged; a wake with no due tick is a
     * draw-only frame. Falls back to setTimeout when the tab is hidden (rAF stops
     * entirely there, which would stall keepalives). Toggle live with ::vsync.
     */
    static rafAlign: boolean = true;

    ntime = performance.now() * 1000000;

    async count(mindel: number, deltime: number): Promise<number> {
        if (Timer.rafAlign && typeof document !== 'undefined' && !document.hidden) {
            await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
            const now = performance.now() * 1000000;
            let loops = 0;
            while (loops < 10 && this.ntime < now) {
                loops++;
                this.ntime += deltime * 1000000;
            }
            if (now > this.ntime) {
                this.ntime = now;
            }
            return loops;
        }

        const mindelNs = mindel * 1000000;
        let delta = this.ntime - performance.now() * 1000000;
        let loops = 0;
        if (delta < mindelNs) {
            delta = mindelNs;
        }
        await ThreadSleep.sleepPrecise((delta / 1000000) | 0);
        const now = performance.now() * 1000000;
        while (loops < 10 && (loops < 1 || this.ntime < now)) {
            loops++;
            this.ntime += deltime * 1000000;
        }
        if (now > this.ntime) {
            this.ntime = now;
        }
        return loops;
    }

    reset(): void {
        this.ntime = performance.now() * 1000000;
    }
}
