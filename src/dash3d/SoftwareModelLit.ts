import ModelLit from '#/dash3d/ModelLit.js';
import Pix3D from '#/dash3d/Pix3D.js';
import AnimFrameSet from '#/dash3d/AnimFrameSet.js';
import type ModelUnlit from '#/dash3d/ModelUnlit.js';
import type { SceneTag } from '#/dash3d/ModelSource.js';

export default class SoftwareModelLit extends ModelLit {
    static tmpPriority11FaceDepth: Int32Array = new Int32Array(4096);
    static tmpPriorityFaces: Int32Array[] = Array.from({ length: 12 }, () => new Int32Array(4096));
    static vertexViewSpaceY: Int32Array = new Int32Array(4096);
    static tmpDepthFaceCount: Int32Array = new Int32Array(1600);
    static vertexViewSpaceX: Int32Array = new Int32Array(4096);
    static tmpPriorityFaceCount: Int32Array = new Int32Array(12);
    static tmpDepthFaces: Int32Array[] = Array.from({ length: 1600 }, () => new Int32Array(512));
    static vertexScreenY: Int32Array = new Int32Array(4096);
    static clippedColour: Int32Array = new Int32Array(10);
    static vertexScreenZ: Int32Array = new Int32Array(4096);
    static tmpPriorityDepthSum: Int32Array = new Int32Array(12);
    static clippedY: Int32Array = new Int32Array(10);
    static vertexScreenX: Int32Array = new Int32Array(4096);
    static vertexViewSpaceZ: Int32Array = new Int32Array(4096);
    static pickedEntityTypecode: SceneTag[] = new Array(1000).fill(0);
    static pickedCount: number = 0;
    static clippedX: Int32Array = new Int32Array(10);
    static oX: number = 0;
    static faceClippedX: boolean[] = new Array(4096).fill(false);
    static oZ: number = 0;
    static readonly tempModel: SoftwareModelLit = new SoftwareModelLit();
    static readonly tempModel2: SoftwareModelLit = new SoftwareModelLit();
    static tempFTran2: Int8Array = new Int8Array(1);
    static oY: number = 0;
    static tempFTran: Int8Array = new Int8Array(1);
    static faceNearClipped: boolean[] = new Array(4096).fill(false);
    static tmpPriority10FaceDepth: Int32Array = new Int32Array(4096);

    minX: number = 0;
    boundsCalculated: boolean = false;
    faceColourC: Int32Array | null = null;
    facePriority: Int8Array | null = null;
    faceTextureM: Int32Array | null = null;
    maxZ: number = 0;
    numT: number = 0;
    pointX: Int32Array | null = null;
    faceTextureAxis: Int8Array | null = null;
    priority: number = 0;
    numPoints: number = 0;
    numFaces: number = 0;
    pointY: Int32Array | null = null;
    pointZ: Int32Array | null = null;
    faceVertexA: Int32Array | null = null;
    faceVertexB: Int32Array | null = null;
    faceVertexC: Int32Array | null = null;
    faceAlpha: Int8Array | null = null;
    labelVertices: number[][] | null = null;
    labelFaces: number[][] | null = null;
    faceColourA: Int32Array | null = null;
    faceColourB: Int32Array | null = null;
    faceTextureId: Int16Array | null = null;
    faceTextureP: Int32Array | null = null;
    faceTextureN: Int32Array | null = null;
    maxDepth: number = 0;
    minZ: number = 0;
    radius: number = 0;
    maxX: number = 0;
    field2277: number = 0;
    maxY: number = 0;

    constructor();
    constructor(arg0: SoftwareModelLit[], arg1: number);
    constructor(arg0: ModelUnlit, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number);
    constructor(arg0?: ModelUnlit | SoftwareModelLit[], arg1: number = 0, arg2: number = 0, arg3: number = 0, arg4: number = 0, arg5: number = 0) {
        super();
        if (arg0 === undefined) {
            return;
        }
        if (Array.isArray(arg0)) {
            let var3 = false;
            let var4 = false;
            let var5 = false;
            let var6 = false;
            this.numPoints = 0;
            this.numFaces = 0;
            this.numT = 0;
            this.priority = -1;
            for (let var7 = 0; var7 < 2; var7++) {
                const var8 = arg0[var7];
                if (var8 !== null) {
                    this.numPoints += var8.numPoints;
                    this.numFaces += var8.numFaces;
                    this.numT += var8.numT;
                    if (var8.facePriority === null) {
                        if (this.priority === -1) {
                            this.priority = var8.priority;
                        }
                        if (this.priority !== var8.priority) {
                            var3 = true;
                        }
                    } else {
                        var3 = true;
                    }
                    var4 ||= var8.faceAlpha !== null;
                    var5 ||= var8.faceTextureId !== null;
                    var6 ||= var8.faceTextureAxis !== null;
                }
            }
            this.pointX = new Int32Array(this.numPoints);
            this.pointY = new Int32Array(this.numPoints);
            this.pointZ = new Int32Array(this.numPoints);
            this.faceVertexA = new Int32Array(this.numFaces);
            this.faceVertexB = new Int32Array(this.numFaces);
            this.faceVertexC = new Int32Array(this.numFaces);
            this.faceColourA = new Int32Array(this.numFaces);
            this.faceColourB = new Int32Array(this.numFaces);
            this.faceColourC = new Int32Array(this.numFaces);
            if (var3) {
                this.facePriority = new Int8Array(this.numFaces);
            }
            if (var4) {
                this.faceAlpha = new Int8Array(this.numFaces);
            }
            if (var5) {
                this.faceTextureId = new Int16Array(this.numFaces);
            }
            if (var6) {
                this.faceTextureAxis = new Int8Array(this.numFaces);
            }
            if (this.numT > 0) {
                this.faceTextureP = new Int32Array(this.numT);
                this.faceTextureM = new Int32Array(this.numT);
                this.faceTextureN = new Int32Array(this.numT);
            }
            this.numPoints = 0;
            this.numFaces = 0;
            this.numT = 0;
            for (let var9 = 0; var9 < 2; var9++) {
                const var10 = arg0[var9];
                if (var10 !== null) {
                    for (let var11 = 0; var11 < var10.numFaces; var11++) {
                        this.faceVertexA[this.numFaces] = var10.faceVertexA![var11] + this.numPoints;
                        this.faceVertexB[this.numFaces] = var10.faceVertexB![var11] + this.numPoints;
                        this.faceVertexC[this.numFaces] = var10.faceVertexC![var11] + this.numPoints;
                        this.faceColourA[this.numFaces] = var10.faceColourA![var11];
                        this.faceColourB[this.numFaces] = var10.faceColourB![var11];
                        this.faceColourC[this.numFaces] = var10.faceColourC![var11];
                        if (var3) {
                            this.facePriority![this.numFaces] = var10.facePriority === null ? var10.priority : var10.facePriority[var11];
                        }
                        if (var4 && var10.faceAlpha !== null) {
                            this.faceAlpha![this.numFaces] = var10.faceAlpha[var11];
                        }
                        if (var5) {
                            this.faceTextureId![this.numFaces] = var10.faceTextureId === null ? -1 : var10.faceTextureId[var11];
                        }
                        if (var6) {
                            if (var10.faceTextureAxis === null || var10.faceTextureAxis[var11] === -1) {
                                this.faceTextureAxis![this.numFaces] = -1;
                            } else {
                                this.faceTextureAxis![this.numFaces] = var10.faceTextureAxis[var11] + this.numT;
                            }
                        }
                        this.numFaces++;
                    }
                    for (let var12 = 0; var12 < var10.numT; var12++) {
                        this.faceTextureP![this.numT] = var10.faceTextureP![var12] + this.numPoints;
                        this.faceTextureM![this.numT] = var10.faceTextureM![var12] + this.numPoints;
                        this.faceTextureN![this.numT] = var10.faceTextureN![var12] + this.numPoints;
                        this.numT++;
                    }
                    for (let var13 = 0; var13 < var10.numPoints; var13++) {
                        this.pointX[this.numPoints] = var10.pointX![var13];
                        this.pointY[this.numPoints] = var10.pointY![var13];
                        this.pointZ[this.numPoints] = var10.pointZ![var13];
                        this.numPoints++;
                    }
                }
            }
            return;
        }
        arg0.calculateNormals();
        arg0.prepareAnim();
        this.numPoints = arg0.numPoints;
        this.pointX = arg0.pointX;
        this.pointY = arg0.pointY;
        this.pointZ = arg0.pointZ;
        this.numFaces = arg0.numFaces;
        this.faceVertexA = arg0.faceVertexA;
        this.faceVertexB = arg0.faceVertexB;
        this.faceVertexC = arg0.faceVertexC;
        this.facePriority = arg0.facePriority as unknown as Int8Array | null;
        this.faceAlpha = arg0.faceAlpha as Int8Array | null;
        this.priority = arg0.priority;
        this.labelVertices = arg0.labelVertices as number[][] | null;
        this.labelFaces = arg0.labelFaces as number[][] | null;
        const var7 = Math.sqrt((((Math.imul(arg3, arg3) + Math.imul(arg4, arg4)) | 0) + Math.imul(arg5, arg5)) | 0) | 0;
        const var8 = Math.imul(arg2, var7) >> 8;
        this.faceColourA = new Int32Array(this.numFaces);
        this.faceColourB = new Int32Array(this.numFaces);
        this.faceColourC = new Int32Array(this.numFaces);
        if (arg0.faceTextureId !== null) {
            this.faceTextureId = new Int16Array(this.numFaces);
            for (let var9 = 0; var9 < this.numFaces; var9++) {
                const var10 = arg0.faceTextureId[var9];
                this.faceTextureId[var9] = var10 !== -1 && Pix3D.textureManager.isTextureEnabled(var10) ? var10 : -1;
            }
        }
        if (arg0.numT > 0 && arg0.faceTextureAxis !== null) {
            const var11 = new Int32Array(arg0.numT);
            for (let var12 = 0; var12 < this.numFaces; var12++) {
                if (arg0.faceTextureAxis[var12] !== -1) {
                    var11[arg0.faceTextureAxis[var12] & 0xff]++;
                }
            }
            this.numT = 0;
            for (let var13 = 0; var13 < arg0.numT; var13++) {
                if (var11[var13] > 0 && arg0.textureRenderType![var13] === 0) {
                    this.numT++;
                }
            }
            this.faceTextureP = new Int32Array(this.numT);
            this.faceTextureM = new Int32Array(this.numT);
            this.faceTextureN = new Int32Array(this.numT);
            let var14 = 0;
            for (let var15 = 0; var15 < arg0.numT; var15++) {
                if (var11[var15] > 0 && arg0.textureRenderType![var15] === 0) {
                    this.faceTextureP[var14] = arg0.faceTextureP![var15] & 0xffff;
                    this.faceTextureM[var14] = arg0.faceTextureM![var15] & 0xffff;
                    this.faceTextureN[var14] = arg0.faceTextureN![var15] & 0xffff;
                    var11[var15] = var14++;
                } else {
                    var11[var15] = -1;
                }
            }
            this.faceTextureAxis = new Int8Array(this.numFaces);
            for (let var16 = 0; var16 < this.numFaces; var16++) {
                if (arg0.faceTextureAxis[var16] === -1) {
                    this.faceTextureAxis[var16] = -1;
                } else {
                    this.faceTextureAxis[var16] = var11[arg0.faceTextureAxis[var16] & 0xff];
                    if (this.faceTextureAxis[var16] === -1 && this.faceTextureId !== null) {
                        this.faceTextureId[var16] = -1;
                    }
                }
            }
        }
        for (let var17 = 0; var17 < this.numFaces; var17++) {
            let var18 = arg0.faceRenderType === null ? 0 : arg0.faceRenderType[var17];
            const var19 = arg0.faceAlpha === null ? 0 : arg0.faceAlpha[var17];
            const var20 = this.faceTextureId === null ? -1 : this.faceTextureId[var17];
            if (var19 === -2) {
                var18 = 3;
            }
            if (var19 === -1) {
                var18 = 2;
            }
            if (var20 === -1) {
                if (var18 === 0) {
                    const var21 = arg0.faceColour![var17] & 0xffff;
                    const var22 = arg0.sharedPointNormal?.[this.faceVertexA![var17]] ?? arg0.pointNormal![this.faceVertexA![var17]]!;
                    const var23Denom = Math.imul(var8, var22.w);
                    if (var23Denom === 0) {
                        throw new Error();
                    }
                    const var23 = (arg1 + ((((((Math.imul(arg3, var22.x) + Math.imul(arg4, var22.y)) | 0) + Math.imul(arg5, var22.z)) | 0) / var23Denom) | 0)) | 0;
                    this.faceColourA[var17] = SoftwareModelLit.getColour(var21, var23);
                    const var24 = arg0.sharedPointNormal?.[this.faceVertexB![var17]] ?? arg0.pointNormal![this.faceVertexB![var17]]!;
                    const var25Denom = Math.imul(var8, var24.w);
                    if (var25Denom === 0) {
                        throw new Error();
                    }
                    const var25 = (arg1 + ((((((Math.imul(arg3, var24.x) + Math.imul(arg4, var24.y)) | 0) + Math.imul(arg5, var24.z)) | 0) / var25Denom) | 0)) | 0;
                    this.faceColourB[var17] = SoftwareModelLit.getColour(var21, var25);
                    const var26 = arg0.sharedPointNormal?.[this.faceVertexC![var17]] ?? arg0.pointNormal![this.faceVertexC![var17]]!;
                    const var27Denom = Math.imul(var8, var26.w);
                    if (var27Denom === 0) {
                        throw new Error();
                    }
                    const var27 = (arg1 + ((((((Math.imul(arg3, var26.x) + Math.imul(arg4, var26.y)) | 0) + Math.imul(arg5, var26.z)) | 0) / var27Denom) | 0)) | 0;
                    this.faceColourC[var17] = SoftwareModelLit.getColour(var21, var27);
                } else if (var18 === 1) {
                    const var28 = arg0.faceNormal![var17]!;
                    const var29Denom = (var8 + ((var8 / 2) | 0)) | 0;
                    if (var29Denom === 0) {
                        throw new Error();
                    }
                    const var29 = (arg1 + ((((((Math.imul(arg3, var28.x) + Math.imul(arg4, var28.y)) | 0) + Math.imul(arg5, var28.z)) | 0) / var29Denom) | 0)) | 0;
                    this.faceColourA[var17] = SoftwareModelLit.getColour(arg0.faceColour![var17] & 0xffff, var29);
                    this.faceColourC[var17] = -1;
                } else if (var18 === 3) {
                    this.faceColourA[var17] = 128;
                    this.faceColourC[var17] = -1;
                } else {
                    this.faceColourC[var17] = -2;
                }
            } else if (var18 === 0) {
                const var30 = arg0.sharedPointNormal?.[this.faceVertexA![var17]] ?? arg0.pointNormal![this.faceVertexA![var17]]!;
                const var31Denom = Math.imul(var8, var30.w);
                if (var31Denom === 0) {
                    throw new Error();
                }
                const var31 = (arg1 + ((((((Math.imul(arg3, var30.x) + Math.imul(arg4, var30.y)) | 0) + Math.imul(arg5, var30.z)) | 0) / var31Denom) | 0)) | 0;
                this.faceColourA[var17] = SoftwareModelLit.getTexLight(var31);
                const var32 = arg0.sharedPointNormal?.[this.faceVertexB![var17]] ?? arg0.pointNormal![this.faceVertexB![var17]]!;
                const var33Denom = Math.imul(var8, var32.w);
                if (var33Denom === 0) {
                    throw new Error();
                }
                const var33 = (arg1 + ((((((Math.imul(arg3, var32.x) + Math.imul(arg4, var32.y)) | 0) + Math.imul(arg5, var32.z)) | 0) / var33Denom) | 0)) | 0;
                this.faceColourB[var17] = SoftwareModelLit.getTexLight(var33);
                const var34 = arg0.sharedPointNormal?.[this.faceVertexC![var17]] ?? arg0.pointNormal![this.faceVertexC![var17]]!;
                const var35Denom = Math.imul(var8, var34.w);
                if (var35Denom === 0) {
                    throw new Error();
                }
                const var35 = (arg1 + ((((((Math.imul(arg3, var34.x) + Math.imul(arg4, var34.y)) | 0) + Math.imul(arg5, var34.z)) | 0) / var35Denom) | 0)) | 0;
                this.faceColourC[var17] = SoftwareModelLit.getTexLight(var35);
            } else if (var18 === 1) {
                const var36 = arg0.faceNormal![var17]!;
                const var37Denom = (var8 + ((var8 / 2) | 0)) | 0;
                if (var37Denom === 0) {
                    throw new Error();
                }
                const var37 = (arg1 + ((((((Math.imul(arg3, var36.x) + Math.imul(arg4, var36.y)) | 0) + Math.imul(arg5, var36.z)) | 0) / var37Denom) | 0)) | 0;
                this.faceColourA[var17] = SoftwareModelLit.getTexLight(var37);
                this.faceColourC[var17] = -1;
            } else {
                this.faceColourC[var17] = -2;
            }
        }
    }

    static getTexLight(arg0: number): number {
        if (arg0 < 2) {
            arg0 = 2;
        } else if (arg0 > 126) {
            arg0 = 126;
        }
        return arg0;
    }

    static getColour(arg0: number, arg1: number): number {
        let var2 = (arg1 * (arg0 & 0x7f)) >> 7;
        if (var2 < 2) {
            var2 = 2;
        } else if (var2 > 126) {
            var2 = 126;
        }
        return (arg0 & 0xff80) + var2;
    }

    copyForAnim2(arg0: boolean, _arg1: boolean): ModelLit {
        if (!arg0 && SoftwareModelLit.tempFTran2.length < this.numFaces) {
            SoftwareModelLit.tempFTran2 = new Int8Array(this.numFaces + 100);
        }
        return this.copyForAnim(arg0, SoftwareModelLit.tempModel2, SoftwareModelLit.tempFTran2);
    }

    copyForAnim(arg0: boolean, arg1: boolean): ModelLit;
    copyForAnim(arg0: boolean, arg1: SoftwareModelLit, arg2: Int8Array): ModelLit;
    copyForAnim(arg0: boolean, arg1: boolean | SoftwareModelLit, arg2?: Int8Array): ModelLit {
        if (arg1 === true || arg1 === false) {
            if (!arg0 && SoftwareModelLit.tempFTran.length < this.numFaces) {
                SoftwareModelLit.tempFTran = new Int8Array(this.numFaces + 100);
            }
            return this.copyForAnim(arg0, SoftwareModelLit.tempModel, SoftwareModelLit.tempFTran);
        }
        const dst: SoftwareModelLit = arg1;
        const alpha: Int8Array = arg2!;
        dst.numPoints = this.numPoints;
        dst.numFaces = this.numFaces;
        dst.numT = this.numT;
        if (dst.pointX === null || dst.pointX.length < this.numPoints) {
            dst.pointX = new Int32Array(this.numPoints + 100);
            dst.pointY = new Int32Array(this.numPoints + 100);
            dst.pointZ = new Int32Array(this.numPoints + 100);
        }
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            dst.pointX[var4] = this.pointX![var4];
            dst.pointY![var4] = this.pointY![var4];
            dst.pointZ![var4] = this.pointZ![var4];
        }
        if (arg0) {
            dst.faceAlpha = this.faceAlpha;
        } else {
            dst.faceAlpha = alpha;
            if (this.faceAlpha === null) {
                for (let var5: number = 0; var5 < this.numFaces; var5++) {
                    dst.faceAlpha[var5] = 0;
                }
            } else {
                for (let var6: number = 0; var6 < this.numFaces; var6++) {
                    dst.faceAlpha[var6] = this.faceAlpha[var6];
                }
            }
        }
        dst.faceVertexA = this.faceVertexA;
        dst.faceVertexB = this.faceVertexB;
        dst.faceVertexC = this.faceVertexC;
        dst.faceColourA = this.faceColourA;
        dst.faceColourB = this.faceColourB;
        dst.faceColourC = this.faceColourC;
        dst.facePriority = this.facePriority;
        dst.faceTextureAxis = this.faceTextureAxis;
        dst.faceTextureId = this.faceTextureId;
        dst.priority = this.priority;
        dst.faceTextureP = this.faceTextureP;
        dst.faceTextureM = this.faceTextureM;
        dst.faceTextureN = this.faceTextureN;
        dst.labelVertices = this.labelVertices;
        dst.labelFaces = this.labelFaces;
        dst.useAABBMouseCheck = this.useAABBMouseCheck;
        dst.boundsCalculated = false;
        return dst;
    }

    hillSkew(arg0: number, arg1: number, arg2: Int32Array[], arg3: Int32Array[] | null, arg4: number, arg5: number, arg6: number, arg7: boolean): SoftwareModelLit {
        if (!this.boundsCalculated) {
            this.method844();
        }
        const var9: number = arg4 + this.minX;
        const var10: number = arg4 + this.maxX;
        const var11: number = arg6 + this.minZ;
        const var12: number = arg6 + this.maxZ;
        if ((arg0 === 1 || arg0 === 2 || arg0 === 3 || arg0 === 5) && (var9 < 0 || (var10 + 128) >> 7 >= arg2.length || var11 < 0 || (var12 + 128) >> 7 >= arg2[0].length)) {
            return this;
        }
        if (arg0 === 4 || arg0 === 5) {
            if (arg3 === null) {
                return this;
            }
            if (var9 < 0 || (var10 + 128) >> 7 >= arg3.length || var11 < 0 || (var12 + 128) >> 7 >= arg3[0].length) {
                return this;
            }
        } else {
            const var13: number = var9 >> 7;
            const var14: number = (var10 + 127) >> 7;
            const var15: number = var11 >> 7;
            const var16: number = (var12 + 127) >> 7;
            if (arg2[var13][var15] === arg5 && arg2[var14][var15] === arg5 && arg2[var13][var16] === arg5 && arg2[var14][var16] === arg5) {
                return this;
            }
        }
        let var17: SoftwareModelLit;
        if (arg7) {
            var17 = new SoftwareModelLit();
            var17.numPoints = this.numPoints;
            var17.numFaces = this.numFaces;
            var17.numT = this.numT;
            var17.faceVertexA = this.faceVertexA;
            var17.faceVertexB = this.faceVertexB;
            var17.faceVertexC = this.faceVertexC;
            var17.faceColourA = this.faceColourA;
            var17.faceColourB = this.faceColourB;
            var17.faceColourC = this.faceColourC;
            var17.facePriority = this.facePriority;
            var17.faceAlpha = this.faceAlpha;
            var17.faceTextureAxis = this.faceTextureAxis;
            var17.faceTextureId = this.faceTextureId;
            var17.priority = this.priority;
            var17.faceTextureP = this.faceTextureP;
            var17.faceTextureM = this.faceTextureM;
            var17.faceTextureN = this.faceTextureN;
            var17.labelVertices = this.labelVertices;
            var17.labelFaces = this.labelFaces;
            var17.useAABBMouseCheck = this.useAABBMouseCheck;
            if (arg0 === 3) {
                var17.pointX = new Int32Array(this.pointX!);
                var17.pointY = new Int32Array(this.pointY!);
                var17.pointZ = new Int32Array(this.pointZ!);
            } else {
                var17.pointX = this.pointX;
                var17.pointY = new Int32Array(var17.numPoints);
                var17.pointZ = this.pointZ;
            }
        } else {
            var17 = this;
        }
        if (arg0 === 1) {
            for (let var18: number = 0; var18 < var17.numPoints; var18++) {
                const var19: number = this.pointX![var18] + arg4;
                const var20: number = this.pointZ![var18] + arg6;
                const var21: number = var19 & 0x7f;
                const var22: number = var20 & 0x7f;
                const var23: number = var19 >> 7;
                const var24: number = var20 >> 7;
                const var25: number = (arg2[var23][var24] * (128 - var21) + arg2[var23 + 1][var24] * var21) >> 7;
                const var26: number = (arg2[var23][var24 + 1] * (128 - var21) + arg2[var23 + 1][var24 + 1] * var21) >> 7;
                const var27: number = (var25 * (128 - var22) + var26 * var22) >> 7;
                var17.pointY![var18] = this.pointY![var18] + var27 - arg5;
            }
        } else if (arg0 === 2) {
            for (let var28: number = 0; var28 < var17.numPoints; var28++) {
                const var29: number = ((this.pointY![var28] << 16) / this.field2277) | 0;
                if (var29 < arg1) {
                    const var30: number = this.pointX![var28] + arg4;
                    const var31: number = this.pointZ![var28] + arg6;
                    const var32: number = var30 & 0x7f;
                    const var33: number = var31 & 0x7f;
                    const var34: number = var30 >> 7;
                    const var35: number = var31 >> 7;
                    const var36: number = (arg2[var34][var35] * (128 - var32) + arg2[var34 + 1][var35] * var32) >> 7;
                    const var37: number = (arg2[var34][var35 + 1] * (128 - var32) + arg2[var34 + 1][var35 + 1] * var32) >> 7;
                    const var38: number = (var36 * (128 - var33) + var37 * var33) >> 7;
                    var17.pointY![var28] = this.pointY![var28] + ((((var38 - arg5) * (arg1 - var29)) / arg1) | 0);
                } else {
                    var17.pointY![var28] = this.pointY![var28];
                }
            }
        } else if (arg0 === 3) {
            const var39: number = (arg1 & 0xff) * 4;
            const var40: number = ((arg1 >> 8) & 0xff) * 4;
            var17.method199(arg2, arg4, arg5, arg6, var39, var40);
        } else if (arg0 === 4) {
            const var41: number = this.maxY - this.field2277;
            for (let var42: number = 0; var42 < this.numPoints; var42++) {
                const var43: number = this.pointX![var42] + arg4;
                const var44: number = this.pointZ![var42] + arg6;
                const var45: number = var43 & 0x7f;
                const var46: number = var44 & 0x7f;
                const var47: number = var43 >> 7;
                const var48: number = var44 >> 7;
                const var49: number = (arg3![var47][var48] * (128 - var45) + arg3![var47 + 1][var48] * var45) >> 7;
                const var50: number = (arg3![var47][var48 + 1] * (128 - var45) + arg3![var47 + 1][var48 + 1] * var45) >> 7;
                const var51: number = (var49 * (128 - var46) + var50 * var46) >> 7;
                var17.pointY![var42] = this.pointY![var42] + var51 + var41 - arg5;
            }
        } else if (arg0 === 5) {
            const var52: number = this.maxY - this.field2277;
            for (let var53: number = 0; var53 < this.numPoints; var53++) {
                const var54: number = this.pointX![var53] + arg4;
                const var55: number = this.pointZ![var53] + arg6;
                const var56: number = var54 & 0x7f;
                const var57: number = var55 & 0x7f;
                const var58: number = var54 >> 7;
                const var59: number = var55 >> 7;
                const var60: number = (arg2[var58][var59] * (128 - var56) + arg2[var58 + 1][var59] * var56) >> 7;
                const var61: number = (arg2[var58][var59 + 1] * (128 - var56) + arg2[var58 + 1][var59 + 1] * var56) >> 7;
                const var62: number = (var60 * (128 - var57) + var61 * var57) >> 7;
                const var63: number = (arg3![var58][var59] * (128 - var56) + arg3![var58 + 1][var59] * var56) >> 7;
                const var64: number = (arg3![var58][var59 + 1] * (128 - var56) + arg3![var58 + 1][var59 + 1] * var56) >> 7;
                const var65: number = (var63 * (128 - var57) + var64 * var57) >> 7;
                const var66: number = var62 - var65;
                var17.pointY![var53] = (((((this.pointY![var53] << 8) / var52) | 0) * var66) >> 8) - (arg5 - var62);
            }
        }
        var17.boundsCalculated = false;
        return var17;
    }

    animate2(arg0: number, arg1: Uint8Array | number[] | Int32Array, arg2: number, arg3: number, arg4: number): void {
        const var6: number = arg1.length;
        if (arg0 === 0) {
            let var7: number = 0;
            SoftwareModelLit.oX = 0;
            SoftwareModelLit.oY = 0;
            SoftwareModelLit.oZ = 0;
            for (let var8: number = 0; var8 < var6; var8++) {
                const var9: number = arg1[var8];
                if (var9 < this.labelVertices!.length) {
                    const var10 = this.labelVertices![var9];
                    for (let var11: number = 0; var11 < var10.length; var11++) {
                        const var12: number = var10[var11];
                        SoftwareModelLit.oX += this.pointX![var12];
                        SoftwareModelLit.oY += this.pointY![var12];
                        SoftwareModelLit.oZ += this.pointZ![var12];
                        var7++;
                    }
                }
            }
            if (var7 > 0) {
                SoftwareModelLit.oX = ((SoftwareModelLit.oX / var7) | 0) + arg2;
                SoftwareModelLit.oY = ((SoftwareModelLit.oY / var7) | 0) + arg3;
                SoftwareModelLit.oZ = ((SoftwareModelLit.oZ / var7) | 0) + arg4;
            } else {
                SoftwareModelLit.oX = arg2;
                SoftwareModelLit.oY = arg3;
                SoftwareModelLit.oZ = arg4;
            }
        } else if (arg0 === 1) {
            for (let var13: number = 0; var13 < var6; var13++) {
                const var14: number = arg1[var13];
                if (var14 < this.labelVertices!.length) {
                    const var15 = this.labelVertices![var14];
                    for (let var16: number = 0; var16 < var15.length; var16++) {
                        const var17: number = var15[var16];
                        this.pointX![var17] += arg2;
                        this.pointY![var17] += arg3;
                        this.pointZ![var17] += arg4;
                    }
                }
            }
        } else if (arg0 === 2) {
            for (let var18: number = 0; var18 < var6; var18++) {
                const var19: number = arg1[var18];
                if (var19 < this.labelVertices!.length) {
                    const var20 = this.labelVertices![var19];
                    for (let var21: number = 0; var21 < var20.length; var21++) {
                        const var22: number = var20[var21];
                        this.pointX![var22] -= SoftwareModelLit.oX;
                        this.pointY![var22] -= SoftwareModelLit.oY;
                        this.pointZ![var22] -= SoftwareModelLit.oZ;
                        if (arg4 !== 0) {
                            const var23: number = Pix3D.sinTable[arg4];
                            const var24: number = Pix3D.cosTable[arg4];
                            const var25: number = (this.pointY![var22] * var23 + this.pointX![var22] * var24 + 32767) >> 16;
                            this.pointY![var22] = (this.pointY![var22] * var24 + 32767 - this.pointX![var22] * var23) >> 16;
                            this.pointX![var22] = var25;
                        }
                        if (arg2 !== 0) {
                            const var26: number = Pix3D.sinTable[arg2];
                            const var27: number = Pix3D.cosTable[arg2];
                            const var28: number = (this.pointY![var22] * var27 + 32767 - this.pointZ![var22] * var26) >> 16;
                            this.pointZ![var22] = (this.pointY![var22] * var26 + this.pointZ![var22] * var27 + 32767) >> 16;
                            this.pointY![var22] = var28;
                        }
                        if (arg3 !== 0) {
                            const var29: number = Pix3D.sinTable[arg3];
                            const var30: number = Pix3D.cosTable[arg3];
                            const var31: number = (this.pointZ![var22] * var29 + this.pointX![var22] * var30 + 32767) >> 16;
                            this.pointZ![var22] = (this.pointZ![var22] * var30 + 32767 - this.pointX![var22] * var29) >> 16;
                            this.pointX![var22] = var31;
                        }
                        this.pointX![var22] += SoftwareModelLit.oX;
                        this.pointY![var22] += SoftwareModelLit.oY;
                        this.pointZ![var22] += SoftwareModelLit.oZ;
                    }
                }
            }
        } else if (arg0 === 3) {
            for (let var32: number = 0; var32 < var6; var32++) {
                const var33: number = arg1[var32];
                if (var33 < this.labelVertices!.length) {
                    const var34 = this.labelVertices![var33];
                    for (let var35: number = 0; var35 < var34.length; var35++) {
                        const var36: number = var34[var35];
                        this.pointX![var36] -= SoftwareModelLit.oX;
                        this.pointY![var36] -= SoftwareModelLit.oY;
                        this.pointZ![var36] -= SoftwareModelLit.oZ;
                        this.pointX![var36] = ((this.pointX![var36] * arg2) / 128) | 0;
                        this.pointY![var36] = ((this.pointY![var36] * arg3) / 128) | 0;
                        this.pointZ![var36] = ((this.pointZ![var36] * arg4) / 128) | 0;
                        this.pointX![var36] += SoftwareModelLit.oX;
                        this.pointY![var36] += SoftwareModelLit.oY;
                        this.pointZ![var36] += SoftwareModelLit.oZ;
                    }
                }
            }
        } else if (arg0 === 5 && this.labelFaces !== null && this.faceAlpha !== null) {
            for (let var37: number = 0; var37 < var6; var37++) {
                const var38: number = arg1[var37];
                if (var38 < this.labelFaces.length) {
                    const var39: number[] = this.labelFaces[var38];
                    for (let var40: number = 0; var40 < var39.length; var40++) {
                        const var41: number = var39[var40];
                        let var42: number = (this.faceAlpha[var41] & 0xff) + arg2 * 8;
                        if (var42 < 0) {
                            var42 = 0;
                        } else if (var42 > 255) {
                            var42 = 255;
                        }
                        this.faceAlpha[var41] = var42 > 127 ? var42 - 256 : var42;
                    }
                }
            }
        }
    }

    animate(arg0: AnimFrameSet, arg1: number, _arg2: boolean): void {
        if (this.labelVertices === null || arg1 === -1) {
            return;
        }
        const var4 = arg0.list[arg1]!;
        const var5 = var4.base;
        SoftwareModelLit.oX = 0;
        SoftwareModelLit.oY = 0;
        SoftwareModelLit.oZ = 0;
        for (let var6: number = 0; var6 < var4.size; var6++) {
            const var7: number = var4.ti[var6];
            if (var4.field3774[var6] !== -1) {
                this.animate2(0, var5.labels![var4.field3774[var6]], 0, 0, 0);
            }
            this.animate2(var5.type![var7], var5.labels![var7], var4.tx[var6], var4.ty[var6], var4.tz[var6]);
        }
        this.boundsCalculated = false;
    }

    maskAnimate(arg0: AnimFrameSet, arg1: number, arg2: AnimFrameSet, arg3: number, arg4: Int32Array | null, arg5: boolean): void {
        if (arg1 === -1) {
            return;
        }
        if (arg4 === null || arg3 === -1) {
            this.animate(arg0, arg1, arg5);
            return;
        }
        const var7 = arg0.list[arg1]!;
        const var8 = arg2.list[arg3]!;
        const var9 = var7.base;
        SoftwareModelLit.oX = 0;
        SoftwareModelLit.oY = 0;
        SoftwareModelLit.oZ = 0;
        const var10 = 0;
        let var18: number = var10 + 1;
        let var11: number = arg4[0];
        for (let var12: number = 0; var12 < var7.size; var12++) {
            const var13: number = var7.ti[var12];
            while (var13 > var11) {
                var11 = arg4[var18++];
            }
            if (var13 !== var11 || var9.type[var13] === 0) {
                if (var7.field3774[var12] !== -1) {
                    this.animate2(0, var9.labels[var7.field3774[var12]], 0, 0, 0);
                }
                this.animate2(var9.type[var13], var9.labels[var13], var7.tx[var12], var7.ty[var12], var7.tz[var12]);
            }
        }
        SoftwareModelLit.oX = 0;
        SoftwareModelLit.oY = 0;
        SoftwareModelLit.oZ = 0;
        const var14 = 0;
        let var19: number = var14 + 1;
        let var15: number = arg4[0];
        for (let var16: number = 0; var16 < var8.size; var16++) {
            const var17: number = var8.ti[var16];
            while (var17 > var15) {
                var15 = arg4[var19++];
            }
            if (var17 === var15 || var9.type[var17] === 0) {
                if (var8.field3774[var16] !== -1) {
                    this.animate2(0, var9.labels[var8.field3774[var16]], 0, 0, 0);
                }
                this.animate2(var9.type[var17], var9.labels[var17], var8.tx[var16], var8.ty[var16], var8.tz[var16]);
            }
        }
        this.boundsCalculated = false;
    }

    render2(arg0: boolean, arg1: boolean, arg2: SceneTag, arg3: number, arg4: number): void {
        if (arg4 >= 1600) {
            return;
        }
        for (let var7: number = 0; var7 < arg4; var7++) {
            SoftwareModelLit.tmpDepthFaceCount[var7] = 0;
        }
        for (let var8: number = 0; var8 < this.numFaces; var8++) {
            if (this.faceColourC![var8] !== -2) {
                const var9: number = this.faceVertexA![var8];
                const var10: number = this.faceVertexB![var8];
                const var11: number = this.faceVertexC![var8];
                const var12: number = SoftwareModelLit.vertexScreenX[var9];
                const var13: number = SoftwareModelLit.vertexScreenX[var10];
                const var14: number = SoftwareModelLit.vertexScreenX[var11];
                if (arg0 && (var12 === -5000 || var13 === -5000 || var14 === -5000)) {
                    const var15: number = SoftwareModelLit.vertexViewSpaceX[var9];
                    const var16: number = SoftwareModelLit.vertexViewSpaceX[var10];
                    const var17: number = SoftwareModelLit.vertexViewSpaceX[var11];
                    const var18: number = SoftwareModelLit.vertexViewSpaceY[var9];
                    const var19: number = SoftwareModelLit.vertexViewSpaceY[var10];
                    const var20: number = SoftwareModelLit.vertexViewSpaceY[var11];
                    const var21: number = SoftwareModelLit.vertexViewSpaceZ[var9];
                    const var22: number = SoftwareModelLit.vertexViewSpaceZ[var10];
                    const var23: number = SoftwareModelLit.vertexViewSpaceZ[var11];
                    const var24: number = var15 - var16;
                    const var25: number = var17 - var16;
                    const var26: number = var18 - var19;
                    const var27: number = var20 - var19;
                    const var28: number = var21 - var22;
                    const var29: number = var23 - var22;
                    const var30: number = var26 * var29 - var28 * var27;
                    const var31: number = var28 * var25 - var24 * var29;
                    const var32: number = var24 * var27 - var26 * var25;
                    if (var16 * var30 + var19 * var31 + var22 * var32 > 0) {
                        SoftwareModelLit.faceNearClipped[var8] = true;
                        const var33: number = (((SoftwareModelLit.vertexScreenZ[var9] + SoftwareModelLit.vertexScreenZ[var10] + SoftwareModelLit.vertexScreenZ[var11]) / 3) | 0) + arg3;
                        SoftwareModelLit.tmpDepthFaces[var33][SoftwareModelLit.tmpDepthFaceCount[var33]++] = var8;
                    }
                } else {
                    if (
                        arg1 &&
                        this.isMouseRoughlyInsideTriangle(
                            ModelLit.mouseX + Pix3D.originX,
                            ModelLit.mouseY + Pix3D.originY,
                            SoftwareModelLit.vertexScreenY[var9],
                            SoftwareModelLit.vertexScreenY[var10],
                            SoftwareModelLit.vertexScreenY[var11],
                            var12,
                            var13,
                            var14
                        )
                    ) {
                        SoftwareModelLit.pickedEntityTypecode[SoftwareModelLit.pickedCount++] = arg2;
                        arg1 = false;
                    }
                    if ((var12 - var13) * (SoftwareModelLit.vertexScreenY[var11] - SoftwareModelLit.vertexScreenY[var10]) - (SoftwareModelLit.vertexScreenY[var9] - SoftwareModelLit.vertexScreenY[var10]) * (var14 - var13) > 0) {
                        SoftwareModelLit.faceNearClipped[var8] = false;
                        if (var12 >= 0 && var13 >= 0 && var14 >= 0 && var12 <= Pix3D.sizeX && var13 <= Pix3D.sizeX && var14 <= Pix3D.sizeX) {
                            SoftwareModelLit.faceClippedX[var8] = false;
                        } else {
                            SoftwareModelLit.faceClippedX[var8] = true;
                        }
                        const var34: number = (((SoftwareModelLit.vertexScreenZ[var9] + SoftwareModelLit.vertexScreenZ[var10] + SoftwareModelLit.vertexScreenZ[var11]) / 3) | 0) + arg3;
                        SoftwareModelLit.tmpDepthFaces[var34][SoftwareModelLit.tmpDepthFaceCount[var34]++] = var8;
                    }
                }
            }
        }
        if (this.facePriority === null) {
            for (let var35: number = arg4 - 1; var35 >= 0; var35--) {
                const var36: number = SoftwareModelLit.tmpDepthFaceCount[var35];
                if (var36 > 0) {
                    const var37: Int32Array = SoftwareModelLit.tmpDepthFaces[var35];
                    for (let var38: number = 0; var38 < var36; var38++) {
                        this.render3(var37[var38]);
                    }
                }
            }
            return;
        }
        for (let var39: number = 0; var39 < 12; var39++) {
            SoftwareModelLit.tmpPriorityFaceCount[var39] = 0;
            SoftwareModelLit.tmpPriorityDepthSum[var39] = 0;
        }
        for (let var40: number = arg4 - 1; var40 >= 0; var40--) {
            const var41: number = SoftwareModelLit.tmpDepthFaceCount[var40];
            if (var41 > 0) {
                const var42: Int32Array = SoftwareModelLit.tmpDepthFaces[var40];
                for (let var43: number = 0; var43 < var41; var43++) {
                    const var44: number = var42[var43];
                    const var45: number = this.facePriority[var44];
                    const var46: number = SoftwareModelLit.tmpPriorityFaceCount[var45]++;
                    SoftwareModelLit.tmpPriorityFaces[var45][var46] = var44;
                    if (var45 < 10) {
                        SoftwareModelLit.tmpPriorityDepthSum[var45] += var40;
                    } else if (var45 === 10) {
                        SoftwareModelLit.tmpPriority10FaceDepth[var46] = var40;
                    } else {
                        SoftwareModelLit.tmpPriority11FaceDepth[var46] = var40;
                    }
                }
            }
        }
        let var47: number = 0;
        if (SoftwareModelLit.tmpPriorityFaceCount[1] > 0 || SoftwareModelLit.tmpPriorityFaceCount[2] > 0) {
            var47 = ((SoftwareModelLit.tmpPriorityDepthSum[1] + SoftwareModelLit.tmpPriorityDepthSum[2]) / (SoftwareModelLit.tmpPriorityFaceCount[1] + SoftwareModelLit.tmpPriorityFaceCount[2])) | 0;
        }
        let var48: number = 0;
        if (SoftwareModelLit.tmpPriorityFaceCount[3] > 0 || SoftwareModelLit.tmpPriorityFaceCount[4] > 0) {
            var48 = ((SoftwareModelLit.tmpPriorityDepthSum[3] + SoftwareModelLit.tmpPriorityDepthSum[4]) / (SoftwareModelLit.tmpPriorityFaceCount[3] + SoftwareModelLit.tmpPriorityFaceCount[4])) | 0;
        }
        let var49: number = 0;
        if (SoftwareModelLit.tmpPriorityFaceCount[6] > 0 || SoftwareModelLit.tmpPriorityFaceCount[8] > 0) {
            var49 = ((SoftwareModelLit.tmpPriorityDepthSum[6] + SoftwareModelLit.tmpPriorityDepthSum[8]) / (SoftwareModelLit.tmpPriorityFaceCount[6] + SoftwareModelLit.tmpPriorityFaceCount[8])) | 0;
        }
        let var50: number = 0;
        let var51: number = SoftwareModelLit.tmpPriorityFaceCount[10];
        let var52: Int32Array = SoftwareModelLit.tmpPriorityFaces[10];
        let var53: Int32Array = SoftwareModelLit.tmpPriority10FaceDepth;
        if (var51 === 0) {
            var50 = 0;
            var51 = SoftwareModelLit.tmpPriorityFaceCount[11];
            var52 = SoftwareModelLit.tmpPriorityFaces[11];
            var53 = SoftwareModelLit.tmpPriority11FaceDepth;
        }
        let var54: number;
        if (var51 > 0) {
            var54 = var53[0];
        } else {
            var54 = -1000;
        }
        for (let var55: number = 0; var55 < 10; var55++) {
            while (var55 === 0 && var54 > var47) {
                this.render3(var52[var50++]);
                if (var50 === var51 && var52 !== SoftwareModelLit.tmpPriorityFaces[11]) {
                    var50 = 0;
                    var51 = SoftwareModelLit.tmpPriorityFaceCount[11];
                    var52 = SoftwareModelLit.tmpPriorityFaces[11];
                    var53 = SoftwareModelLit.tmpPriority11FaceDepth;
                }
                if (var50 < var51) {
                    var54 = var53[var50];
                } else {
                    var54 = -1000;
                }
            }
            while (var55 === 3 && var54 > var48) {
                this.render3(var52[var50++]);
                if (var50 === var51 && var52 !== SoftwareModelLit.tmpPriorityFaces[11]) {
                    var50 = 0;
                    var51 = SoftwareModelLit.tmpPriorityFaceCount[11];
                    var52 = SoftwareModelLit.tmpPriorityFaces[11];
                    var53 = SoftwareModelLit.tmpPriority11FaceDepth;
                }
                if (var50 < var51) {
                    var54 = var53[var50];
                } else {
                    var54 = -1000;
                }
            }
            while (var55 === 5 && var54 > var49) {
                this.render3(var52[var50++]);
                if (var50 === var51 && var52 !== SoftwareModelLit.tmpPriorityFaces[11]) {
                    var50 = 0;
                    var51 = SoftwareModelLit.tmpPriorityFaceCount[11];
                    var52 = SoftwareModelLit.tmpPriorityFaces[11];
                    var53 = SoftwareModelLit.tmpPriority11FaceDepth;
                }
                if (var50 < var51) {
                    var54 = var53[var50];
                } else {
                    var54 = -1000;
                }
            }
            const var56: number = SoftwareModelLit.tmpPriorityFaceCount[var55];
            const var57: Int32Array = SoftwareModelLit.tmpPriorityFaces[var55];
            for (let var58: number = 0; var58 < var56; var58++) {
                this.render3(var57[var58]);
            }
        }
        while (var54 !== -1000) {
            this.render3(var52[var50++]);
            if (var50 === var51 && var52 !== SoftwareModelLit.tmpPriorityFaces[11]) {
                var50 = 0;
                var52 = SoftwareModelLit.tmpPriorityFaces[11];
                var51 = SoftwareModelLit.tmpPriorityFaceCount[11];
                var53 = SoftwareModelLit.tmpPriority11FaceDepth;
            }
            if (var50 < var51) {
                var54 = var53[var50];
            } else {
                var54 = -1000;
            }
        }
    }

    method194(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.minX;
    }

    method196(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.maxX;
    }

    method198(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.maxZ;
    }

    method844(): void {
        let var1: number = 32767;
        let var2: number = 32767;
        let var3: number = 32767;
        let var4: number = -32768;
        let var5: number = -32768;
        let var6: number = -32768;
        let var7: number = 0;
        let var8: number = 0;
        for (let var9: number = 0; var9 < this.numPoints; var9++) {
            const var10: number = this.pointX![var9];
            const var11: number = this.pointY![var9];
            const var12: number = this.pointZ![var9];
            if (var10 < var1) {
                var1 = var10;
            }
            if (var10 > var4) {
                var4 = var10;
            }
            if (var11 < var2) {
                var2 = var11;
            }
            if (var11 > var5) {
                var5 = var11;
            }
            if (var12 < var3) {
                var3 = var12;
            }
            if (var12 > var6) {
                var6 = var12;
            }
            const var13: number = var10 * var10 + var12 * var12;
            if (var13 > var7) {
                var7 = var13;
            }
            const var14: number = var10 * var10 + var12 * var12 + var11 * var11;
            if (var14 > var8) {
                var8 = var14;
            }
        }
        this.minX = var1;
        this.maxX = var4;
        this.field2277 = var2;
        this.maxY = var5;
        this.minZ = var3;
        this.maxZ = var6;
        this.radius = (Math.sqrt(var7) + 0.99) | 0;
        this.maxDepth = (Math.sqrt(var8) + 0.99) | 0;
        this.boundsCalculated = true;
    }

    method88(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.field2277;
    }

    rotateXAxis(arg0: number): void {
        const var2: number = Pix3D.sinTable[arg0];
        const var3: number = Pix3D.cosTable[arg0];
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            const var5: number = (this.pointY![var4] * var3 - this.pointZ![var4] * var2) >> 16;
            this.pointZ![var4] = (this.pointY![var4] * var2 + this.pointZ![var4] * var3) >> 16;
            this.pointY![var4] = var5;
        }
        this.boundsCalculated = false;
    }

    method191(arg0: number): void {
        const var2: number = Pix3D.sinTable[arg0];
        const var3: number = Pix3D.cosTable[arg0];
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            const var5: number = (this.pointY![var4] * var2 + this.pointX![var4] * var3) >> 16;
            this.pointY![var4] = (this.pointY![var4] * var3 - this.pointX![var4] * var2) >> 16;
            this.pointX![var4] = var5;
        }
        this.boundsCalculated = false;
    }

    method186(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.minZ;
    }

    isMouseRoughlyInsideTriangle(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number): boolean {
        if (arg1 < arg2 && arg1 < arg3 && arg1 < arg4) {
            return false;
        } else if (arg1 > arg2 && arg1 > arg3 && arg1 > arg4) {
            return false;
        } else if (arg0 < arg5 && arg0 < arg6 && arg0 < arg7) {
            return false;
        } else {
            return arg0 <= arg5 || arg0 <= arg6 || arg0 <= arg7;
        }
    }

    objRender(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number): void {
        try {
            if (!this.boundsCalculated) {
                this.method844();
            }
            const var8: number = Pix3D.originX;
            const var9: number = Pix3D.originY;
            const var10: number = Pix3D.sinTable[0];
            const var11: number = Pix3D.cosTable[0];
            const var12: number = Pix3D.sinTable[arg0];
            const var13: number = Pix3D.cosTable[arg0];
            const var14: number = Pix3D.sinTable[arg1];
            const var15: number = Pix3D.cosTable[arg1];
            const var16: number = Pix3D.sinTable[arg2];
            const var17: number = Pix3D.cosTable[arg2];
            const var18: number = ((Math.imul(arg4, var16) + Math.imul(arg5, var17)) | 0) >> 16;
            for (let var19: number = 0; var19 < this.numPoints; var19++) {
                let var20: number = this.pointX![var19];
                let var21: number = this.pointY![var19];
                let var22: number = this.pointZ![var19];
                if (arg1 !== 0) {
                    const var23: number = ((Math.imul(var21, var14) + Math.imul(var20, var15)) | 0) >> 16;
                    var21 = ((Math.imul(var21, var15) - Math.imul(var20, var14)) | 0) >> 16;
                    var20 = var23;
                }
                if (arg0 !== 0) {
                    const var24: number = ((Math.imul(var22, var12) + Math.imul(var20, var13)) | 0) >> 16;
                    var22 = ((Math.imul(var22, var13) - Math.imul(var20, var12)) | 0) >> 16;
                    var20 = var24;
                }
                const var25: number = var20 + arg3;
                const var26: number = var21 + arg4;
                const var27: number = var22 + arg5;
                const var28: number = ((Math.imul(var26, var17) - Math.imul(var27, var16)) | 0) >> 16;
                const var29: number = ((Math.imul(var26, var16) + Math.imul(var27, var17)) | 0) >> 16;
                SoftwareModelLit.vertexScreenZ[var19] = var29 - var18;
                if (arg6 === 0) {
                    throw new Error();
                }
                SoftwareModelLit.vertexScreenX[var19] = (var8 + (((var25 << 9) / arg6) | 0)) | 0;
                SoftwareModelLit.vertexScreenY[var19] = (var9 + (((var28 << 9) / arg6) | 0)) | 0;
                if (this.numT > 0) {
                    SoftwareModelLit.vertexViewSpaceX[var19] = var25;
                    SoftwareModelLit.vertexViewSpaceY[var19] = var28;
                    SoftwareModelLit.vertexViewSpaceZ[var19] = var29;
                }
            }
            this.render2(false, false, 0, this.maxDepth, this.maxDepth << 1);
        } catch {}
    }

    rotate270(): void {
        for (let var1: number = 0; var1 < this.numPoints; var1++) {
            const var2: number = this.pointZ![var1];
            this.pointZ![var1] = this.pointX![var1];
            this.pointX![var1] = -var2;
        }
        this.boundsCalculated = false;
    }

    translate(arg0: number, arg1: number, arg2: number): void {
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            this.pointX![var4] += arg0;
            this.pointY![var4] += arg1;
            this.pointZ![var4] += arg2;
        }
        this.boundsCalculated = false;
    }

    method188(arg0: number): void {
        const var2: number = Pix3D.sinTable[arg0];
        const var3: number = Pix3D.cosTable[arg0];
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            const var5: number = (this.pointZ![var4] * var2 + this.pointX![var4] * var3) >> 16;
            this.pointZ![var4] = (this.pointZ![var4] * var3 - this.pointX![var4] * var2) >> 16;
            this.pointX![var4] = var5;
        }
        this.boundsCalculated = false;
    }

    rotate90(): void {
        for (let var1: number = 0; var1 < this.numPoints; var1++) {
            const var2: number = this.pointX![var1];
            this.pointX![var1] = this.pointZ![var1];
            this.pointZ![var1] = -var2;
        }
        this.boundsCalculated = false;
    }

    method193(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        try {
            if (!this.boundsCalculated) {
                this.method844();
            }
            const var7: number = Pix3D.originX;
            const var8: number = Pix3D.originY;
            const var9: number = Pix3D.sinTable[0];
            const var10: number = Pix3D.cosTable[0];
            const var11: number = Pix3D.sinTable[arg0];
            const var12: number = Pix3D.cosTable[arg0];
            const var13: number = Pix3D.sinTable[arg1];
            const var14: number = Pix3D.cosTable[arg1];
            const var15: number = Pix3D.sinTable[arg2];
            const var16: number = Pix3D.cosTable[arg2];
            const var17: number = (arg4 * var15 + arg5 * var16) >> 16;
            for (let var18: number = 0; var18 < this.numPoints; var18++) {
                let var19: number = this.pointX![var18];
                let var20: number = this.pointY![var18];
                let var21: number = this.pointZ![var18];
                if (arg1 !== 0) {
                    const var22: number = (var20 * var13 + var19 * var14) >> 16;
                    var20 = (var20 * var14 - var19 * var13) >> 16;
                    var19 = var22;
                }
                if (arg0 !== 0) {
                    const var23: number = (var21 * var11 + var19 * var12) >> 16;
                    var21 = (var21 * var12 - var19 * var11) >> 16;
                    var19 = var23;
                }
                const var24: number = var19 + arg3;
                const var25: number = var20 + arg4;
                const var26: number = var21 + arg5;
                const var27: number = (var25 * var16 - var26 * var15) >> 16;
                const var28: number = (var25 * var15 + var26 * var16) >> 16;
                SoftwareModelLit.vertexScreenZ[var18] = var28 - var17;
                SoftwareModelLit.vertexScreenX[var18] = var7 + (((var24 << 9) / var28) | 0);
                SoftwareModelLit.vertexScreenY[var18] = var8 + (((var27 << 9) / var28) | 0);
                if (this.numT > 0) {
                    SoftwareModelLit.vertexViewSpaceX[var18] = var24;
                    SoftwareModelLit.vertexViewSpaceY[var18] = var27;
                    SoftwareModelLit.vertexViewSpaceZ[var18] = var28;
                }
            }
            this.render2(false, false, 0, this.maxDepth, this.maxDepth << 1);
        } catch {}
    }

    override method87(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: SceneTag): void {
        if (!this.boundsCalculated) {
            this.method844();
        }
        const var11: number = (arg7 * arg4 - arg5 * arg3) >> 16;
        const var12: number = (arg6 * arg1 + var11 * arg2) >> 16;
        const var13: number = var12 + ((this.radius * arg2 + this.maxY * arg1) >> 16);
        if (var13 <= 50) {
            return;
        }
        const var14: number = var12 + ((-this.radius * arg2 + this.field2277 * arg1) >> 16);
        if (var14 >= 3500) {
            return;
        }
        const var15: number = (arg7 * arg3 + arg5 * arg4) >> 16;
        // MOBA sceneFocal: the scene pass projects with Pix3D.focal (512 in fixed
        // mode; scaled for constant vertical FOV in resizable / half-res render).
        const var16: number = (var15 + this.radius) * Pix3D.focal;
        if (((var16 / var13) | 0) <= Pix3D.minX) {
            return;
        }
        const var17: number = (var15 - this.radius) * Pix3D.focal;
        if (((var17 / var13) | 0) >= Pix3D.maxX) {
            return;
        }
        const var18: number = (arg6 * arg2 - var11 * arg1) >> 16;
        const var19: number = (var18 + ((this.radius * arg1 + this.maxY * arg2) >> 16)) * Pix3D.focal;
        if (((var19 / var13) | 0) <= Pix3D.minY) {
            return;
        }
        const var20: number = (var18 + ((-this.radius * arg1 + this.field2277 * arg2) >> 16)) * Pix3D.focal;
        if (((var20 / var13) | 0) >= Pix3D.maxY) {
            return;
        }
        let var21: boolean = false;
        const var22: boolean = var14 <= 50;
        const var23: boolean = var22 || this.numT > 0;
        const var24: number = Pix3D.originX;
        const var25: number = Pix3D.originY;
        let var26: number = 0;
        let var27: number = 0;
        if (arg0 !== 0) {
            var26 = Pix3D.sinTable[arg0];
            var27 = Pix3D.cosTable[arg0];
        }
        let var28: boolean = false;
        if ((typeof arg8 === 'bigint' ? BigInt.asIntN(64, arg8) > 0n : arg8 > 0) && ModelLit.mouseCheck && var14 > 0) {
            let var29: number;
            let var30: number;
            if (var15 > 0) {
                var29 = (var17 / var13) | 0;
                var30 = (var16 / var14) | 0;
            } else {
                var29 = (var17 / var14) | 0;
                var30 = (var16 / var13) | 0;
            }
            let var31: number;
            let var32: number;
            if (var18 > 0) {
                var31 = (var20 / var13) | 0;
                var32 = (var19 / var14) | 0;
            } else {
                var31 = (var20 / var14) | 0;
                var32 = (var19 / var13) | 0;
            }
            if (ModelLit.mouseX >= var29 && ModelLit.mouseX <= var30 && ModelLit.mouseY >= var31 && ModelLit.mouseY <= var32) {
                let var33: number = 999999;
                let var34: number = -999999;
                let var35: number = 999999;
                let var36: number = -999999;
                const var37: number[] = [this.minX, this.maxX, this.minX, this.maxX, this.minX, this.maxX, this.minX, this.maxX];
                const var38: number[] = [this.minZ, this.minZ, this.maxZ, this.maxZ, this.minZ, this.minZ, this.maxZ, this.maxZ];
                const var39: number[] = [this.field2277, this.field2277, this.field2277, this.field2277, this.maxY, this.maxY, this.maxY, this.maxY];
                for (let var40: number = 0; var40 < 8; var40++) {
                    let var41: number = var37[var40];
                    const var42: number = var39[var40];
                    let var43: number = var38[var40];
                    if (arg0 !== 0) {
                        const var44: number = (var43 * var26 + var41 * var27) >> 16;
                        var43 = (var43 * var27 - var41 * var26) >> 16;
                        var41 = var44;
                    }
                    const var45: number = var41 + arg5;
                    const var46: number = var42 + arg6;
                    const var47: number = var43 + arg7;
                    const var48: number = (var47 * arg3 + var45 * arg4) >> 16;
                    const var49: number = (var47 * arg4 - var45 * arg3) >> 16;
                    const var51: number = (var46 * arg2 - var49 * arg1) >> 16;
                    const var52: number = (var46 * arg1 + var49 * arg2) >> 16;
                    if (var52 > 0) {
                        const var53: number = ((var48 * Pix3D.focal) / var52) | 0;
                        const var54: number = ((var51 * Pix3D.focal) / var52) | 0;
                        if (var53 < var33) {
                            var33 = var53;
                        }
                        if (var53 > var34) {
                            var34 = var53;
                        }
                        if (var54 < var35) {
                            var35 = var54;
                        }
                        if (var54 > var36) {
                            var36 = var54;
                        }
                    }
                }
                if (ModelLit.mouseX >= var33 && ModelLit.mouseX <= var34 && ModelLit.mouseY >= var35 && ModelLit.mouseY <= var36) {
                    if (this.useAABBMouseCheck) {
                        SoftwareModelLit.pickedEntityTypecode[SoftwareModelLit.pickedCount++] = arg8;
                    } else {
                        var28 = true;
                    }
                }
            }
        }
        for (let var55: number = 0; var55 < this.numPoints; var55++) {
            let var56: number = this.pointX![var55];
            const var57: number = this.pointY![var55];
            let var58: number = this.pointZ![var55];
            if (arg0 !== 0) {
                const var59: number = (var58 * var26 + var56 * var27) >> 16;
                var58 = (var58 * var27 - var56 * var26) >> 16;
                var56 = var59;
            }
            const var60: number = var56 + arg5;
            const var61: number = var57 + arg6;
            const var62: number = var58 + arg7;
            const var63: number = (var62 * arg3 + var60 * arg4) >> 16;
            const var64: number = (var62 * arg4 - var60 * arg3) >> 16;
            const var66: number = (var61 * arg2 - var64 * arg1) >> 16;
            const var67: number = (var61 * arg1 + var64 * arg2) >> 16;
            SoftwareModelLit.vertexScreenZ[var55] = var67 - var12;
            if (var67 >= 50) {
                SoftwareModelLit.vertexScreenX[var55] = var24 + (((var63 * Pix3D.focal) / var67) | 0);
                SoftwareModelLit.vertexScreenY[var55] = var25 + (((var66 * Pix3D.focal) / var67) | 0);
            } else {
                SoftwareModelLit.vertexScreenX[var55] = -5000;
                var21 = true;
            }
            if (var23) {
                SoftwareModelLit.vertexViewSpaceX[var55] = var63;
                SoftwareModelLit.vertexViewSpaceY[var55] = var66;
                SoftwareModelLit.vertexViewSpaceZ[var55] = var67;
            }
        }
        try {
            this.render2(var21, var28, arg8, var12 - var14, var13 - var14 + 2);
        } catch {}
    }

    getRadiusCylinder(): number {
        if (!this.boundsCalculated) {
            this.method844();
        }
        return this.radius;
    }

    method850(arg0: ModelLit): ModelLit {
        return new SoftwareModelLit([this, arg0 as SoftwareModelLit], 2);
    }

    resize(arg0: number, arg1: number, arg2: number): void {
        for (let var4: number = 0; var4 < this.numPoints; var4++) {
            this.pointX![var4] = ((this.pointX![var4] * arg0) / 128) | 0;
            this.pointY![var4] = ((this.pointY![var4] * arg1) / 128) | 0;
            this.pointZ![var4] = ((this.pointZ![var4] * arg2) / 128) | 0;
        }
        this.boundsCalculated = false;
    }

    rotate180(): void {
        for (let var1: number = 0; var1 < this.numPoints; var1++) {
            this.pointX![var1] = -this.pointX![var1];
            this.pointZ![var1] = -this.pointZ![var1];
        }
        this.boundsCalculated = false;
    }

    render3ZClip(arg0: number): void {
        const var2: number = Pix3D.originX;
        const var3: number = Pix3D.originY;
        let var4: number = 0;
        const var5: number = this.faceVertexA![arg0];
        const var6: number = this.faceVertexB![arg0];
        const var7: number = this.faceVertexC![arg0];
        const var8: number = SoftwareModelLit.vertexViewSpaceZ[var5];
        const var9: number = SoftwareModelLit.vertexViewSpaceZ[var6];
        const var10: number = SoftwareModelLit.vertexViewSpaceZ[var7];
        if (this.faceAlpha === null) {
            Pix3D.trans = 0;
        } else {
            Pix3D.trans = this.faceAlpha[arg0] & 0xff;
        }
        if (var8 >= 50) {
            SoftwareModelLit.clippedX[0] = SoftwareModelLit.vertexScreenX[var5];
            SoftwareModelLit.clippedY[0] = SoftwareModelLit.vertexScreenY[var5];
            var4++;
            SoftwareModelLit.clippedColour[0] = this.faceColourA![arg0];
        } else {
            const var11: number = SoftwareModelLit.vertexViewSpaceX[var5];
            const var12: number = SoftwareModelLit.vertexViewSpaceY[var5];
            const var13: number = this.faceColourA![arg0];
            if (var10 >= 50) {
                const var14: number = (50 - var8) * Pix3D.divTable2[var10 - var8];
                SoftwareModelLit.clippedX[0] = var2 + ((((var11 + (((SoftwareModelLit.vertexViewSpaceX[var7] - var11) * var14) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[0] = var3 + ((((var12 + (((SoftwareModelLit.vertexViewSpaceY[var7] - var12) * var14) >> 16)) * Pix3D.focal) / 50) | 0);
                var4++;
                SoftwareModelLit.clippedColour[0] = var13 + (((this.faceColourC![arg0] - var13) * var14) >> 16);
            }
            if (var9 >= 50) {
                const var15: number = (50 - var8) * Pix3D.divTable2[var9 - var8];
                SoftwareModelLit.clippedX[var4] = var2 + ((((var11 + (((SoftwareModelLit.vertexViewSpaceX[var6] - var11) * var15) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[var4] = var3 + ((((var12 + (((SoftwareModelLit.vertexViewSpaceY[var6] - var12) * var15) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedColour[var4++] = var13 + (((this.faceColourB![arg0] - var13) * var15) >> 16);
            }
        }
        if (var9 >= 50) {
            SoftwareModelLit.clippedX[var4] = SoftwareModelLit.vertexScreenX[var6];
            SoftwareModelLit.clippedY[var4] = SoftwareModelLit.vertexScreenY[var6];
            SoftwareModelLit.clippedColour[var4++] = this.faceColourB![arg0];
        } else {
            const var16: number = SoftwareModelLit.vertexViewSpaceX[var6];
            const var17: number = SoftwareModelLit.vertexViewSpaceY[var6];
            const var18: number = this.faceColourB![arg0];
            if (var8 >= 50) {
                const var19: number = (50 - var9) * Pix3D.divTable2[var8 - var9];
                SoftwareModelLit.clippedX[var4] = var2 + ((((var16 + (((SoftwareModelLit.vertexViewSpaceX[var5] - var16) * var19) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[var4] = var3 + ((((var17 + (((SoftwareModelLit.vertexViewSpaceY[var5] - var17) * var19) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedColour[var4++] = var18 + (((this.faceColourA![arg0] - var18) * var19) >> 16);
            }
            if (var10 >= 50) {
                const var20: number = (50 - var9) * Pix3D.divTable2[var10 - var9];
                SoftwareModelLit.clippedX[var4] = var2 + ((((var16 + (((SoftwareModelLit.vertexViewSpaceX[var7] - var16) * var20) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[var4] = var3 + ((((var17 + (((SoftwareModelLit.vertexViewSpaceY[var7] - var17) * var20) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedColour[var4++] = var18 + (((this.faceColourC![arg0] - var18) * var20) >> 16);
            }
        }
        if (var10 >= 50) {
            SoftwareModelLit.clippedX[var4] = SoftwareModelLit.vertexScreenX[var7];
            SoftwareModelLit.clippedY[var4] = SoftwareModelLit.vertexScreenY[var7];
            SoftwareModelLit.clippedColour[var4++] = this.faceColourC![arg0];
        } else {
            const var21: number = SoftwareModelLit.vertexViewSpaceX[var7];
            const var22: number = SoftwareModelLit.vertexViewSpaceY[var7];
            const var23: number = this.faceColourC![arg0];
            if (var9 >= 50) {
                const var24: number = (50 - var10) * Pix3D.divTable2[var9 - var10];
                SoftwareModelLit.clippedX[var4] = var2 + ((((var21 + (((SoftwareModelLit.vertexViewSpaceX[var6] - var21) * var24) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[var4] = var3 + ((((var22 + (((SoftwareModelLit.vertexViewSpaceY[var6] - var22) * var24) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedColour[var4++] = var23 + (((this.faceColourB![arg0] - var23) * var24) >> 16);
            }
            if (var8 >= 50) {
                const var25: number = (50 - var10) * Pix3D.divTable2[var8 - var10];
                SoftwareModelLit.clippedX[var4] = var2 + ((((var21 + (((SoftwareModelLit.vertexViewSpaceX[var5] - var21) * var25) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedY[var4] = var3 + ((((var22 + (((SoftwareModelLit.vertexViewSpaceY[var5] - var22) * var25) >> 16)) * Pix3D.focal) / 50) | 0);
                SoftwareModelLit.clippedColour[var4++] = var23 + (((this.faceColourA![arg0] - var23) * var25) >> 16);
            }
        }
        const var26: number = SoftwareModelLit.clippedX[0];
        const var27: number = SoftwareModelLit.clippedX[1];
        const var28: number = SoftwareModelLit.clippedX[2];
        const var29: number = SoftwareModelLit.clippedY[0];
        const var30: number = SoftwareModelLit.clippedY[1];
        const var31: number = SoftwareModelLit.clippedY[2];
        Pix3D.hclip = false;
        if (var4 === 3) {
            if (var26 < 0 || var27 < 0 || var28 < 0 || var26 > Pix3D.sizeX || var27 > Pix3D.sizeX || var28 > Pix3D.sizeX) {
                Pix3D.hclip = true;
            }
            if (this.faceTextureId !== null && this.faceTextureId[arg0] !== -1) {
                let var33: number;
                let var34: number;
                let var35: number;
                if (this.faceTextureAxis === null || this.faceTextureAxis[arg0] === -1) {
                    var33 = var5;
                    var34 = var6;
                    var35 = var7;
                } else {
                    const var32: number = this.faceTextureAxis[arg0] & 0xff;
                    var33 = this.faceTextureP![var32];
                    var34 = this.faceTextureM![var32];
                    var35 = this.faceTextureN![var32];
                }
                if (this.faceColourC![arg0] === -1) {
                    Pix3D.textureTriangle(
                        var29,
                        var30,
                        var31,
                        var26,
                        var27,
                        var28,
                        this.faceColourA![arg0],
                        this.faceColourA![arg0],
                        this.faceColourA![arg0],
                        SoftwareModelLit.vertexViewSpaceX[var33],
                        SoftwareModelLit.vertexViewSpaceX[var34],
                        SoftwareModelLit.vertexViewSpaceX[var35],
                        SoftwareModelLit.vertexViewSpaceY[var33],
                        SoftwareModelLit.vertexViewSpaceY[var34],
                        SoftwareModelLit.vertexViewSpaceY[var35],
                        SoftwareModelLit.vertexViewSpaceZ[var33],
                        SoftwareModelLit.vertexViewSpaceZ[var34],
                        SoftwareModelLit.vertexViewSpaceZ[var35],
                        this.faceTextureId[arg0]
                    );
                } else {
                    Pix3D.textureTriangle(
                        var29,
                        var30,
                        var31,
                        var26,
                        var27,
                        var28,
                        SoftwareModelLit.clippedColour[0],
                        SoftwareModelLit.clippedColour[1],
                        SoftwareModelLit.clippedColour[2],
                        SoftwareModelLit.vertexViewSpaceX[var33],
                        SoftwareModelLit.vertexViewSpaceX[var34],
                        SoftwareModelLit.vertexViewSpaceX[var35],
                        SoftwareModelLit.vertexViewSpaceY[var33],
                        SoftwareModelLit.vertexViewSpaceY[var34],
                        SoftwareModelLit.vertexViewSpaceY[var35],
                        SoftwareModelLit.vertexViewSpaceZ[var33],
                        SoftwareModelLit.vertexViewSpaceZ[var34],
                        SoftwareModelLit.vertexViewSpaceZ[var35],
                        this.faceTextureId[arg0]
                    );
                }
            } else if (this.faceColourC![arg0] === -1) {
                Pix3D.flatTriangle(var29, var30, var31, var26, var27, var28, Pix3D.colourTable[this.faceColourA![arg0]]);
            } else {
                Pix3D.gouraudTriangle(var29, var30, var31, var26, var27, var28, SoftwareModelLit.clippedColour[0], SoftwareModelLit.clippedColour[1], SoftwareModelLit.clippedColour[2]);
            }
        }
        if (var4 !== 4) {
            return;
        }
        if (var26 < 0 || var27 < 0 || var28 < 0 || var26 > Pix3D.sizeX || var27 > Pix3D.sizeX || var28 > Pix3D.sizeX || SoftwareModelLit.clippedX[3] < 0 || SoftwareModelLit.clippedX[3] > Pix3D.sizeX) {
            Pix3D.hclip = true;
        }
        if (this.faceTextureId === null || this.faceTextureId[arg0] === -1) {
            if (this.faceColourC![arg0] === -1) {
                const var36: number = Pix3D.colourTable[this.faceColourA![arg0]];
                Pix3D.flatTriangle(var29, var30, var31, var26, var27, var28, var36);
                Pix3D.flatTriangle(var29, var31, SoftwareModelLit.clippedY[3], var26, var28, SoftwareModelLit.clippedX[3], var36);
                return;
            }
            Pix3D.gouraudTriangle(var29, var30, var31, var26, var27, var28, SoftwareModelLit.clippedColour[0], SoftwareModelLit.clippedColour[1], SoftwareModelLit.clippedColour[2]);
            Pix3D.gouraudTriangle(var29, var31, SoftwareModelLit.clippedY[3], var26, var28, SoftwareModelLit.clippedX[3], SoftwareModelLit.clippedColour[0], SoftwareModelLit.clippedColour[2], SoftwareModelLit.clippedColour[3]);
            return;
        }
        let var38: number;
        let var39: number;
        let var40: number;
        if (this.faceTextureAxis === null || this.faceTextureAxis[arg0] === -1) {
            var38 = var5;
            var39 = var6;
            var40 = var7;
        } else {
            const var37: number = this.faceTextureAxis[arg0] & 0xff;
            var38 = this.faceTextureP![var37];
            var39 = this.faceTextureM![var37];
            var40 = this.faceTextureN![var37];
        }
        const var41: number = this.faceTextureId[arg0];
        if (this.faceColourC![arg0] === -1) {
            Pix3D.textureTriangle(
                var29,
                var30,
                var31,
                var26,
                var27,
                var28,
                this.faceColourA![arg0],
                this.faceColourA![arg0],
                this.faceColourA![arg0],
                SoftwareModelLit.vertexViewSpaceX[var38],
                SoftwareModelLit.vertexViewSpaceX[var39],
                SoftwareModelLit.vertexViewSpaceX[var40],
                SoftwareModelLit.vertexViewSpaceY[var38],
                SoftwareModelLit.vertexViewSpaceY[var39],
                SoftwareModelLit.vertexViewSpaceY[var40],
                SoftwareModelLit.vertexViewSpaceZ[var38],
                SoftwareModelLit.vertexViewSpaceZ[var39],
                SoftwareModelLit.vertexViewSpaceZ[var40],
                var41
            );
            Pix3D.textureTriangle(
                var29,
                var31,
                SoftwareModelLit.clippedY[3],
                var26,
                var28,
                SoftwareModelLit.clippedX[3],
                this.faceColourA![arg0],
                this.faceColourA![arg0],
                this.faceColourA![arg0],
                SoftwareModelLit.vertexViewSpaceX[var38],
                SoftwareModelLit.vertexViewSpaceX[var39],
                SoftwareModelLit.vertexViewSpaceX[var40],
                SoftwareModelLit.vertexViewSpaceY[var38],
                SoftwareModelLit.vertexViewSpaceY[var39],
                SoftwareModelLit.vertexViewSpaceY[var40],
                SoftwareModelLit.vertexViewSpaceZ[var38],
                SoftwareModelLit.vertexViewSpaceZ[var39],
                SoftwareModelLit.vertexViewSpaceZ[var40],
                var41
            );
            return;
        }
        Pix3D.textureTriangle(
            var29,
            var30,
            var31,
            var26,
            var27,
            var28,
            SoftwareModelLit.clippedColour[0],
            SoftwareModelLit.clippedColour[1],
            SoftwareModelLit.clippedColour[2],
            SoftwareModelLit.vertexViewSpaceX[var38],
            SoftwareModelLit.vertexViewSpaceX[var39],
            SoftwareModelLit.vertexViewSpaceX[var40],
            SoftwareModelLit.vertexViewSpaceY[var38],
            SoftwareModelLit.vertexViewSpaceY[var39],
            SoftwareModelLit.vertexViewSpaceY[var40],
            SoftwareModelLit.vertexViewSpaceZ[var38],
            SoftwareModelLit.vertexViewSpaceZ[var39],
            SoftwareModelLit.vertexViewSpaceZ[var40],
            var41
        );
        Pix3D.textureTriangle(
            var29,
            var31,
            SoftwareModelLit.clippedY[3],
            var26,
            var28,
            SoftwareModelLit.clippedX[3],
            SoftwareModelLit.clippedColour[0],
            SoftwareModelLit.clippedColour[2],
            SoftwareModelLit.clippedColour[3],
            SoftwareModelLit.vertexViewSpaceX[var38],
            SoftwareModelLit.vertexViewSpaceX[var39],
            SoftwareModelLit.vertexViewSpaceX[var40],
            SoftwareModelLit.vertexViewSpaceY[var38],
            SoftwareModelLit.vertexViewSpaceY[var39],
            SoftwareModelLit.vertexViewSpaceY[var40],
            SoftwareModelLit.vertexViewSpaceZ[var38],
            SoftwareModelLit.vertexViewSpaceZ[var39],
            SoftwareModelLit.vertexViewSpaceZ[var40],
            var41
        );
    }

    render3(arg0: number): void {
        if (SoftwareModelLit.faceNearClipped[arg0]) {
            this.render3ZClip(arg0);
            return;
        }
        const var2: number = this.faceVertexA![arg0];
        const var3: number = this.faceVertexB![arg0];
        const var4: number = this.faceVertexC![arg0];
        Pix3D.hclip = SoftwareModelLit.faceClippedX[arg0];
        if (this.faceAlpha === null) {
            Pix3D.trans = 0;
        } else {
            Pix3D.trans = this.faceAlpha[arg0] & 0xff;
        }
        if (this.faceTextureId !== null && this.faceTextureId[arg0] !== -1) {
            let var6: number;
            let var7: number;
            let var8: number;
            if (this.faceTextureAxis === null || this.faceTextureAxis[arg0] === -1) {
                var6 = var2;
                var7 = var3;
                var8 = var4;
            } else {
                const var5: number = this.faceTextureAxis[arg0] & 0xff;
                var6 = this.faceTextureP![var5];
                var7 = this.faceTextureM![var5];
                var8 = this.faceTextureN![var5];
            }
            if (this.faceColourC![arg0] === -1) {
                Pix3D.textureTriangle(
                    SoftwareModelLit.vertexScreenY[var2],
                    SoftwareModelLit.vertexScreenY[var3],
                    SoftwareModelLit.vertexScreenY[var4],
                    SoftwareModelLit.vertexScreenX[var2],
                    SoftwareModelLit.vertexScreenX[var3],
                    SoftwareModelLit.vertexScreenX[var4],
                    this.faceColourA![arg0],
                    this.faceColourA![arg0],
                    this.faceColourA![arg0],
                    SoftwareModelLit.vertexViewSpaceX[var6],
                    SoftwareModelLit.vertexViewSpaceX[var7],
                    SoftwareModelLit.vertexViewSpaceX[var8],
                    SoftwareModelLit.vertexViewSpaceY[var6],
                    SoftwareModelLit.vertexViewSpaceY[var7],
                    SoftwareModelLit.vertexViewSpaceY[var8],
                    SoftwareModelLit.vertexViewSpaceZ[var6],
                    SoftwareModelLit.vertexViewSpaceZ[var7],
                    SoftwareModelLit.vertexViewSpaceZ[var8],
                    this.faceTextureId[arg0]
                );
            } else {
                Pix3D.textureTriangle(
                    SoftwareModelLit.vertexScreenY[var2],
                    SoftwareModelLit.vertexScreenY[var3],
                    SoftwareModelLit.vertexScreenY[var4],
                    SoftwareModelLit.vertexScreenX[var2],
                    SoftwareModelLit.vertexScreenX[var3],
                    SoftwareModelLit.vertexScreenX[var4],
                    this.faceColourA![arg0],
                    this.faceColourB![arg0],
                    this.faceColourC![arg0],
                    SoftwareModelLit.vertexViewSpaceX[var6],
                    SoftwareModelLit.vertexViewSpaceX[var7],
                    SoftwareModelLit.vertexViewSpaceX[var8],
                    SoftwareModelLit.vertexViewSpaceY[var6],
                    SoftwareModelLit.vertexViewSpaceY[var7],
                    SoftwareModelLit.vertexViewSpaceY[var8],
                    SoftwareModelLit.vertexViewSpaceZ[var6],
                    SoftwareModelLit.vertexViewSpaceZ[var7],
                    SoftwareModelLit.vertexViewSpaceZ[var8],
                    this.faceTextureId[arg0]
                );
            }
        } else if (this.faceColourC![arg0] === -1) {
            Pix3D.flatTriangle(
                SoftwareModelLit.vertexScreenY[var2],
                SoftwareModelLit.vertexScreenY[var3],
                SoftwareModelLit.vertexScreenY[var4],
                SoftwareModelLit.vertexScreenX[var2],
                SoftwareModelLit.vertexScreenX[var3],
                SoftwareModelLit.vertexScreenX[var4],
                Pix3D.colourTable[this.faceColourA![arg0]]
            );
        } else {
            Pix3D.gouraudTriangle(
                SoftwareModelLit.vertexScreenY[var2],
                SoftwareModelLit.vertexScreenY[var3],
                SoftwareModelLit.vertexScreenY[var4],
                SoftwareModelLit.vertexScreenX[var2],
                SoftwareModelLit.vertexScreenX[var3],
                SoftwareModelLit.vertexScreenX[var4],
                this.faceColourA![arg0],
                this.faceColourB![arg0],
                this.faceColourC![arg0]
            );
        }
    }
}
