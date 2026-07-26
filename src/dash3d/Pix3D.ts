import Pix2D from '#/graphics/Pix2D.js';
import GlRenderer from '#/dash3d/GlRenderer.js';
import type TextureProvider from '#/dash3d/TextureProvider.js';
import IntMath from '#/util/IntMath.js';

// jag::oldscape::dash3d::Pix3D
export default class Pix3D {
    // jag::oldscape::dash3d::Pix3D::SetHClip
    static hclip: boolean = false;

    static opaque: boolean = false;
    static lowMem: boolean = false;

    // jag::oldscape::dash3d::Pix3D::SetLowDetail
    static lowDetail: boolean = true;

    // jag::oldscape::dash3d::Pix3D::SetTrans
    static trans: number = 0;

    static originX: number = 0;
    static originY: number = 0;
    static sizeX: number = 0;
    static sizeY: number = 0;
    static minX: number = 0;
    static maxX: number = 0;
    static minY: number = 0;
    static maxY: number = 0;
    static scanline: Int32Array = new Int32Array(1024);

    // jag::oldscape::dash3d::Pix3D::m_colourTable
    static readonly colourTable: Int32Array = new Int32Array(65536);

    static textureManager: TextureProvider;

    // jag::oldscape::dash3d::Pix3D::m_divTable
    static readonly divTable: Int32Array = new Int32Array(512);

    // jag::oldscape::dash3d::Pix3D::m_divTable2
    static readonly divTable2: Int32Array = new Int32Array(2048);

    // jag::oldscape::dash3d::Pix3D::m_sinTable
    static readonly sinTable: Int32Array = new Int32Array(2048);

    // jag::oldscape::dash3d::Pix3D::m_cosTable
    static readonly cosTable: Int32Array = new Int32Array(2048);

    static brightness: number = 1.0;
    static textureFallback: boolean = false;

    static {
        for (let i: number = 1; i < 512; i++) {
            Pix3D.divTable[i] = (32768 / i) | 0;
        }

        for (let i: number = 1; i < 2048; i++) {
            Pix3D.divTable2[i] = (65536 / i) | 0;
        }

        for (let i: number = 0; i < 2048; i++) {
            Pix3D.sinTable[i] = (Math.sin(i * 0.0030679615) * 65536.0) | 0;
            Pix3D.cosTable[i] = (Math.cos(i * 0.0030679615) * 65536.0) | 0;
        }
    }

    // jag::oldscape::dash3d::Pix3D::SetRenderClipping
    /**
     * Scene-pass projection focal (512 = the engine's baked baseline). Set around
     * World.renderAll to ScreenMode.sceneFocal / renderScale for constant-vertical-
     * FOV resizable windows and the half-res render; every UI pass (item icons,
     * interface models) runs with it at 512.
     */
    static focal: number = 512;

    static setRenderClipping(): void {
        Pix3D.setClipping(Pix2D.clipMinX, Pix2D.clipMinY, Pix2D.clipMaxX, Pix2D.clipMaxY);
    }

    // jag::oldscape::dash3d::Pix3D::SetClipping
    static setClipping(arg0: number, arg1: number, arg2: number, arg3: number): void {
        Pix3D.sizeX = arg2 - arg0;
        Pix3D.sizeY = arg3 - arg1;
        Pix3D.resetOrigin();
        if (Pix3D.scanline.length < Pix3D.sizeY) {
            Pix3D.scanline = new Int32Array(IntMath.bitceil(Pix3D.sizeY));
        }
        let var4 = arg1 * Pix2D.width + arg0;
        for (let var5: number = 0; var5 < Pix3D.sizeY; var5++) {
            Pix3D.scanline[var5] = var4;
            var4 += Pix2D.width;
        }
    }

    static getClipX(): number {
        return Pix3D.scanline[0] % Pix2D.width;
    }

    static getClipY(): number {
        return (Pix3D.scanline[0] / Pix2D.width) | 0;
    }

    // jag::oldscape::dash3d::Pix3D::ResetOrigin
    static resetOrigin(): void {
        Pix3D.originX = (Pix3D.sizeX / 2) | 0;
        Pix3D.originY = (Pix3D.sizeY / 2) | 0;
        Pix3D.minX = -Pix3D.originX;
        Pix3D.maxX = Pix3D.sizeX - Pix3D.originX;
        Pix3D.minY = -Pix3D.originY;
        Pix3D.maxY = Pix3D.sizeY - Pix3D.originY;
    }

    // jag::oldscape::dash3d::Pix3D::SetOrigin
    static setOrigin(arg0: number, arg1: number): void {
        const var2 = Pix3D.scanline[0];
        const var3 = (var2 / Pix2D.width) | 0;
        const var4 = var2 - var3 * Pix2D.width;
        Pix3D.originX = arg0 - var4;
        Pix3D.originY = arg1 - var3;
        Pix3D.minX = -Pix3D.originX;
        Pix3D.maxX = Pix3D.sizeX - Pix3D.originX;
        Pix3D.minY = -Pix3D.originY;
        Pix3D.maxY = Pix3D.sizeY - Pix3D.originY;
    }

    // jag::oldscape::dash3d::Pix3D::SetTextures
    static setTextures(arg0: TextureProvider): void {
        Pix3D.textureManager = arg0;
    }

    static setBrightness(arg0: number): void {
        Pix3D.brightness = arg0;
        Pix3D.brightness = Pix3D.brightness + Math.random() * 0.03 - 0.015;
    }

    // jag::oldscape::dash3d::Pix3D::InitColourTable
    static initColourTable(): void;
    static initColourTable(brightness: number): void;
    static initColourTable(brightness?: number): void {
        if (brightness !== undefined) {
            Pix3D.setBrightness(brightness);
            Pix3D.initColourTable();
            return;
        }

        let offset: number = 0;
        for (let y: number = 0; y < 512; y++) {
            const hue: number = ((y / 8) | 0) / 64.0 + 0.0078125;
            const saturation: number = (y & 0x7) / 8.0 + 0.0625;

            for (let x: number = 0; x < 128; x++) {
                const lightness: number = x / 128.0;
                let r: number = lightness;
                let g: number = lightness;
                let b: number = lightness;

                if (saturation !== 0.0) {
                    let q: number;
                    if (lightness < 0.5) {
                        q = lightness * (saturation + 1.0);
                    } else {
                        q = lightness + saturation - lightness * saturation;
                    }

                    const p: number = lightness * 2.0 - q;
                    let t: number = hue + 0.3333333333333333;
                    if (t > 1.0) {
                        t--;
                    }

                    let d11: number = hue - 0.3333333333333333;
                    if (d11 < 0.0) {
                        d11++;
                    }

                    if (t * 6.0 < 1.0) {
                        r = p + (q - p) * 6.0 * t;
                    } else if (t * 2.0 < 1.0) {
                        r = q;
                    } else if (t * 3.0 < 2.0) {
                        r = p + (q - p) * (0.6666666666666666 - t) * 6.0;
                    } else {
                        r = p;
                    }

                    if (hue * 6.0 < 1.0) {
                        g = p + (q - p) * 6.0 * hue;
                    } else if (hue * 2.0 < 1.0) {
                        g = q;
                    } else if (hue * 3.0 < 2.0) {
                        g = p + (q - p) * (0.6666666666666666 - hue) * 6.0;
                    } else {
                        g = p;
                    }

                    if (d11 * 6.0 < 1.0) {
                        b = p + (q - p) * 6.0 * d11;
                    } else if (d11 * 2.0 < 1.0) {
                        b = q;
                    } else if (d11 * 3.0 < 2.0) {
                        b = p + (q - p) * (0.6666666666666666 - d11) * 6.0;
                    } else {
                        b = p;
                    }
                }

                const powR: number = Math.pow(r, Pix3D.brightness);
                const powG: number = Math.pow(g, Pix3D.brightness);
                const powB: number = Math.pow(b, Pix3D.brightness);
                const intR: number = (powR * 256.0) | 0;
                const intG: number = (powG * 256.0) | 0;
                const intB: number = (powB * 256.0) | 0;
                let rgb: number = (intR << 16) + (intG << 8) + intB;
                if (rgb === 0) {
                    rgb = 1;
                }
                Pix3D.colourTable[offset++] = rgb;
            }
        }
    }

    // jag::oldscape::dash3d::Pix3D::SetHClip
    static setHClip(arg0: number, arg1: number, arg2: number): void {
        Pix3D.hclip = arg0 < 0 || arg0 > Pix3D.sizeX || arg1 < 0 || arg1 > Pix3D.sizeX || arg2 < 0 || arg2 > Pix3D.sizeX;
    }

    static gouraudTriangle(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number): void {
        if (GlRenderer.active) {
            // GPU path: args are (y0,y1,y2, x0,x1,x2, palette c0,c1,c2)
            GlRenderer.pushTriangle(arg3, arg0, Pix3D.colourTable[arg6 & 0xffff], arg4, arg1, Pix3D.colourTable[arg7 & 0xffff], arg5, arg2, Pix3D.colourTable[arg8 & 0xffff], (256 - Pix3D.trans) / 256);
            return;
        }
        const var9 = arg4 - arg3;
        const var10 = arg1 - arg0;
        const var11 = arg5 - arg3;
        const var12 = arg2 - arg0;
        const var13 = arg7 - arg6;
        const var14 = arg8 - arg6;
        let var15: number;
        if (arg2 === arg1) {
            var15 = 0;
        } else {
            var15 = (((arg5 - arg4) << 16) / (arg2 - arg1)) | 0;
        }
        let var16: number;
        if (arg1 === arg0) {
            var16 = 0;
        } else {
            var16 = ((var9 << 16) / var10) | 0;
        }
        let var17: number;
        if (arg2 === arg0) {
            var17 = 0;
        } else {
            var17 = ((var11 << 16) / var12) | 0;
        }
        const var18 = var9 * var12 - var11 * var10;
        if (var18 === 0) {
            return;
        }
        const var19 = (((var13 * var12 - var14 * var10) << 8) / var18) | 0;
        const var20 = (((var14 * var9 - var13 * var11) << 8) / var18) | 0;
        if (arg0 <= arg1 && arg0 <= arg2) {
            if (arg0 < Pix3D.sizeY) {
                if (arg1 > Pix3D.sizeY) {
                    arg1 = Pix3D.sizeY;
                }
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                let var21 = (arg6 << 8) + var19 - var19 * arg3;
                if (arg1 < arg2) {
                    let var22: number;
                    let var23 = (var22 = arg3 << 16);
                    if (arg0 < 0) {
                        var23 -= var17 * arg0;
                        var22 -= var16 * arg0;
                        var21 -= var20 * arg0;
                        arg0 = 0;
                    }
                    let var24 = arg4 << 16;
                    if (arg1 < 0) {
                        var24 -= var15 * arg1;
                        arg1 = 0;
                    }
                    if ((arg0 !== arg1 && var17 < var16) || (arg0 === arg1 && var17 > var15)) {
                        let var25 = arg2 - arg1;
                        let var26 = arg1 - arg0;
                        let var27 = Pix3D.scanline[arg0];
                        while (true) {
                            var26--;
                            if (var26 < 0) {
                                while (true) {
                                    var25--;
                                    if (var25 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var27, var23 >> 16, var24 >> 16, var21, var19);
                                    var23 += var17;
                                    var24 += var15;
                                    var21 += var20;
                                    var27 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var27, var23 >> 16, var22 >> 16, var21, var19);
                            var23 += var17;
                            var22 += var16;
                            var21 += var20;
                            var27 += Pix2D.width;
                        }
                    } else {
                        let var28 = arg2 - arg1;
                        let var29 = arg1 - arg0;
                        let var30 = Pix3D.scanline[arg0];
                        while (true) {
                            var29--;
                            if (var29 < 0) {
                                while (true) {
                                    var28--;
                                    if (var28 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var30, var24 >> 16, var23 >> 16, var21, var19);
                                    var23 += var17;
                                    var24 += var15;
                                    var21 += var20;
                                    var30 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var30, var22 >> 16, var23 >> 16, var21, var19);
                            var23 += var17;
                            var22 += var16;
                            var21 += var20;
                            var30 += Pix2D.width;
                        }
                    }
                } else {
                    let var31: number;
                    let var32 = (var31 = arg3 << 16);
                    if (arg0 < 0) {
                        var32 -= var17 * arg0;
                        var31 -= var16 * arg0;
                        var21 -= var20 * arg0;
                        arg0 = 0;
                    }
                    let var33 = arg5 << 16;
                    if (arg2 < 0) {
                        var33 -= var15 * arg2;
                        arg2 = 0;
                    }
                    if ((arg0 !== arg2 && var17 < var16) || (arg0 === arg2 && var15 > var16)) {
                        let var34 = arg1 - arg2;
                        let var35 = arg2 - arg0;
                        let var36 = Pix3D.scanline[arg0];
                        while (true) {
                            var35--;
                            if (var35 < 0) {
                                while (true) {
                                    var34--;
                                    if (var34 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var36, var33 >> 16, var31 >> 16, var21, var19);
                                    var33 += var15;
                                    var31 += var16;
                                    var21 += var20;
                                    var36 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var36, var32 >> 16, var31 >> 16, var21, var19);
                            var32 += var17;
                            var31 += var16;
                            var21 += var20;
                            var36 += Pix2D.width;
                        }
                    } else {
                        let var37 = arg1 - arg2;
                        let var38 = arg2 - arg0;
                        let var39 = Pix3D.scanline[arg0];
                        while (true) {
                            var38--;
                            if (var38 < 0) {
                                while (true) {
                                    var37--;
                                    if (var37 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var39, var31 >> 16, var33 >> 16, var21, var19);
                                    var33 += var15;
                                    var31 += var16;
                                    var21 += var20;
                                    var39 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var39, var31 >> 16, var32 >> 16, var21, var19);
                            var32 += var17;
                            var31 += var16;
                            var21 += var20;
                            var39 += Pix2D.width;
                        }
                    }
                }
            }
        } else if (arg1 <= arg2) {
            if (arg1 < Pix3D.sizeY) {
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                if (arg0 > Pix3D.sizeY) {
                    arg0 = Pix3D.sizeY;
                }
                let var40 = (arg7 << 8) + var19 - var19 * arg4;
                if (arg2 < arg0) {
                    let var41: number;
                    let var42 = (var41 = arg4 << 16);
                    if (arg1 < 0) {
                        var42 -= var16 * arg1;
                        var41 -= var15 * arg1;
                        var40 -= var20 * arg1;
                        arg1 = 0;
                    }
                    let var43 = arg5 << 16;
                    if (arg2 < 0) {
                        var43 -= var17 * arg2;
                        arg2 = 0;
                    }
                    if ((arg1 === arg2 || var16 >= var15) && (arg1 !== arg2 || var16 <= var17)) {
                        let var47 = arg0 - arg2;
                        let var48 = arg2 - arg1;
                        let var49 = Pix3D.scanline[arg1];
                        while (true) {
                            var48--;
                            if (var48 < 0) {
                                while (true) {
                                    var47--;
                                    if (var47 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var49, var43 >> 16, var42 >> 16, var40, var19);
                                    var42 += var16;
                                    var43 += var17;
                                    var40 += var20;
                                    var49 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var49, var41 >> 16, var42 >> 16, var40, var19);
                            var42 += var16;
                            var41 += var15;
                            var40 += var20;
                            var49 += Pix2D.width;
                        }
                    } else {
                        let var44 = arg0 - arg2;
                        let var45 = arg2 - arg1;
                        let var46 = Pix3D.scanline[arg1];
                        while (true) {
                            var45--;
                            if (var45 < 0) {
                                while (true) {
                                    var44--;
                                    if (var44 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var46, var42 >> 16, var43 >> 16, var40, var19);
                                    var42 += var16;
                                    var43 += var17;
                                    var40 += var20;
                                    var46 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var46, var42 >> 16, var41 >> 16, var40, var19);
                            var42 += var16;
                            var41 += var15;
                            var40 += var20;
                            var46 += Pix2D.width;
                        }
                    }
                } else {
                    let var50: number;
                    let var51 = (var50 = arg4 << 16);
                    if (arg1 < 0) {
                        var51 -= var16 * arg1;
                        var50 -= var15 * arg1;
                        var40 -= var20 * arg1;
                        arg1 = 0;
                    }
                    let var52 = arg3 << 16;
                    if (arg0 < 0) {
                        var52 -= var17 * arg0;
                        arg0 = 0;
                    }
                    if (var16 < var15) {
                        let var53 = arg2 - arg0;
                        let var54 = arg0 - arg1;
                        let var55 = Pix3D.scanline[arg1];
                        while (true) {
                            var54--;
                            if (var54 < 0) {
                                while (true) {
                                    var53--;
                                    if (var53 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var55, var52 >> 16, var50 >> 16, var40, var19);
                                    var52 += var17;
                                    var50 += var15;
                                    var40 += var20;
                                    var55 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var55, var51 >> 16, var50 >> 16, var40, var19);
                            var51 += var16;
                            var50 += var15;
                            var40 += var20;
                            var55 += Pix2D.width;
                        }
                    } else {
                        let var56 = arg2 - arg0;
                        let var57 = arg0 - arg1;
                        let var58 = Pix3D.scanline[arg1];
                        while (true) {
                            var57--;
                            if (var57 < 0) {
                                while (true) {
                                    var56--;
                                    if (var56 < 0) {
                                        return;
                                    }
                                    Pix3D.gouraudRaster(Pix2D.pixels, var58, var50 >> 16, var52 >> 16, var40, var19);
                                    var52 += var17;
                                    var50 += var15;
                                    var40 += var20;
                                    var58 += Pix2D.width;
                                }
                            }
                            Pix3D.gouraudRaster(Pix2D.pixels, var58, var50 >> 16, var51 >> 16, var40, var19);
                            var51 += var16;
                            var50 += var15;
                            var40 += var20;
                            var58 += Pix2D.width;
                        }
                    }
                }
            }
        } else if (arg2 < Pix3D.sizeY) {
            if (arg0 > Pix3D.sizeY) {
                arg0 = Pix3D.sizeY;
            }
            if (arg1 > Pix3D.sizeY) {
                arg1 = Pix3D.sizeY;
            }
            let var59 = (arg8 << 8) + var19 - var19 * arg5;
            if (arg0 < arg1) {
                let var60: number;
                let var61 = (var60 = arg5 << 16);
                if (arg2 < 0) {
                    var61 -= var15 * arg2;
                    var60 -= var17 * arg2;
                    var59 -= var20 * arg2;
                    arg2 = 0;
                }
                let var62 = arg3 << 16;
                if (arg0 < 0) {
                    var62 -= var16 * arg0;
                    arg0 = 0;
                }
                if (var15 < var17) {
                    let var63 = arg1 - arg0;
                    let var64 = arg0 - arg2;
                    let var65 = Pix3D.scanline[arg2];
                    while (true) {
                        var64--;
                        if (var64 < 0) {
                            while (true) {
                                var63--;
                                if (var63 < 0) {
                                    return;
                                }
                                Pix3D.gouraudRaster(Pix2D.pixels, var65, var61 >> 16, var62 >> 16, var59, var19);
                                var61 += var15;
                                var62 += var16;
                                var59 += var20;
                                var65 += Pix2D.width;
                            }
                        }
                        Pix3D.gouraudRaster(Pix2D.pixels, var65, var61 >> 16, var60 >> 16, var59, var19);
                        var61 += var15;
                        var60 += var17;
                        var59 += var20;
                        var65 += Pix2D.width;
                    }
                } else {
                    let var66 = arg1 - arg0;
                    let var67 = arg0 - arg2;
                    let var68 = Pix3D.scanline[arg2];
                    while (true) {
                        var67--;
                        if (var67 < 0) {
                            while (true) {
                                var66--;
                                if (var66 < 0) {
                                    return;
                                }
                                Pix3D.gouraudRaster(Pix2D.pixels, var68, var62 >> 16, var61 >> 16, var59, var19);
                                var61 += var15;
                                var62 += var16;
                                var59 += var20;
                                var68 += Pix2D.width;
                            }
                        }
                        Pix3D.gouraudRaster(Pix2D.pixels, var68, var60 >> 16, var61 >> 16, var59, var19);
                        var61 += var15;
                        var60 += var17;
                        var59 += var20;
                        var68 += Pix2D.width;
                    }
                }
            } else {
                let var69: number;
                let var70 = (var69 = arg5 << 16);
                if (arg2 < 0) {
                    var70 -= var15 * arg2;
                    var69 -= var17 * arg2;
                    var59 -= var20 * arg2;
                    arg2 = 0;
                }
                let var71 = arg4 << 16;
                if (arg1 < 0) {
                    var71 -= var16 * arg1;
                    arg1 = 0;
                }
                if (var15 < var17) {
                    let var72 = arg0 - arg1;
                    let var73 = arg1 - arg2;
                    let var74 = Pix3D.scanline[arg2];
                    while (true) {
                        var73--;
                        if (var73 < 0) {
                            while (true) {
                                var72--;
                                if (var72 < 0) {
                                    return;
                                }
                                Pix3D.gouraudRaster(Pix2D.pixels, var74, var71 >> 16, var69 >> 16, var59, var19);
                                var71 += var16;
                                var69 += var17;
                                var59 += var20;
                                var74 += Pix2D.width;
                            }
                        }
                        Pix3D.gouraudRaster(Pix2D.pixels, var74, var70 >> 16, var69 >> 16, var59, var19);
                        var70 += var15;
                        var69 += var17;
                        var59 += var20;
                        var74 += Pix2D.width;
                    }
                } else {
                    let var75 = arg0 - arg1;
                    let var76 = arg1 - arg2;
                    let var77 = Pix3D.scanline[arg2];
                    while (true) {
                        var76--;
                        if (var76 < 0) {
                            while (true) {
                                var75--;
                                if (var75 < 0) {
                                    return;
                                }
                                Pix3D.gouraudRaster(Pix2D.pixels, var77, var69 >> 16, var71 >> 16, var59, var19);
                                var71 += var16;
                                var69 += var17;
                                var59 += var20;
                                var77 += Pix2D.width;
                            }
                        }
                        Pix3D.gouraudRaster(Pix2D.pixels, var77, var69 >> 16, var70 >> 16, var59, var19);
                        var70 += var15;
                        var69 += var17;
                        var59 += var20;
                        var77 += Pix2D.width;
                    }
                }
            }
        }
    }

    static gouraudRaster(arg0: Int32Array, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        if (Pix3D.hclip) {
            if (arg3 > Pix3D.sizeX) {
                arg3 = Pix3D.sizeX;
            }
            if (arg2 < 0) {
                arg2 = 0;
            }
        }
        if (arg2 >= arg3) {
            return;
        }
        let var6 = arg1 + arg2;
        let var7 = arg4 + arg5 * arg2;
        if (!Pix3D.lowDetail) {
            let var25 = arg3 - arg2;
            if (Pix3D.trans === 0) {
                do {
                    arg0[var6++] = Pix3D.colourTable[var7 >> 8];
                    var7 += arg5;
                    var25--;
                } while (var25 > 0);
            } else {
                const var26 = Pix3D.trans;
                const var27 = 256 - Pix3D.trans;
                do {
                    const var28 = Pix3D.colourTable[var7 >> 8];
                    var7 += arg5;
                    const var29 = ((((var28 & 0xff00ff) * var27) >> 8) & 0xff00ff) + ((((var28 & 0xff00) * var27) >> 8) & 0xff00);
                    const var30 = arg0[var6];
                    arg0[var6++] = var29 + ((((var30 & 0xff00ff) * var26) >> 8) & 0xff00ff) + ((((var30 & 0xff00) * var26) >> 8) & 0xff00);
                    var25--;
                } while (var25 > 0);
            }
            return;
        }
        let var8 = (arg3 - arg2) >> 2;
        const var9 = arg5 << 2;
        if (Pix3D.trans === 0) {
            if (var8 > 0) {
                do {
                    const var10 = Pix3D.colourTable[var7 >> 8];
                    var7 += var9;
                    arg0[var6++] = var10;
                    arg0[var6++] = var10;
                    arg0[var6++] = var10;
                    arg0[var6++] = var10;
                    var8--;
                } while (var8 > 0);
            }
            let var11 = (arg3 - arg2) & 0x3;
            if (var11 > 0) {
                const var12 = Pix3D.colourTable[var7 >> 8];
                do {
                    arg0[var6++] = var12;
                    var11--;
                } while (var11 > 0);
                return;
            }
            return;
        }
        const var13 = Pix3D.trans;
        const var14 = 256 - Pix3D.trans;
        if (var8 > 0) {
            do {
                const var15 = Pix3D.colourTable[var7 >> 8];
                var7 += var9;
                const var16 = ((((var15 & 0xff00ff) * var14) >> 8) & 0xff00ff) + ((((var15 & 0xff00) * var14) >> 8) & 0xff00);
                const var17 = arg0[var6];
                arg0[var6++] = var16 + ((((var17 & 0xff00ff) * var13) >> 8) & 0xff00ff) + ((((var17 & 0xff00) * var13) >> 8) & 0xff00);
                const var18 = arg0[var6];
                arg0[var6++] = var16 + ((((var18 & 0xff00ff) * var13) >> 8) & 0xff00ff) + ((((var18 & 0xff00) * var13) >> 8) & 0xff00);
                const var19 = arg0[var6];
                arg0[var6++] = var16 + ((((var19 & 0xff00ff) * var13) >> 8) & 0xff00ff) + ((((var19 & 0xff00) * var13) >> 8) & 0xff00);
                const var20 = arg0[var6];
                arg0[var6++] = var16 + ((((var20 & 0xff00ff) * var13) >> 8) & 0xff00ff) + ((((var20 & 0xff00) * var13) >> 8) & 0xff00);
                var8--;
            } while (var8 > 0);
        }
        let var21 = (arg3 - arg2) & 0x3;
        if (var21 <= 0) {
            return;
        }
        const var22 = Pix3D.colourTable[var7 >> 8];
        const var23 = ((((var22 & 0xff00ff) * var14) >> 8) & 0xff00ff) + ((((var22 & 0xff00) * var14) >> 8) & 0xff00);
        do {
            const var24 = arg0[var6];
            arg0[var6++] = var23 + ((((var24 & 0xff00ff) * var13) >> 8) & 0xff00ff) + ((((var24 & 0xff00) * var13) >> 8) & 0xff00);
            var21--;
        } while (var21 > 0);
    }

    static flatTriangle(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number): void {
        if (GlRenderer.active) {
            // GPU path: args are (y0,y1,y2, x0,x1,x2, raw RGB)
            GlRenderer.pushTriangle(arg3, arg0, arg6, arg4, arg1, arg6, arg5, arg2, arg6, (256 - Pix3D.trans) / 256);
            return;
        }
        let var7: number = 0;
        if (arg1 !== arg0) {
            var7 = (((arg4 - arg3) << 16) / (arg1 - arg0)) | 0;
        }
        let var8: number = 0;
        if (arg2 !== arg1) {
            var8 = (((arg5 - arg4) << 16) / (arg2 - arg1)) | 0;
        }
        let var9: number = 0;
        if (arg2 !== arg0) {
            var9 = (((arg3 - arg5) << 16) / (arg0 - arg2)) | 0;
        }
        if (arg0 <= arg1 && arg0 <= arg2) {
            if (arg0 < Pix3D.sizeY) {
                if (arg1 > Pix3D.sizeY) {
                    arg1 = Pix3D.sizeY;
                }
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                if (arg1 < arg2) {
                    let var10: number;
                    let var11: number = (var10 = arg3 << 16);
                    if (arg0 < 0) {
                        var11 -= var9 * arg0;
                        var10 -= var7 * arg0;
                        arg0 = 0;
                    }
                    let var12: number = arg4 << 16;
                    if (arg1 < 0) {
                        var12 -= var8 * arg1;
                        arg1 = 0;
                    }
                    if ((arg0 !== arg1 && var9 < var7) || (arg0 === arg1 && var9 > var8)) {
                        let var13: number = arg2 - arg1;
                        let var14: number = arg1 - arg0;
                        let var15: number = Pix3D.scanline[arg0];
                        while (true) {
                            var14--;
                            if (var14 < 0) {
                                while (true) {
                                    var13--;
                                    if (var13 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var15, arg6, var11 >> 16, var12 >> 16);
                                    var11 += var9;
                                    var12 += var8;
                                    var15 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var15, arg6, var11 >> 16, var10 >> 16);
                            var11 += var9;
                            var10 += var7;
                            var15 += Pix2D.width;
                        }
                    } else {
                        let var16: number = arg2 - arg1;
                        let var17: number = arg1 - arg0;
                        let var18: number = Pix3D.scanline[arg0];
                        while (true) {
                            var17--;
                            if (var17 < 0) {
                                while (true) {
                                    var16--;
                                    if (var16 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var18, arg6, var12 >> 16, var11 >> 16);
                                    var11 += var9;
                                    var12 += var8;
                                    var18 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var18, arg6, var10 >> 16, var11 >> 16);
                            var11 += var9;
                            var10 += var7;
                            var18 += Pix2D.width;
                        }
                    }
                } else {
                    let var19: number;
                    let var20: number = (var19 = arg3 << 16);
                    if (arg0 < 0) {
                        var20 -= var9 * arg0;
                        var19 -= var7 * arg0;
                        arg0 = 0;
                    }
                    let var21: number = arg5 << 16;
                    if (arg2 < 0) {
                        var21 -= var8 * arg2;
                        arg2 = 0;
                    }
                    if ((arg0 !== arg2 && var9 < var7) || (arg0 === arg2 && var8 > var7)) {
                        let var22: number = arg1 - arg2;
                        let var23: number = arg2 - arg0;
                        let var24: number = Pix3D.scanline[arg0];
                        while (true) {
                            var23--;
                            if (var23 < 0) {
                                while (true) {
                                    var22--;
                                    if (var22 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var24, arg6, var21 >> 16, var19 >> 16);
                                    var21 += var8;
                                    var19 += var7;
                                    var24 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var24, arg6, var20 >> 16, var19 >> 16);
                            var20 += var9;
                            var19 += var7;
                            var24 += Pix2D.width;
                        }
                    } else {
                        let var25: number = arg1 - arg2;
                        let var26: number = arg2 - arg0;
                        let var27: number = Pix3D.scanline[arg0];
                        while (true) {
                            var26--;
                            if (var26 < 0) {
                                while (true) {
                                    var25--;
                                    if (var25 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var27, arg6, var19 >> 16, var21 >> 16);
                                    var21 += var8;
                                    var19 += var7;
                                    var27 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var27, arg6, var19 >> 16, var20 >> 16);
                            var20 += var9;
                            var19 += var7;
                            var27 += Pix2D.width;
                        }
                    }
                }
            }
        } else if (arg1 <= arg2) {
            if (arg1 < Pix3D.sizeY) {
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                if (arg0 > Pix3D.sizeY) {
                    arg0 = Pix3D.sizeY;
                }
                if (arg2 < arg0) {
                    let var28: number;
                    let var29: number = (var28 = arg4 << 16);
                    if (arg1 < 0) {
                        var29 -= var7 * arg1;
                        var28 -= var8 * arg1;
                        arg1 = 0;
                    }
                    let var30: number = arg5 << 16;
                    if (arg2 < 0) {
                        var30 -= var9 * arg2;
                        arg2 = 0;
                    }
                    if ((arg1 !== arg2 && var7 < var8) || (arg1 === arg2 && var7 > var9)) {
                        let var31: number = arg0 - arg2;
                        let var32: number = arg2 - arg1;
                        let var33: number = Pix3D.scanline[arg1];
                        while (true) {
                            var32--;
                            if (var32 < 0) {
                                while (true) {
                                    var31--;
                                    if (var31 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var33, arg6, var29 >> 16, var30 >> 16);
                                    var29 += var7;
                                    var30 += var9;
                                    var33 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var33, arg6, var29 >> 16, var28 >> 16);
                            var29 += var7;
                            var28 += var8;
                            var33 += Pix2D.width;
                        }
                    } else {
                        let var34: number = arg0 - arg2;
                        let var35: number = arg2 - arg1;
                        let var36: number = Pix3D.scanline[arg1];
                        while (true) {
                            var35--;
                            if (var35 < 0) {
                                while (true) {
                                    var34--;
                                    if (var34 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var36, arg6, var30 >> 16, var29 >> 16);
                                    var29 += var7;
                                    var30 += var9;
                                    var36 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var36, arg6, var28 >> 16, var29 >> 16);
                            var29 += var7;
                            var28 += var8;
                            var36 += Pix2D.width;
                        }
                    }
                } else {
                    let var37: number;
                    let var38: number = (var37 = arg4 << 16);
                    if (arg1 < 0) {
                        var38 -= var7 * arg1;
                        var37 -= var8 * arg1;
                        arg1 = 0;
                    }
                    let var39: number = arg3 << 16;
                    if (arg0 < 0) {
                        var39 -= var9 * arg0;
                        arg0 = 0;
                    }
                    if (var7 < var8) {
                        let var40: number = arg2 - arg0;
                        let var41: number = arg0 - arg1;
                        let var42: number = Pix3D.scanline[arg1];
                        while (true) {
                            var41--;
                            if (var41 < 0) {
                                while (true) {
                                    var40--;
                                    if (var40 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var42, arg6, var39 >> 16, var37 >> 16);
                                    var39 += var9;
                                    var37 += var8;
                                    var42 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var42, arg6, var38 >> 16, var37 >> 16);
                            var38 += var7;
                            var37 += var8;
                            var42 += Pix2D.width;
                        }
                    } else {
                        let var43: number = arg2 - arg0;
                        let var44: number = arg0 - arg1;
                        let var45: number = Pix3D.scanline[arg1];
                        while (true) {
                            var44--;
                            if (var44 < 0) {
                                while (true) {
                                    var43--;
                                    if (var43 < 0) {
                                        return;
                                    }
                                    Pix3D.flatRaster(Pix2D.pixels, var45, arg6, var37 >> 16, var39 >> 16);
                                    var39 += var9;
                                    var37 += var8;
                                    var45 += Pix2D.width;
                                }
                            }
                            Pix3D.flatRaster(Pix2D.pixels, var45, arg6, var37 >> 16, var38 >> 16);
                            var38 += var7;
                            var37 += var8;
                            var45 += Pix2D.width;
                        }
                    }
                }
            }
        } else if (arg2 < Pix3D.sizeY) {
            if (arg0 > Pix3D.sizeY) {
                arg0 = Pix3D.sizeY;
            }
            if (arg1 > Pix3D.sizeY) {
                arg1 = Pix3D.sizeY;
            }
            if (arg0 < arg1) {
                let var46: number;
                let var47: number = (var46 = arg5 << 16);
                if (arg2 < 0) {
                    var47 -= var8 * arg2;
                    var46 -= var9 * arg2;
                    arg2 = 0;
                }
                let var48: number = arg3 << 16;
                if (arg0 < 0) {
                    var48 -= var7 * arg0;
                    arg0 = 0;
                }
                if (var8 < var9) {
                    let var49: number = arg1 - arg0;
                    let var50: number = arg0 - arg2;
                    let var51: number = Pix3D.scanline[arg2];
                    while (true) {
                        var50--;
                        if (var50 < 0) {
                            while (true) {
                                var49--;
                                if (var49 < 0) {
                                    return;
                                }
                                Pix3D.flatRaster(Pix2D.pixels, var51, arg6, var47 >> 16, var48 >> 16);
                                var47 += var8;
                                var48 += var7;
                                var51 += Pix2D.width;
                            }
                        }
                        Pix3D.flatRaster(Pix2D.pixels, var51, arg6, var47 >> 16, var46 >> 16);
                        var47 += var8;
                        var46 += var9;
                        var51 += Pix2D.width;
                    }
                } else {
                    let var52: number = arg1 - arg0;
                    let var53: number = arg0 - arg2;
                    let var54: number = Pix3D.scanline[arg2];
                    while (true) {
                        var53--;
                        if (var53 < 0) {
                            while (true) {
                                var52--;
                                if (var52 < 0) {
                                    return;
                                }
                                Pix3D.flatRaster(Pix2D.pixels, var54, arg6, var48 >> 16, var47 >> 16);
                                var47 += var8;
                                var48 += var7;
                                var54 += Pix2D.width;
                            }
                        }
                        Pix3D.flatRaster(Pix2D.pixels, var54, arg6, var46 >> 16, var47 >> 16);
                        var47 += var8;
                        var46 += var9;
                        var54 += Pix2D.width;
                    }
                }
            } else {
                let var55: number;
                let var56: number = (var55 = arg5 << 16);
                if (arg2 < 0) {
                    var56 -= var8 * arg2;
                    var55 -= var9 * arg2;
                    arg2 = 0;
                }
                let var57: number = arg4 << 16;
                if (arg1 < 0) {
                    var57 -= var7 * arg1;
                    arg1 = 0;
                }
                if (var8 < var9) {
                    let var58: number = arg0 - arg1;
                    let var59: number = arg1 - arg2;
                    let var60: number = Pix3D.scanline[arg2];
                    while (true) {
                        var59--;
                        if (var59 < 0) {
                            while (true) {
                                var58--;
                                if (var58 < 0) {
                                    return;
                                }
                                Pix3D.flatRaster(Pix2D.pixels, var60, arg6, var57 >> 16, var55 >> 16);
                                var57 += var7;
                                var55 += var9;
                                var60 += Pix2D.width;
                            }
                        }
                        Pix3D.flatRaster(Pix2D.pixels, var60, arg6, var56 >> 16, var55 >> 16);
                        var56 += var8;
                        var55 += var9;
                        var60 += Pix2D.width;
                    }
                } else {
                    let var61: number = arg0 - arg1;
                    let var62: number = arg1 - arg2;
                    let var63: number = Pix3D.scanline[arg2];
                    while (true) {
                        var62--;
                        if (var62 < 0) {
                            while (true) {
                                var61--;
                                if (var61 < 0) {
                                    return;
                                }
                                Pix3D.flatRaster(Pix2D.pixels, var63, arg6, var55 >> 16, var57 >> 16);
                                var57 += var7;
                                var55 += var9;
                                var63 += Pix2D.width;
                            }
                        }
                        Pix3D.flatRaster(Pix2D.pixels, var63, arg6, var55 >> 16, var56 >> 16);
                        var56 += var8;
                        var55 += var9;
                        var63 += Pix2D.width;
                    }
                }
            }
        }
    }

    static flatRaster(arg0: Int32Array, arg1: number, arg2: number, arg3: number, arg4: number): void {
        if (Pix3D.hclip) {
            if (arg4 > Pix3D.sizeX) {
                arg4 = Pix3D.sizeX;
            }
            if (arg3 < 0) {
                arg3 = 0;
            }
        }
        if (arg3 >= arg4) {
            return;
        }
        let var5: number = arg1 + arg3;
        let var6: number = (arg4 - arg3) >> 2;
        if (Pix3D.trans === 0) {
            while (true) {
                var6--;
                if (var6 < 0) {
                    let var7: number = (arg4 - arg3) & 0x3;
                    while (true) {
                        var7--;
                        if (var7 < 0) {
                            return;
                        }
                        arg0[var5++] = arg2;
                    }
                }
                arg0[var5++] = arg2;
                arg0[var5++] = arg2;
                arg0[var5++] = arg2;
                arg0[var5++] = arg2;
            }
        } else if (Pix3D.trans === 254) {
            while (true) {
                var6--;
                if (var6 < 0) {
                    let var8: number = (arg4 - arg3) & 0x3;
                    while (true) {
                        var8--;
                        if (var8 < 0) {
                            return;
                        }
                        arg0[var5++] = arg0[var5];
                    }
                }
                arg0[var5++] = arg0[var5];
                arg0[var5++] = arg0[var5];
                arg0[var5++] = arg0[var5];
                arg0[var5++] = arg0[var5];
            }
        } else {
            const var9: number = Pix3D.trans;
            const var10: number = 256 - Pix3D.trans;
            const var11: number = ((((arg2 & 0xff00ff) * var10) >> 8) & 0xff00ff) + ((((arg2 & 0xff00) * var10) >> 8) & 0xff00);
            while (true) {
                var6--;
                if (var6 < 0) {
                    let var16: number = (arg4 - arg3) & 0x3;
                    while (true) {
                        var16--;
                        if (var16 < 0) {
                            return;
                        }
                        const var17: number = arg0[var5];
                        arg0[var5++] = var11 + ((((var17 & 0xff00ff) * var9) >> 8) & 0xff00ff) + ((((var17 & 0xff00) * var9) >> 8) & 0xff00);
                    }
                }
                const var12: number = arg0[var5];
                arg0[var5++] = var11 + ((((var12 & 0xff00ff) * var9) >> 8) & 0xff00ff) + ((((var12 & 0xff00) * var9) >> 8) & 0xff00);
                const var13: number = arg0[var5];
                arg0[var5++] = var11 + ((((var13 & 0xff00ff) * var9) >> 8) & 0xff00ff) + ((((var13 & 0xff00) * var9) >> 8) & 0xff00);
                const var14: number = arg0[var5];
                arg0[var5++] = var11 + ((((var14 & 0xff00ff) * var9) >> 8) & 0xff00ff) + ((((var14 & 0xff00) * var9) >> 8) & 0xff00);
                const var15: number = arg0[var5];
                arg0[var5++] = var11 + ((((var15 & 0xff00ff) * var9) >> 8) & 0xff00ff) + ((((var15 & 0xff00) * var9) >> 8) & 0xff00);
            }
        }
    }

    static textureTriangle(
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number,
        arg4: number,
        arg5: number,
        arg6: number,
        arg7: number,
        arg8: number,
        arg9: number,
        arg10: number,
        arg11: number,
        arg12: number,
        arg13: number,
        arg14: number,
        arg15: number,
        arg16: number,
        arg17: number,
        arg18: number
    ): void {
        if (GlRenderer.active) {
            Pix3D.glTexturedFace(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12, arg13, arg14, arg15, arg16, arg17, arg18);
            return;
        }
        const var19 = Pix3D.textureManager!.getTexels(Pix3D.brightness, arg18);
        if (var19 === null || Pix3D.trans > 10) {
            const var20 = Pix3D.textureManager!.getAverageRgb(arg18);
            Pix3D.textureFallback = true;
            Pix3D.gouraudTriangle(arg0, arg1, arg2, arg3, arg4, arg5, Pix3D.textureLightColour(var20, arg6), Pix3D.textureLightColour(var20, arg7), Pix3D.textureLightColour(var20, arg8));
            return;
        }
        Pix3D.lowMem = Pix3D.textureManager!.isLowMem(arg18);
        Pix3D.opaque = Pix3D.textureManager!.isOpaque(arg18);
        const var21 = arg4 - arg3;
        const var22 = arg1 - arg0;
        const var23 = arg5 - arg3;
        const var24 = arg2 - arg0;
        const var25 = arg7 - arg6;
        const var26 = arg8 - arg6;
        let var27 = 0;
        if (arg1 !== arg0) {
            var27 = (((arg4 - arg3) << 16) / (arg1 - arg0)) | 0;
        }
        let var28 = 0;
        if (arg2 !== arg1) {
            var28 = (((arg5 - arg4) << 16) / (arg2 - arg1)) | 0;
        }
        let var29 = 0;
        if (arg2 !== arg0) {
            var29 = (((arg3 - arg5) << 16) / (arg0 - arg2)) | 0;
        }
        const var30 = var21 * var24 - var23 * var22;
        if (var30 === 0) {
            return;
        }
        const var31 = (((var25 * var24 - var26 * var22) << 9) / var30) | 0;
        const var32 = (((var26 * var21 - var25 * var23) << 9) / var30) | 0;
        const var33 = arg9 - arg10;
        const var34 = arg12 - arg13;
        const var35 = arg15 - arg16;
        const var36 = arg11 - arg9;
        const var37 = arg14 - arg12;
        const var38 = arg17 - arg15;
        const var39 = (var36 * arg12 - var37 * arg9) << 14;
        let var40 = (var37 * arg15 - var38 * arg12) << 8;
        let var41 = (var38 * arg9 - var36 * arg15) << 5;
        const var42 = (var33 * arg12 - var34 * arg9) << 14;
        let var43 = (var34 * arg15 - var35 * arg12) << 8;
        let var44 = (var35 * arg9 - var33 * arg15) << 5;
        const var45 = (var34 * var36 - var33 * var37) << 14;
        let var46 = (var35 * var37 - var34 * var38) << 8;
        let var47 = (var33 * var38 - var35 * var36) << 5;
        if (Pix3D.focal !== 512) {
            // sceneFocal: the base terms (<<14) bake focal 512; rescale the SIX step
            // terms by 512/focal so the u=f1/f3 ratios match vertices projected with
            // the scene focal (the 464 client's verified round-2 recipe). float64 is
            // exact here (|terms| < 2^37 << 2^53).
            var40 = ((var40 * 512) / Pix3D.focal) | 0;
            var41 = ((var41 * 512) / Pix3D.focal) | 0;
            var43 = ((var43 * 512) / Pix3D.focal) | 0;
            var44 = ((var44 * 512) / Pix3D.focal) | 0;
            var46 = ((var46 * 512) / Pix3D.focal) | 0;
            var47 = ((var47 * 512) / Pix3D.focal) | 0;
        }
        if (arg0 <= arg1 && arg0 <= arg2) {
            if (arg0 < Pix3D.sizeY) {
                if (arg1 > Pix3D.sizeY) {
                    arg1 = Pix3D.sizeY;
                }
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                let var48 = (arg6 << 9) + var31 - var31 * arg3;
                if (arg1 < arg2) {
                    let var49: number;
                    let var50 = (var49 = arg3 << 16);
                    if (arg0 < 0) {
                        var50 -= var29 * arg0;
                        var49 -= var27 * arg0;
                        var48 -= var32 * arg0;
                        arg0 = 0;
                    }
                    let var51 = arg4 << 16;
                    if (arg1 < 0) {
                        var51 -= var28 * arg1;
                        arg1 = 0;
                    }
                    const var52 = arg0 - Pix3D.originY;
                    let var53 = var39 + var41 * var52;
                    let var54 = var42 + var44 * var52;
                    let var55 = var45 + var47 * var52;
                    if ((arg0 !== arg1 && var29 < var27) || (arg0 === arg1 && var29 > var28)) {
                        let var56 = arg2 - arg1;
                        let var57 = arg1 - arg0;
                        let var58 = Pix3D.scanline[arg0];
                        while (true) {
                            var57--;
                            if (var57 < 0) {
                                while (true) {
                                    var56--;
                                    if (var56 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var58, var50 >> 16, var51 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                                    var50 += var29;
                                    var51 += var28;
                                    var48 += var32;
                                    var58 += Pix2D.width;
                                    var53 = (var53 + var41) | 0;
                                    var54 = (var54 + var44) | 0;
                                    var55 = (var55 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var58, var50 >> 16, var49 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                            var50 += var29;
                            var49 += var27;
                            var48 += var32;
                            var58 += Pix2D.width;
                            var53 = (var53 + var41) | 0;
                            var54 = (var54 + var44) | 0;
                            var55 = (var55 + var47) | 0;
                        }
                    } else {
                        let var59 = arg2 - arg1;
                        let var60 = arg1 - arg0;
                        let var61 = Pix3D.scanline[arg0];
                        while (true) {
                            var60--;
                            if (var60 < 0) {
                                while (true) {
                                    var59--;
                                    if (var59 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var61, var51 >> 16, var50 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                                    var50 += var29;
                                    var51 += var28;
                                    var48 += var32;
                                    var61 += Pix2D.width;
                                    var53 = (var53 + var41) | 0;
                                    var54 = (var54 + var44) | 0;
                                    var55 = (var55 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var61, var49 >> 16, var50 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                            var50 += var29;
                            var49 += var27;
                            var48 += var32;
                            var61 += Pix2D.width;
                            var53 = (var53 + var41) | 0;
                            var54 = (var54 + var44) | 0;
                            var55 = (var55 + var47) | 0;
                        }
                    }
                } else {
                    let var62: number;
                    let var63 = (var62 = arg3 << 16);
                    if (arg0 < 0) {
                        var63 -= var29 * arg0;
                        var62 -= var27 * arg0;
                        var48 -= var32 * arg0;
                        arg0 = 0;
                    }
                    let var64 = arg5 << 16;
                    if (arg2 < 0) {
                        var64 -= var28 * arg2;
                        arg2 = 0;
                    }
                    const var65 = arg0 - Pix3D.originY;
                    let var66 = var39 + var41 * var65;
                    let var67 = var42 + var44 * var65;
                    let var68 = var45 + var47 * var65;
                    if ((arg0 === arg2 || var29 >= var27) && (arg0 !== arg2 || var28 <= var27)) {
                        let var72 = arg1 - arg2;
                        let var73 = arg2 - arg0;
                        let var74 = Pix3D.scanline[arg0];
                        while (true) {
                            var73--;
                            if (var73 < 0) {
                                while (true) {
                                    var72--;
                                    if (var72 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var74, var62 >> 16, var64 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                                    var64 += var28;
                                    var62 += var27;
                                    var48 += var32;
                                    var74 += Pix2D.width;
                                    var66 = (var66 + var41) | 0;
                                    var67 = (var67 + var44) | 0;
                                    var68 = (var68 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var74, var62 >> 16, var63 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                            var63 += var29;
                            var62 += var27;
                            var48 += var32;
                            var74 += Pix2D.width;
                            var66 = (var66 + var41) | 0;
                            var67 = (var67 + var44) | 0;
                            var68 = (var68 + var47) | 0;
                        }
                    } else {
                        let var69 = arg1 - arg2;
                        let var70 = arg2 - arg0;
                        let var71 = Pix3D.scanline[arg0];
                        while (true) {
                            var70--;
                            if (var70 < 0) {
                                while (true) {
                                    var69--;
                                    if (var69 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var71, var64 >> 16, var62 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                                    var64 += var28;
                                    var62 += var27;
                                    var48 += var32;
                                    var71 += Pix2D.width;
                                    var66 = (var66 + var41) | 0;
                                    var67 = (var67 + var44) | 0;
                                    var68 = (var68 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var71, var63 >> 16, var62 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                            var63 += var29;
                            var62 += var27;
                            var48 += var32;
                            var71 += Pix2D.width;
                            var66 = (var66 + var41) | 0;
                            var67 = (var67 + var44) | 0;
                            var68 = (var68 + var47) | 0;
                        }
                    }
                }
            }
        } else if (arg1 <= arg2) {
            if (arg1 < Pix3D.sizeY) {
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                if (arg0 > Pix3D.sizeY) {
                    arg0 = Pix3D.sizeY;
                }
                let var75 = (arg7 << 9) + var31 - var31 * arg4;
                if (arg2 < arg0) {
                    let var76: number;
                    let var77 = (var76 = arg4 << 16);
                    if (arg1 < 0) {
                        var77 -= var27 * arg1;
                        var76 -= var28 * arg1;
                        var75 -= var32 * arg1;
                        arg1 = 0;
                    }
                    let var78 = arg5 << 16;
                    if (arg2 < 0) {
                        var78 -= var29 * arg2;
                        arg2 = 0;
                    }
                    const var79 = arg1 - Pix3D.originY;
                    let var80 = var39 + var41 * var79;
                    let var81 = var42 + var44 * var79;
                    let var82 = var45 + var47 * var79;
                    if ((arg1 !== arg2 && var27 < var28) || (arg1 === arg2 && var27 > var29)) {
                        let var83 = arg0 - arg2;
                        let var84 = arg2 - arg1;
                        let var85 = Pix3D.scanline[arg1];
                        while (true) {
                            var84--;
                            if (var84 < 0) {
                                while (true) {
                                    var83--;
                                    if (var83 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var85, var77 >> 16, var78 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                                    var77 += var27;
                                    var78 += var29;
                                    var75 += var32;
                                    var85 += Pix2D.width;
                                    var80 = (var80 + var41) | 0;
                                    var81 = (var81 + var44) | 0;
                                    var82 = (var82 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var85, var77 >> 16, var76 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                            var77 += var27;
                            var76 += var28;
                            var75 += var32;
                            var85 += Pix2D.width;
                            var80 = (var80 + var41) | 0;
                            var81 = (var81 + var44) | 0;
                            var82 = (var82 + var47) | 0;
                        }
                    } else {
                        let var86 = arg0 - arg2;
                        let var87 = arg2 - arg1;
                        let var88 = Pix3D.scanline[arg1];
                        while (true) {
                            var87--;
                            if (var87 < 0) {
                                while (true) {
                                    var86--;
                                    if (var86 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var88, var78 >> 16, var77 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                                    var77 += var27;
                                    var78 += var29;
                                    var75 += var32;
                                    var88 += Pix2D.width;
                                    var80 = (var80 + var41) | 0;
                                    var81 = (var81 + var44) | 0;
                                    var82 = (var82 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var88, var76 >> 16, var77 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                            var77 += var27;
                            var76 += var28;
                            var75 += var32;
                            var88 += Pix2D.width;
                            var80 = (var80 + var41) | 0;
                            var81 = (var81 + var44) | 0;
                            var82 = (var82 + var47) | 0;
                        }
                    }
                } else {
                    let var89: number;
                    let var90 = (var89 = arg4 << 16);
                    if (arg1 < 0) {
                        var90 -= var27 * arg1;
                        var89 -= var28 * arg1;
                        var75 -= var32 * arg1;
                        arg1 = 0;
                    }
                    let var91 = arg3 << 16;
                    if (arg0 < 0) {
                        var91 -= var29 * arg0;
                        arg0 = 0;
                    }
                    const var92 = arg1 - Pix3D.originY;
                    let var93 = var39 + var41 * var92;
                    let var94 = var42 + var44 * var92;
                    let var95 = var45 + var47 * var92;
                    if (var27 < var28) {
                        let var96 = arg2 - arg0;
                        let var97 = arg0 - arg1;
                        let var98 = Pix3D.scanline[arg1];
                        while (true) {
                            var97--;
                            if (var97 < 0) {
                                while (true) {
                                    var96--;
                                    if (var96 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var98, var91 >> 16, var89 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                                    var91 += var29;
                                    var89 += var28;
                                    var75 += var32;
                                    var98 += Pix2D.width;
                                    var93 = (var93 + var41) | 0;
                                    var94 = (var94 + var44) | 0;
                                    var95 = (var95 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var98, var90 >> 16, var89 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                            var90 += var27;
                            var89 += var28;
                            var75 += var32;
                            var98 += Pix2D.width;
                            var93 = (var93 + var41) | 0;
                            var94 = (var94 + var44) | 0;
                            var95 = (var95 + var47) | 0;
                        }
                    } else {
                        let var99 = arg2 - arg0;
                        let var100 = arg0 - arg1;
                        let var101 = Pix3D.scanline[arg1];
                        while (true) {
                            var100--;
                            if (var100 < 0) {
                                while (true) {
                                    var99--;
                                    if (var99 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRaster(Pix2D.pixels, var19, var101, var89 >> 16, var91 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                                    var91 += var29;
                                    var89 += var28;
                                    var75 += var32;
                                    var101 += Pix2D.width;
                                    var93 = (var93 + var41) | 0;
                                    var94 = (var94 + var44) | 0;
                                    var95 = (var95 + var47) | 0;
                                }
                            }
                            Pix3D.textureRaster(Pix2D.pixels, var19, var101, var89 >> 16, var90 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                            var90 += var27;
                            var89 += var28;
                            var75 += var32;
                            var101 += Pix2D.width;
                            var93 = (var93 + var41) | 0;
                            var94 = (var94 + var44) | 0;
                            var95 = (var95 + var47) | 0;
                        }
                    }
                }
            }
        } else if (arg2 < Pix3D.sizeY) {
            if (arg0 > Pix3D.sizeY) {
                arg0 = Pix3D.sizeY;
            }
            if (arg1 > Pix3D.sizeY) {
                arg1 = Pix3D.sizeY;
            }
            let var102 = (arg8 << 9) + var31 - var31 * arg5;
            if (arg0 < arg1) {
                let var103: number;
                let var104 = (var103 = arg5 << 16);
                if (arg2 < 0) {
                    var104 -= var28 * arg2;
                    var103 -= var29 * arg2;
                    var102 -= var32 * arg2;
                    arg2 = 0;
                }
                let var105 = arg3 << 16;
                if (arg0 < 0) {
                    var105 -= var27 * arg0;
                    arg0 = 0;
                }
                const var106 = arg2 - Pix3D.originY;
                let var107 = var39 + var41 * var106;
                let var108 = var42 + var44 * var106;
                let var109 = var45 + var47 * var106;
                if (var28 < var29) {
                    let var110 = arg1 - arg0;
                    let var111 = arg0 - arg2;
                    let var112 = Pix3D.scanline[arg2];
                    while (true) {
                        var111--;
                        if (var111 < 0) {
                            while (true) {
                                var110--;
                                if (var110 < 0) {
                                    return;
                                }
                                Pix3D.textureRaster(Pix2D.pixels, var19, var112, var104 >> 16, var105 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                                var104 += var28;
                                var105 += var27;
                                var102 += var32;
                                var112 += Pix2D.width;
                                var107 = (var107 + var41) | 0;
                                var108 = (var108 + var44) | 0;
                                var109 = (var109 + var47) | 0;
                            }
                        }
                        Pix3D.textureRaster(Pix2D.pixels, var19, var112, var104 >> 16, var103 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                        var104 += var28;
                        var103 += var29;
                        var102 += var32;
                        var112 += Pix2D.width;
                        var107 = (var107 + var41) | 0;
                        var108 = (var108 + var44) | 0;
                        var109 = (var109 + var47) | 0;
                    }
                } else {
                    let var113 = arg1 - arg0;
                    let var114 = arg0 - arg2;
                    let var115 = Pix3D.scanline[arg2];
                    while (true) {
                        var114--;
                        if (var114 < 0) {
                            while (true) {
                                var113--;
                                if (var113 < 0) {
                                    return;
                                }
                                Pix3D.textureRaster(Pix2D.pixels, var19, var115, var105 >> 16, var104 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                                var104 += var28;
                                var105 += var27;
                                var102 += var32;
                                var115 += Pix2D.width;
                                var107 = (var107 + var41) | 0;
                                var108 = (var108 + var44) | 0;
                                var109 = (var109 + var47) | 0;
                            }
                        }
                        Pix3D.textureRaster(Pix2D.pixels, var19, var115, var103 >> 16, var104 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                        var104 += var28;
                        var103 += var29;
                        var102 += var32;
                        var115 += Pix2D.width;
                        var107 = (var107 + var41) | 0;
                        var108 = (var108 + var44) | 0;
                        var109 = (var109 + var47) | 0;
                    }
                }
            } else {
                let var116: number;
                let var117 = (var116 = arg5 << 16);
                if (arg2 < 0) {
                    var117 -= var28 * arg2;
                    var116 -= var29 * arg2;
                    var102 -= var32 * arg2;
                    arg2 = 0;
                }
                let var118 = arg4 << 16;
                if (arg1 < 0) {
                    var118 -= var27 * arg1;
                    arg1 = 0;
                }
                const var119 = arg2 - Pix3D.originY;
                let var120 = var39 + var41 * var119;
                let var121 = var42 + var44 * var119;
                let var122 = var45 + var47 * var119;
                if (var28 < var29) {
                    let var123 = arg0 - arg1;
                    let var124 = arg1 - arg2;
                    let var125 = Pix3D.scanline[arg2];
                    while (true) {
                        var124--;
                        if (var124 < 0) {
                            while (true) {
                                var123--;
                                if (var123 < 0) {
                                    return;
                                }
                                Pix3D.textureRaster(Pix2D.pixels, var19, var125, var118 >> 16, var116 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                                var118 += var27;
                                var116 += var29;
                                var102 += var32;
                                var125 += Pix2D.width;
                                var120 = (var120 + var41) | 0;
                                var121 = (var121 + var44) | 0;
                                var122 = (var122 + var47) | 0;
                            }
                        }
                        Pix3D.textureRaster(Pix2D.pixels, var19, var125, var117 >> 16, var116 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                        var117 += var28;
                        var116 += var29;
                        var102 += var32;
                        var125 += Pix2D.width;
                        var120 = (var120 + var41) | 0;
                        var121 = (var121 + var44) | 0;
                        var122 = (var122 + var47) | 0;
                    }
                } else {
                    let var126 = arg0 - arg1;
                    let var127 = arg1 - arg2;
                    let var128 = Pix3D.scanline[arg2];
                    while (true) {
                        var127--;
                        if (var127 < 0) {
                            while (true) {
                                var126--;
                                if (var126 < 0) {
                                    return;
                                }
                                Pix3D.textureRaster(Pix2D.pixels, var19, var128, var116 >> 16, var118 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                                var118 += var27;
                                var116 += var29;
                                var102 += var32;
                                var128 += Pix2D.width;
                                var120 = (var120 + var41) | 0;
                                var121 = (var121 + var44) | 0;
                                var122 = (var122 + var47) | 0;
                            }
                        }
                        Pix3D.textureRaster(Pix2D.pixels, var19, var128, var116 >> 16, var117 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                        var117 += var28;
                        var116 += var29;
                        var102 += var32;
                        var128 += Pix2D.width;
                        var120 = (var120 + var41) | 0;
                        var121 = (var121 + var44) | 0;
                        var122 = (var122 + var47) | 0;
                    }
                }
            }
        }
    }

    static textureRaster(arg0: Int32Array, arg1: Int32Array, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number, arg9: number, arg10: number, arg11: number, arg12: number): void {
        if (Pix3D.hclip) {
            if (arg4 > Pix3D.sizeX) {
                arg4 = Pix3D.sizeX;
            }
            if (arg3 < 0) {
                arg3 = 0;
            }
        }
        if (arg3 >= arg4) {
            return;
        }
        let var13 = arg2 + arg3;
        let var14 = (arg5 + arg6 * arg3) | 0;
        const var15 = arg4 - arg3;

        if (!Pix3D.lowMem) {
            const var74 = arg3 - Pix3D.originX;
            const var75 = (arg7 + (((arg10 >> 3) * var74) | 0)) | 0;
            const var76 = (arg8 + (((arg11 >> 3) * var74) | 0)) | 0;
            const var77 = (arg9 + (((arg12 >> 3) * var74) | 0)) | 0;
            const var78 = var77 >> 14;
            let var79: number;
            let var80: number;
            if (var78 === 0) {
                var79 = 0;
                var80 = 0;
            } else {
                var79 = Math.trunc(var75 / var78) | 0;
                var80 = Math.trunc(var76 / var78) | 0;
            }
            let var81 = (var75 + arg10) | 0;
            let var82 = (var76 + arg11) | 0;
            let var83 = (var77 + arg12) | 0;
            let var84 = var83 >> 14;
            let var85: number;
            let var86: number;
            if (var84 === 0) {
                var85 = 0;
                var86 = 0;
            } else {
                var85 = Math.trunc(var81 / var84) | 0;
                var86 = Math.trunc(var82 / var84) | 0;
            }
            let var87 = ((var79 << 18) + var80) | 0;
            let var88 = ((((var85 - var79) >> 3) << 18) + ((var86 - var80) >> 3)) | 0;
            let var89 = var15 >> 3;
            const var90 = arg6 << 3;
            let var91 = var14 >> 8;
            if (Pix3D.opaque) {
                if (var89 > 0) {
                    do {
                        const var92 = arg1[(var87 & 0x3f80) + (var87 >>> 25)];
                        arg0[var13++] = ((((var92 & 0xff00ff) * var91) & 0xff00ff00) + (((var92 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var93 = var87 + var88;
                        const var94 = arg1[(var93 & 0x3f80) + (var93 >>> 25)];
                        arg0[var13++] = ((((var94 & 0xff00ff) * var91) & 0xff00ff00) + (((var94 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var95 = var93 + var88;
                        const var96 = arg1[(var95 & 0x3f80) + (var95 >>> 25)];
                        arg0[var13++] = ((((var96 & 0xff00ff) * var91) & 0xff00ff00) + (((var96 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var97 = var95 + var88;
                        const var98 = arg1[(var97 & 0x3f80) + (var97 >>> 25)];
                        arg0[var13++] = ((((var98 & 0xff00ff) * var91) & 0xff00ff00) + (((var98 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var99 = var97 + var88;
                        const var100 = arg1[(var99 & 0x3f80) + (var99 >>> 25)];
                        arg0[var13++] = ((((var100 & 0xff00ff) * var91) & 0xff00ff00) + (((var100 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var101 = var99 + var88;
                        const var102 = arg1[(var101 & 0x3f80) + (var101 >>> 25)];
                        arg0[var13++] = ((((var102 & 0xff00ff) * var91) & 0xff00ff00) + (((var102 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var103 = var101 + var88;
                        const var104 = arg1[(var103 & 0x3f80) + (var103 >>> 25)];
                        arg0[var13++] = ((((var104 & 0xff00ff) * var91) & 0xff00ff00) + (((var104 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var105 = var103 + var88;
                        const var106 = arg1[(var105 & 0x3f80) + (var105 >>> 25)];
                        arg0[var13++] = ((((var106 & 0xff00ff) * var91) & 0xff00ff00) + (((var106 & 0xff00) * var91) & 0xff0000)) >> 8;
                        const var107 = var85;
                        const var108 = var86;
                        var81 = (var81 + arg10) | 0;
                        var82 = (var82 + arg11) | 0;
                        var83 = (var83 + arg12) | 0;
                        const var109 = var83 >> 14;
                        if (var109 === 0) {
                            var85 = 0;
                            var86 = 0;
                        } else {
                            var85 = Math.trunc(var81 / var109) | 0;
                            var86 = Math.trunc(var82 / var109) | 0;
                        }
                        var87 = ((var107 << 18) + var108) | 0;
                        var88 = ((((var85 - var107) >> 3) << 18) + ((var86 - var108) >> 3)) | 0;
                        var14 = (var14 + var90) | 0;
                        var91 = var14 >> 8;
                        var89--;
                    } while (var89 > 0);
                }
                let var110 = (arg4 - arg3) & 0x7;
                if (var110 > 0) {
                    do {
                        const var111 = arg1[(var87 & 0x3f80) + (var87 >>> 25)];
                        arg0[var13++] = ((((var111 & 0xff00ff) * var91) & 0xff00ff00) + (((var111 & 0xff00) * var91) & 0xff0000)) >> 8;
                        var87 = (var87 + var88) | 0;
                        var110--;
                    } while (var110 > 0);
                    return;
                }
            } else {
                if (var89 > 0) {
                    do {
                        const var112 = arg1[(var87 & 0x3f80) + (var87 >>> 25)];
                        if (var112 !== 0) {
                            arg0[var13] = ((((var112 & 0xff00ff) * var91) & 0xff00ff00) + (((var112 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var113 = var87 + var88;
                        const var114 = arg1[(var113 & 0x3f80) + (var113 >>> 25)];
                        if (var114 !== 0) {
                            arg0[var13] = ((((var114 & 0xff00ff) * var91) & 0xff00ff00) + (((var114 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var115 = var113 + var88;
                        const var116 = arg1[(var115 & 0x3f80) + (var115 >>> 25)];
                        if (var116 !== 0) {
                            arg0[var13] = ((((var116 & 0xff00ff) * var91) & 0xff00ff00) + (((var116 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var117 = var115 + var88;
                        const var118 = arg1[(var117 & 0x3f80) + (var117 >>> 25)];
                        if (var118 !== 0) {
                            arg0[var13] = ((((var118 & 0xff00ff) * var91) & 0xff00ff00) + (((var118 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var119 = var117 + var88;
                        const var120 = arg1[(var119 & 0x3f80) + (var119 >>> 25)];
                        if (var120 !== 0) {
                            arg0[var13] = ((((var120 & 0xff00ff) * var91) & 0xff00ff00) + (((var120 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var121 = var119 + var88;
                        const var122 = arg1[(var121 & 0x3f80) + (var121 >>> 25)];
                        if (var122 !== 0) {
                            arg0[var13] = ((((var122 & 0xff00ff) * var91) & 0xff00ff00) + (((var122 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var123 = var121 + var88;
                        const var124 = arg1[(var123 & 0x3f80) + (var123 >>> 25)];
                        if (var124 !== 0) {
                            arg0[var13] = ((((var124 & 0xff00ff) * var91) & 0xff00ff00) + (((var124 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var125 = var123 + var88;
                        const var126 = arg1[(var125 & 0x3f80) + (var125 >>> 25)];
                        if (var126 !== 0) {
                            arg0[var13] = ((((var126 & 0xff00ff) * var91) & 0xff00ff00) + (((var126 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var127 = var85;
                        const var128 = var86;
                        var81 = (var81 + arg10) | 0;
                        var82 = (var82 + arg11) | 0;
                        var83 = (var83 + arg12) | 0;
                        const var129 = var83 >> 14;
                        if (var129 === 0) {
                            var85 = 0;
                            var86 = 0;
                        } else {
                            var85 = Math.trunc(var81 / var129) | 0;
                            var86 = Math.trunc(var82 / var129) | 0;
                        }
                        var87 = ((var127 << 18) + var128) | 0;
                        var88 = ((((var85 - var127) >> 3) << 18) + ((var86 - var128) >> 3)) | 0;
                        var14 = (var14 + var90) | 0;
                        var91 = var14 >> 8;
                        var89--;
                    } while (var89 > 0);
                }
                let var130 = (arg4 - arg3) & 0x7;
                if (var130 > 0) {
                    do {
                        const var131 = arg1[(var87 & 0x3f80) + (var87 >>> 25)];
                        if (var131 !== 0) {
                            arg0[var13] = ((((var131 & 0xff00ff) * var91) & 0xff00ff00) + (((var131 & 0xff00) * var91) & 0xff0000)) >> 8;
                        }
                        var13++;
                        var87 = (var87 + var88) | 0;
                        var130--;
                    } while (var130 > 0);
                }
            }
            return;
        }

        const var16 = arg3 - Pix3D.originX;
        const var17 = (arg7 + (((arg10 >> 3) * var16) | 0)) | 0;
        const var18 = (arg8 + (((arg11 >> 3) * var16) | 0)) | 0;
        const var19 = (arg9 + (((arg12 >> 3) * var16) | 0)) | 0;
        const var20 = var19 >> 12;
        let var21: number;
        let var22: number;
        if (var20 === 0) {
            var21 = 0;
            var22 = 0;
        } else {
            var21 = Math.trunc(var17 / var20) | 0;
            var22 = Math.trunc(var18 / var20) | 0;
        }
        let var23 = (var17 + arg10) | 0;
        let var24 = (var18 + arg11) | 0;
        let var25 = (var19 + arg12) | 0;
        let var26 = var25 >> 12;
        let var27: number;
        let var28: number;
        if (var26 === 0) {
            var27 = 0;
            var28 = 0;
        } else {
            var27 = Math.trunc(var23 / var26) | 0;
            var28 = Math.trunc(var24 / var26) | 0;
        }
        let var29 = ((var21 << 20) + var22) | 0;
        let var30 = ((((var27 - var21) >> 3) << 20) + ((var28 - var22) >> 3)) | 0;
        let var31 = var15 >> 3;
        const var32 = arg6 << 3;
        let var33 = var14 >> 8;
        if (Pix3D.opaque) {
            if (var31 > 0) {
                do {
                    const var34 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                    arg0[var13++] = ((((var34 & 0xff00ff) * var33) & 0xff00ff00) + (((var34 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var35 = var29 + var30;
                    const var36 = arg1[(var35 & 0xfc0) + (var35 >>> 26)];
                    arg0[var13++] = ((((var36 & 0xff00ff) * var33) & 0xff00ff00) + (((var36 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var37 = var35 + var30;
                    const var38 = arg1[(var37 & 0xfc0) + (var37 >>> 26)];
                    arg0[var13++] = ((((var38 & 0xff00ff) * var33) & 0xff00ff00) + (((var38 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var39 = var37 + var30;
                    const var40 = arg1[(var39 & 0xfc0) + (var39 >>> 26)];
                    arg0[var13++] = ((((var40 & 0xff00ff) * var33) & 0xff00ff00) + (((var40 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var41 = var39 + var30;
                    const var42 = arg1[(var41 & 0xfc0) + (var41 >>> 26)];
                    arg0[var13++] = ((((var42 & 0xff00ff) * var33) & 0xff00ff00) + (((var42 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var43 = var41 + var30;
                    const var44 = arg1[(var43 & 0xfc0) + (var43 >>> 26)];
                    arg0[var13++] = ((((var44 & 0xff00ff) * var33) & 0xff00ff00) + (((var44 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var45 = var43 + var30;
                    const var46 = arg1[(var45 & 0xfc0) + (var45 >>> 26)];
                    arg0[var13++] = ((((var46 & 0xff00ff) * var33) & 0xff00ff00) + (((var46 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var47 = var45 + var30;
                    const var48 = arg1[(var47 & 0xfc0) + (var47 >>> 26)];
                    arg0[var13++] = ((((var48 & 0xff00ff) * var33) & 0xff00ff00) + (((var48 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var49 = var27;
                    const var50 = var28;
                    var23 = (var23 + arg10) | 0;
                    var24 = (var24 + arg11) | 0;
                    var25 = (var25 + arg12) | 0;
                    const var51 = var25 >> 12;
                    if (var51 === 0) {
                        var27 = 0;
                        var28 = 0;
                    } else {
                        var27 = Math.trunc(var23 / var51) | 0;
                        var28 = Math.trunc(var24 / var51) | 0;
                    }
                    var29 = ((var49 << 20) + var50) | 0;
                    var30 = ((((var27 - var49) >> 3) << 20) + ((var28 - var50) >> 3)) | 0;
                    var14 = (var14 + var32) | 0;
                    var33 = var14 >> 8;
                    var31--;
                } while (var31 > 0);
            }
            let var52 = (arg4 - arg3) & 0x7;
            if (var52 > 0) {
                do {
                    const var53 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                    arg0[var13++] = ((((var53 & 0xff00ff) * var33) & 0xff00ff00) + (((var53 & 0xff00) * var33) & 0xff0000)) >> 8;
                    var29 = (var29 + var30) | 0;
                    var52--;
                } while (var52 > 0);
                return;
            }
            return;
        }
        if (var31 > 0) {
            do {
                const var54 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                if (var54 !== 0) {
                    arg0[var13] = ((((var54 & 0xff00ff) * var33) & 0xff00ff00) + (((var54 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var55 = var29 + var30;
                const var56 = arg1[(var55 & 0xfc0) + (var55 >>> 26)];
                if (var56 !== 0) {
                    arg0[var13] = ((((var56 & 0xff00ff) * var33) & 0xff00ff00) + (((var56 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var57 = var55 + var30;
                const var58 = arg1[(var57 & 0xfc0) + (var57 >>> 26)];
                if (var58 !== 0) {
                    arg0[var13] = ((((var58 & 0xff00ff) * var33) & 0xff00ff00) + (((var58 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var59 = var57 + var30;
                const var60 = arg1[(var59 & 0xfc0) + (var59 >>> 26)];
                if (var60 !== 0) {
                    arg0[var13] = ((((var60 & 0xff00ff) * var33) & 0xff00ff00) + (((var60 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var61 = var59 + var30;
                const var62 = arg1[(var61 & 0xfc0) + (var61 >>> 26)];
                if (var62 !== 0) {
                    arg0[var13] = ((((var62 & 0xff00ff) * var33) & 0xff00ff00) + (((var62 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var63 = var61 + var30;
                const var64 = arg1[(var63 & 0xfc0) + (var63 >>> 26)];
                if (var64 !== 0) {
                    arg0[var13] = ((((var64 & 0xff00ff) * var33) & 0xff00ff00) + (((var64 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var65 = var63 + var30;
                const var66 = arg1[(var65 & 0xfc0) + (var65 >>> 26)];
                if (var66 !== 0) {
                    arg0[var13] = ((((var66 & 0xff00ff) * var33) & 0xff00ff00) + (((var66 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var67 = var65 + var30;
                const var68 = arg1[(var67 & 0xfc0) + (var67 >>> 26)];
                if (var68 !== 0) {
                    arg0[var13] = ((((var68 & 0xff00ff) * var33) & 0xff00ff00) + (((var68 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var69 = var27;
                const var70 = var28;
                var23 = (var23 + arg10) | 0;
                var24 = (var24 + arg11) | 0;
                var25 = (var25 + arg12) | 0;
                const var71 = var25 >> 12;
                if (var71 === 0) {
                    var27 = 0;
                    var28 = 0;
                } else {
                    var27 = Math.trunc(var23 / var71) | 0;
                    var28 = Math.trunc(var24 / var71) | 0;
                }
                var29 = ((var69 << 20) + var70) | 0;
                var30 = ((((var27 - var69) >> 3) << 20) + ((var28 - var70) >> 3)) | 0;
                var14 = (var14 + var32) | 0;
                var33 = var14 >> 8;
                var31--;
            } while (var31 > 0);
        }
        let var72 = (arg4 - arg3) & 0x7;
        if (var72 <= 0) {
            return;
        }
        do {
            const var73 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
            if (var73 !== 0) {
                arg0[var13] = ((((var73 & 0xff00ff) * var33) & 0xff00ff00) + (((var73 & 0xff00) * var33) & 0xff0000)) >> 8;
            }
            var13++;
            var29 = (var29 + var30) | 0;
            var72--;
        } while (var72 > 0);
        return;
    }

    // jag::oldscape::dash3d::SoftwarePix3D::TextureTriangleAffine
    static textureTriangleAffine(
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number,
        arg4: number,
        arg5: number,
        arg6: number,
        arg7: number,
        arg8: number,
        arg9: number,
        arg10: number,
        arg11: number,
        arg12: number,
        arg13: number,
        arg14: number,
        arg15: number,
        arg16: number,
        arg17: number,
        arg18: number
    ): void {
        if (GlRenderer.active) {
            // GPU ground textures use the PERSPECTIVE plane math (the affine span
            // walk was only ever a CPU shortcut) — strictly better than software.
            Pix3D.glTexturedFace(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12, arg13, arg14, arg15, arg16, arg17, arg18);
            return;
        }
        const var19 = Pix3D.textureManager!.getTexels(Pix3D.brightness, arg18);
        if (var19 === null) {
            const var20 = Pix3D.textureManager!.getAverageRgb(arg18);
            Pix3D.gouraudTriangle(arg0, arg1, arg2, arg3, arg4, arg5, Pix3D.textureLightColour(var20, arg6), Pix3D.textureLightColour(var20, arg7), Pix3D.textureLightColour(var20, arg8));
            return;
        }
        Pix3D.lowMem = Pix3D.textureManager!.isLowMem(arg18);
        Pix3D.opaque = Pix3D.textureManager!.isOpaque(arg18);
        const var21 = arg4 - arg3;
        const var22 = arg1 - arg0;
        const var23 = arg5 - arg3;
        const var24 = arg2 - arg0;
        const var25 = arg7 - arg6;
        const var26 = arg8 - arg6;
        let var27 = 0;
        if (arg1 !== arg0) {
            var27 = (((arg4 - arg3) << 16) / (arg1 - arg0)) | 0;
        }
        let var28 = 0;
        if (arg2 !== arg1) {
            var28 = (((arg5 - arg4) << 16) / (arg2 - arg1)) | 0;
        }
        let var29 = 0;
        if (arg2 !== arg0) {
            var29 = (((arg3 - arg5) << 16) / (arg0 - arg2)) | 0;
        }
        const var30 = var21 * var24 - var23 * var22;
        if (var30 === 0) {
            return;
        }
        const var31 = (((var25 * var24 - var26 * var22) << 9) / var30) | 0;
        const var32 = (((var26 * var21 - var25 * var23) << 9) / var30) | 0;
        const var33 = arg9 - arg10;
        const var34 = arg12 - arg13;
        const var35 = arg15 - arg16;
        const var36 = arg11 - arg9;
        const var37 = arg14 - arg12;
        const var38 = arg17 - arg15;
        const var39 = (var36 * arg12 - var37 * arg9) << 14;
        let var40 = (var37 * arg15 - var38 * arg12) << 5;
        let var41 = (var38 * arg9 - var36 * arg15) << 5;
        const var42 = (var33 * arg12 - var34 * arg9) << 14;
        let var43 = (var34 * arg15 - var35 * arg12) << 5;
        let var44 = (var35 * arg9 - var33 * arg15) << 5;
        const var45 = (var34 * var36 - var33 * var37) << 14;
        let var46 = (var35 * var37 - var34 * var38) << 5;
        let var47 = (var33 * var38 - var35 * var36) << 5;
        if (Pix3D.focal !== 512) {
            // sceneFocal: same six-step-term rescale as textureTriangle (ground mapper).
            var40 = ((var40 * 512) / Pix3D.focal) | 0;
            var41 = ((var41 * 512) / Pix3D.focal) | 0;
            var43 = ((var43 * 512) / Pix3D.focal) | 0;
            var44 = ((var44 * 512) / Pix3D.focal) | 0;
            var46 = ((var46 * 512) / Pix3D.focal) | 0;
            var47 = ((var47 * 512) / Pix3D.focal) | 0;
        }
        if (arg0 <= arg1 && arg0 <= arg2) {
            if (arg0 < Pix3D.sizeY) {
                if (arg1 > Pix3D.sizeY) {
                    arg1 = Pix3D.sizeY;
                }
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                let var48 = (arg6 << 9) + var31 - var31 * arg3;
                if (arg1 < arg2) {
                    let var49: number;
                    let var50 = (var49 = arg3 << 16);
                    if (arg0 < 0) {
                        var50 -= var29 * arg0;
                        var49 -= var27 * arg0;
                        var48 -= var32 * arg0;
                        arg0 = 0;
                    }
                    let var51 = arg4 << 16;
                    if (arg1 < 0) {
                        var51 -= var28 * arg1;
                        arg1 = 0;
                    }
                    const var52 = arg0 - Pix3D.originY;
                    let var53 = var39 + var41 * var52;
                    let var54 = var42 + var44 * var52;
                    let var55 = var45 + var47 * var52;
                    if ((arg0 !== arg1 && var29 < var27) || (arg0 === arg1 && var29 > var28)) {
                        let var56 = arg2 - arg1;
                        let var57 = arg1 - arg0;
                        let var58 = Pix3D.scanline[arg0];
                        while (true) {
                            var57--;
                            if (var57 < 0) {
                                while (true) {
                                    var56--;
                                    if (var56 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var58, var50 >> 16, var51 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                                    var50 += var29;
                                    var51 += var28;
                                    var48 += var32;
                                    var58 += Pix2D.width;
                                    var53 = (var53 + var41) | 0;
                                    var54 = (var54 + var44) | 0;
                                    var55 = (var55 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var58, var50 >> 16, var49 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                            var50 += var29;
                            var49 += var27;
                            var48 += var32;
                            var58 += Pix2D.width;
                            var53 = (var53 + var41) | 0;
                            var54 = (var54 + var44) | 0;
                            var55 = (var55 + var47) | 0;
                        }
                    } else {
                        let var59 = arg2 - arg1;
                        let var60 = arg1 - arg0;
                        let var61 = Pix3D.scanline[arg0];
                        while (true) {
                            var60--;
                            if (var60 < 0) {
                                while (true) {
                                    var59--;
                                    if (var59 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var61, var51 >> 16, var50 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                                    var50 += var29;
                                    var51 += var28;
                                    var48 += var32;
                                    var61 += Pix2D.width;
                                    var53 = (var53 + var41) | 0;
                                    var54 = (var54 + var44) | 0;
                                    var55 = (var55 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var61, var49 >> 16, var50 >> 16, var48, var31, var53, var54, var55, var40, var43, var46);
                            var50 += var29;
                            var49 += var27;
                            var48 += var32;
                            var61 += Pix2D.width;
                            var53 = (var53 + var41) | 0;
                            var54 = (var54 + var44) | 0;
                            var55 = (var55 + var47) | 0;
                        }
                    }
                } else {
                    let var62: number;
                    let var63 = (var62 = arg3 << 16);
                    if (arg0 < 0) {
                        var63 -= var29 * arg0;
                        var62 -= var27 * arg0;
                        var48 -= var32 * arg0;
                        arg0 = 0;
                    }
                    let var64 = arg5 << 16;
                    if (arg2 < 0) {
                        var64 -= var28 * arg2;
                        arg2 = 0;
                    }
                    const var65 = arg0 - Pix3D.originY;
                    let var66 = var39 + var41 * var65;
                    let var67 = var42 + var44 * var65;
                    let var68 = var45 + var47 * var65;
                    if ((arg0 === arg2 || var29 >= var27) && (arg0 !== arg2 || var28 <= var27)) {
                        let var72 = arg1 - arg2;
                        let var73 = arg2 - arg0;
                        let var74 = Pix3D.scanline[arg0];
                        while (true) {
                            var73--;
                            if (var73 < 0) {
                                while (true) {
                                    var72--;
                                    if (var72 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var74, var62 >> 16, var64 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                                    var64 += var28;
                                    var62 += var27;
                                    var48 += var32;
                                    var74 += Pix2D.width;
                                    var66 = (var66 + var41) | 0;
                                    var67 = (var67 + var44) | 0;
                                    var68 = (var68 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var74, var62 >> 16, var63 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                            var63 += var29;
                            var62 += var27;
                            var48 += var32;
                            var74 += Pix2D.width;
                            var66 = (var66 + var41) | 0;
                            var67 = (var67 + var44) | 0;
                            var68 = (var68 + var47) | 0;
                        }
                    } else {
                        let var69 = arg1 - arg2;
                        let var70 = arg2 - arg0;
                        let var71 = Pix3D.scanline[arg0];
                        while (true) {
                            var70--;
                            if (var70 < 0) {
                                while (true) {
                                    var69--;
                                    if (var69 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var71, var64 >> 16, var62 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                                    var64 += var28;
                                    var62 += var27;
                                    var48 += var32;
                                    var71 += Pix2D.width;
                                    var66 = (var66 + var41) | 0;
                                    var67 = (var67 + var44) | 0;
                                    var68 = (var68 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var71, var63 >> 16, var62 >> 16, var48, var31, var66, var67, var68, var40, var43, var46);
                            var63 += var29;
                            var62 += var27;
                            var48 += var32;
                            var71 += Pix2D.width;
                            var66 = (var66 + var41) | 0;
                            var67 = (var67 + var44) | 0;
                            var68 = (var68 + var47) | 0;
                        }
                    }
                }
            }
        } else if (arg1 <= arg2) {
            if (arg1 < Pix3D.sizeY) {
                if (arg2 > Pix3D.sizeY) {
                    arg2 = Pix3D.sizeY;
                }
                if (arg0 > Pix3D.sizeY) {
                    arg0 = Pix3D.sizeY;
                }
                let var75 = (arg7 << 9) + var31 - var31 * arg4;
                if (arg2 < arg0) {
                    let var76: number;
                    let var77 = (var76 = arg4 << 16);
                    if (arg1 < 0) {
                        var77 -= var27 * arg1;
                        var76 -= var28 * arg1;
                        var75 -= var32 * arg1;
                        arg1 = 0;
                    }
                    let var78 = arg5 << 16;
                    if (arg2 < 0) {
                        var78 -= var29 * arg2;
                        arg2 = 0;
                    }
                    const var79 = arg1 - Pix3D.originY;
                    let var80 = var39 + var41 * var79;
                    let var81 = var42 + var44 * var79;
                    let var82 = var45 + var47 * var79;
                    if ((arg1 !== arg2 && var27 < var28) || (arg1 === arg2 && var27 > var29)) {
                        let var83 = arg0 - arg2;
                        let var84 = arg2 - arg1;
                        let var85 = Pix3D.scanline[arg1];
                        while (true) {
                            var84--;
                            if (var84 < 0) {
                                while (true) {
                                    var83--;
                                    if (var83 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var85, var77 >> 16, var78 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                                    var77 += var27;
                                    var78 += var29;
                                    var75 += var32;
                                    var85 += Pix2D.width;
                                    var80 = (var80 + var41) | 0;
                                    var81 = (var81 + var44) | 0;
                                    var82 = (var82 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var85, var77 >> 16, var76 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                            var77 += var27;
                            var76 += var28;
                            var75 += var32;
                            var85 += Pix2D.width;
                            var80 = (var80 + var41) | 0;
                            var81 = (var81 + var44) | 0;
                            var82 = (var82 + var47) | 0;
                        }
                    } else {
                        let var86 = arg0 - arg2;
                        let var87 = arg2 - arg1;
                        let var88 = Pix3D.scanline[arg1];
                        while (true) {
                            var87--;
                            if (var87 < 0) {
                                while (true) {
                                    var86--;
                                    if (var86 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var88, var78 >> 16, var77 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                                    var77 += var27;
                                    var78 += var29;
                                    var75 += var32;
                                    var88 += Pix2D.width;
                                    var80 = (var80 + var41) | 0;
                                    var81 = (var81 + var44) | 0;
                                    var82 = (var82 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var88, var76 >> 16, var77 >> 16, var75, var31, var80, var81, var82, var40, var43, var46);
                            var77 += var27;
                            var76 += var28;
                            var75 += var32;
                            var88 += Pix2D.width;
                            var80 = (var80 + var41) | 0;
                            var81 = (var81 + var44) | 0;
                            var82 = (var82 + var47) | 0;
                        }
                    }
                } else {
                    let var89: number;
                    let var90 = (var89 = arg4 << 16);
                    if (arg1 < 0) {
                        var90 -= var27 * arg1;
                        var89 -= var28 * arg1;
                        var75 -= var32 * arg1;
                        arg1 = 0;
                    }
                    let var91 = arg3 << 16;
                    if (arg0 < 0) {
                        var91 -= var29 * arg0;
                        arg0 = 0;
                    }
                    const var92 = arg1 - Pix3D.originY;
                    let var93 = var39 + var41 * var92;
                    let var94 = var42 + var44 * var92;
                    let var95 = var45 + var47 * var92;
                    if (var27 < var28) {
                        let var96 = arg2 - arg0;
                        let var97 = arg0 - arg1;
                        let var98 = Pix3D.scanline[arg1];
                        while (true) {
                            var97--;
                            if (var97 < 0) {
                                while (true) {
                                    var96--;
                                    if (var96 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var98, var91 >> 16, var89 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                                    var91 += var29;
                                    var89 += var28;
                                    var75 += var32;
                                    var98 += Pix2D.width;
                                    var93 = (var93 + var41) | 0;
                                    var94 = (var94 + var44) | 0;
                                    var95 = (var95 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var98, var90 >> 16, var89 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                            var90 += var27;
                            var89 += var28;
                            var75 += var32;
                            var98 += Pix2D.width;
                            var93 = (var93 + var41) | 0;
                            var94 = (var94 + var44) | 0;
                            var95 = (var95 + var47) | 0;
                        }
                    } else {
                        let var99 = arg2 - arg0;
                        let var100 = arg0 - arg1;
                        let var101 = Pix3D.scanline[arg1];
                        while (true) {
                            var100--;
                            if (var100 < 0) {
                                while (true) {
                                    var99--;
                                    if (var99 < 0) {
                                        return;
                                    }
                                    Pix3D.textureRasterAffine(Pix2D.pixels, var19, var101, var89 >> 16, var91 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                                    var91 += var29;
                                    var89 += var28;
                                    var75 += var32;
                                    var101 += Pix2D.width;
                                    var93 = (var93 + var41) | 0;
                                    var94 = (var94 + var44) | 0;
                                    var95 = (var95 + var47) | 0;
                                }
                            }
                            Pix3D.textureRasterAffine(Pix2D.pixels, var19, var101, var89 >> 16, var90 >> 16, var75, var31, var93, var94, var95, var40, var43, var46);
                            var90 += var27;
                            var89 += var28;
                            var75 += var32;
                            var101 += Pix2D.width;
                            var93 = (var93 + var41) | 0;
                            var94 = (var94 + var44) | 0;
                            var95 = (var95 + var47) | 0;
                        }
                    }
                }
            }
        } else if (arg2 < Pix3D.sizeY) {
            if (arg0 > Pix3D.sizeY) {
                arg0 = Pix3D.sizeY;
            }
            if (arg1 > Pix3D.sizeY) {
                arg1 = Pix3D.sizeY;
            }
            let var102 = (arg8 << 9) + var31 - var31 * arg5;
            if (arg0 < arg1) {
                let var103: number;
                let var104 = (var103 = arg5 << 16);
                if (arg2 < 0) {
                    var104 -= var28 * arg2;
                    var103 -= var29 * arg2;
                    var102 -= var32 * arg2;
                    arg2 = 0;
                }
                let var105 = arg3 << 16;
                if (arg0 < 0) {
                    var105 -= var27 * arg0;
                    arg0 = 0;
                }
                const var106 = arg2 - Pix3D.originY;
                let var107 = var39 + var41 * var106;
                let var108 = var42 + var44 * var106;
                let var109 = var45 + var47 * var106;
                if (var28 < var29) {
                    let var110 = arg1 - arg0;
                    let var111 = arg0 - arg2;
                    let var112 = Pix3D.scanline[arg2];
                    while (true) {
                        var111--;
                        if (var111 < 0) {
                            while (true) {
                                var110--;
                                if (var110 < 0) {
                                    return;
                                }
                                Pix3D.textureRasterAffine(Pix2D.pixels, var19, var112, var104 >> 16, var105 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                                var104 += var28;
                                var105 += var27;
                                var102 += var32;
                                var112 += Pix2D.width;
                                var107 = (var107 + var41) | 0;
                                var108 = (var108 + var44) | 0;
                                var109 = (var109 + var47) | 0;
                            }
                        }
                        Pix3D.textureRasterAffine(Pix2D.pixels, var19, var112, var104 >> 16, var103 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                        var104 += var28;
                        var103 += var29;
                        var102 += var32;
                        var112 += Pix2D.width;
                        var107 = (var107 + var41) | 0;
                        var108 = (var108 + var44) | 0;
                        var109 = (var109 + var47) | 0;
                    }
                } else {
                    let var113 = arg1 - arg0;
                    let var114 = arg0 - arg2;
                    let var115 = Pix3D.scanline[arg2];
                    while (true) {
                        var114--;
                        if (var114 < 0) {
                            while (true) {
                                var113--;
                                if (var113 < 0) {
                                    return;
                                }
                                Pix3D.textureRasterAffine(Pix2D.pixels, var19, var115, var105 >> 16, var104 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                                var104 += var28;
                                var105 += var27;
                                var102 += var32;
                                var115 += Pix2D.width;
                                var107 = (var107 + var41) | 0;
                                var108 = (var108 + var44) | 0;
                                var109 = (var109 + var47) | 0;
                            }
                        }
                        Pix3D.textureRasterAffine(Pix2D.pixels, var19, var115, var103 >> 16, var104 >> 16, var102, var31, var107, var108, var109, var40, var43, var46);
                        var104 += var28;
                        var103 += var29;
                        var102 += var32;
                        var115 += Pix2D.width;
                        var107 = (var107 + var41) | 0;
                        var108 = (var108 + var44) | 0;
                        var109 = (var109 + var47) | 0;
                    }
                }
            } else {
                let var116: number;
                let var117 = (var116 = arg5 << 16);
                if (arg2 < 0) {
                    var117 -= var28 * arg2;
                    var116 -= var29 * arg2;
                    var102 -= var32 * arg2;
                    arg2 = 0;
                }
                let var118 = arg4 << 16;
                if (arg1 < 0) {
                    var118 -= var27 * arg1;
                    arg1 = 0;
                }
                const var119 = arg2 - Pix3D.originY;
                let var120 = var39 + var41 * var119;
                let var121 = var42 + var44 * var119;
                let var122 = var45 + var47 * var119;
                if (var28 < var29) {
                    let var123 = arg0 - arg1;
                    let var124 = arg1 - arg2;
                    let var125 = Pix3D.scanline[arg2];
                    while (true) {
                        var124--;
                        if (var124 < 0) {
                            while (true) {
                                var123--;
                                if (var123 < 0) {
                                    return;
                                }
                                Pix3D.textureRasterAffine(Pix2D.pixels, var19, var125, var118 >> 16, var116 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                                var118 += var27;
                                var116 += var29;
                                var102 += var32;
                                var125 += Pix2D.width;
                                var120 = (var120 + var41) | 0;
                                var121 = (var121 + var44) | 0;
                                var122 = (var122 + var47) | 0;
                            }
                        }
                        Pix3D.textureRasterAffine(Pix2D.pixels, var19, var125, var117 >> 16, var116 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                        var117 += var28;
                        var116 += var29;
                        var102 += var32;
                        var125 += Pix2D.width;
                        var120 = (var120 + var41) | 0;
                        var121 = (var121 + var44) | 0;
                        var122 = (var122 + var47) | 0;
                    }
                } else {
                    let var126 = arg0 - arg1;
                    let var127 = arg1 - arg2;
                    let var128 = Pix3D.scanline[arg2];
                    while (true) {
                        var127--;
                        if (var127 < 0) {
                            while (true) {
                                var126--;
                                if (var126 < 0) {
                                    return;
                                }
                                Pix3D.textureRasterAffine(Pix2D.pixels, var19, var128, var116 >> 16, var118 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                                var118 += var27;
                                var116 += var29;
                                var102 += var32;
                                var128 += Pix2D.width;
                                var120 = (var120 + var41) | 0;
                                var121 = (var121 + var44) | 0;
                                var122 = (var122 + var47) | 0;
                            }
                        }
                        Pix3D.textureRasterAffine(Pix2D.pixels, var19, var128, var116 >> 16, var117 >> 16, var102, var31, var120, var121, var122, var40, var43, var46);
                        var117 += var28;
                        var116 += var29;
                        var102 += var32;
                        var128 += Pix2D.width;
                        var120 = (var120 + var41) | 0;
                        var121 = (var121 + var44) | 0;
                        var122 = (var122 + var47) | 0;
                    }
                }
            }
        }
    }

    // jag::oldscape::dash3d::SoftwarePix3D::TextureRasterAffine
    static textureRasterAffine(arg0: Int32Array, arg1: Int32Array, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number, arg9: number, arg10: number, arg11: number, arg12: number): void {
        if (Pix3D.hclip) {
            if (arg4 > Pix3D.sizeX) {
                arg4 = Pix3D.sizeX;
            }
            if (arg3 < 0) {
                arg3 = 0;
            }
        }
        if (arg3 >= arg4) {
            return;
        }
        let var13 = arg2 + arg3;
        let var14 = (arg5 + arg6 * arg3) | 0;
        const var15 = arg4 - arg3;

        if (!Pix3D.lowMem) {
            const var68 = arg3 - Pix3D.originX;
            const var69 = (arg7 + ((arg10 * var68) | 0)) | 0;
            const var70 = (arg8 + ((arg11 * var68) | 0)) | 0;
            const var71 = (arg9 + ((arg12 * var68) | 0)) | 0;
            const var72 = var71 >> 14;
            let var73: number;
            let var74: number;
            if (var72 === 0) {
                var73 = 0;
                var74 = 0;
            } else {
                var73 = Math.trunc(var69 / var72) | 0;
                var74 = Math.trunc(var70 / var72) | 0;
            }
            const var75 = (var69 + ((arg10 * var15) | 0)) | 0;
            const var76 = (var70 + ((arg11 * var15) | 0)) | 0;
            const var77 = (var71 + ((arg12 * var15) | 0)) | 0;
            const var78 = var77 >> 14;
            let var79: number;
            let var80: number;
            if (var78 === 0) {
                var79 = 0;
                var80 = 0;
            } else {
                var79 = Math.trunc(var75 / var78) | 0;
                var80 = Math.trunc(var76 / var78) | 0;
            }
            let var81 = ((var73 << 18) + var74) | 0;
            const var82 = ((Math.trunc(((var79 - var73) | 0) / var15) << 18) + Math.trunc(((var80 - var74) | 0) / var15)) | 0;
            let var83 = var15 >> 3;
            const var84 = arg6 << 3;
            let var85 = var14 >> 8;
            if (Pix3D.opaque) {
                if (var83 > 0) {
                    do {
                        const var86 = arg1[(var81 & 0x3f80) + (var81 >>> 25)];
                        arg0[var13++] = ((((var86 & 0xff00ff) * var85) & 0xff00ff00) + (((var86 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var87 = var81 + var82;
                        const var88 = arg1[(var87 & 0x3f80) + (var87 >>> 25)];
                        arg0[var13++] = ((((var88 & 0xff00ff) * var85) & 0xff00ff00) + (((var88 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var89 = var87 + var82;
                        const var90 = arg1[(var89 & 0x3f80) + (var89 >>> 25)];
                        arg0[var13++] = ((((var90 & 0xff00ff) * var85) & 0xff00ff00) + (((var90 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var91 = var89 + var82;
                        const var92 = arg1[(var91 & 0x3f80) + (var91 >>> 25)];
                        arg0[var13++] = ((((var92 & 0xff00ff) * var85) & 0xff00ff00) + (((var92 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var93 = var91 + var82;
                        const var94 = arg1[(var93 & 0x3f80) + (var93 >>> 25)];
                        arg0[var13++] = ((((var94 & 0xff00ff) * var85) & 0xff00ff00) + (((var94 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var95 = var93 + var82;
                        const var96 = arg1[(var95 & 0x3f80) + (var95 >>> 25)];
                        arg0[var13++] = ((((var96 & 0xff00ff) * var85) & 0xff00ff00) + (((var96 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var97 = var95 + var82;
                        const var98 = arg1[(var97 & 0x3f80) + (var97 >>> 25)];
                        arg0[var13++] = ((((var98 & 0xff00ff) * var85) & 0xff00ff00) + (((var98 & 0xff00) * var85) & 0xff0000)) >> 8;
                        const var99 = var97 + var82;
                        const var100 = arg1[(var99 & 0x3f80) + (var99 >>> 25)];
                        arg0[var13++] = ((((var100 & 0xff00ff) * var85) & 0xff00ff00) + (((var100 & 0xff00) * var85) & 0xff0000)) >> 8;
                        var81 = (var99 + var82) | 0;
                        var14 = (var14 + var84) | 0;
                        var85 = var14 >> 8;
                        var83--;
                    } while (var83 > 0);
                }
                let var101 = (arg4 - arg3) & 0x7;
                if (var101 > 0) {
                    do {
                        const var102 = arg1[(var81 & 0x3f80) + (var81 >>> 25)];
                        arg0[var13++] = ((((var102 & 0xff00ff) * var85) & 0xff00ff00) + (((var102 & 0xff00) * var85) & 0xff0000)) >> 8;
                        var81 = (var81 + var82) | 0;
                        var101--;
                    } while (var101 > 0);
                    return;
                }
            } else {
                if (var83 > 0) {
                    do {
                        const var103 = arg1[(var81 & 0x3f80) + (var81 >>> 25)];
                        if (var103 !== 0) {
                            arg0[var13] = ((((var103 & 0xff00ff) * var85) & 0xff00ff00) + (((var103 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var104 = var81 + var82;
                        const var105 = arg1[(var104 & 0x3f80) + (var104 >>> 25)];
                        if (var105 !== 0) {
                            arg0[var13] = ((((var105 & 0xff00ff) * var85) & 0xff00ff00) + (((var105 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var106 = var104 + var82;
                        const var107 = arg1[(var106 & 0x3f80) + (var106 >>> 25)];
                        if (var107 !== 0) {
                            arg0[var13] = ((((var107 & 0xff00ff) * var85) & 0xff00ff00) + (((var107 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var108 = var106 + var82;
                        const var109 = arg1[(var108 & 0x3f80) + (var108 >>> 25)];
                        if (var109 !== 0) {
                            arg0[var13] = ((((var109 & 0xff00ff) * var85) & 0xff00ff00) + (((var109 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var110 = var108 + var82;
                        const var111 = arg1[(var110 & 0x3f80) + (var110 >>> 25)];
                        if (var111 !== 0) {
                            arg0[var13] = ((((var111 & 0xff00ff) * var85) & 0xff00ff00) + (((var111 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var112 = var110 + var82;
                        const var113 = arg1[(var112 & 0x3f80) + (var112 >>> 25)];
                        if (var113 !== 0) {
                            arg0[var13] = ((((var113 & 0xff00ff) * var85) & 0xff00ff00) + (((var113 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var114 = var112 + var82;
                        const var115 = arg1[(var114 & 0x3f80) + (var114 >>> 25)];
                        if (var115 !== 0) {
                            arg0[var13] = ((((var115 & 0xff00ff) * var85) & 0xff00ff00) + (((var115 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        const var116 = var114 + var82;
                        const var117 = arg1[(var116 & 0x3f80) + (var116 >>> 25)];
                        if (var117 !== 0) {
                            arg0[var13] = ((((var117 & 0xff00ff) * var85) & 0xff00ff00) + (((var117 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        var81 = (var116 + var82) | 0;
                        var14 = (var14 + var84) | 0;
                        var85 = var14 >> 8;
                        var83--;
                    } while (var83 > 0);
                }
                let var118 = (arg4 - arg3) & 0x7;
                if (var118 > 0) {
                    do {
                        const var119 = arg1[(var81 & 0x3f80) + (var81 >>> 25)];
                        if (var119 !== 0) {
                            arg0[var13] = ((((var119 & 0xff00ff) * var85) & 0xff00ff00) + (((var119 & 0xff00) * var85) & 0xff0000)) >> 8;
                        }
                        var13++;
                        var81 = (var81 + var82) | 0;
                        var118--;
                    } while (var118 > 0);
                }
            }
            return;
        }

        const var16 = arg3 - Pix3D.originX;
        const var17 = (arg7 + ((arg10 * var16) | 0)) | 0;
        const var18 = (arg8 + ((arg11 * var16) | 0)) | 0;
        const var19 = (arg9 + ((arg12 * var16) | 0)) | 0;
        const var20 = var19 >> 12;
        let var21: number;
        let var22: number;
        if (var20 === 0) {
            var21 = 0;
            var22 = 0;
        } else {
            var21 = Math.trunc(var17 / var20) | 0;
            var22 = Math.trunc(var18 / var20) | 0;
        }
        const var23 = (var17 + ((arg10 * var15) | 0)) | 0;
        const var24 = (var18 + ((arg11 * var15) | 0)) | 0;
        const var25 = (var19 + ((arg12 * var15) | 0)) | 0;
        const var26 = var25 >> 12;
        let var27: number;
        let var28: number;
        if (var26 === 0) {
            var27 = 0;
            var28 = 0;
        } else {
            var27 = Math.trunc(var23 / var26) | 0;
            var28 = Math.trunc(var24 / var26) | 0;
        }
        let var29 = ((var21 << 20) + var22) | 0;
        const var30 = ((Math.trunc(((var27 - var21) | 0) / var15) << 20) + Math.trunc(((var28 - var22) | 0) / var15)) | 0;
        let var31 = var15 >> 3;
        const var32 = arg6 << 3;
        let var33 = var14 >> 8;
        if (Pix3D.opaque) {
            if (var31 > 0) {
                do {
                    const var34 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                    arg0[var13++] = ((((var34 & 0xff00ff) * var33) & 0xff00ff00) + (((var34 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var35 = var29 + var30;
                    const var36 = arg1[(var35 & 0xfc0) + (var35 >>> 26)];
                    arg0[var13++] = ((((var36 & 0xff00ff) * var33) & 0xff00ff00) + (((var36 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var37 = var35 + var30;
                    const var38 = arg1[(var37 & 0xfc0) + (var37 >>> 26)];
                    arg0[var13++] = ((((var38 & 0xff00ff) * var33) & 0xff00ff00) + (((var38 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var39 = var37 + var30;
                    const var40 = arg1[(var39 & 0xfc0) + (var39 >>> 26)];
                    arg0[var13++] = ((((var40 & 0xff00ff) * var33) & 0xff00ff00) + (((var40 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var41 = var39 + var30;
                    const var42 = arg1[(var41 & 0xfc0) + (var41 >>> 26)];
                    arg0[var13++] = ((((var42 & 0xff00ff) * var33) & 0xff00ff00) + (((var42 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var43 = var41 + var30;
                    const var44 = arg1[(var43 & 0xfc0) + (var43 >>> 26)];
                    arg0[var13++] = ((((var44 & 0xff00ff) * var33) & 0xff00ff00) + (((var44 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var45 = var43 + var30;
                    const var46 = arg1[(var45 & 0xfc0) + (var45 >>> 26)];
                    arg0[var13++] = ((((var46 & 0xff00ff) * var33) & 0xff00ff00) + (((var46 & 0xff00) * var33) & 0xff0000)) >> 8;
                    const var47 = var45 + var30;
                    const var48 = arg1[(var47 & 0xfc0) + (var47 >>> 26)];
                    arg0[var13++] = ((((var48 & 0xff00ff) * var33) & 0xff00ff00) + (((var48 & 0xff00) * var33) & 0xff0000)) >> 8;
                    var29 = (var47 + var30) | 0;
                    var14 = (var14 + var32) | 0;
                    var33 = var14 >> 8;
                    var31--;
                } while (var31 > 0);
            }
            let var49 = (arg4 - arg3) & 0x7;
            if (var49 > 0) {
                do {
                    const var50 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                    arg0[var13++] = ((((var50 & 0xff00ff) * var33) & 0xff00ff00) + (((var50 & 0xff00) * var33) & 0xff0000)) >> 8;
                    var29 = (var29 + var30) | 0;
                    var49--;
                } while (var49 > 0);
                return;
            }
            return;
        }
        if (var31 > 0) {
            do {
                const var51 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
                if (var51 !== 0) {
                    arg0[var13] = ((((var51 & 0xff00ff) * var33) & 0xff00ff00) + (((var51 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var52 = var29 + var30;
                const var53 = arg1[(var52 & 0xfc0) + (var52 >>> 26)];
                if (var53 !== 0) {
                    arg0[var13] = ((((var53 & 0xff00ff) * var33) & 0xff00ff00) + (((var53 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var54 = var52 + var30;
                const var55 = arg1[(var54 & 0xfc0) + (var54 >>> 26)];
                if (var55 !== 0) {
                    arg0[var13] = ((((var55 & 0xff00ff) * var33) & 0xff00ff00) + (((var55 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var56 = var54 + var30;
                const var57 = arg1[(var56 & 0xfc0) + (var56 >>> 26)];
                if (var57 !== 0) {
                    arg0[var13] = ((((var57 & 0xff00ff) * var33) & 0xff00ff00) + (((var57 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var58 = var56 + var30;
                const var59 = arg1[(var58 & 0xfc0) + (var58 >>> 26)];
                if (var59 !== 0) {
                    arg0[var13] = ((((var59 & 0xff00ff) * var33) & 0xff00ff00) + (((var59 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var60 = var58 + var30;
                const var61 = arg1[(var60 & 0xfc0) + (var60 >>> 26)];
                if (var61 !== 0) {
                    arg0[var13] = ((((var61 & 0xff00ff) * var33) & 0xff00ff00) + (((var61 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var62 = var60 + var30;
                const var63 = arg1[(var62 & 0xfc0) + (var62 >>> 26)];
                if (var63 !== 0) {
                    arg0[var13] = ((((var63 & 0xff00ff) * var33) & 0xff00ff00) + (((var63 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                const var64 = var62 + var30;
                const var65 = arg1[(var64 & 0xfc0) + (var64 >>> 26)];
                if (var65 !== 0) {
                    arg0[var13] = ((((var65 & 0xff00ff) * var33) & 0xff00ff00) + (((var65 & 0xff00) * var33) & 0xff0000)) >> 8;
                }
                var13++;
                var29 = (var64 + var30) | 0;
                var14 = (var14 + var32) | 0;
                var33 = var14 >> 8;
                var31--;
            } while (var31 > 0);
        }
        let var66 = (arg4 - arg3) & 0x7;
        if (var66 <= 0) {
            return;
        }
        do {
            const var67 = arg1[(var29 & 0xfc0) + (var29 >>> 26)];
            if (var67 !== 0) {
                arg0[var13] = ((((var67 & 0xff00ff) * var33) & 0xff00ff00) + (((var67 & 0xff00) * var33) & 0xff0000)) >> 8;
            }
            var13++;
            var29 = (var29 + var30) | 0;
            var66--;
        } while (var66 > 0);
        return;
    }

    // jag::oldscape::dash3d::Pix3D::TextureLightColour
    /**
     * GPU textured face (Stage B): evaluate the software mapper's SCREEN-LINEAR
     * plane functions f1/f2/f3 (u = f1/f3, v = f2/f3, texel units) at the three
     * screen vertices and hand them to the GL varyings — linear interpolation of
     * linear functions makes the fragment shader's divides perspective-exact.
     * Base terms bake focal 512 (<<14 = coeff*512*32); x-steps (<<8) are per-8px
     * spans (hence /8 per pixel), y-steps (<<5) per row; steps rescale by
     * 512/focal exactly like the software path. Falls back to the average-colour
     * gouraud while the texture is still downloading or the atlas is full.
     */
    private static glTexturedFace(
        y0: number, y1: number, y2: number, x0: number, x1: number, x2: number,
        l0: number, l1: number, l2: number,
        arg9: number, arg10: number, arg11: number, arg12: number, arg13: number,
        arg14: number, arg15: number, arg16: number, arg17: number, textureId: number
    ): void {
        const var33 = arg9 - arg10;
        const var34 = arg12 - arg13;
        const var35 = arg15 - arg16;
        const var36 = arg11 - arg9;
        const var37 = arg14 - arg12;
        const var38 = arg17 - arg15;
        const fscale = Pix3D.focal !== 512 ? 512 / Pix3D.focal : 1;
        const f1c = (var36 * arg12 - var37 * arg9) * 16384;
        const f1x = ((var37 * arg15 - var38 * arg12) * 256 * fscale) / 8;
        const f1y = (var38 * arg9 - var36 * arg15) * 32 * fscale;
        const f2c = (var33 * arg12 - var34 * arg9) * 16384;
        const f2x = ((var34 * arg15 - var35 * arg12) * 256 * fscale) / 8;
        const f2y = (var35 * arg9 - var33 * arg15) * 32 * fscale;
        const f3c = (var34 * var36 - var33 * var37) * 16384;
        const f3x = ((var35 * var37 - var34 * var38) * 256 * fscale) / 8;
        const f3y = (var33 * var38 - var35 * var36) * 32 * fscale;
        const ok = GlRenderer.pushTexturedTriangle(
            textureId,
            x0, y0, l0, f1c + f1x * x0 + f1y * y0, f2c + f2x * x0 + f2y * y0, f3c + f3x * x0 + f3y * y0,
            x1, y1, l1, f1c + f1x * x1 + f1y * y1, f2c + f2x * x1 + f2y * y1, f3c + f3x * x1 + f3y * y1,
            x2, y2, l2, f1c + f1x * x2 + f1y * y2, f2c + f2x * x2 + f2y * y2, f3c + f3x * x2 + f3y * y2,
            (256 - Pix3D.trans) / 256
        );
        if (!ok) {
            const avg = Pix3D.textureManager!.getAverageRgb(textureId);
            Pix3D.gouraudTriangle(y0, y1, y2, x0, x1, x2, Pix3D.textureLightColour(avg, l0), Pix3D.textureLightColour(avg, l1), Pix3D.textureLightColour(avg, l2));
        }
    }

    static textureLightColour(arg0: number, arg1: number): number {
        let var2 = (arg1 * (arg0 & 0x7f)) >> 7;
        if (var2 < 2) {
            var2 = 2;
        } else if (var2 > 126) {
            var2 = 126;
        }
        return (arg0 & 0xff80) + var2;
    }
}
