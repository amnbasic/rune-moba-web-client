import FogOfWar from '#/client/FogOfWar.js';
import { BuildArea } from '#/dash3d/CollisionMap.js';
import Occlude from '#/dash3d/Occlude.js';

import GroundDecor from '#/dash3d/GroundDecor.js';
import Sprite from '#/dash3d/Sprite.js';
import GroundObject from '#/dash3d/GroundObject.js';
import Square from '#/dash3d/Square.js';
import Ground from '#/dash3d/Ground.js';
import QuickGround from '#/dash3d/QuickGround.js';
import Wall from '#/dash3d/Wall.js';
import Decor from '#/dash3d/Decor.js';
import ClientBuild from '#/client/ClientBuild.js';

import LinkList from '#/datastruct/LinkList.js';

import Pix3D from '#/dash3d/Pix3D.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';

import type ModelSource from '#/dash3d/ModelSource.js';
import type { SceneTag } from '#/dash3d/ModelSource.js';

export default class World {
    static readonly LEVELS: number = 4;
    static readonly occluders: (Occlude | null)[][] = Array.from({ length: World.LEVELS }, () => new Array(500).fill(null));
    static readonly numOccluders: Int32Array = new Int32Array(World.LEVELS);
    static readonly dynamicSprites: (Sprite | null)[] = new Array(5000).fill(null);
    static readonly spriteBuffer: (Sprite | null)[] = new Array(100).fill(null);
    static readonly POSTTAB: Uint8Array = Uint8Array.of(76, 8, 137, 4, 0, 1, 38, 2, 19);
    static readonly PRETAB: Uint8Array = Uint8Array.of(19, 55, 38, 155, 255, 110, 137, 205, 76);
    static readonly MIDTAB: Uint8Array = Uint8Array.of(160, 192, 80, 96, 0, 144, 80, 48, 160);
    static readonly MIDDEP_16: Uint8Array = Uint8Array.of(0, 0, 2, 0, 0, 2, 1, 1, 0);
    static readonly MIDDEP_32: Uint8Array = Uint8Array.of(2, 0, 0, 2, 0, 0, 0, 4, 4);
    static readonly MIDDEP_64: Uint8Array = Uint8Array.of(0, 4, 4, 8, 0, 0, 8, 0, 0);
    static readonly MIDDEP_128: Uint8Array = Uint8Array.of(1, 1, 0, 0, 0, 8, 0, 0, 8);
    // prettier-ignore
    static readonly MINIMAP_SHAPE: Uint8Array[] = [
        new Uint8Array(16),
        Uint8Array.of(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        Uint8Array.of(1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1),
        Uint8Array.of(1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
        Uint8Array.of(0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1),
        Uint8Array.of(0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
        Uint8Array.of(1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1),
        Uint8Array.of(1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0),
        Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0),
        Uint8Array.of(1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1),
        Uint8Array.of(1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
        Uint8Array.of(0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1),
        Uint8Array.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1)
    ];
    // prettier-ignore
    static readonly MINIMAP_ROTATE: Uint8Array[] = [
        Uint8Array.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
        Uint8Array.of(12, 8, 4, 0, 13, 9, 5, 1, 14, 10, 6, 2, 15, 11, 7, 3),
        Uint8Array.of(15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0),
        Uint8Array.of(3, 7, 11, 15, 2, 6, 10, 14, 1, 5, 9, 13, 0, 4, 8, 12)
    ];
    static readonly activeOccluders: (Occlude | null)[] = new Array(500).fill(null);
    static readonly fillQueue: LinkList<Square> = new LinkList();
    static field211: (Square | null)[][][] | null = null;
    static groundh: Int32Array[][] | null = null;
    static maxTileX: number = 0;
    static maxTileZ: number = 0;
    static occlusionCycle: Int32Array[][] | null = null;
    static visibilityRadius: number = 0;
    static visibilityMap: boolean[][] | null = null;
    static visibilityMapBuffer: boolean[][] | null = null;
    static squares: (Square | null)[][][] | null = null;
    static maxTileLevel: number = 0;
    static dynamicCount: number = 0;
    static cx: number = 0;
    static cz: number = 0;
    static cy: number = 0;
    static click: boolean = false;
    static groundX: number = -1;
    static clickX: number = 0;
    static clickY: number = 0;
    static groundZ: number = -1;
    // MOBA skillshot aim: per-frame HOVER ground pick — the same triangle test as
    // the click pick but armed every frame with the current mouse, so the aim
    // overlay has a hovered tile without a click (Java World.anInt1420/anInt1413).
    static hoverPick: boolean = false;
    static hoverLev: number = 0;
    static hoverX: number = 0;
    static hoverY: number = 0;
    static hoverGroundX: number = -1;
    static hoverGroundZ: number = -1;
    static lowMem: boolean = true;
    static cycleNo: number = 0;
    static cameraSinX: number = 0;
    static cameraCosX: number = 0;
    static cameraSinY: number = 0;
    static cameraCosY: number = 0;
    static gz: number = 0;
    static gx: number = 0;
    static clickLev: number = 0;
    static maxX: number = 0;
    static field4510: Int32Array | null = null;
    static minX: number = 0;
    static field1416: (Square | null)[][][] | null = null;
    static fillLeft: number = 0;
    static minLevel: number = 0;
    static minZ: number = 0;
    static maxZ: number = 0;
    static maxLevel: number = 0;
    static numActiveOccluders: number = 0;
    static field3882: Int32Array | null = null;
    static field2713: Int32Array | null = null;
    static field2979: Int32Array[][] | null = null;
    static field3605: Int32Array | null = null;
    static field740: Int32Array | null = null;

    static init(): void {
        World.field211 = Array.from({ length: 4 }, () => Array.from({ length: 104 }, () => new Array(104).fill(null)));
        World.groundh = Array.from({ length: 4 }, () => Array.from({ length: 105 }, () => new Int32Array(105)));
        World.method131();
        World.maxTileX = 104;
        World.maxTileZ = 104;
        World.occlusionCycle = Array.from({ length: 4 }, () => Array.from({ length: 105 }, () => new Int32Array(105)));
        World.resetMap();
        World.visibilityRadius = 25;
        World.visibilityMap = Array.from({ length: World.visibilityRadius + World.visibilityRadius + 1 }, () => new Array(World.visibilityRadius + World.visibilityRadius + 1).fill(false));
        World.visibilityMapBuffer = Array.from({ length: World.visibilityRadius + World.visibilityRadius + 2 }, () => new Array(World.visibilityRadius + World.visibilityRadius + 2).fill(false));
    }

    static method131(): void {
        ClientBuild.groundh = World.groundh;
        World.squares = World.field211;
        World.maxTileLevel = World.squares!.length;
    }

    static resetMap(): void {
        for (let var0: number = 0; var0 < World.maxTileLevel; var0++) {
            for (let var1: number = 0; var1 < World.maxTileX; var1++) {
                for (let var2: number = 0; var2 < World.maxTileZ; var2++) {
                    World.squares![var0][var1][var2] = null;
                }
            }
        }

        for (let var3: number = 0; var3 < World.LEVELS; var3++) {
            for (let var4: number = 0; var4 < World.numOccluders[var3]; var4++) {
                World.occluders[var3][var4] = null;
            }
            World.numOccluders[var3] = 0;
        }

        for (let var5: number = 0; var5 < World.dynamicCount; var5++) {
            World.dynamicSprites[var5] = null;
        }
        World.dynamicCount = 0;
        for (let var6: number = 0; var6 < World.spriteBuffer.length; var6++) {
            World.spriteBuffer[var6] = null;
        }
    }

    static fillBaseLevel(arg0: number): void {
        World.minLevel = arg0;

        for (let var1: number = 0; var1 < World.maxTileX; var1++) {
            for (let var2: number = 0; var2 < World.maxTileZ; var2++) {
                if (World.squares![arg0][var1][var2] === null) {
                    World.squares![arg0][var1][var2] = new Square(arg0, var1, var2);
                }
            }
        }
    }

    static pushDown(arg0: number, arg1: number): void {
        const var2: Square | null = World.squares![0][arg0][arg1];
        for (let var3: number = 0; var3 < 3; var3++) {
            const var4: Square | null = (World.squares![var3][arg0][arg1] = World.squares![var3 + 1][arg0][arg1]);
            if (var4 !== null) {
                var4.level--;
                for (let var5: number = 0; var5 < var4.spriteCount; var5++) {
                    const var6: Sprite = var4.sprites[var5]!;
                    if (((Number(BigInt.asIntN(32, BigInt(var6.typecode))) >> 29) & 0x3) === 2 && var6.minTileX === arg0 && var6.minTileZ === arg1) {
                        var6.level--;
                    }
                }
            }
        }
        if (World.squares![0][arg0][arg1] === null) {
            World.squares![0][arg0][arg1] = new Square(0, arg0, arg1);
        }
        World.squares![0][arg0][arg1]!.linkedSquare = var2;
        World.squares![3][arg0][arg1] = null;
    }

    static setOcclude(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number): void {
        const var8 = new Occlude();
        var8.minTileX = (arg2 / 128) | 0;
        var8.maxTileX = (arg3 / 128) | 0;
        var8.minTileZ = (arg4 / 128) | 0;
        var8.maxTileZ = (arg5 / 128) | 0;
        var8.type = arg1;
        var8.minX = arg2;
        var8.maxX = arg3;
        var8.minZ = arg4;
        var8.maxZ = arg5;
        var8.minY = arg6;
        var8.maxY = arg7;
        World.occluders[arg0][World.numOccluders[arg0]++] = var8;
    }

    static setLayer(arg0: number, arg1: number, arg2: number, arg3: number): void {
        const var4: Square | null = World.squares![arg0][arg1][arg2];
        if (var4 !== null) {
            World.squares![arg0][arg1][arg2]!.drawLevel = arg3;
        }
    }

    static setGround(
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
        arg18: number,
        arg19: number
    ): void {
        if (arg3 === 0) {
            const var20 = new QuickGround(arg10, arg11, arg12, arg13, -1, arg18, false);
            for (let var21 = arg0; var21 >= 0; var21--) {
                if (World.squares![var21][arg1][arg2] === null) {
                    World.squares![var21][arg1][arg2] = new Square(var21, arg1, arg2);
                }
            }
            World.squares![arg0][arg1][arg2]!.quickGround = var20;
        } else if (arg3 === 1) {
            const var22 = new QuickGround(arg14, arg15, arg16, arg17, arg5, arg19, arg6 === arg7 && arg6 === arg8 && arg6 === arg9);
            for (let var23 = arg0; var23 >= 0; var23--) {
                if (World.squares![var23][arg1][arg2] === null) {
                    World.squares![var23][arg1][arg2] = new Square(var23, arg1, arg2);
                }
            }
            World.squares![arg0][arg1][arg2]!.quickGround = var22;
        } else {
            const var24 = new Ground(arg3, arg4, arg5, arg1, arg2, arg6, arg7, arg8, arg9, arg10, arg11, arg12, arg13, arg14, arg15, arg16, arg17, arg18, arg19);
            for (let var25 = arg0; var25 >= 0; var25--) {
                if (World.squares![var25][arg1][arg2] === null) {
                    World.squares![var25][arg1][arg2] = new Square(var25, arg1, arg2);
                }
            }
            World.squares![arg0][arg1][arg2]!.ground = var24;
        }
    }

    static setGroundDecor(arg0: number, arg1: number, arg2: number, arg3: number, arg4: ModelSource | null, arg5: SceneTag, arg6: boolean): void {
        if (arg4 === null) {
            return;
        }
        const var8 = new GroundDecor();
        var8.model = arg4;
        var8.x = arg1 * 128 + 64;
        var8.z = arg2 * 128 + 64;
        var8.y = arg3;
        var8.typecode = arg5;
        if (World.squares![arg0][arg1][arg2] === null) {
            World.squares![arg0][arg1][arg2] = new Square(arg0, arg1, arg2);
        }
        World.squares![arg0][arg1][arg2]!.groundDecor = var8;
    }

    static delGroundDecor(arg0: number, arg1: number, arg2: number): void {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 !== null) {
            var3.groundDecor = null;
        }
    }

    static setObj(arg0: number, arg1: number, arg2: number, arg3: number, arg4: ModelSource | null, arg5: SceneTag, arg6: ModelSource | null, arg7: ModelSource | null): void {
        const var9: GroundObject = new GroundObject();
        var9.topObj = arg4;
        var9.x = arg1 * 128 + 64;
        var9.z = arg2 * 128 + 64;
        var9.y = arg3;
        var9.typecode = arg5;
        var9.bottomObj = arg6;
        var9.middleObj = arg7;
        let var10: number = 0;
        const var11: Square | null = World.squares![arg0][arg1][arg2];
        if (var11 !== null) {
            for (let var12: number = 0; var12 < var11.spriteCount; var12++) {
                const var13: Sprite = var11.sprites[var12]!;
                if ((BigInt(var13.typecode) & 0x400000n) === 4194304n) {
                    const var14: number = var13.model.method88();
                    if (var14 !== -32768 && var14 < var10) {
                        var10 = var14;
                    }
                }
            }
        }
        var9.height = -var10;
        if (World.squares![arg0][arg1][arg2] === null) {
            World.squares![arg0][arg1][arg2] = new Square(arg0, arg1, arg2);
        }
        World.squares![arg0][arg1][arg2]!.groundObject = var9;
    }

    static delObj(arg0: number, arg1: number, arg2: number): void {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 !== null) {
            var3.groundObject = null;
        }
    }

    static setWall(arg0: number, arg1: number, arg2: number, arg3: number, arg4: ModelSource | null, arg5: ModelSource | null, arg6: number, arg7: number, arg8: SceneTag): void {
        if (arg4 === null && arg5 === null) {
            return;
        }
        const var10: Wall = new Wall();
        var10.typecode = arg8;
        var10.x = arg1 * 128 + 64;
        var10.z = arg2 * 128 + 64;
        var10.y = arg3;
        var10.modelA = arg4!;
        var10.modelB = arg5!;
        var10.typeA = arg6;
        var10.typeB = arg7;
        for (let var11: number = arg0; var11 >= 0; var11--) {
            if (World.squares![var11][arg1][arg2] === null) {
                World.squares![var11][arg1][arg2] = new Square(var11, arg1, arg2);
            }
        }
        World.squares![arg0][arg1][arg2]!.wall = var10;
    }

    static delWall(arg0: number, arg1: number, arg2: number): void {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 !== null) {
            var3.wall = null;
        }
    }

    static setDecor(arg0: number, arg1: number, arg2: number, arg3: number, arg4: ModelSource | null, arg5: ModelSource | null, arg6: number, arg7: number, arg8: number, arg9: number, arg10: SceneTag): void {
        if (arg4 === null) {
            return;
        }
        const var12: Decor = new Decor();
        var12.typecode = arg10;
        var12.x = arg1 * 128 + 64;
        var12.z = arg2 * 128 + 64;
        var12.y = arg3;
        var12.model = arg4;
        var12.model2 = arg5!;
        var12.wshape = arg6;
        var12.yof = arg7;
        var12.xof = arg8;
        var12.zof = arg9;
        for (let var13: number = arg0; var13 >= 0; var13--) {
            if (World.squares![var13][arg1][arg2] === null) {
                World.squares![var13][arg1][arg2] = new Square(var13, arg1, arg2);
            }
        }
        World.squares![arg0][arg1][arg2]!.decor = var12;
    }

    static delDecor(arg0: number, arg1: number, arg2: number): void {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 !== null) {
            var3.decor = null;
        }
    }

    static moveDecor(arg0: number, arg1: number, arg2: number, arg3: number): void {
        const var4: Square | null = World.squares![arg0][arg1][arg2];
        if (var4 === null) {
            return;
        }

        const var5: Decor | null = var4.decor;
        if (var5 !== null) {
            var5.xof = ((var5.xof * arg3) / 16) | 0;
            var5.zof = ((var5.zof * arg3) / 16) | 0;
        }
    }

    static addScenery(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: ModelSource | null, arg7: number, arg8: SceneTag): boolean {
        if (arg6 === null) {
            return true;
        } else {
            const var10: number = arg1 * 128 + arg4 * 64;
            const var11: number = arg2 * 128 + arg5 * 64;
            return World.setSprite(arg0, arg1, arg2, arg4, arg5, var10, var11, arg3, arg6, arg7, false, arg8);
        }
    }

    static addDynamic(level: number, x: number, z: number, y: number, padding: number, model: ModelSource | null, yaw: number, typecode: SceneTag, forwardPadding: boolean): boolean;
    static addDynamic(level: number, x: number, z: number, y: number, model: ModelSource | null, yaw: number, typecode: SceneTag, minTileX: number, minTileZ: number, maxTileX: number, maxTileZ: number): boolean;
    static addDynamic(level: number, x: number, z: number, y: number, arg4: ModelSource | null | number, arg5: ModelSource | null | number, arg6: number, arg7: SceneTag | number, arg8: boolean | number, arg9?: number, arg10?: number): boolean {
        if (typeof arg4 === 'number') {
            const padding = arg4;
            const model = arg5 as ModelSource | null;
            const yaw = arg6;
            const typecode = arg7 as SceneTag;
            const forwardPadding = arg8 as boolean;
            if (model === null) {
                return true;
            }

            let x0: number = x - padding;
            let z0: number = z - padding;
            let x1: number = x + padding;
            let z1: number = z + padding;

            if (forwardPadding) {
                if (yaw > 640 && yaw < 1408) {
                    z1 += 128;
                }
                if (yaw > 1152 && yaw < 1920) {
                    x1 += 128;
                }
                if (yaw > 1664 || yaw < 384) {
                    z0 -= 128;
                }
                if (yaw > 128 && yaw < 896) {
                    x0 -= 128;
                }
            }

            x0 = (x0 / 128) | 0;
            z0 = (z0 / 128) | 0;
            x1 = (x1 / 128) | 0;
            z1 = (z1 / 128) | 0;

            return World.setSprite(level, x0, z0, x1 + 1 - x0, z1 - z0 + 1, x, z, y, model, yaw, true, typecode);
        }
        const model = arg4;
        const yaw = arg5 as number;
        const typecode = arg6 as SceneTag;
        const minTileX = arg7 as number;
        const minTileZ = arg8 as number;
        const maxTileX = arg9!;
        const maxTileZ = arg10!;
        return model === null || World.setSprite(level, minTileX, minTileZ, maxTileX + 1 - minTileX, maxTileZ - minTileZ + 1, x, z, y, model, yaw, true, typecode);
    }

    static delLoc(arg0: number, arg1: number, arg2: number): void {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 === null) {
            return;
        }

        for (let var4: number = 0; var4 < var3.spriteCount; var4++) {
            const var5: Sprite = var3.sprites[var4]!;
            if (((Number(BigInt.asIntN(32, BigInt(var5.typecode))) >> 29) & 0x3) === 2 && var5.minTileX === arg1 && var5.minTileZ === arg2) {
                World.delSprite(var5);
                return;
            }
        }
    }

    static removeSprites(): void {
        for (let var0: number = 0; var0 < World.dynamicCount; var0++) {
            const var1: Sprite = World.dynamicSprites[var0]!;
            World.delSprite(var1);
            World.dynamicSprites[var0] = null;
        }

        World.dynamicCount = 0;
    }

    static getWall(arg0: number, arg1: number, arg2: number): Wall | null {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null ? null : var3.wall;
    }

    static getDecor(arg0: number, arg1: number, arg2: number): Decor | null {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null ? null : var3.decor;
    }

    static getScene(arg0: number, arg1: number, arg2: number): Sprite | null {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 === null) {
            return null;
        }

        for (let var4: number = 0; var4 < var3.spriteCount; var4++) {
            const var5: Sprite = var3.sprites[var4]!;
            if (((Number(BigInt.asIntN(32, BigInt(var5.typecode))) >> 29) & 0x3) === 2 && var5.minTileX === arg1 && var5.minTileZ === arg2) {
                return var5;
            }
        }

        return null;
    }

    static getGd(arg0: number, arg1: number, arg2: number): GroundDecor | null {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null || var3.groundDecor === null ? null : var3.groundDecor;
    }

    static wallType(arg0: number, arg1: number, arg2: number): SceneTag {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null || var3.wall === null ? 0 : var3.wall.typecode;
    }

    static decorType(arg0: number, arg1: number, arg2: number): SceneTag {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null || var3.decor === null ? 0 : var3.decor.typecode;
    }

    static sceneType(arg0: number, arg1: number, arg2: number): SceneTag {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        if (var3 === null) {
            return 0;
        }

        for (let var4: number = 0; var4 < var3.spriteCount; var4++) {
            const var5: Sprite = var3.sprites[var4]!;
            if (((Number(BigInt.asIntN(32, BigInt(var5.typecode))) >> 29) & 0x3) === 2 && var5.minTileX === arg1 && var5.minTileZ === arg2) {
                return var5.typecode;
            }
        }

        return 0;
    }

    static gdType(arg0: number, arg1: number, arg2: number): SceneTag {
        const var3: Square | null = World.squares![arg0][arg1][arg2];
        return var3 === null || var3.groundDecor === null ? 0 : var3.groundDecor.typecode;
    }

    static method1386(arg0: number, arg1: number, arg2: number, arg3: SceneTag): boolean {
        const var5: Square | null = World.squares![arg0][arg1][arg2];
        if (var5 === null) {
            return false;
        } else if (var5.wall != null && BigInt(var5.wall.typecode) === BigInt(arg3)) {
            return true;
        } else if (var5.decor != null && BigInt(var5.decor.typecode) === BigInt(arg3)) {
            return true;
        } else if (var5.groundDecor != null && BigInt(var5.groundDecor.typecode) === BigInt(arg3)) {
            return true;
        } else {
            for (let var6 = 0; var6 < var5.spriteCount; var6++) {
                if (BigInt(var5.sprites[var6]!.typecode) === BigInt(arg3)) {
                    return true;
                }
            }
            return false;
        }
    }

    static shareLight(): void {
        for (let var0: number = 0; var0 < World.maxTileLevel; var0++) {
            for (let var1: number = 0; var1 < World.maxTileX; var1++) {
                for (let var2: number = 0; var2 < World.maxTileZ; var2++) {
                    const var3: Square | null = World.squares![var0][var1][var2];
                    if (var3 !== null) {
                        const var4: Wall | null = var3.wall;
                        if (var4 !== null && var4.modelA.method544()) {
                            World.shareLightLoc(var4.modelA as ModelUnlit, var0, var1, var2, 1, 1);
                            if (var4.modelB !== null && var4.modelB.method544()) {
                                World.shareLightLoc(var4.modelB as ModelUnlit, var0, var1, var2, 1, 1);
                                var4.modelA.method570(var4.modelB, 0, 0, 0, false);
                                var4.modelB = var4.modelB.method559();
                            }
                            var4.modelA = var4.modelA.method559();
                        }
                        for (let var5: number = 0; var5 < var3.spriteCount; var5++) {
                            const var6: Sprite | null = var3.sprites[var5];
                            if (var6 !== null && var6.model.method544()) {
                                World.shareLightLoc(var6.model as ModelUnlit, var0, var1, var2, var6.maxTileX + 1 - var6.minTileX, var6.maxTileZ - var6.minTileZ + 1);
                                var6.model = var6.model.method559();
                            }
                        }
                        const var7: GroundDecor | null = var3.groundDecor;
                        if (var7 !== null && var7.model.method544()) {
                            World.shareLightGd(var7.model, var0, var1, var2);
                            var7.model = var7.model.method559();
                        }
                    }
                }
            }
        }
    }

    static shareLightGd(arg0: ModelSource, arg1: number, arg2: number, arg3: number): void {
        if (arg2 < World.maxTileX) {
            const var4: Square | null = World.squares![arg1][arg2 + 1][arg3];
            if (var4 !== null && var4.groundDecor !== null && var4.groundDecor.model.method544()) {
                arg0.method570(var4.groundDecor.model, 128, 0, 0, true);
            }
        }

        if (arg3 < World.maxTileX) {
            const var5: Square | null = World.squares![arg1][arg2][arg3 + 1];
            if (var5 !== null && var5.groundDecor !== null && var5.groundDecor.model.method544()) {
                arg0.method570(var5.groundDecor.model, 0, 0, 128, true);
            }
        }

        if (arg2 < World.maxTileX && arg3 < World.maxTileZ) {
            const var6: Square | null = World.squares![arg1][arg2 + 1][arg3 + 1];
            if (var6 !== null && var6.groundDecor !== null && var6.groundDecor.model.method544()) {
                arg0.method570(var6.groundDecor.model, 128, 0, 128, true);
            }
        }

        if (arg2 < World.maxTileX && arg3 > 0) {
            const var7: Square | null = World.squares![arg1][arg2 + 1][arg3 - 1];
            if (var7 !== null && var7.groundDecor !== null && var7.groundDecor.model.method544()) {
                arg0.method570(var7.groundDecor.model, 128, 0, -128, true);
            }
        }
    }

    static shareLightLoc(arg0: ModelSource, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        let var6 = true;
        let var7 = arg2;
        const var8 = arg2 + arg4;
        const var9 = arg3 - 1;
        const var10 = arg3 + arg5;
        for (let var11 = arg1; var11 <= arg1 + 1; var11++) {
            if (var11 !== World.maxTileLevel) {
                for (let var12 = var7; var12 <= var8; var12++) {
                    if (var12 >= 0 && var12 < World.maxTileX) {
                        for (let var13 = var9; var13 <= var10; var13++) {
                            if (var13 >= 0 && var13 < World.maxTileZ && (!var6 || var12 >= var8 || var13 >= var10 || (var13 < arg3 && var12 !== arg2))) {
                                const var14 = World.squares![var11][var12][var13];
                                if (var14 !== null) {
                                    const var15 =
                                        (((ClientBuild.groundh![var11][var12][var13] + ClientBuild.groundh![var11][var12 + 1][var13] + ClientBuild.groundh![var11][var12][var13 + 1] + ClientBuild.groundh![var11][var12 + 1][var13 + 1]) / 4) | 0) -
                                        (((ClientBuild.groundh![arg1][arg2][arg3] + ClientBuild.groundh![arg1][arg2 + 1][arg3] + ClientBuild.groundh![arg1][arg2][arg3 + 1] + ClientBuild.groundh![arg1][arg2 + 1][arg3 + 1]) / 4) | 0);
                                    const var16 = var14.wall;
                                    if (var16 !== null) {
                                        if (var16.modelA.method544()) {
                                            arg0.method570(var16.modelA, (var12 - arg2) * 128 + (1 - arg4) * 64, var15, (var13 - arg3) * 128 + (1 - arg5) * 64, var6);
                                        }
                                        if (var16.modelB !== null && var16.modelB.method544()) {
                                            arg0.method570(var16.modelB, (var12 - arg2) * 128 + (1 - arg4) * 64, var15, (var13 - arg3) * 128 + (1 - arg5) * 64, var6);
                                        }
                                    }
                                    for (let var17 = 0; var17 < var14.spriteCount; var17++) {
                                        const var18 = var14.sprites[var17];
                                        if (var18 !== null && var18.model.method544() && (var12 === var18.minTileX || var12 === var7) && (var13 === var18.minTileZ || var13 === var9)) {
                                            const var19 = var18.maxTileX + 1 - var18.minTileX;
                                            const var20 = var18.maxTileZ + 1 - var18.minTileZ;
                                            arg0.method570(var18.model, (var18.minTileX - arg2) * 128 + (var19 - arg4) * 64, var15, (var18.minTileZ - arg3) * 128 + (var20 - arg5) * 64, var6);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                var7--;
                var6 = false;
            }
        }
    }

    static render2DGround(arg0: Int32Array, arg1: number, arg2: number, arg3: number, arg4: number): void {
        const var5 = World.squares![arg2][arg3][arg4];
        if (var5 === null) {
            return;
        }
        const var6 = var5.quickGround;
        if (var6 !== null) {
            const var7 = var6.minimapRgb;
            if (var7 !== 0) {
                for (let var8 = 0; var8 < 4; var8++) {
                    arg0[arg1] = var7;
                    arg0[arg1 + 1] = var7;
                    arg0[arg1 + 2] = var7;
                    arg0[arg1 + 3] = var7;
                    arg1 += 512;
                }
            }
            return;
        }
        const var9 = var5.ground;
        if (var9 === null) {
            return;
        }
        const var10 = var9.overlayShape;
        const var11 = var9.overlayRotation;
        const var12 = var9.minimapOverlay;
        const var13 = var9.minimapUnderlay;
        const var14 = World.MINIMAP_SHAPE[var10];
        const var15 = World.MINIMAP_ROTATE[var11];
        let var16 = 0;
        if (var12 !== 0) {
            for (let var17 = 0; var17 < 4; var17++) {
                arg0[arg1] = var14[var15[var16++]] === 0 ? var12 : var13;
                arg0[arg1 + 1] = var14[var15[var16++]] === 0 ? var12 : var13;
                arg0[arg1 + 2] = var14[var15[var16++]] === 0 ? var12 : var13;
                arg0[arg1 + 3] = var14[var15[var16++]] === 0 ? var12 : var13;
                arg1 += 512;
            }
            return;
        }
        for (let var18 = 0; var18 < 4; var18++) {
            if (var14[var15[var16++]] !== 0) {
                arg0[arg1] = var13;
            }
            if (var14[var15[var16++]] !== 0) {
                arg0[arg1 + 1] = var13;
            }
            if (var14[var15[var16++]] !== 0) {
                arg0[arg1 + 2] = var13;
            }
            if (var14[var15[var16++]] !== 0) {
                arg0[arg1 + 3] = var13;
            }
            arg1 += 512;
        }
    }

    static testPoint(arg0: number, arg1: number, arg2: number, arg3: number): boolean {
        const var4: number = (arg3 * World.cameraSinY + arg0 * World.cameraCosY) >> 16;
        const var5: number = (arg3 * World.cameraCosY - arg0 * World.cameraSinY) >> 16;
        let var6: number = (arg1 * World.cameraSinX + var5 * World.cameraCosX) >> 16;
        const var7: number = (arg1 * World.cameraCosX - var5 * World.cameraSinX) >> 16;
        if (var6 < 1) {
            var6 = 1;
        }
        const var8: number = ((var4 * Pix3D.focal) / var6) | 0;
        const var9: number = ((var7 * Pix3D.focal) / var6) | 0;
        let var10: number = (arg2 * World.cameraSinX + var5 * World.cameraCosX) >> 16;
        const var11: number = (arg2 * World.cameraCosX - var5 * World.cameraSinX) >> 16;
        if (var10 < 1) {
            var10 = 1;
        }
        const var12: number = ((var4 * Pix3D.focal) / var10) | 0;
        const var13: number = ((var11 * Pix3D.focal) / var10) | 0;
        if (var6 < 50 && var10 < 50) {
            return false;
        } else if (var6 > 3500 && var10 > 3500) {
            return false;
        } else if (var8 < Pix3D.minX && var12 < Pix3D.minX) {
            return false;
        } else if (var8 > Pix3D.maxX && var12 > Pix3D.maxX) {
            return false;
        } else if (var9 < Pix3D.minY && var13 < Pix3D.minY) {
            return false;
        } else {
            return var9 <= Pix3D.maxY || var13 <= Pix3D.maxY;
        }
    }

    static updateMousePicking(arg0: number, arg1: number, arg2: number): void {
        World.click = true;
        World.clickLev = arg0;
        World.clickX = arg1;
        World.clickY = arg2;
        World.groundX = -1;
        World.groundZ = -1;
    }

    /** Arm (or disarm) the per-frame hover ground pick before renderAll. */
    static updateHoverPicking(active: boolean, lev: number, x: number, y: number): void {
        World.hoverPick = active;
        World.hoverLev = lev;
        World.hoverX = x;
        World.hoverY = y;
        World.hoverGroundX = -1;
        World.hoverGroundZ = -1;
    }

    static renderAll(
        arg0: number,
        arg1: number,
        arg2: number,
        arg3: number,
        arg4: number,
        arg5: number,
        arg6: Array<Array<Uint8Array>> | null,
        arg7: Int32Array | null,
        arg8: Int32Array | null,
        arg9: Int32Array | null,
        arg10: Int32Array | null,
        arg11: Int32Array | null,
        arg12: number,
        arg13: number
    ): void {
        if (arg0 < 0) {
            arg0 = 0;
        } else if (arg0 >= World.maxTileX * 128) {
            arg0 = World.maxTileX * 128 - 1;
        }

        if (arg2 < 0) {
            arg2 = 0;
        } else if (arg2 >= World.maxTileZ * 128) {
            arg2 = World.maxTileZ * 128 - 1;
        }

        World.cameraSinX = Pix3D.sinTable[arg3];
        World.cameraCosX = Pix3D.cosTable[arg3];
        World.cameraSinY = Pix3D.sinTable[arg4];
        World.cameraCosY = Pix3D.cosTable[arg4];

        World.cx = arg0;
        World.cy = arg1;
        World.cz = arg2;
        World.gx = (arg0 / 128) | 0;
        World.gz = (arg2 / 128) | 0;
        World.maxLevel = arg5;

        World.minX = World.gx - World.visibilityRadius;
        if (World.minX < 0) {
            World.minX = 0;
        }

        World.minZ = World.gz - World.visibilityRadius;
        if (World.minZ < 0) {
            World.minZ = 0;
        }

        World.maxX = World.gx + World.visibilityRadius;
        if (World.maxX > World.maxTileX) {
            World.maxX = World.maxTileX;
        }

        World.maxZ = World.gz + World.visibilityRadius;
        if (World.maxZ > World.maxTileZ) {
            World.maxZ = World.maxTileZ;
        }

        for (let var14: number = 0; var14 < World.visibilityRadius + World.visibilityRadius + 2; var14++) {
            for (let var15: number = 0; var15 < World.visibilityRadius + World.visibilityRadius + 2; var15++) {
                const var16: number = ((var14 - World.visibilityRadius) << 7) - (World.cx & 0x7f);
                const var17: number = ((var15 - World.visibilityRadius) << 7) - (World.cz & 0x7f);
                const var18: number = World.gx + var14 - World.visibilityRadius;
                const var19: number = World.gz + var15 - World.visibilityRadius;
                if (var18 >= 0 && var19 >= 0 && var18 < World.maxTileX && var19 < World.maxTileZ) {
                    let var20: number;
                    if (World.field2979 === null) {
                        var20 = World.groundh![0][var18][var19] + 128 - World.cy;
                    } else {
                        var20 = World.field2979[0][var18][var19] + 128 - World.cy;
                    }
                    const var21: number = World.groundh![3][var18][var19] - World.cy - 1000;
                    World.visibilityMapBuffer![var14][var15] = World.testPoint(var16, var21, var20, var17);
                } else {
                    World.visibilityMapBuffer![var14][var15] = false;
                }
            }
        }

        for (let var22: number = 0; var22 < World.visibilityRadius + World.visibilityRadius + 1; var22++) {
            for (let var23: number = 0; var23 < World.visibilityRadius + World.visibilityRadius + 1; var23++) {
                World.visibilityMap![var22][var23] = World.visibilityMapBuffer![var22][var23] || World.visibilityMapBuffer![var22 + 1][var23] || World.visibilityMapBuffer![var22][var23 + 1] || World.visibilityMapBuffer![var22 + 1][var23 + 1];
            }
        }

        World.field4510 = arg7;
        World.field740 = arg8;
        World.field3605 = arg9;
        World.field2713 = arg10;
        World.field3882 = arg11;
        World.calcOcclude();
        World.method803(arg0, arg1, arg2, arg6, arg12, arg13);
    }

    static method803(arg0: number, arg1: number, arg2: number, arg3: Array<Array<Uint8Array>> | null, arg4: number, arg5: number): void {
        World.cycleNo++;
        World.fillLeft = 0;
        const var6: number = arg4 - 16;
        const var7: number = arg4 + 16;
        const var8: number = arg5 - 16;
        const var9: number = arg5 + 16;
        for (let var10: number = World.minLevel; var10 < World.maxTileLevel; var10++) {
            const var11 = World.squares![var10];
            for (let var12: number = World.minX; var12 < World.maxX; var12++) {
                for (let var13: number = World.minZ; var13 < World.maxZ; var13++) {
                    const var14: Square | null = var11[var12][var13];
                    if (var14 !== null) {
                        if (var14.drawLevel <= World.maxLevel && World.visibilityMap![var12 + World.visibilityRadius - World.gx][var13 + World.visibilityRadius - World.gz] && (arg3 === null || var10 < 0 || arg3[var10][var12][var13] !== 0)) {
                            var14.drawFront = true;
                            var14.drawBack = true;
                            if (var14.spriteCount > 0) {
                                var14.drawSprites = true;
                            } else {
                                var14.drawSprites = false;
                            }
                            World.fillLeft++;
                        } else {
                            var14.drawFront = false;
                            var14.drawBack = false;
                            var14.checkLocSpans = 0;
                            if (var14.sprites !== null && var12 >= var6 && var12 <= var7 && var13 >= var8 && var13 <= var9) {
                                for (let var15: number = 0; var15 < var14.spriteCount; var15++) {
                                    const var16: Sprite = var14.sprites[var15]!;
                                    var16.model.method537((var16.minTileX + ((var16.maxTileX - var16.minTileX) >> 1)) * 128 + 64, (var16.minTileZ + ((var16.maxTileZ - var16.minTileZ) >> 1)) * 128 + 64);
                                }
                            }
                        }
                    }
                }
            }
        }
        const var17: boolean = ClientBuild.groundh === World.field2979;
        for (let var18: number = World.minLevel; var18 < World.maxTileLevel; var18++) {
            const var19 = World.squares![var18];
            for (let var20: number = -World.visibilityRadius; var20 <= 0; var20++) {
                const var21: number = World.gx + var20;
                const var22: number = World.gx - var20;
                if (var21 >= World.minX || var22 < World.maxX) {
                    for (let var23: number = -World.visibilityRadius; var23 <= 0; var23++) {
                        const var24: number = World.gz + var23;
                        const var25: number = World.gz - var23;
                        if (var21 >= World.minX) {
                            if (var24 >= World.minZ) {
                                const var26: Square | null = var19[var21][var24];
                                if (var26 !== null && var26.drawFront) {
                                    World.fill(var26, true);
                                }
                            }
                            if (var25 < World.maxZ) {
                                const var27: Square | null = var19[var21][var25];
                                if (var27 !== null && var27.drawFront) {
                                    World.fill(var27, true);
                                }
                            }
                        }
                        if (var22 < World.maxX) {
                            if (var24 >= World.minZ) {
                                const var28: Square | null = var19[var22][var24];
                                if (var28 !== null && var28.drawFront) {
                                    World.fill(var28, true);
                                }
                            }
                            if (var25 < World.maxZ) {
                                const var29: Square | null = var19[var22][var25];
                                if (var29 !== null && var29.drawFront) {
                                    World.fill(var29, true);
                                }
                            }
                        }
                        if (World.fillLeft === 0) {
                            if (!var17) {
                                World.click = false;
                            }
                            return;
                        }
                    }
                }
            }
        }
        for (let var30: number = World.minLevel; var30 < World.maxTileLevel; var30++) {
            const var31 = World.squares![var30];
            for (let var32: number = -World.visibilityRadius; var32 <= 0; var32++) {
                const var33: number = World.gx + var32;
                const var34: number = World.gx - var32;
                if (var33 >= World.minX || var34 < World.maxX) {
                    for (let var35: number = -World.visibilityRadius; var35 <= 0; var35++) {
                        const var36: number = World.gz + var35;
                        const var37: number = World.gz - var35;
                        if (var33 >= World.minX) {
                            if (var36 >= World.minZ) {
                                const var38: Square | null = var31[var33][var36];
                                if (var38 !== null && var38.drawFront) {
                                    World.fill(var38, false);
                                }
                            }
                            if (var37 < World.maxZ) {
                                const var39: Square | null = var31[var33][var37];
                                if (var39 !== null && var39.drawFront) {
                                    World.fill(var39, false);
                                }
                            }
                        }
                        if (var34 < World.maxX) {
                            if (var36 >= World.minZ) {
                                const var40: Square | null = var31[var34][var36];
                                if (var40 !== null && var40.drawFront) {
                                    World.fill(var40, false);
                                }
                            }
                            if (var37 < World.maxZ) {
                                const var41: Square | null = var31[var34][var37];
                                if (var41 !== null && var41.drawFront) {
                                    World.fill(var41, false);
                                }
                            }
                        }
                        if (World.fillLeft === 0) {
                            if (!var17) {
                                World.click = false;
                            }
                            return;
                        }
                    }
                }
            }
        }
        World.click = false;
    }

    static setSprite(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: ModelSource, arg9: number, arg10: boolean, arg11: SceneTag): boolean {
        for (let var13: number = arg1; var13 < arg1 + arg3; var13++) {
            for (let var14: number = arg2; var14 < arg2 + arg4; var14++) {
                if (var13 < 0 || var14 < 0 || var13 >= World.maxTileX || var14 >= World.maxTileZ) {
                    return false;
                }
                const var15: Square | null = World.squares![arg0][var13][var14];
                if (var15 !== null && var15.spriteCount >= 5) {
                    return false;
                }
            }
        }
        const var16: Sprite = new Sprite();
        var16.typecode = arg11;
        var16.level = arg0;
        var16.x = arg5;
        var16.z = arg6;
        var16.y = arg7;
        var16.model = arg8;
        var16.yaw = arg9;
        var16.minTileX = arg1;
        var16.minTileZ = arg2;
        var16.maxTileX = arg1 + arg3 - 1;
        var16.maxTileZ = arg2 + arg4 - 1;
        for (let var17: number = arg1; var17 < arg1 + arg3; var17++) {
            for (let var18: number = arg2; var18 < arg2 + arg4; var18++) {
                let var19: number = 0;
                if (var17 > arg1) {
                    var19++;
                }
                if (var17 < arg1 + arg3 - 1) {
                    var19 += 4;
                }
                if (var18 > arg2) {
                    var19 += 8;
                }
                if (var18 < arg2 + arg4 - 1) {
                    var19 += 2;
                }
                for (let var20: number = arg0; var20 >= 0; var20--) {
                    if (World.squares![var20][var17][var18] === null) {
                        World.squares![var20][var17][var18] = new Square(var20, var17, var18);
                    }
                }
                const var21: Square = World.squares![arg0][var17][var18]!;
                var21.sprites[var21.spriteCount] = var16;
                var21.spriteSpan[var21.spriteCount] = var19;
                var21.spriteSpans |= var19;
                var21.spriteCount++;
            }
        }
        if (arg10) {
            World.dynamicSprites[World.dynamicCount++] = var16;
        }
        return true;
    }

    static delSprite(arg0: Sprite): void {
        for (let var1: number = arg0.minTileX; var1 <= arg0.maxTileX; var1++) {
            for (let var2: number = arg0.minTileZ; var2 <= arg0.maxTileZ; var2++) {
                const var3: Square | null = World.squares![arg0.level][var1][var2];
                if (var3 !== null) {
                    for (let var4: number = 0; var4 < var3.spriteCount; var4++) {
                        if (var3.sprites[var4] === arg0) {
                            var3.spriteCount--;
                            for (let var5: number = var4; var5 < var3.spriteCount; var5++) {
                                var3.sprites[var5] = var3.sprites[var5 + 1];
                                var3.spriteSpan[var5] = var3.spriteSpan[var5 + 1];
                            }
                            var3.sprites[var3.spriteCount] = null;
                            break;
                        }
                    }
                    var3.spriteSpans = 0;
                    for (let var6: number = 0; var6 < var3.spriteCount; var6++) {
                        var3.spriteSpans |= var3.spriteSpan[var6];
                    }
                }
            }
        }
    }

    static calcOcclude(): void {
        const var0: number = World.numOccluders[World.maxLevel];
        const var1: Array<Occlude | null> = World.occluders[World.maxLevel];
        World.numActiveOccluders = 0;
        label187: for (let var2: number = 0; var2 < var0; var2++) {
            const var3: Occlude = var1[var2]!;
            if (World.field4510 !== null) {
                for (let var4: number = 0; var4 < World.field4510.length; var4++) {
                    if (
                        World.field4510[var4] !== -1000000 &&
                        (var3.minY <= World.field4510[var4] || var3.maxY <= World.field4510[var4]) &&
                        (var3.minX <= World.field3605![var4] || var3.maxX <= World.field3605![var4]) &&
                        (var3.minX >= World.field740![var4] || var3.maxX >= World.field740![var4]) &&
                        (var3.minZ <= World.field2713![var4] || var3.maxZ <= World.field2713![var4]) &&
                        (var3.minZ >= World.field3882![var4] || var3.maxZ >= World.field3882![var4])
                    ) {
                        continue label187;
                    }
                }
            }
            if (var3.type === 1) {
                const var5: number = var3.minTileX + World.visibilityRadius - World.gx;
                if (var5 >= 0 && var5 <= World.visibilityRadius + World.visibilityRadius) {
                    let var6: number = var3.minTileZ + World.visibilityRadius - World.gz;
                    if (var6 < 0) {
                        var6 = 0;
                    }
                    let var7: number = var3.maxTileZ + World.visibilityRadius - World.gz;
                    if (var7 > World.visibilityRadius + World.visibilityRadius) {
                        var7 = World.visibilityRadius + World.visibilityRadius;
                    }
                    let var8: boolean = false;
                    while (var6 <= var7) {
                        if (World.visibilityMap![var5][var6++]) {
                            var8 = true;
                            break;
                        }
                    }
                    if (var8) {
                        let var9: number = World.cx - var3.minX;
                        if (var9 > 32) {
                            var3.mode = 1;
                        } else {
                            if (var9 >= -32) {
                                continue;
                            }
                            var3.mode = 2;
                            var9 = -var9;
                        }
                        var3.minDeltaZ = (((var3.minZ - World.cz) << 8) / var9) | 0;
                        var3.maxDeltaZ = (((var3.maxZ - World.cz) << 8) / var9) | 0;
                        var3.minDeltaY = (((var3.minY - World.cy) << 8) / var9) | 0;
                        var3.maxDeltaY = (((var3.maxY - World.cy) << 8) / var9) | 0;
                        World.activeOccluders[World.numActiveOccluders++] = var3;
                    }
                }
            } else if (var3.type === 2) {
                const var10: number = var3.minTileZ + World.visibilityRadius - World.gz;
                if (var10 >= 0 && var10 <= World.visibilityRadius + World.visibilityRadius) {
                    let var11: number = var3.minTileX + World.visibilityRadius - World.gx;
                    if (var11 < 0) {
                        var11 = 0;
                    }
                    let var12: number = var3.maxTileX + World.visibilityRadius - World.gx;
                    if (var12 > World.visibilityRadius + World.visibilityRadius) {
                        var12 = World.visibilityRadius + World.visibilityRadius;
                    }
                    let var13: boolean = false;
                    while (var11 <= var12) {
                        if (World.visibilityMap![var11++][var10]) {
                            var13 = true;
                            break;
                        }
                    }
                    if (var13) {
                        let var14: number = World.cz - var3.minZ;
                        if (var14 > 32) {
                            var3.mode = 3;
                        } else {
                            if (var14 >= -32) {
                                continue;
                            }
                            var3.mode = 4;
                            var14 = -var14;
                        }
                        var3.minDeltaX = (((var3.minX - World.cx) << 8) / var14) | 0;
                        var3.maxDeltaX = (((var3.maxX - World.cx) << 8) / var14) | 0;
                        var3.minDeltaY = (((var3.minY - World.cy) << 8) / var14) | 0;
                        var3.maxDeltaY = (((var3.maxY - World.cy) << 8) / var14) | 0;
                        World.activeOccluders[World.numActiveOccluders++] = var3;
                    }
                }
            } else if (var3.type === 4) {
                const var15: number = var3.minY - World.cy;
                if (var15 > 128) {
                    let var16: number = var3.minTileZ + World.visibilityRadius - World.gz;
                    if (var16 < 0) {
                        var16 = 0;
                    }
                    let var17: number = var3.maxTileZ + World.visibilityRadius - World.gz;
                    if (var17 > World.visibilityRadius + World.visibilityRadius) {
                        var17 = World.visibilityRadius + World.visibilityRadius;
                    }
                    if (var16 <= var17) {
                        let var18: number = var3.minTileX + World.visibilityRadius - World.gx;
                        if (var18 < 0) {
                            var18 = 0;
                        }
                        let var19: number = var3.maxTileX + World.visibilityRadius - World.gx;
                        if (var19 > World.visibilityRadius + World.visibilityRadius) {
                            var19 = World.visibilityRadius + World.visibilityRadius;
                        }
                        let var20: boolean = false;
                        label159: for (let var21: number = var18; var21 <= var19; var21++) {
                            for (let var22: number = var16; var22 <= var17; var22++) {
                                if (World.visibilityMap![var21][var22]) {
                                    var20 = true;
                                    break label159;
                                }
                            }
                        }
                        if (var20) {
                            var3.mode = 5;
                            var3.minDeltaX = (((var3.minX - World.cx) << 8) / var15) | 0;
                            var3.maxDeltaX = (((var3.maxX - World.cx) << 8) / var15) | 0;
                            var3.minDeltaZ = (((var3.minZ - World.cz) << 8) / var15) | 0;
                            var3.maxDeltaZ = (((var3.maxZ - World.cz) << 8) / var15) | 0;
                            World.activeOccluders[World.numActiveOccluders++] = var3;
                        }
                    }
                }
            }
        }
    }

    static fill(arg0: Square, arg1: boolean): void {
        World.fillQueue.push(arg0);
        while (true) {
            let var2!: Square;
            let var3!: number;
            let var4!: number;
            let var5!: number;
            let var6!: number;
            let var7!: Square[][];
            let var65: Square | null;
            do {
                let var64: Square | null;
                do {
                    let var63: Square | null;
                    do {
                        let var62: Square | null;
                        do {
                            do {
                                do {
                                    while (true) {
                                        while (true) {
                                            do {
                                                var2 = World.fillQueue.popFront() as Square;
                                                if (var2 === null) {
                                                    return;
                                                }
                                            } while (!var2.drawBack);
                                            var3 = var2.x;
                                            var4 = var2.z;
                                            var5 = var2.level;
                                            var6 = var2.originalLevel;
                                            var7 = World.squares![var5] as Square[][];
                                            if (!var2.drawFront) {
                                                break;
                                            }
                                            if (arg1) {
                                                if (var5 > 0) {
                                                    const var8: Square | null = World.squares![var5 - 1][var3][var4];
                                                    if (var8 !== null && var8.drawBack) {
                                                        continue;
                                                    }
                                                }
                                                if (var3 <= World.gx && var3 > World.minX) {
                                                    const var9: Square | null = var7[var3 - 1][var4];
                                                    if (var9 !== null && var9.drawBack && (var9.drawFront || (var2.spriteSpans & 0x1) === 0)) {
                                                        continue;
                                                    }
                                                }
                                                if (var3 >= World.gx && var3 < World.maxX - 1) {
                                                    const var10: Square | null = var7[var3 + 1][var4];
                                                    if (var10 !== null && var10.drawBack && (var10.drawFront || (var2.spriteSpans & 0x4) === 0)) {
                                                        continue;
                                                    }
                                                }
                                                if (var4 <= World.gz && var4 > World.minZ) {
                                                    const var11: Square | null = var7[var3][var4 - 1];
                                                    if (var11 !== null && var11.drawBack && (var11.drawFront || (var2.spriteSpans & 0x8) === 0)) {
                                                        continue;
                                                    }
                                                }
                                                if (var4 >= World.gz && var4 < World.maxZ - 1) {
                                                    const var12: Square | null = var7[var3][var4 + 1];
                                                    if (var12 !== null && var12.drawBack && (var12.drawFront || (var2.spriteSpans & 0x2) === 0)) {
                                                        continue;
                                                    }
                                                }
                                            } else {
                                                arg1 = true;
                                            }
                                            var2.drawFront = false;
                                            if (var2.linkedSquare !== null) {
                                                const var13: Square = var2.linkedSquare;
                                                if (var13.quickGround === null) {
                                                    if (var13.ground !== null) {
                                                        if (World.groundOccluded(0, var3, var4)) {
                                                            World.renderGround(var13.ground, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, true);
                                                        } else {
                                                            World.renderGround(var13.ground, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, false);
                                                        }
                                                    }
                                                } else if (World.groundOccluded(0, var3, var4)) {
                                                    World.renderQuickGround(var13.quickGround, 0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, true);
                                                } else {
                                                    World.renderQuickGround(var13.quickGround, 0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, false);
                                                }
                                                const var14: Wall | null = var13.wall;
                                                if (var14 !== null) {
                                                    var14.modelA.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var14.x - World.cx, var14.y - World.cy, var14.z - World.cz, var14.typecode);
                                                }
                                                for (let var15: number = 0; var15 < var13.spriteCount; var15++) {
                                                    const var16: Sprite | null = var13.sprites[var15];
                                                    if (var16 !== null) {
                                                        var16.model.method87(var16.yaw, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var16.x - World.cx, var16.y - World.cy, var16.z - World.cz, var16.typecode);
                                                    }
                                                }
                                            }
                                            let var17: boolean = false;
                                            if (var2.quickGround === null) {
                                                if (var2.ground !== null) {
                                                    if (World.groundOccluded(var6, var3, var4)) {
                                                        World.renderGround(var2.ground, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, true);
                                                    } else {
                                                        var17 = true;
                                                        World.renderGround(var2.ground, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, false);
                                                    }
                                                }
                                            } else if (World.groundOccluded(var6, var3, var4)) {
                                                World.renderQuickGround(var2.quickGround, var6, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, true);
                                            } else {
                                                var17 = true;
                                                if (var2.quickGround.colourNE !== 12345678 || (World.click && var5 <= World.clickLev) || (World.hoverPick && var5 <= World.hoverLev)) {
                                                    World.renderQuickGround(var2.quickGround, var6, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var3, var4, false);
                                                }
                                            }
                                            let var18: number = 0;
                                            let var19: number = 0;
                                            const var20: Wall | null = var2.wall;
                                            const var21: Decor | null = var2.decor;
                                            if (var20 !== null || var21 !== null) {
                                                if (World.gx === var3) {
                                                    var18++;
                                                } else if (World.gx < var3) {
                                                    var18 += 2;
                                                }
                                                if (World.gz === var4) {
                                                    var18 += 3;
                                                } else if (World.gz > var4) {
                                                    var18 += 6;
                                                }
                                                var19 = World.PRETAB[var18];
                                                var2.blockLocSpans = World.POSTTAB[var18];
                                            }
                                            if (var20 !== null) {
                                                if ((var20.typeA & World.MIDTAB[var18]) === 0) {
                                                    var2.checkLocSpans = 0;
                                                } else if (var20.typeA === 16) {
                                                    var2.checkLocSpans = 3;
                                                    var2.backWallTypes = World.MIDDEP_16[var18];
                                                    var2.inverseBlockLocSpans = 3 - var2.backWallTypes;
                                                } else if (var20.typeA === 32) {
                                                    var2.checkLocSpans = 6;
                                                    var2.backWallTypes = World.MIDDEP_32[var18];
                                                    var2.inverseBlockLocSpans = 6 - var2.backWallTypes;
                                                } else if (var20.typeA === 64) {
                                                    var2.checkLocSpans = 12;
                                                    var2.backWallTypes = World.MIDDEP_64[var18];
                                                    var2.inverseBlockLocSpans = 12 - var2.backWallTypes;
                                                } else {
                                                    var2.checkLocSpans = 9;
                                                    var2.backWallTypes = World.MIDDEP_128[var18];
                                                    var2.inverseBlockLocSpans = 9 - var2.backWallTypes;
                                                }
                                                if ((var20.typeA & var19) !== 0 && !World.wallOccluded(var6, var3, var4, var20.typeA)) {
                                                    var20.modelA.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var20.x - World.cx, var20.y - World.cy, var20.z - World.cz, var20.typecode);
                                                }
                                                if ((var20.typeB & var19) !== 0 && !World.wallOccluded(var6, var3, var4, var20.typeB)) {
                                                    var20.modelB.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var20.x - World.cx, var20.y - World.cy, var20.z - World.cz, var20.typecode);
                                                }
                                            }
                                            if (var21 !== null && !World.spriteOccluded(var6, var3, var4, var21.model.method88())) {
                                                if ((var21.wshape & var19) !== 0) {
                                                    var21.model.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var21.x + var21.xof - World.cx, var21.y - World.cy, var21.z + var21.zof - World.cz, var21.typecode);
                                                } else if (var21.wshape === 256) {
                                                    const var22: number = var21.x - World.cx;
                                                    const var23: number = var21.y - World.cy;
                                                    const var24: number = var21.z - World.cz;
                                                    const var25: number = var21.yof;
                                                    let var26: number;
                                                    if (var25 === 1 || var25 === 2) {
                                                        var26 = -var22;
                                                    } else {
                                                        var26 = var22;
                                                    }
                                                    let var27: number;
                                                    if (var25 === 2 || var25 === 3) {
                                                        var27 = -var24;
                                                    } else {
                                                        var27 = var24;
                                                    }
                                                    if (var27 < var26) {
                                                        var21.model.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var22 + var21.xof, var23, var24 + var21.zof, var21.typecode);
                                                    } else if (var21.model2 !== null) {
                                                        var21.model2.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var22, var23, var24, var21.typecode);
                                                    }
                                                }
                                            }
                                            if (var17) {
                                                const var28: GroundDecor | null = var2.groundDecor;
                                                if (var28 !== null) {
                                                    var28.model.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var28.x - World.cx, var28.y - World.cy, var28.z - World.cz, var28.typecode);
                                                }
                                                const var29: GroundObject | null = var2.groundObject;
                                                if (var29 !== null && var29.height === 0) {
                                                    if (var29.bottomObj !== null) {
                                                        var29.bottomObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var29.x - World.cx, var29.y - World.cy, var29.z - World.cz, var29.typecode);
                                                    }
                                                    if (var29.middleObj !== null) {
                                                        var29.middleObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var29.x - World.cx, var29.y - World.cy, var29.z - World.cz, var29.typecode);
                                                    }
                                                    if (var29.topObj !== null) {
                                                        var29.topObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var29.x - World.cx, var29.y - World.cy, var29.z - World.cz, var29.typecode);
                                                    }
                                                }
                                            }
                                            const var30: number = var2.spriteSpans;
                                            if (var30 !== 0) {
                                                if (var3 < World.gx && (var30 & 0x4) !== 0) {
                                                    const var31: Square | null = var7[var3 + 1][var4];
                                                    if (var31 !== null && var31.drawBack) {
                                                        World.fillQueue.push(var31);
                                                    }
                                                }
                                                if (var4 < World.gz && (var30 & 0x2) !== 0) {
                                                    const var32: Square | null = var7[var3][var4 + 1];
                                                    if (var32 !== null && var32.drawBack) {
                                                        World.fillQueue.push(var32);
                                                    }
                                                }
                                                if (var3 > World.gx && (var30 & 0x1) !== 0) {
                                                    const var33: Square | null = var7[var3 - 1][var4];
                                                    if (var33 !== null && var33.drawBack) {
                                                        World.fillQueue.push(var33);
                                                    }
                                                }
                                                if (var4 > World.gz && (var30 & 0x8) !== 0) {
                                                    const var34: Square | null = var7[var3][var4 - 1];
                                                    if (var34 !== null && var34.drawBack) {
                                                        World.fillQueue.push(var34);
                                                    }
                                                }
                                            }
                                            break;
                                        }
                                        if (var2.checkLocSpans !== 0) {
                                            let var35: boolean = true;
                                            for (let var36: number = 0; var36 < var2.spriteCount; var36++) {
                                                if (var2.sprites[var36]!.cycle !== World.cycleNo && (var2.spriteSpan[var36] & var2.checkLocSpans) === var2.backWallTypes) {
                                                    var35 = false;
                                                    break;
                                                }
                                            }
                                            if (var35) {
                                                const var37: Wall = var2.wall!;
                                                if (!World.wallOccluded(var6, var3, var4, var37.typeA)) {
                                                    var37.modelA.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var37.x - World.cx, var37.y - World.cy, var37.z - World.cz, var37.typecode);
                                                }
                                                var2.checkLocSpans = 0;
                                            }
                                        }
                                        if (!var2.drawSprites) {
                                            break;
                                        }
                                        try {
                                            const var38: number = var2.spriteCount;
                                            var2.drawSprites = false;
                                            let var39: number = 0;
                                            label562: for (let var40: number = 0; var40 < var38; var40++) {
                                                const var41: Sprite = var2.sprites[var40]!;
                                                if (var41.cycle !== World.cycleNo) {
                                                    for (let var42: number = var41.minTileX; var42 <= var41.maxTileX; var42++) {
                                                        for (let var43: number = var41.minTileZ; var43 <= var41.maxTileZ; var43++) {
                                                            const var44: Square = var7[var42][var43]!;
                                                            if (var44.drawFront) {
                                                                var2.drawSprites = true;
                                                                continue label562;
                                                            }
                                                            if (var44.checkLocSpans !== 0) {
                                                                let var45: number = 0;
                                                                if (var42 > var41.minTileX) {
                                                                    var45++;
                                                                }
                                                                if (var42 < var41.maxTileX) {
                                                                    var45 += 4;
                                                                }
                                                                if (var43 > var41.minTileZ) {
                                                                    var45 += 8;
                                                                }
                                                                if (var43 < var41.maxTileZ) {
                                                                    var45 += 2;
                                                                }
                                                                if ((var45 & var44.checkLocSpans) === var2.inverseBlockLocSpans) {
                                                                    var2.drawSprites = true;
                                                                    continue label562;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    World.spriteBuffer[var39++] = var41;
                                                    let var46: number = World.gx - var41.minTileX;
                                                    const var47: number = var41.maxTileX - World.gx;
                                                    if (var47 > var46) {
                                                        var46 = var47;
                                                    }
                                                    const var48: number = World.gz - var41.minTileZ;
                                                    const var49: number = var41.maxTileZ - World.gz;
                                                    if (var49 > var48) {
                                                        var41.distance = var46 + var49;
                                                    } else {
                                                        var41.distance = var46 + var48;
                                                    }
                                                }
                                            }
                                            while (var39 > 0) {
                                                let var50: number = -50;
                                                let var51: number = -1;
                                                for (let var52: number = 0; var52 < var39; var52++) {
                                                    const var53: Sprite = World.spriteBuffer[var52]!;
                                                    if (var53.cycle !== World.cycleNo) {
                                                        if (var53.distance > var50) {
                                                            var50 = var53.distance;
                                                            var51 = var52;
                                                        } else if (var53.distance === var50) {
                                                            const var54: number = var53.x - World.cx;
                                                            const var55: number = var53.z - World.cz;
                                                            const var56: number = World.spriteBuffer[var51]!.x - World.cx;
                                                            const var57: number = World.spriteBuffer[var51]!.z - World.cz;
                                                            if (var54 * var54 + var55 * var55 > var56 * var56 + var57 * var57) {
                                                                var51 = var52;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (var51 === -1) {
                                                    break;
                                                }
                                                const var58: Sprite = World.spriteBuffer[var51]!;
                                                var58.cycle = World.cycleNo;
                                                if (!World.spriteOccluded(var6, var58.minTileX, var58.maxTileX, var58.minTileZ, var58.maxTileZ, var58.model.method88())) {
                                                    var58.model.method87(var58.yaw, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var58.x - World.cx, var58.y - World.cy, var58.z - World.cz, var58.typecode);
                                                }
                                                for (let var59: number = var58.minTileX; var59 <= var58.maxTileX; var59++) {
                                                    for (let var60: number = var58.minTileZ; var60 <= var58.maxTileZ; var60++) {
                                                        const var61: Square = var7[var59][var60]!;
                                                        if (var61.checkLocSpans !== 0) {
                                                            World.fillQueue.push(var61);
                                                        } else if ((var59 !== var3 || var60 !== var4) && var61.drawBack) {
                                                            World.fillQueue.push(var61);
                                                        }
                                                    }
                                                }
                                            }
                                            if (!var2.drawSprites) {
                                                break;
                                            }
                                        } catch (var80) {
                                            var2.drawSprites = false;
                                            break;
                                        }
                                    }
                                } while (!var2.drawBack);
                            } while (var2.checkLocSpans !== 0);
                            if (var3 > World.gx || var3 <= World.minX) {
                                break;
                            }
                            var62 = var7[var3 - 1][var4];
                        } while (var62 !== null && var62.drawBack);
                        if (var3 < World.gx || var3 >= World.maxX - 1) {
                            break;
                        }
                        var63 = var7[var3 + 1][var4];
                    } while (var63 !== null && var63.drawBack);
                    if (var4 > World.gz || var4 <= World.minZ) {
                        break;
                    }
                    var64 = var7[var3][var4 - 1];
                } while (var64 !== null && var64.drawBack);
                if (var4 < World.gz || var4 >= World.maxZ - 1) {
                    break;
                }
                var65 = var7[var3][var4 + 1];
            } while (var65 !== null && var65.drawBack);
            var2.drawBack = false;
            World.fillLeft--;
            const var66: GroundObject | null = var2.groundObject;
            if (var66 !== null && var66.height !== 0) {
                if (var66.bottomObj !== null) {
                    var66.bottomObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var66.x - World.cx, var66.y - World.cy - var66.height, var66.z - World.cz, var66.typecode);
                }
                if (var66.middleObj !== null) {
                    var66.middleObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var66.x - World.cx, var66.y - World.cy - var66.height, var66.z - World.cz, var66.typecode);
                }
                if (var66.topObj !== null) {
                    var66.topObj.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var66.x - World.cx, var66.y - World.cy - var66.height, var66.z - World.cz, var66.typecode);
                }
            }
            if (var2.blockLocSpans !== 0) {
                const var67: Decor | null = var2.decor;
                if (var67 !== null && !World.spriteOccluded(var6, var3, var4, var67.model.method88())) {
                    if ((var67.wshape & var2.blockLocSpans) !== 0) {
                        var67.model.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var67.x + var67.xof - World.cx, var67.y - World.cy, var67.z + var67.zof - World.cz, var67.typecode);
                    } else if (var67.wshape === 256) {
                        const var68: number = var67.x - World.cx;
                        const var69: number = var67.y - World.cy;
                        const var70: number = var67.z - World.cz;
                        const var71: number = var67.yof;
                        let var72: number;
                        if (var71 === 1 || var71 === 2) {
                            var72 = -var68;
                        } else {
                            var72 = var68;
                        }
                        let var73: number;
                        if (var71 === 2 || var71 === 3) {
                            var73 = -var70;
                        } else {
                            var73 = var70;
                        }
                        if (var73 >= var72) {
                            var67.model.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var68 + var67.xof, var69, var70 + var67.zof, var67.typecode);
                        } else if (var67.model2 !== null) {
                            var67.model2.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var68, var69, var70, var67.typecode);
                        }
                    }
                }
                const var74: Wall | null = var2.wall;
                if (var74 !== null) {
                    if ((var74.typeB & var2.blockLocSpans) !== 0 && !World.wallOccluded(var6, var3, var4, var74.typeB)) {
                        var74.modelB.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var74.x - World.cx, var74.y - World.cy, var74.z - World.cz, var74.typecode);
                    }
                    if ((var74.typeA & var2.blockLocSpans) !== 0 && !World.wallOccluded(var6, var3, var4, var74.typeA)) {
                        var74.modelA.method87(0, World.cameraSinX, World.cameraCosX, World.cameraSinY, World.cameraCosY, var74.x - World.cx, var74.y - World.cy, var74.z - World.cz, var74.typecode);
                    }
                }
            }
            if (var5 < World.maxTileLevel - 1) {
                const var75: Square | null = World.squares![var5 + 1][var3][var4];
                if (var75 !== null && var75.drawBack) {
                    World.fillQueue.push(var75);
                }
            }
            if (var3 < World.gx) {
                const var76: Square | null = var7[var3 + 1][var4];
                if (var76 !== null && var76.drawBack) {
                    World.fillQueue.push(var76);
                }
            }
            if (var4 < World.gz) {
                const var77: Square | null = var7[var3][var4 + 1];
                if (var77 !== null && var77.drawBack) {
                    World.fillQueue.push(var77);
                }
            }
            if (var3 > World.gx) {
                const var78: Square | null = var7[var3 - 1][var4];
                if (var78 !== null && var78.drawBack) {
                    World.fillQueue.push(var78);
                }
            }
            if (var4 > World.gz) {
                const var79: Square | null = var7[var3][var4 - 1];
                if (var79 !== null && var79.drawBack) {
                    World.fillQueue.push(var79);
                }
            }
        }
    }

    static renderQuickGround(ground: QuickGround, level: number, sinEyePitch: number, cosEyePitch: number, sinEyeYaw: number, cosEyeYaw: number, tileX: number, tileZ: number, checkOnly: boolean): void {
        let var9: number;
        const var10: number = (var9 = (tileX << 7) - World.cx);
        let var11: number;
        const var12: number = (var11 = (tileZ << 7) - World.cz);
        let var13: number;
        const var14: number = (var13 = var10 + 128);
        let var15: number;
        const var16: number = (var15 = var12 + 128);
        const var17: number = ClientBuild.groundh![level][tileX][tileZ] - World.cy;
        const var18: number = ClientBuild.groundh![level][tileX + 1][tileZ] - World.cy;
        const var19: number = ClientBuild.groundh![level][tileX + 1][tileZ + 1] - World.cy;
        const var20: number = ClientBuild.groundh![level][tileX][tileZ + 1] - World.cy;
        const var21: number = (var12 * sinEyeYaw + var10 * cosEyeYaw) >> 16;
        const var22: number = (var12 * cosEyeYaw - var10 * sinEyeYaw) >> 16;
        const var24: number = (var17 * cosEyePitch - var22 * sinEyePitch) >> 16;
        const var25: number = (var17 * sinEyePitch + var22 * cosEyePitch) >> 16;
        if (var25 < 50) {
            return;
        }
        const var27: number = (var11 * sinEyeYaw + var14 * cosEyeYaw) >> 16;
        const var28: number = (var11 * cosEyeYaw - var14 * sinEyeYaw) >> 16;
        const var30: number = (var18 * cosEyePitch - var28 * sinEyePitch) >> 16;
        const var31: number = (var18 * sinEyePitch + var28 * cosEyePitch) >> 16;
        if (var31 < 50) {
            return;
        }
        const var33: number = (var16 * sinEyeYaw + var13 * cosEyeYaw) >> 16;
        const var34: number = (var16 * cosEyeYaw - var13 * sinEyeYaw) >> 16;
        const var36: number = (var19 * cosEyePitch - var34 * sinEyePitch) >> 16;
        const var37: number = (var19 * sinEyePitch + var34 * cosEyePitch) >> 16;
        if (var37 < 50) {
            return;
        }
        const var39: number = (var15 * sinEyeYaw + var9 * cosEyeYaw) >> 16;
        const var40: number = (var15 * cosEyeYaw - var9 * sinEyeYaw) >> 16;
        const var42: number = (var20 * cosEyePitch - var40 * sinEyePitch) >> 16;
        const var43: number = (var20 * sinEyePitch + var40 * cosEyePitch) >> 16;
        if (var43 < 50) {
            return;
        }
        const var44: number = Pix3D.originX + (((var21 * Pix3D.focal) / var25) | 0);
        const var45: number = Pix3D.originY + (((var24 * Pix3D.focal) / var25) | 0);
        const var46: number = Pix3D.originX + (((var27 * Pix3D.focal) / var31) | 0);
        const var47: number = Pix3D.originY + (((var30 * Pix3D.focal) / var31) | 0);
        const var48: number = Pix3D.originX + (((var33 * Pix3D.focal) / var37) | 0);
        const var49: number = Pix3D.originY + (((var36 * Pix3D.focal) / var37) | 0);
        const var50: number = Pix3D.originX + (((var39 * Pix3D.focal) / var43) | 0);
        const var51: number = Pix3D.originY + (((var42 * Pix3D.focal) / var43) | 0);
        Pix3D.trans = 0;
        // MOBA fog Stage B: darken this tile's corner colours as it draws (ground draws before
        // walls/locs/entities, so objects standing in fog are unaffected — correct occlusion)
        let fogNE: number = ground.colourNE;
        let fogNW: number = ground.colourNW;
        let fogSE: number = ground.colourSE;
        let fogSW: number = ground.colourSW;
        if (FogOfWar.enabled()) {
            fogNE = FogOfWar.shadeGround(fogNE, tileX + 1, tileZ + 1);
            fogNW = FogOfWar.shadeGround(fogNW, tileX, tileZ + 1);
            fogSE = FogOfWar.shadeGround(fogSE, tileX + 1, tileZ);
            fogSW = FogOfWar.shadeGround(fogSW, tileX, tileZ);
        }
        if ((var48 - var50) * (var47 - var51) - (var49 - var51) * (var46 - var50) > 0) {
            if (World.click && World.insideTriangle(World.clickX + Pix3D.originX, World.clickY + Pix3D.originY, var49, var51, var47, var48, var50, var46)) {
                World.groundX = tileX;
                World.groundZ = tileZ;
            }
            if (World.hoverPick && World.insideTriangle(World.hoverX + Pix3D.originX, World.hoverY + Pix3D.originY, var49, var51, var47, var48, var50, var46)) {
                World.hoverGroundX = tileX;
                World.hoverGroundZ = tileZ;
            }
            if (!checkOnly) {
                Pix3D.hclip = false;
                if (var48 < 0 || var50 < 0 || var46 < 0 || var48 > Pix3D.sizeX || var50 > Pix3D.sizeX || var46 > Pix3D.sizeX) {
                    Pix3D.hclip = true;
                }
                if (ground.texture === -1) {
                    if (fogNE !== 12345678) {
                        Pix3D.gouraudTriangle(var49, var51, var47, var48, var50, var46, fogNE, fogNW, fogSE);
                    }
                } else if (World.lowMem) {
                    const var52: number = Pix3D.textureManager.getAverageRgb(ground.texture);
                    Pix3D.gouraudTriangle(var49, var51, var47, var48, var50, var46, World.adjustHslLightness(var52, fogNE), World.adjustHslLightness(var52, fogNW), World.adjustHslLightness(var52, fogSE));
                } else if (ground.flat) {
                    Pix3D.textureTriangleAffine(var49, var51, var47, var48, var50, var46, fogNE, fogNW, fogSE, var21, var27, var39, var24, var30, var42, var25, var31, var43, ground.texture);
                } else {
                    Pix3D.textureTriangleAffine(var49, var51, var47, var48, var50, var46, fogNE, fogNW, fogSE, var33, var39, var27, var36, var42, var30, var37, var43, var31, ground.texture);
                }
            }
        }
        if ((var44 - var46) * (var51 - var47) - (var45 - var47) * (var50 - var46) <= 0) {
            return;
        }
        if (World.click && World.insideTriangle(World.clickX + Pix3D.originX, World.clickY + Pix3D.originY, var45, var47, var51, var44, var46, var50)) {
            World.groundX = tileX;
            World.groundZ = tileZ;
        }
        if (World.hoverPick && World.insideTriangle(World.hoverX + Pix3D.originX, World.hoverY + Pix3D.originY, var45, var47, var51, var44, var46, var50)) {
            World.hoverGroundX = tileX;
            World.hoverGroundZ = tileZ;
        }
        if (checkOnly) {
            return;
        }
        Pix3D.hclip = false;
        if (var44 < 0 || var46 < 0 || var50 < 0 || var44 > Pix3D.sizeX || var46 > Pix3D.sizeX || var50 > Pix3D.sizeX) {
            Pix3D.hclip = true;
        }
        if (ground.texture !== -1) {
            if (!World.lowMem) {
                Pix3D.textureTriangleAffine(var45, var47, var51, var44, var46, var50, fogSW, fogSE, fogNW, var21, var27, var39, var24, var30, var42, var25, var31, var43, ground.texture);
                return;
            }
            const var53: number = Pix3D.textureManager.getAverageRgb(ground.texture);
            Pix3D.gouraudTriangle(var45, var47, var51, var44, var46, var50, World.adjustHslLightness(var53, fogSW), World.adjustHslLightness(var53, fogSE), World.adjustHslLightness(var53, fogNW));
        } else if (fogSW !== 12345678) {
            Pix3D.gouraudTriangle(var45, var47, var51, var44, var46, var50, fogSW, fogSE, fogNW);
        }
    }

    static renderGround(arg0: Ground, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: boolean): void {
        const var8: number = arg0.vertexX.length;
        for (let var9: number = 0; var9 < var8; var9++) {
            const var10: number = arg0.vertexX[var9] - World.cx;
            const var11: number = arg0.vertexY[var9] - World.cy;
            const var12: number = arg0.vertexZ[var9] - World.cz;
            const var13: number = (var12 * arg3 + var10 * arg4) >> 16;
            const var14: number = (var12 * arg4 - var10 * arg3) >> 16;
            const var16: number = (var11 * arg2 - var14 * arg1) >> 16;
            const var17: number = (var11 * arg1 + var14 * arg2) >> 16;
            if (var17 < 50) {
                return;
            }
            if (arg0.faceTexture !== null) {
                Ground.drawTextureVertexX[var9] = var13;
                Ground.drawTextureVertexY[var9] = var16;
                Ground.drawTextureVertexZ[var9] = var17;
            }
            Ground.drawVertexX[var9] = Pix3D.originX + (((var13 * Pix3D.focal) / var17) | 0);
            Ground.drawVertexY[var9] = Pix3D.originY + (((var16 * Pix3D.focal) / var17) | 0);
        }
        Pix3D.trans = 0;
        const var18: number = arg0.faceVertexA.length;
        for (let var19: number = 0; var19 < var18; var19++) {
            const var20: number = arg0.faceVertexA[var19];
            const var21: number = arg0.faceVertexB[var19];
            const var22: number = arg0.faceVertexC[var19];
            const var23: number = Ground.drawVertexX[var20];
            const var24: number = Ground.drawVertexX[var21];
            const var25: number = Ground.drawVertexX[var22];
            const var26: number = Ground.drawVertexY[var20];
            const var27: number = Ground.drawVertexY[var21];
            const var28: number = Ground.drawVertexY[var22];
            if ((var23 - var24) * (var28 - var27) - (var26 - var27) * (var25 - var24) > 0) {
                if (World.click && World.insideTriangle(World.clickX + Pix3D.originX, World.clickY + Pix3D.originY, var26, var27, var28, var23, var24, var25)) {
                    World.groundX = arg5;
                    World.groundZ = arg6;
                }
                if (World.hoverPick && World.insideTriangle(World.hoverX + Pix3D.originX, World.hoverY + Pix3D.originY, var26, var27, var28, var23, var24, var25)) {
                    World.hoverGroundX = arg5;
                    World.hoverGroundZ = arg6;
                }
                if (!arg7) {
                    Pix3D.hclip = false;
                    if (var23 < 0 || var24 < 0 || var25 < 0 || var23 > Pix3D.sizeX || var24 > Pix3D.sizeX || var25 > Pix3D.sizeX) {
                        Pix3D.hclip = true;
                    }
                    // MOBA fog Stage B: darken this face's vertex colours by the fog at each
                    // vertex's tile corner (vertex coords are scene-local fine; >>7 = tile)
                    let fogA: number = arg0.faceColourA[var19];
                    let fogB: number = arg0.faceColourB[var19];
                    let fogC: number = arg0.faceColourC[var19];
                    if (FogOfWar.enabled()) {
                        fogA = FogOfWar.shadeGround(fogA, arg0.vertexX[var20] >> 7, arg0.vertexZ[var20] >> 7);
                        fogB = FogOfWar.shadeGround(fogB, arg0.vertexX[var21] >> 7, arg0.vertexZ[var21] >> 7);
                        fogC = FogOfWar.shadeGround(fogC, arg0.vertexX[var22] >> 7, arg0.vertexZ[var22] >> 7);
                    }
                    if (arg0.faceTexture === null || arg0.faceTexture[var19] === -1) {
                        if (fogA !== 12345678) {
                            Pix3D.gouraudTriangle(var26, var27, var28, var23, var24, var25, fogA, fogB, fogC);
                        }
                    } else if (World.lowMem) {
                        const var29: number = Pix3D.textureManager.getAverageRgb(arg0.faceTexture[var19]);
                        Pix3D.gouraudTriangle(
                            var26,
                            var27,
                            var28,
                            var23,
                            var24,
                            var25,
                            World.adjustHslLightness(var29, fogA),
                            World.adjustHslLightness(var29, fogB),
                            World.adjustHslLightness(var29, fogC)
                        );
                    } else if (arg0.flat) {
                        Pix3D.textureTriangleAffine(
                            var26,
                            var27,
                            var28,
                            var23,
                            var24,
                            var25,
                            fogA,
                            fogB,
                            fogC,
                            Ground.drawTextureVertexX[0],
                            Ground.drawTextureVertexX[1],
                            Ground.drawTextureVertexX[3],
                            Ground.drawTextureVertexY[0],
                            Ground.drawTextureVertexY[1],
                            Ground.drawTextureVertexY[3],
                            Ground.drawTextureVertexZ[0],
                            Ground.drawTextureVertexZ[1],
                            Ground.drawTextureVertexZ[3],
                            arg0.faceTexture[var19]
                        );
                    } else {
                        Pix3D.textureTriangleAffine(
                            var26,
                            var27,
                            var28,
                            var23,
                            var24,
                            var25,
                            fogA,
                            fogB,
                            fogC,
                            Ground.drawTextureVertexX[var20],
                            Ground.drawTextureVertexX[var21],
                            Ground.drawTextureVertexX[var22],
                            Ground.drawTextureVertexY[var20],
                            Ground.drawTextureVertexY[var21],
                            Ground.drawTextureVertexY[var22],
                            Ground.drawTextureVertexZ[var20],
                            Ground.drawTextureVertexZ[var21],
                            Ground.drawTextureVertexZ[var22],
                            arg0.faceTexture[var19]
                        );
                    }
                }
            }
        }
    }

    static groundOccluded(arg0: number, arg1: number, arg2: number): boolean {
        const var3: number = World.occlusionCycle![arg0][arg1][arg2];
        if (var3 === -World.cycleNo) {
            return false;
        } else if (var3 === World.cycleNo) {
            return true;
        } else {
            const var4: number = arg1 << 7;
            const var5: number = arg2 << 7;
            if (
                World.occluded(var4 + 1, ClientBuild.groundh![arg0][arg1][arg2], var5 + 1) &&
                World.occluded(var4 + 128 - 1, ClientBuild.groundh![arg0][arg1 + 1][arg2], var5 + 1) &&
                World.occluded(var4 + 128 - 1, ClientBuild.groundh![arg0][arg1 + 1][arg2 + 1], var5 + 128 - 1) &&
                World.occluded(var4 + 1, ClientBuild.groundh![arg0][arg1][arg2 + 1], var5 + 128 - 1)
            ) {
                World.occlusionCycle![arg0][arg1][arg2] = World.cycleNo;
                return true;
            } else {
                World.occlusionCycle![arg0][arg1][arg2] = -World.cycleNo;
                return false;
            }
        }
    }

    static wallOccluded(arg0: number, arg1: number, arg2: number, arg3: number): boolean {
        if (!World.groundOccluded(arg0, arg1, arg2)) {
            return false;
        }
        const var4: number = arg1 << 7;
        const var5: number = arg2 << 7;
        const var6: number = ClientBuild.groundh![arg0][arg1][arg2] - 1;
        const var7: number = var6 - 120;
        const var8: number = var6 - 230;
        const var9: number = var6 - 238;
        if (arg3 < 16) {
            if (arg3 === 1) {
                if (var4 > World.cx) {
                    if (!World.occluded(var4, var6, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4, var6, var5 + 128)) {
                        return false;
                    }
                }
                if (arg0 > 0) {
                    if (!World.occluded(var4, var7, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4, var7, var5 + 128)) {
                        return false;
                    }
                }
                if (!World.occluded(var4, var8, var5)) {
                    return false;
                }
                if (!World.occluded(var4, var8, var5 + 128)) {
                    return false;
                }
                return true;
            }
            if (arg3 === 2) {
                if (var5 < World.cz) {
                    if (!World.occluded(var4, var6, var5 + 128)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var6, var5 + 128)) {
                        return false;
                    }
                }
                if (arg0 > 0) {
                    if (!World.occluded(var4, var7, var5 + 128)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var7, var5 + 128)) {
                        return false;
                    }
                }
                if (!World.occluded(var4, var8, var5 + 128)) {
                    return false;
                }
                if (!World.occluded(var4 + 128, var8, var5 + 128)) {
                    return false;
                }
                return true;
            }
            if (arg3 === 4) {
                if (var4 < World.cx) {
                    if (!World.occluded(var4 + 128, var6, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var6, var5 + 128)) {
                        return false;
                    }
                }
                if (arg0 > 0) {
                    if (!World.occluded(var4 + 128, var7, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var7, var5 + 128)) {
                        return false;
                    }
                }
                if (!World.occluded(var4 + 128, var8, var5)) {
                    return false;
                }
                if (!World.occluded(var4 + 128, var8, var5 + 128)) {
                    return false;
                }
                return true;
            }
            if (arg3 === 8) {
                if (var5 > World.cz) {
                    if (!World.occluded(var4, var6, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var6, var5)) {
                        return false;
                    }
                }
                if (arg0 > 0) {
                    if (!World.occluded(var4, var7, var5)) {
                        return false;
                    }
                    if (!World.occluded(var4 + 128, var7, var5)) {
                        return false;
                    }
                }
                if (!World.occluded(var4, var8, var5)) {
                    return false;
                }
                if (!World.occluded(var4 + 128, var8, var5)) {
                    return false;
                }
                return true;
            }
        }
        if (!World.occluded(var4 + 64, var9, var5 + 64)) {
            return false;
        } else if (arg3 === 16) {
            return World.occluded(var4, var8, var5 + 128);
        } else if (arg3 === 32) {
            return World.occluded(var4 + 128, var8, var5 + 128);
        } else if (arg3 === 64) {
            return World.occluded(var4 + 128, var8, var5);
        } else if (arg3 === 128) {
            return World.occluded(var4, var8, var5);
        } else {
            return true;
        }
    }

    static spriteOccluded(level: number, arg1: number, arg2: number, arg3: number): boolean;
    static spriteOccluded(level: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): boolean;
    static spriteOccluded(level: number, arg1: number, arg2: number, arg3: number, arg4?: number, arg5?: number): boolean {
        if (arg4 !== undefined && arg5 !== undefined) {
            if (arg1 !== arg2 || arg3 !== arg4) {
                for (let x: number = arg1; x <= arg2; x++) {
                    for (let z: number = arg3; z <= arg4; z++) {
                        if (World.occlusionCycle![level][x][z] === -World.cycleNo) {
                            return false;
                        }
                    }
                }

                const x0 = (arg1 << 7) + 1;
                const z0: number = (arg3 << 7) + 2;
                const y0: number = World.groundh![level][arg1][arg3] + arg5;
                if (!World.occluded(x0, y0, z0)) {
                    return false;
                }

                const x1: number = (arg2 << 7) - 1;
                if (!World.occluded(x1, y0, z0)) {
                    return false;
                }

                const z1: number = (arg4 << 7) - 1;
                if (!World.occluded(x0, y0, z1)) {
                    return false;
                } else if (World.occluded(x1, y0, z1)) {
                    return true;
                } else {
                    return false;
                }
            } else if (World.groundOccluded(level, arg1, arg3)) {
                const x: number = arg1 << 7;
                const z: number = arg3 << 7;
                return (
                    World.occluded(x + 1, World.groundh![level][arg1][arg3] + arg5, z + 1) &&
                    World.occluded(x + 128 - 1, World.groundh![level][arg1 + 1][arg3] + arg5, z + 1) &&
                    World.occluded(x + 128 - 1, World.groundh![level][arg1 + 1][arg3 + 1] + arg5, z + 128 - 1) &&
                    World.occluded(x + 1, World.groundh![level][arg1][arg3 + 1] + arg5, z + 128 - 1)
                );
            }
            return false;
        }
        if (World.groundOccluded(level, arg1, arg2)) {
            const x: number = arg1 << 7;
            const z: number = arg2 << 7;
            return (
                World.occluded(x + 1, World.groundh![level][arg1][arg2] + arg3, z + 1) &&
                World.occluded(x + 128 - 1, World.groundh![level][arg1 + 1][arg2] + arg3, z + 1) &&
                World.occluded(x + 128 - 1, World.groundh![level][arg1 + 1][arg2 + 1] + arg3, z + 128 - 1) &&
                World.occluded(x + 1, World.groundh![level][arg1][arg2 + 1] + arg3, z + 128 - 1)
            );
        }
        return false;
    }

    static occluded(arg0: number, arg1: number, arg2: number): boolean {
        for (let var3 = 0; var3 < World.numActiveOccluders; var3++) {
            const var4 = World.activeOccluders[var3]!;
            if (var4.mode === 1) {
                const var5 = var4.minX - arg0;
                if (var5 > 0) {
                    const var6 = var4.minZ + ((var4.minDeltaZ * var5) >> 8);
                    const var7 = var4.maxZ + ((var4.maxDeltaZ * var5) >> 8);
                    const var8 = var4.minY + ((var4.minDeltaY * var5) >> 8);
                    const var9 = var4.maxY + ((var4.maxDeltaY * var5) >> 8);
                    if (arg2 >= var6 && arg2 <= var7 && arg1 >= var8 && arg1 <= var9) {
                        return true;
                    }
                }
            } else if (var4.mode === 2) {
                const var10 = arg0 - var4.minX;
                if (var10 > 0) {
                    const var11 = var4.minZ + ((var4.minDeltaZ * var10) >> 8);
                    const var12 = var4.maxZ + ((var4.maxDeltaZ * var10) >> 8);
                    const var13 = var4.minY + ((var4.minDeltaY * var10) >> 8);
                    const var14 = var4.maxY + ((var4.maxDeltaY * var10) >> 8);
                    if (arg2 >= var11 && arg2 <= var12 && arg1 >= var13 && arg1 <= var14) {
                        return true;
                    }
                }
            } else if (var4.mode === 3) {
                const var15 = var4.minZ - arg2;
                if (var15 > 0) {
                    const var16 = var4.minX + ((var4.minDeltaX * var15) >> 8);
                    const var17 = var4.maxX + ((var4.maxDeltaX * var15) >> 8);
                    const var18 = var4.minY + ((var4.minDeltaY * var15) >> 8);
                    const var19 = var4.maxY + ((var4.maxDeltaY * var15) >> 8);
                    if (arg0 >= var16 && arg0 <= var17 && arg1 >= var18 && arg1 <= var19) {
                        return true;
                    }
                }
            } else if (var4.mode === 4) {
                const var20 = arg2 - var4.minZ;
                if (var20 > 0) {
                    const var21 = var4.minX + ((var4.minDeltaX * var20) >> 8);
                    const var22 = var4.maxX + ((var4.maxDeltaX * var20) >> 8);
                    const var23 = var4.minY + ((var4.minDeltaY * var20) >> 8);
                    const var24 = var4.maxY + ((var4.maxDeltaY * var20) >> 8);
                    if (arg0 >= var21 && arg0 <= var22 && arg1 >= var23 && arg1 <= var24) {
                        return true;
                    }
                }
            } else if (var4.mode === 5) {
                const var25 = arg1 - var4.minY;
                if (var25 > 0) {
                    const var26 = var4.minX + ((var4.minDeltaX * var25) >> 8);
                    const var27 = var4.maxX + ((var4.maxDeltaX * var25) >> 8);
                    const var28 = var4.minZ + ((var4.minDeltaZ * var25) >> 8);
                    const var29 = var4.maxZ + ((var4.maxDeltaZ * var25) >> 8);
                    if (arg0 >= var26 && arg0 <= var27 && arg2 >= var28 && arg2 <= var29) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static insideTriangle(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number): boolean {
        if (arg1 < arg2 && arg1 < arg3 && arg1 < arg4) {
            return false;
        } else if (arg1 > arg2 && arg1 > arg3 && arg1 > arg4) {
            return false;
        } else if (arg0 < arg5 && arg0 < arg6 && arg0 < arg7) {
            return false;
        } else if (arg0 > arg5 && arg0 > arg6 && arg0 > arg7) {
            return false;
        } else {
            const var8 = (arg1 - arg2) * (arg6 - arg5) - (arg0 - arg5) * (arg3 - arg2);
            const var9 = (arg1 - arg4) * (arg5 - arg7) - (arg0 - arg7) * (arg2 - arg4);
            const var10 = (arg1 - arg3) * (arg7 - arg6) - (arg0 - arg6) * (arg4 - arg3);
            return var8 * var10 > 0 && var10 * var9 > 0;
        }
    }

    static adjustHslLightness(arg0: number, arg1: number): number {
        let var2 = (arg1 * (arg0 & 0x7f)) >> 7;
        if (var2 < 2) {
            var2 = 2;
        } else if (var2 > 126) {
            var2 = 126;
        }
        return (arg0 & 0xff80) + var2;
    }
}
