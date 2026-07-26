import Pix3D from '#/dash3d/Pix3D.js';

/**
 * GlRenderer — WebGL "face soup" backend for the 3D scene (the option-2 GPU port).
 *
 * The engine keeps doing EVERYTHING it does today — projection, painter's-algorithm
 * ordering, picking, fog vertex shading — but the per-pixel triangle FILLS
 * (Pix3D.gouraudTriangle / flatTriangle / texture mappers) are intercepted while
 * `active` and appended to one streaming vertex buffer instead of being CPU-
 * rasterized into Pix2D. flush() draws the whole scene in a single GL call on a
 * canvas layered UNDER the 2D canvas; the 2D frame keeps a transparent hole
 * (PixMap's GL_TRANSPARENT sentinel) where the scene shows through.
 *
 * STAGE B textures: the software texture mappers' plane terms are LINEAR IN SCREEN
 * SPACE — f1(x,y), f2(x,y), f3(x,y) with u = f1/f3, v = f2/f3 in texel units
 * (0..128, 7-bit wrap). We evaluate the three functions at each screen vertex and
 * pass them as varyings; linear interpolation of linear functions is exact, so the
 * fragment shader's two divides reproduce the CPU's perspective-correct texturing
 * pixel-for-pixel. Texels live in a lazily-filled 1024x1024 atlas (8x8 slots of
 * 128x128 from TextureManager). Per-vertex lightness rides the colour channels.
 *
 * Painter order = submission order (no depth buffer); alpha = (256-trans)/256.
 */
export default class GlRenderer {
    /** User toggle (::settings). Falls back to software automatically if init fails. */
    static enabled: boolean = true;
    /** True while the current scene pass routes fills here. */
    static active: boolean = false;

    /** Full-viewport black dim (0..1) drawn over the scene at flush (modal dialogs). */
    static dimAlpha: number = 0;

    private static gl: WebGLRenderingContext | null = null;
    private static canvas: HTMLCanvasElement | null = null;
    private static initFailed: boolean = false;
    private static uScale: WebGLUniformLocation | null = null;
    private static vbo: WebGLBuffer | null = null;
    private static atlasTex: WebGLTexture | null = null;

    // interleaved: x, y, r, g, b, a, f1, f2, f3, tileU, tileV, texFlag — 12 floats
    private static readonly VSIZE: number = 12;
    private static verts: Float32Array = new Float32Array(GlRenderer.VSIZE * 3 * 32768);
    private static count: number = 0;

    // texture id -> atlas slot (0..63); -1 marks a failed/loading texture
    private static atlasSlot: Int32Array = new Int32Array(256).fill(-2);
    private static atlasNext: number = 0;
    private static atlasUpload: Uint8Array = new Uint8Array(128 * 128 * 4);

    private static vpX: number = 0;
    private static vpY: number = 0;
    private static vpW: number = 512;
    private static vpH: number = 334;

    private static dbgFrames: number = 0;

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
                'attribute vec2 aPos; attribute vec4 aCol; attribute vec3 aF; attribute vec3 aTex;' +
                    'uniform vec2 uScale; varying vec4 vCol; varying vec3 vF; varying vec3 vTex;' +
                    'void main() { vCol = aCol; vF = aF; vTex = aTex;' +
                    ' gl_Position = vec4(aPos.x * uScale.x - 1.0, 1.0 - aPos.y * uScale.y, 0.0, 1.0); }'
            );
            gl.compileShader(vs);
            const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(
                fs,
                'precision highp float; varying vec4 vCol; varying vec3 vF; varying vec3 vTex; uniform sampler2D uAtlas;' +
                    'void main() {' +
                    ' vec4 c;' +
                    ' if (vTex.z > 0.5) {' +
                    '  vec2 uv = fract(vF.xy / vF.z);' + // plane ratio is normalized 0..1 per tile (texel col = ratio*128)
                    '  c = texture2D(uAtlas, vTex.xy + uv * 0.125);' +
                    '  if (c.a < 0.5) discard;' + // cutout textures (texel 0)
                    '  c = vec4(c.rgb * vCol.rgb, vCol.a);' + // texel * light/128 (software >>7)
                    ' } else { c = vCol; }' +
                    ' gl_FragColor = vec4(c.rgb * c.a, c.a); }'
            );
            gl.compileShader(fs);
            const prog = gl.createProgram()!;
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                console.error('[GL] shader link failed: ' + gl.getProgramInfoLog(prog) + ' / ' + gl.getShaderInfoLog(vs) + ' / ' + gl.getShaderInfoLog(fs));
                GlRenderer.initFailed = true;
                return false;
            }
            gl.useProgram(prog);
            const aPos = gl.getAttribLocation(prog, 'aPos');
            const aCol = gl.getAttribLocation(prog, 'aCol');
            const aF = gl.getAttribLocation(prog, 'aF');
            const aTex = gl.getAttribLocation(prog, 'aTex');
            GlRenderer.uScale = gl.getUniformLocation(prog, 'uScale');
            gl.uniform1i(gl.getUniformLocation(prog, 'uAtlas'), 0);
            GlRenderer.vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, GlRenderer.vbo);
            const stride = GlRenderer.VSIZE * 4;
            gl.enableVertexAttribArray(aPos);
            gl.enableVertexAttribArray(aCol);
            gl.enableVertexAttribArray(aF);
            gl.enableVertexAttribArray(aTex);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
            gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, stride, 8);
            gl.vertexAttribPointer(aF, 3, gl.FLOAT, false, stride, 24);
            gl.vertexAttribPointer(aTex, 3, gl.FLOAT, false, stride, 36);
            // 1024x1024 atlas: 8x8 slots of 128x128
            GlRenderer.atlasTex = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, GlRenderer.atlasTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
            gl.disable(gl.DEPTH_TEST);
            gl.disable(gl.CULL_FACE);
            GlRenderer.canvas = canvas;
            GlRenderer.gl = gl;
            console.log('[GL] face-soup renderer initialised (stage B textures)');
            return true;
        } catch (e) {
            console.error('[GL] init failed: ' + e);
            GlRenderer.initFailed = true;
            return false;
        }
    }

    /** Match the GL canvas to the frame canvas size (ScreenMode.applySize). */
    static resize(w: number, h: number): void {
        const canvas = GlRenderer.canvas ?? (document.getElementById('glcanvas') as HTMLCanvasElement | null);
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

    private static grow(): void {
        const grown = new Float32Array(GlRenderer.verts.length * 2);
        grown.set(GlRenderer.verts);
        GlRenderer.verts = grown;
    }

    private static vert(x: number, y: number, r: number, g: number, b: number, a: number, f1: number, f2: number, f3: number, tu: number, tv: number, flag: number): void {
        const v = GlRenderer.verts;
        let i = GlRenderer.count;
        v[i++] = x;
        v[i++] = y;
        v[i++] = r;
        v[i++] = g;
        v[i++] = b;
        v[i++] = a;
        v[i++] = f1;
        v[i++] = f2;
        v[i++] = f3;
        v[i++] = tu;
        v[i++] = tv;
        v[i++] = flag;
        GlRenderer.count = i;
    }

    /** One untextured triangle: clip-local pixel coords + raw 0xRRGGBB + alpha 0..1. */
    static pushTriangle(x0: number, y0: number, rgb0: number, x1: number, y1: number, rgb1: number, x2: number, y2: number, rgb2: number, alpha: number): void {
        if (GlRenderer.count + GlRenderer.VSIZE * 3 > GlRenderer.verts.length) {
            GlRenderer.grow();
        }
        GlRenderer.vert(x0, y0, ((rgb0 >> 16) & 0xff) / 255, ((rgb0 >> 8) & 0xff) / 255, (rgb0 & 0xff) / 255, alpha, 0, 0, 1, 0, 0, 0);
        GlRenderer.vert(x1, y1, ((rgb1 >> 16) & 0xff) / 255, ((rgb1 >> 8) & 0xff) / 255, (rgb1 & 0xff) / 255, alpha, 0, 0, 1, 0, 0, 0);
        GlRenderer.vert(x2, y2, ((rgb2 >> 16) & 0xff) / 255, ((rgb2 >> 8) & 0xff) / 255, (rgb2 & 0xff) / 255, alpha, 0, 0, 1, 0, 0, 0);
    }

    /**
     * One textured triangle. f1/f2/f3 are the software mapper's screen-linear plane
     * functions evaluated at each vertex (u = f1/f3, v = f2/f3, texel units);
     * light0..2 are the per-vertex lightness values (0..128, 64 = neutral).
     * Returns false if the texture has no atlas slot yet (caller falls back).
     */
    static pushTexturedTriangle(
        textureId: number,
        x0: number, y0: number, l0: number, f10: number, f20: number, f30: number,
        x1: number, y1: number, l1: number, f11: number, f21: number, f31: number,
        x2: number, y2: number, l2: number, f12: number, f22: number, f32: number,
        alpha: number
    ): boolean {
        const slot = GlRenderer.slotFor(textureId);
        if (slot < 0) {
            return false;
        }
        if (GlRenderer.count + GlRenderer.VSIZE * 3 > GlRenderer.verts.length) {
            GlRenderer.grow();
        }
        const tu = (slot & 7) * 0.125;
        const tv = (slot >> 3) * 0.125;
        // lightness -> colour channels; shader multiplies texel * light * 2 (0.5 neutral)
        const s0 = Math.min(1, Math.max(0, l0 / 128));
        const s1 = Math.min(1, Math.max(0, l1 / 128));
        const s2 = Math.min(1, Math.max(0, l2 / 128));
        GlRenderer.vert(x0, y0, s0, s0, s0, alpha, f10, f20, f30, tu, tv, 1);
        GlRenderer.vert(x1, y1, s1, s1, s1, alpha, f11, f21, f31, tu, tv, 1);
        GlRenderer.vert(x2, y2, s2, s2, s2, alpha, f12, f22, f32, tu, tv, 1);
        return true;
    }

    /** Atlas slot for a texture id, lazily uploading its texels. -1 = unavailable. */
    private static slotFor(textureId: number): number {
        if (textureId < 0 || textureId >= GlRenderer.atlasSlot.length) {
            return -1;
        }
        let slot = GlRenderer.atlasSlot[textureId];
        if (slot >= 0) {
            return slot;
        }
        if (GlRenderer.atlasNext >= 64) {
            return -1; // atlas full
        }
        const texels = Pix3D.textureManager!.getTexels(Pix3D.brightness, textureId);
        if (texels === null) {
            return -1; // still downloading — caller falls back this frame
        }
        const gl = GlRenderer.gl!;
        const opaque = Pix3D.textureManager!.isOpaque(textureId);
        const up = GlRenderer.atlasUpload;
        for (let i = 0; i < 128 * 128; i++) {
            const t = texels[i];
            up[i * 4] = (t >> 16) & 0xff;
            up[i * 4 + 1] = (t >> 8) & 0xff;
            up[i * 4 + 2] = t & 0xff;
            up[i * 4 + 3] = t === 0 && !opaque ? 0 : 255;
        }
        slot = GlRenderer.atlasNext++;
        gl.bindTexture(gl.TEXTURE_2D, GlRenderer.atlasTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, (slot & 7) * 128, (slot >> 3) * 128, 128, 128, gl.RGBA, gl.UNSIGNED_BYTE, up);
        GlRenderer.atlasSlot[textureId] = slot;
        return slot;
    }

    /** Draw the collected soup: one buffer upload, one draw call. */
    static flush(): void {
        GlRenderer.active = false;
        const gl = GlRenderer.gl;
        const canvas = GlRenderer.canvas;
        if (!gl || !canvas) {
            return;
        }
        if (GlRenderer.dimAlpha > 0) {
            // modal dim (::settings): darken the GL scene itself — a 2D-layer wash
            // would destroy the transparent hole (it has no alpha to blend into)
            const a = GlRenderer.dimAlpha;
            GlRenderer.pushTriangle(0, 0, 0, GlRenderer.vpW, 0, 0, 0, GlRenderer.vpH, 0, a);
            GlRenderer.pushTriangle(GlRenderer.vpW, 0, 0, GlRenderer.vpW, GlRenderer.vpH, 0, 0, GlRenderer.vpH, 0, a);
        }
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
            gl.drawArrays(gl.TRIANGLES, 0, (GlRenderer.count / GlRenderer.VSIZE) | 0);
        }
        gl.disable(gl.SCISSOR_TEST);
        if (GlRenderer.dbgFrames < 3 && GlRenderer.count > 0) {
            GlRenderer.dbgFrames++;
            console.log('[GL] flush tris=' + ((GlRenderer.count / (GlRenderer.VSIZE * 3)) | 0) + ' atlasSlots=' + GlRenderer.atlasNext + ' err=' + gl.getError());
        }
    }
}
