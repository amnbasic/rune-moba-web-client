import ObjType from '#/config/ObjType.js';
import SpotType from '#/config/SpotType.js';
import SeqType from '#/config/SeqType.js';
import { Client } from '#/client/Client.js';

import JagString from '#/jstring/JagString.js';

import ClientEntity from '#/dash3d/ClientEntity.js';
import type ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import ModelSourceCache from '#/dash3d/ModelSourceCache.js';
import type { SceneTag } from '#/dash3d/ModelSource.js';
import PlayerModel from '#/dash3d/PlayerModel.js';
import Pix3D from '#/dash3d/Pix3D.js';
import SoftwareModelLit from '#/dash3d/SoftwareModelLit.js';

import Packet from '#/io/Packet.js';

export default class ClientPlayer extends ClientEntity {
    name: string | null = null;
    model: PlayerModel | null = null;
    headiconPk: number = -1;
    headiconPrayer: number = -1;
    combatLevel: number = 0;
    skillLevel: number = 0;
    mobaTeam: number = 0; // MOBA fog: custom team byte from the appearance tail (0/1/2)
    locStartCycle: number = 0;
    locEndCycle: number = 0;
    locOffsetX: number = 0;
    locOffsetY: number = 0;
    locOffsetZ: number = 0;
    locModel: ModelLit | null = null;
    minTileX: number = 0;
    minTileZ: number = 0;
    maxTileX: number = 0;
    maxTileZ: number = 0;
    lowMem: boolean = false;
    team: number = 0;

    // todo: identify and sort
    field761: number = 0;
    field769: number = 0;
    static field1956: ModelSourceCache = new ModelSourceCache(4);

    // jag::oldscape::ClientPlayer::SetAppearance
    setAppearance(buf: Packet): void {
        buf.pos = 0;
        // 464 appearance header: gender(u8), skull(u8=-1), prayer(u8) — NOT a rev-500 flags byte
        // (which packed gender/size/model-scale). Players are always size 1 with no per-appearance scale.
        const var3 = buf.g1(); // gender
        this.size = 1;
        this.field761 = 0;
        this.field769 = 0;
        const var4 = true; // 464 always writes the trailing skill-total short
        let var5 = -1;
        this.headiconPk = buf.g1b();
        const var6 = new Int32Array(12);
        this.headiconPrayer = buf.g1b();
        this.team = 0;
        for (let var7 = 0; var7 < 12; var7++) {
            const var8 = buf.g1();
            if (var8 === 0) {
                var6[var7] = 0;
            } else {
                const var9 = buf.g1();
                const var10 = var9 + (var8 << 8);
                if (var7 === 0 && var10 === 65535) {
                    var5 = buf.g2();
                    break;
                }
                if (var10 >= 512) {
                    // 464 worn item = 0x200 + RAW obj id (rev-500 used 0x8000 + a wearable[] remap
                    // table; indexing that table with a raw id gave garbage -> invisible equipment).
                    const var11 = var10 - 512;
                    var6[var7] = var11 | 0x40000000;
                    const var12 = ObjType.list(var11).team;
                    if (var12 !== 0) {
                        this.team = var12;
                    }
                } else {
                    var6[var7] = -2147483648 | (var10 - 256);
                }
            }
        }
        const var13 = new Int32Array(5);
        for (let var14 = 0; var14 < 5; var14++) {
            let var15 = buf.g1();
            if (var15 < 0 || var15 >= PlayerModel.recol1d[var14].length) {
                var15 = 0;
            }
            var13[var14] = var15;
        }
        this.readyanim = buf.g2();
        if (this.readyanim === 65535) {
            this.readyanim = -1;
        }
        this.turnleftanim = buf.g2();
        if (this.turnleftanim === 65535) {
            this.turnleftanim = -1;
        }
        this.turnrightanim = this.turnleftanim;
        this.walkanim = buf.g2();
        if (this.walkanim === 65535) {
            this.walkanim = -1;
        }
        this.walkanim_b = buf.g2();
        if (this.walkanim_b === 65535) {
            this.walkanim_b = -1;
        }
        this.walkanim_l = buf.g2();
        if (this.walkanim_l === 65535) {
            this.walkanim_l = -1;
        }
        this.walkanim_r = buf.g2();
        if (this.walkanim_r === 65535) {
            this.walkanim_r = -1;
        }
        this.runanim = buf.g2();
        if (this.runanim === 65535) {
            this.runanim = -1;
        }
        this.name = JagString.toRawUsername(buf.g8())!.toScreenName().toString();
        this.combatLevel = buf.g1();
        if (var4) {
            this.skillLevel = buf.g2();
        } else {
            this.skillLevel = 0;
        }
        // MOBA fog of war: custom team byte appended after the vanilla tail (%champ_team;
        // 0 none, 1 red, 2 green) — guarded so vanilla servers without it still parse.
        this.mobaTeam = buf.pos < buf.data.length ? buf.g1() : 0;
        if (this.model === null) {
            this.model = new PlayerModel();
        }
        this.model.setAppearance(var5, var6, var13, var3 === 1);
    }

    static method897(arg0: ModelLit, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): ModelLit | null {
        const var6 = BigInt(arg3);
        let var8 = ClientPlayer.field1956.find(var6) as ModelLit | null;
        if (var8 === null) {
            const var9 = ModelUnlit.load(Client.models!, arg3);
            if (var9 === null) {
                return null;
            }
            var8 = var9.light(64, 768, -50, -10, -50);
            ClientPlayer.field1956.put(var6, var8);
        }

        const var10 = arg0.method194();
        const var11 = arg0.method196();
        const var12 = arg0.method186();
        const var13 = arg0.method198();
        const var14 = var8.copyForAnim2(true, true);
        if (arg4 !== 0) {
            var14.method188(arg4);
        }
        const var15 = var14 as SoftwareModelLit;
        if (arg5 !== Client.getAvH(var10 + arg2, arg1 + var12, Client.minusedlevel) || Client.getAvH(var11 + arg2, var13 + arg1, Client.minusedlevel) !== arg5) {
            for (let var16 = 0; var16 < var15.numPoints; var16++) {
                var15.pointY![var16] += Client.getAvH(arg2 + var15.pointX![var16], var15.pointZ![var16] - -arg1, Client.minusedlevel) - arg5;
            }
            var15.boundsCalculated = false;
        }
        return var14;
    }

    method286(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number, arg9: ModelLit, arg10: number, arg11: number): void {
        const var13 = arg11 * arg11 + arg6 * arg6;
        if (var13 < 16 || var13 > 360000) {
            return;
        }
        const var14 = (Math.atan2(arg11, arg6) * 325.949) & 0x7ff;
        const var15 = ClientPlayer.method897(arg9, this.z, this.x, arg8, var14, this.y);
        if (var15 !== null) {
            var15.method87(0, arg3, arg0, arg1, arg7, arg4, arg10, arg2, -1);
        }
    }

    override method87(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: SceneTag): void {
        if (this.model === null) {
            return;
        }

        const var11: SeqType | null = this.primarySeqId !== -1 && this.primarySeqDelay === 0 ? SeqType.list(this.primarySeqId) : null;
        const var12: SeqType | null = this.secondarySeqId === -1 || this.lowMem || (this.secondarySeqId === this.readyanim && var11 !== null) ? null : SeqType.list(this.secondarySeqId);
        let var13 = this.model.getTempModel(var12, this.primarySeqFrame, this.secondarySeqFrame, var11);
        if (var13 === null) {
            return;
        }

        this.height = var13.method88();

        if (Client.localPlayer === this) {
            for (let var14 = Client.field1171.length - 1; var14 >= 0; var14--) {
                const var15 = Client.field1171[var14];
                if (var15 !== null && var15.field2136 !== -1) {
                    if (var15.hintType === 1 && var15.hintTarget >= 0 && Client.npc.length > var15.hintTarget) {
                        const var16 = Client.npc[var15.hintTarget];
                        if (var16 !== null) {
                            const var17 = ((var16.x / 32) | 0) - ((Client.localPlayer!.x / 32) | 0);
                            const var18 = ((var16.z / 32) | 0) - ((Client.localPlayer!.z / 32) | 0);
                            this.method286(arg2, arg3, arg7, arg1, arg5, arg0, var18, arg4, var15.field2136, var13, arg6, var17);
                        }
                    }
                    if (var15.hintType === 2) {
                        const var19 = (var15.hintTileX - Client.mapBuildBaseX) * 4 + 2 - ((Client.localPlayer!.x / 32) | 0);
                        const var20 = (var15.hintTileZ - Client.mapBuildBaseZ) * 4 + 2 - ((Client.localPlayer!.z / 32) | 0);
                        this.method286(arg2, arg3, arg7, arg1, arg5, arg0, var20, arg4, var15.field2136, var13, arg6, var19);
                    }
                    if (var15.hintType === 10 && var15.hintTarget >= 0 && var15.hintTarget < Client.players.length) {
                        const var21 = Client.players[var15.hintTarget];
                        if (var21 !== null) {
                            const var22 = ((var21.x / 32) | 0) - ((Client.localPlayer!.x / 32) | 0);
                            const var23 = ((var21.z / 32) | 0) - ((Client.localPlayer!.z / 32) | 0);
                            this.method286(arg2, arg3, arg7, arg1, arg5, arg0, var23, arg4, var15.field2136, var13, arg6, var22);
                        }
                    }
                }
            }
        }

        let var24 = 0;
        let var25 = 0;
        let var26 = 0;
        if (this.field769 !== 0 && this.field761 !== 0) {
            const var27 = Pix3D.sinTable[arg0];
            const var28 = this.field769;
            const var29 = Pix3D.cosTable[arg0];
            const var30 = this.field761;
            const var31 = (-var28 / 2) | 0;
            const var32 = (-var30 / 2) | 0;
            const var33 = (var28 / 2) | 0;
            const var34 = (var27 * var32 + var31 * var29) >> 16;
            const var35 = (var32 * var29 - var27 * var31) >> 16;
            const var36 = Client.getAvH(var34 + this.x, this.z + var35, Client.minusedlevel);
            const var37 = (-var30 / 2) | 0;
            const var38 = (var33 * var29 + var27 * var37) >> 16;
            const var39 = (var37 * var29 - var33 * var27) >> 16;
            const var40 = Client.getAvH(this.x + var38, var39 + this.z, Client.minusedlevel);
            const var41 = (var30 / 2) | 0;
            const var42 = (-var28 / 2) | 0;
            const var43 = (var29 * var41 - var27 * var42) >> 16;
            const var44 = (var29 * var42 + var27 * var41) >> 16;
            const var45 = Client.getAvH(this.x + var44, this.z + var43, Client.minusedlevel);
            const var46 = (var28 / 2) | 0;
            const var47 = (var30 / 2) | 0;
            const var48 = (var29 * var47 - var27 * var46) >> 16;
            const var49 = (var29 * var46 + var27 * var47) >> 16;
            const var50 = Client.getAvH(var49 + this.x, this.z + var48, Client.minusedlevel);
            let var51 = var36 + var50;
            if (var40 + var45 < var51) {
                var51 = var45 + var40;
            }
            const var52 = var40 <= var36 ? var40 : var36;
            const var53 = var50 <= var45 ? var50 : var45;
            var24 = (Math.atan2(var52 - var53, var30) * 325.95) & 0x7ff;
            if (var24 !== 0) {
                var13.rotateXAxis(var24);
            }
            const var54 = var50 <= var40 ? var50 : var40;
            const var55 = var45 <= var36 ? var45 : var36;
            var25 = (Math.atan2(var55 - var54, var28) * 325.95) & 0x7ff;
            if (var25 !== 0) {
                var13.method191(var25);
            }
            var26 = (var51 >> 1) - this.y;
            if (var26 !== 0) {
                var13.translate(0, var26, 0);
            }
        }

        let var56: ModelLit | null = null;
        if (!this.lowMem && this.spotanimId !== -1 && this.spotanimFrame !== -1) {
            const var57 = SpotType.list(this.spotanimId);
            var56 = var57.getTempModel2(this.spotanimFrame);
            if (var56 !== null) {
                var56.translate(0, -this.spotanimHeight, 0);
                if (var57.hillskew) {
                    if (var24 !== 0) {
                        var56.rotateXAxis(var24);
                    }
                    if (var25 !== 0) {
                        var56.method191(var25);
                    }
                    if (var26 !== 0) {
                        var56.translate(0, var26, 0);
                    }
                }
            }
        }

        let var58: ModelLit | null = null;
        if (!this.lowMem && this.locModel != null) {
            if (this.locEndCycle <= Client.loopCycle) {
                this.locModel = null;
            }
            if (this.locStartCycle <= Client.loopCycle && this.locEndCycle > Client.loopCycle) {
                var58 = this.locModel!;
                var58.translate(this.locOffsetX - this.x, this.locOffsetY + -this.y, this.locOffsetZ - this.z);
                if (this.dstYaw === 512) {
                    var58.rotate270();
                } else if (this.dstYaw === 1024) {
                    var58.rotate180();
                } else if (this.dstYaw === 1536) {
                    var58.rotate90();
                }
            }
        }

        if (var56 !== null) {
            var13 = (var13 as SoftwareModelLit).method850(var56);
        }
        if (var58 !== null) {
            var13 = (var13 as SoftwareModelLit).method850(var58);
        }
        var13.useAABBMouseCheck = true;
        var13.method87(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);

        if (var58 === null) {
            return;
        }
        if (this.dstYaw === 512) {
            var58.rotate90();
        } else if (this.dstYaw === 1024) {
            var58.rotate180();
        } else if (this.dstYaw === 1536) {
            var58.rotate270();
        }
        var58.translate(this.x - this.locOffsetX, -this.locOffsetY + this.y, this.z - this.locOffsetZ);
    }

    override method88(): number {
        return this.height;
    }

    // jag::oldscape::ClientPlayer::Ready
    override ready(): boolean {
        return this.model !== null;
    }
}
