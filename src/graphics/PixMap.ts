import Pix2D from '#/graphics/Pix2D.js';

export default class PixMap {
    /**
     * Transparent-pixel sentinel for the GL scene hole: a value no 24-bit drawing
     * op can produce (bit 24 set). Converted to alpha 0 at present time so the
     * WebGL canvas layered below shows through; every real pixel stays opaque.
     */
    static readonly GL_TRANSPARENT: number = 0x1000000;

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

        const T = PixMap.GL_TRANSPARENT;
        for (let i = 0; i < len; i++) {
            const pixel = data[i];
            paint[i] = pixel === T ? 0 : ((pixel & 0xff0000) >> 16) | (pixel & 0xff00) | ((pixel & 0xff) << 16) | 0xff000000;
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
        const T = PixMap.GL_TRANSPARENT;
        for (let row = y; row < y + h; row++) {
            let i = row * this.width + x;
            const end = i + w;
            for (; i < end; i++) {
                const pixel = data[i];
                paint[i] = pixel === T ? 0 : ((pixel & 0xff0000) >> 16) | (pixel & 0xff00) | ((pixel & 0xff) << 16) | 0xff000000;
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
