import Pix2D from '#/graphics/Pix2D.js';

export default class PixMap {
    data: Int32Array;
    width: number;
    height: number;
    image: ImageData | null;

    protected ctx: CanvasRenderingContext2D;
    protected paint: Uint32Array;

    constructor(height: number, width: number, ctx: CanvasRenderingContext2D) {
        this.height = height;
        this.data = new Int32Array(width * height + 1);
        this.width = width;
        this.image = ctx.createImageData(width, height);
        this.paint = new Uint32Array(this.image.data.buffer);
        this.ctx = ctx;
        this.bind();
    }

    bind(): void {
        Pix2D.setPixels(this.data, this.width, this.height);
    }

    private updateImageData(): ImageData | null {
        if (!this.image) {
            return null;
        }

        const data = this.data;
        const paint = this.paint;
        const len = data.length;

        let i = 0;
        const unroll = len - (len % 4);

        for (; i < unroll; i += 4) {
            const p0 = data[i];
            const p1 = data[i + 1];
            const p2 = data[i + 2];
            const p3 = data[i + 3];

            paint[i] = ((p0 & 0xff0000) >> 16) | (p0 & 0xff00) | ((p0 & 0xff) << 16) | 0xff000000;
            paint[i + 1] = ((p1 & 0xff0000) >> 16) | (p1 & 0xff00) | ((p1 & 0xff) << 16) | 0xff000000;
            paint[i + 2] = ((p2 & 0xff0000) >> 16) | (p2 & 0xff00) | ((p2 & 0xff) << 16) | 0xff000000;
            paint[i + 3] = ((p3 & 0xff0000) >> 16) | (p3 & 0xff00) | ((p3 & 0xff) << 16) | 0xff000000;
        }

        for (; i < len; i++) {
            const pixel = data[i];
            paint[i] = ((pixel & 0xff0000) >> 16) | (pixel & 0xff00) | ((pixel & 0xff) << 16) | 0xff000000;
        }

        return this.image;
    }

    /** Convert only the rows/cols of a dirty rect — a sub-blit present must not pay
     *  for a full-frame conversion (that cost scales with WINDOW size, not rect size). */
    private updateImageDataRect(x: number, y: number, w: number, h: number): ImageData | null {
        if (!this.image) {
            return null;
        }
        if (x < 0) {
            w += x;
            x = 0;
        }
        if (y < 0) {
            h += y;
            y = 0;
        }
        if (x + w > this.width) {
            w = this.width - x;
        }
        if (y + h > this.height) {
            h = this.height - y;
        }
        if (w <= 0 || h <= 0) {
            return null;
        }
        const data = this.data;
        const paint = this.paint;
        for (let row = y; row < y + h; row++) {
            let i = row * this.width + x;
            const end = i + w;
            for (; i < end; i++) {
                const pixel = data[i];
                paint[i] = ((pixel & 0xff0000) >> 16) | (pixel & 0xff00) | ((pixel & 0xff) << 16) | 0xff000000;
            }
        }
        return this.image;
    }

    draw(x: number, y: number): void {
        const image = this.updateImageData();
        if (!image) {
            return;
        }

        this.ctx.putImageData(image, x, y);
    }

    draw2(height: number, width: number, y: number, x: number): void {
        const image = this.updateImageDataRect(x, y, width, height);
        if (!image || width <= 0 || height <= 0) {
            return;
        }

        this.ctx.putImageData(image, 0, 0, x, y, width, height);
    }
}
