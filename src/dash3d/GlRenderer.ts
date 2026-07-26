/**
 * GlRenderer — WebGL "face soup" backend for the 3D scene (the option-2 GPU port).
 *
 * The engine keeps doing EVERYTHING it does today — projection, painter's-algorithm
 * ordering, picking, fog vertex shading — but the per-pixel triangle FILLS
 * (Pix3D.gouraudTriangle / flatTriangle / texture fallbacks) are intercepted while
 * `active` and appended to one streaming vertex buffer instead of being CPU-
 * rasterized into Pix2D. flush() then draws the whole scene in a single GL call on
 * a canvas layered UNDER the 2D canvas; the 2D frame keeps a transparent hole
 * (PixMap's GL_TRANSPARENT sentinel) where the scene shows through.
 *
 * Painter order = submission order (no depth buffer), so translucency (Pix3D.trans,
 * alpha = (256-trans)/256) blends exactly like the software renderer. Stage A draws
 * textured faces via the engine's own average-colour fallback (the lowmem path);
 * real textures (UV derivation from the P/M/N plane) are the follow-up stage.
 */
export default class GlRenderer {
    /** User toggle (::settings). Falls back to software automatically if init fails. */
    static enabled: boolean = true;
    /** True while the current scene pass routes fills here. */
    static active: boolean = false;

    private static gl: WebGLRenderingContext | null = null;
    private static canvas: HTMLCanvasElement | null = null;
    private static initFailed: boolean = false;
    private static aPos: number = 0;
    private static aCol: number = 0;
    private static uScale: WebGLUniformLocation | null = null;
    private static vbo: WebGLBuffer | null = null;

    // interleaved: x, y, r, g, b, a — 6 floats per vertex
    private static verts: Float32Array = new Float32Array(6 * 3 * 32768);
    private static count: number = 0; // floats used

    private static vpX: number = 0;
    private static vpY: number = 0;
    private static vpW: number = 512;
    private static vpH: number = 334;

    static ready(): boolean {
        if (GlRenderer.gl !== null) {
            return true;
        }
        if (GlRenderer.initFailed) {
            return false;
        }
        return GlRenderer.init();
    }

    private static init(): boolean {
        try {
            const canvas = document.getElementById('glcanvas') as HTMLCanvasElement | null;
            if (!canvas) {
                GlRenderer.initFailed = true;
                return false;
            }
            const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true });
            if (!gl) {
                GlRenderer.initFailed = true;
                return false;
            }
            const vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(
                vs,
                'attribute vec2 aPos; attribute vec4 aCol; uniform vec2 uScale; varying vec4 vCol;' +
                    'void main() { vCol = aCol; gl_Position = vec4(aPos.x * uScale.x - 1.0, 1.0 - aPos.y * uScale.y, 0.0, 1.0); }'
            );
            gl.compileShader(vs);
            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(fs, 'precision mediump float; varying vec4 vCol; void main() { gl_FragColor = vec4(vCol.rgb * vCol.a, vCol.a); }');
            gl.compileShader(fs);
            const prog = gl.createProgram()!;
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('[GL] shader link failed: ' + gl.getProgramInfoLog(prog));
                GlRenderer.initFailed = true;
                return false;
            }
            gl.useProgram(prog);
            GlRenderer.aPos = gl.getAttribLocation(prog, 'aPos');
            GlRenderer.aCol = gl.getAttribLocation(prog, 'aCol');
            GlRenderer.uScale = gl.getUniformLocation(prog, 'uScale');
            GlRenderer.vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, GlRenderer.vbo);
            gl.enableVertexAttribArray(GlRenderer.aPos);
            gl.enableVertexAttribArray(GlRenderer.aCol);
            gl.vertexAttribPointer(GlRenderer.aPos, 2, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(GlRenderer.aCol, 4, gl.FLOAT, false, 24, 8);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            GlRenderer.canvas = canvas;
            GlRenderer.gl = gl;
            console.log('[GL] face-soup renderer initialised');
            return true;
        } catch (e) {
            console.error('[GL] init failed: ' + e);
            GlRenderer.initFailed = true;
            return false;
        }
    }

    /** Match the GL canvas to the frame canvas size (ScreenMode.applySize). */
    static resize(w: number, h: number): void {
        const canvas = (GlRenderer.canvas ?? (document.getElementById('glcanvas') as HTMLCanvasElement | null));
        if (canvas && (canvas.width !== w || canvas.height !== h)) {
            canvas.width = w;
            canvas.height = h;
        }
    }

    /** Arm collection for this scene pass (viewport rect in frame-canvas coords). */
    static beginScene(x: number, y: number, w: number, h: number): void {
        GlRenderer.vpX = x;
        GlRenderer.vpY = y;
        GlRenderer.vpW = w;
        GlRenderer.vpH = h;
        GlRenderer.count = 0;
        GlRenderer.active = true;
    }

    /** One triangle, clip-local pixel coords + raw 0xRRGGBB per vertex + alpha 0..1. */
    static pushTriangle(x0: number, y0: number, rgb0: number, x1: number, y1: number, rgb1: number, x2: number, y2: number, rgb2: number, alpha: number): void {
        if (GlRenderer.count + 18 > GlRenderer.verts.length) {
            const grown = new Float32Array(GlRenderer.verts.length * 2);
            grown.set(GlRenderer.verts);
            GlRenderer.verts = grown;
        }
        const v = GlRenderer.verts;
        let i = GlRenderer.count;
        v[i++] = x0;
        v[i++] = y0;
        v[i++] = ((rgb0 >> 16) & 0xff) / 255;
        v[i++] = ((rgb0 >> 8) & 0xff) / 255;
        v[i++] = (rgb0 & 0xff) / 255;
        v[i++] = alpha;
        v[i++] = x1;
        v[i++] = y1;
        v[i++] = ((rgb1 >> 16) & 0xff) / 255;
        v[i++] = ((rgb1 >> 8) & 0xff) / 255;
        v[i++] = (rgb1 & 0xff) / 255;
        v[i++] = alpha;
        v[i++] = x2;
        v[i++] = y2;
        v[i++] = ((rgb2 >> 16) & 0xff) / 255;
        v[i++] = ((rgb2 >> 8) & 0xff) / 255;
        v[i++] = (rgb2 & 0xff) / 255;
        v[i++] = alpha;
        GlRenderer.count = i;
    }

    /** Draw the collected soup: one buffer upload, one draw call. */
    static flush(): void {
        GlRenderer.active = false;
        const gl = GlRenderer.gl;
        const canvas = GlRenderer.canvas;
        if (!gl || !canvas) {
            return;
        }
        // GL origin is bottom-left; our rect is top-left based
        const glY = canvas.height - GlRenderer.vpY - GlRenderer.vpH;
        gl.viewport(GlRenderer.vpX, glY, GlRenderer.vpW, GlRenderer.vpH);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(GlRenderer.vpX, glY, GlRenderer.vpW, GlRenderer.vpH);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (GlRenderer.count > 0) {
            gl.uniform2f(GlRenderer.uScale, 2 / GlRenderer.vpW, 2 / GlRenderer.vpH);
            gl.bindBuffer(gl.ARRAY_BUFFER, GlRenderer.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, GlRenderer.verts.subarray(0, GlRenderer.count), gl.STREAM_DRAW);
            gl.drawArrays(gl.TRIANGLES, 0, (GlRenderer.count / 6) | 0);
        }
        gl.disable(gl.SCISSOR_TEST);
    }
}
