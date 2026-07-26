import LruCache from '#/datastruct/LruCache.js';
import GlTexture from '#/dash3d/GlTexture.js';
import type TextureProvider from '#/dash3d/TextureProvider.js';
import Packet from '#/io/Packet.js';
import type Js5 from '#/js5/Js5.js';

export default class TextureManager implements TextureProvider {
    readonly field1222: Int8Array;
    readonly enabled: boolean[];
    readonly field1224: Int8Array;
    readonly textures: Js5;
    poolSize: number = 50;
    readonly averageRgb: Int16Array;
    readonly textureCache: LruCache<GlTexture>;
    readonly field1233: Int8Array;
    readonly sprites: Js5;
    readonly field1237: boolean[];
    readonly field1241: boolean[];
    readonly hasTexture: boolean[];
    lowMem: boolean = false;
    readonly opaque: boolean[];
    readonly field1250: Int8Array;

    constructor(arg0: Js5, arg1: Js5, arg2: Js5, _arg3: number, arg4: boolean) {
        this.lowMem = arg4;
        this.textures = arg0;
        this.sprites = arg2;
        this.poolSize = 20;
        this.textureCache = new LruCache(this.poolSize);
        void arg1; // rev-500 "materials" manifest archive — does not exist in 465

        // 465: no manifest. Texture defs live as files of textures-archive group 0 (file id =
        // texture id) and carry opaque/averageColour themselves — decoded lazily by loadTexture,
        // which back-fills opaque[]/averageRgb[] below. Until a def arrives the average is 0
        // (renders dark) and refines on download, same as the Java client's lazy build.
        let var7 = 0;
        try {
            var7 = arg0.getFileIdLimit(0);
        } catch {
            var7 = 0;
        }
        this.field1222 = new Int8Array(var7);
        this.enabled = new Array(var7).fill(true);
        this.opaque = new Array(var7).fill(false);
        this.field1224 = new Int8Array(var7);
        this.field1250 = new Int8Array(var7);
        this.field1237 = new Array(var7).fill(false);
        this.hasTexture = new Array(var7).fill(true);
        this.field1241 = new Array(var7).fill(false);
        this.field1233 = new Int8Array(var7);
        this.averageRgb = new Int16Array(var7);
    }

    isOpaque(arg0: number): boolean {
        return this.opaque[arg0];
    }

    isTextureEnabled(arg0: number): boolean {
        return this.enabled[arg0];
    }

    isLoaded(arg0: number): boolean {
        const var2 = this.loadTexture(arg0);
        return var2 === null ? false : var2.isReady(this, this.sprites);
    }

    getAverageRgb(arg0: number): number {
        return this.averageRgb[arg0] & 0xffff;
    }

    private defsLoaded: boolean = false;

    /**
     * True once the texture-def group (idx 9 group 0) is downloaded and every def has been
     * decoded (filling opaque[]/averageRgb[]). The scene build bakes minimap + lowmem ground
     * colours from averageRgb — building before the defs arrive baked water/roofs black until
     * the next region rebuild.
     */
    defsReady(): boolean {
        if (this.defsLoaded) {
            return true;
        }
        if (this.averageRgb.length === 0) {
            this.defsLoaded = true;
            return true;
        }
        let any = false;
        for (let i = 0; i < this.averageRgb.length; i++) {
            if (this.loadTexture(i) !== null) {
                any = true;
            }
        }
        if (!any) {
            return false; // group 0 still downloading (loadTexture triggered the request)
        }
        this.defsLoaded = true;
        return true;
    }

    loadTexture(arg0: number): GlTexture | null {
        const var2 = this.textureCache.find(BigInt(arg0));
        if (var2 !== null) {
            return var2;
        }

        // 465 addressing: texture id = FILE arg0 of GROUP 0 (rev-500 used group-per-texture).
        const var3 = this.textures.getFile(arg0, 0);
        if (var3 === null) {
            return null;
        } else {
            const var4 = new Packet(var3);
            const var5 = new GlTexture(var4);
            this.textureCache.put(BigInt(arg0), var5);
            // back-fill the per-texture facts the rev-500 manifest used to carry
            if (arg0 < this.opaque.length) {
                this.opaque[arg0] = var5.opaque;
                this.averageRgb[arg0] = var5.averageHsl;
            }
            return var5;
        }
    }

    isLowMem(arg0: number): boolean {
        return this.lowMem || this.field1237[arg0];
    }

    reset(): void {
        this.textureCache.clear();
    }

    getTexels(arg0: number): Int32Array | null;
    getTexels(arg0: number, arg1: number): Int32Array | null;
    getTexels(arg0: number, arg1?: number): Int32Array | null {
        if (typeof arg1 === 'undefined') {
            const var2 = this.loadTexture(arg0);
            return var2 === null ? null : var2.getTextures(this.sprites, this.lowMem || this.field1237[arg0], this);
        }

        const var3 = this.loadTexture(arg1);
        if (var3 === null) {
            return null;
        }
        var3.needsAnimation = true;
        return var3.getTexels(this, arg0, this.sprites, this.lowMem || this.field1237[arg1]);
    }

    runAnims(arg0: number): void {
        for (let var2 = this.textureCache.search() as GlTexture | null; var2 !== null; var2 = this.textureCache.findnext() as GlTexture | null) {
            if (var2.needsAnimation) {
                var2.animate(arg0);
                var2.needsAnimation = false;
            }
        }
    }
}
