import IdkType from '#/config/IdkType.js';
import NpcType from '#/config/NpcType.js';
import ObjType from '#/config/ObjType.js';
import SeqType from '#/config/SeqType.js';

import type ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import ModelSourceCache from '#/dash3d/ModelSourceCache.js';
import RecolsRunescape from '#/dash3d/RecolsRunescape.js';

import Packet from '#/io/Packet.js';

// jag::oldscape::rs2lib::PlayerModel
export default class PlayerModel {
    appearance: Int32Array = new Int32Array(12);
    colour: Int32Array = new Int32Array(5);
    gender: boolean = false;
    transmog: number = 0;
    baseId: bigint = 0n;

    // jag::oldscape::rs2lib::PlayerModel::m_headModelHashToModelCacheID
    headModelHashToModelCacheID: bigint = 0n;

    // jag::oldscape::rs2lib::PlayerModel::m_recol1s
    static recol1s: number[] = RecolsRunescape.recol1s;

    // jag::oldscape::rs2lib::PlayerModel::m_recol1d
    static recol1d: number[][] = RecolsRunescape.recol1d;

    // jag::oldscape::rs2lib::PlayerModel::m_recol2s
    static recol2s: number[] = RecolsRunescape.recol2s;

    // jag::oldscape::rs2lib::PlayerModel::m_recol2d
    static recol2d: number[][] = RecolsRunescape.recol2d;

    // jag::oldscape::rs2lib::PlayerModel::m_basePartMap
    static readonly basePartMap: number[] = [8, 11, 4, 6, 9, 7, 10];

    // jag::oldscape::rs2lib::PlayerModel::m_modelCache
    static modelCache: ModelSourceCache = new ModelSourceCache(260);

    static field2616: ModelSourceCache = new ModelSourceCache(5);

    // jag::oldscape::rs2lib::PlayerModel::SetAppearance
    setAppearance(arg0: number, arg1: Int32Array | null, arg2: Int32Array, arg3: boolean): void {
        if (arg1 === null) {
            arg1 = new Int32Array(12);
            for (let var5: number = 0; var5 < 7; var5++) {
                for (let var6: number = 0; var6 < IdkType.numDefinitions; var6++) {
                    const var7: IdkType = IdkType.list(var6);
                    if (var7 !== null && !var7.disable && var5 + (arg3 ? 7 : 0) === var7.type) {
                        arg1[PlayerModel.basePartMap[var5]] = var6 | -2147483648;
                        break;
                    }
                }
            }
        }
        this.appearance = arg1;
        this.colour = arg2;
        this.gender = arg3;
        this.transmog = arg0;
        this.calcBaseId();
    }

    /** 464 seq replaceheld wire value -> internal appearance encoding (0=hide, 256+idk, 512+obj) */
    private static seqReplaceValue(v: number): number {
        if (v >= 512) {
            return (v - 512) | 0x40000000;
        }
        if (v >= 256) {
            return (v - 256) | -2147483648;
        }
        return 0; // 0 (and any invalid low value) = hide the slot
    }

    // jag::oldscape::rs2lib::PlayerModel::IdkChangePart
    idkChangePart(arg0: number, arg1: number): void {
        const var3 = PlayerModel.basePartMap[arg0];
        if (this.appearance[var3] !== 0 && IdkType.list(arg1) !== null) {
            this.appearance[var3] = -2147483648 | arg1;
            this.calcBaseId();
        }
    }

    // jag::oldscape::rs2lib::PlayerModel::IdkChangeColour
    idkChangeColour(arg0: number, arg1: number): void {
        this.colour[arg1] = arg0;
        this.calcBaseId();
    }

    // jag::oldscape::rs2lib::PlayerModel::IdkChangeBodytype
    idkChangeGender(arg0: boolean): void {
        this.gender = arg0;
        this.calcBaseId();
    }

    // jag::oldscape::rs2lib::PlayerModel::CalcBaseId
    calcBaseId(): void {
        const var1: bigint = this.baseId;
        this.baseId = -1n;
        const var3 = Packet.crctable64;
        for (let var4: number = 0; var4 < 12; var4++) {
            this.baseId = var3[Number((BigInt(this.appearance[var4] >> 24) ^ this.baseId) & 0xffn)] ^ (BigInt.asUintN(64, this.baseId) >> 8n);
            this.baseId = (BigInt.asUintN(64, this.baseId) >> 8n) ^ var3[Number((BigInt(this.appearance[var4] >> 16) ^ this.baseId) & 0xffn)];
            this.baseId = (BigInt.asUintN(64, this.baseId) >> 8n) ^ var3[Number((BigInt(this.appearance[var4] >> 8) ^ this.baseId) & 0xffn)];
            this.baseId = (BigInt.asUintN(64, this.baseId) >> 8n) ^ var3[Number((BigInt(this.appearance[var4]) ^ this.baseId) & 0xffn)];
        }
        for (let var5: number = 0; var5 < 5; var5++) {
            this.baseId = var3[Number((BigInt(this.colour[var5]) ^ this.baseId) & 0xffn)] ^ (BigInt.asUintN(64, this.baseId) >> 8n);
        }
        this.baseId = var3[Number((this.baseId ^ BigInt(this.gender ? 1 : 0)) & 0xffn)] ^ (BigInt.asUintN(64, this.baseId) >> 8n);
        if (var1 !== 0n && var1 !== this.baseId) {
            PlayerModel.modelCache.remove(var1);
        }
    }

    // jag::oldscape::rs2lib::PlayerModel::GetTempModel
    getTempModel(arg0: SeqType | null, arg1: number, arg2: number, arg3: SeqType | null): ModelLit | null {
        if (this.transmog !== -1) {
            return NpcType.list(this.transmog).getTempModel(arg0, arg2, arg1, arg3);
        }
        let var5: bigint = this.baseId;
        let var7: Int32Array = this.appearance;
        if (arg3 !== null && (arg3.replaceheldleft >= 0 || arg3.replaceheldright >= 0)) {
            var7 = new Int32Array(12);
            for (let var8 = 0; var8 < 12; var8++) {
                var7[var8] = this.appearance[var8];
            }
            // 464 seq replaceheld values use the appearance-slot encoding (Java PlayerAppearance
            // stores them RAW into the array): 0/65535 = hide, 256+idkId, 512+objId. rev-500
            // treated them as raw obj ids -> invalid model -> e.g. no axe shown during
            // inventory-axe woodcutting.
            if (arg3.replaceheldleft >= 0) {
                var7[5] = PlayerModel.seqReplaceValue(arg3.replaceheldleft);
                var5 ^= var7[5] === 0 ? 0xffffffff00000000n : BigInt(var7[5]) << 32n;
            }
            if (arg3.replaceheldright >= 0) {
                var7[3] = PlayerModel.seqReplaceValue(arg3.replaceheldright);
                var5 ^= var7[3] === 0 ? 0xffffffffn : BigInt(var7[3]);
            }
        }
        let var9 = PlayerModel.modelCache.find(var5) as ModelLit | null;
        if (var9 === null) {
            let var10 = false;
            for (let var11 = 0; var11 < 12; var11++) {
                const var12 = var7[var11];
                if ((var12 & 0x40000000) === 0) {
                    if ((-2147483648 & var12) !== 0 && !IdkType.list(var12 & 0x3fffffff).checkHead()) {
                        var10 = true;
                    }
                } else if (!ObjType.list(var12 & 0x3fffffff).checkWearModel(this.gender)) {
                    var10 = true;
                }
            }
            if (var10) {
                if (this.headModelHashToModelCacheID !== -1n) {
                    var9 = PlayerModel.modelCache.find(this.headModelHashToModelCacheID) as ModelLit | null;
                }
                if (var9 === null) {
                    return null;
                }
            }
            if (var9 === null) {
                const var13 = new Array(12).fill(null) as (ModelUnlit | null)[];
                let var14 = 0;
                for (let var15 = 0; var15 < 12; var15++) {
                    const var16 = var7[var15];
                    if ((var16 & 0x40000000) !== 0) {
                        const var17 = ObjType.list(var16 & 0x3fffffff).getWearModelNoCheck(this.gender);
                        if (var17 !== null) {
                            var13[var14++] = var17;
                        }
                    } else if ((-2147483648 & var16) !== 0) {
                        const var18 = IdkType.list(var16 & 0x3fffffff).getModelNoCheck();
                        if (var18 !== null) {
                            var13[var14++] = var18;
                        }
                    }
                }
                const var19 = var7[0];
                if ((var19 & 0x40000000) !== 0) {
                    const var20 = ObjType.list(var19 & 0x3fffffff);
                    if (var20.field2839 !== null) {
                        for (let var21 = 0; var21 < var20.field2839.length; var21++) {
                            const var22 = var20.field2839[var21][1];
                            const var23 = var20.field2839[var21][3];
                            const var24 = var20.field2839[var21][0];
                            const var25 = var20.field2839[var21][2];
                            const var26 = var20.field2839[var21][4];
                            const var27 = var20.field2839[var21][5];
                            var13[var21 + 1]!.translate(var24, var22, var25);
                            var13[var21 + 1]!.method565(var23, var26, var27);
                        }
                    }
                }
                const var28 = new ModelUnlit(var13, var14);
                for (let var29 = 0; var29 < 5; var29++) {
                    if (this.colour[var29] < PlayerModel.recol1d[var29].length) {
                        var28.recolour(PlayerModel.recol1s[var29], PlayerModel.recol1d[var29][this.colour[var29]]);
                    }
                    if (PlayerModel.recol2d[var29].length > this.colour[var29]) {
                        var28.recolour(PlayerModel.recol2s[var29], PlayerModel.recol2d[var29][this.colour[var29]]);
                    }
                }
                var9 = var28.light(64, 850, -30, -50, -30);
                PlayerModel.modelCache.put(var5, var9);
                this.headModelHashToModelCacheID = var5;
            }
        }
        if (arg3 === null && arg0 === null) {
            return var9;
        }
        let var30: ModelLit;
        if (arg3 !== null && arg0 !== null) {
            var30 = arg3.splitAnimateModel(arg1, arg0, arg2, var9);
        } else if (arg3 === null) {
            var30 = arg0!.animateModel(arg2, var9);
        } else {
            var30 = arg3.animateModel(arg1, var9);
        }
        return var30;
    }

    // jag::oldscape::rs2lib::PlayerModel::GetHeadModel
    getHeadModel(arg0: SeqType | null = null, arg1: number = 0): ModelLit | null {
        if (this.transmog !== -1) {
            return NpcType.list(this.transmog).getHead(arg1, arg0);
        }

        let var3 = PlayerModel.field2616.find(this.baseId) as ModelLit | null;
        if (var3 === null) {
            let var4 = false;
            for (let var5 = 0; var5 < 12; var5++) {
                const var6 = this.appearance[var5];
                if ((var6 & 0x40000000) === 0) {
                    if ((var6 & -2147483648) !== 0 && !IdkType.list(var6 & 0x3fffffff).checkModel()) {
                        var4 = true;
                    }
                } else if (!ObjType.list(var6 & 0x3fffffff).checkHeadModel(this.gender)) {
                    var4 = true;
                }
            }
            if (var4) {
                return null;
            }
            let var7 = 0;
            const var8 = new Array(12).fill(null) as (ModelUnlit | null)[];
            for (let var9 = 0; var9 < 12; var9++) {
                const var10 = this.appearance[var9];
                if ((var10 & 0x40000000) !== 0) {
                    const var12 = ObjType.list(var10 & 0x3fffffff).getHeadModelNoCheck(this.gender);
                    if (var12 !== null) {
                        var8[var7++] = var12;
                    }
                } else if ((var10 & -2147483648) !== 0) {
                    const var11 = IdkType.list(var10 & 0x3fffffff).getHeadNoCheck();
                    if (var11 !== null) {
                        var8[var7++] = var11;
                    }
                }
            }
            const var13 = new ModelUnlit(var8, var7);
            for (let var14 = 0; var14 < 5; var14++) {
                if (this.colour[var14] < PlayerModel.recol1d[var14].length) {
                    var13.recolour(PlayerModel.recol1s[var14], PlayerModel.recol1d[var14][this.colour[var14]]);
                }
                if (this.colour[var14] < PlayerModel.recol2d[var14].length) {
                    var13.recolour(PlayerModel.recol2s[var14], PlayerModel.recol2d[var14][this.colour[var14]]);
                }
            }
            var3 = var13.light(64, 768, -50, -10, -50);
            PlayerModel.field2616.put(this.baseId, var3);
        }
        if (arg0 !== null) {
            var3 = arg0.animateModelWithExtra(arg1, var3);
        }
        return var3;
    }

    method1427(): number {
        return this.transmog === -1 ? (this.appearance[11] << 5) + (this.colour[0] << 25) + (this.colour[4] << 20) + (this.appearance[0] << 15) + (this.appearance[8] << 10) + this.appearance[1] : 305419896 - -NpcType.list(this.transmog).id;
    }

    // jag::oldscape::rs2lib::PlayerModel::ResetCache
    static resetCache(): void {
        PlayerModel.modelCache.clear();
    }
}
