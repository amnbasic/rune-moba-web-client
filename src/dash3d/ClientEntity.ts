import SeqType from '#/config/SeqType.js';

import ModelSource from '#/dash3d/ModelSource.js';
import JagString from '#/jstring/JagString.js';

// jag::oldscape::ClientEntity
export default abstract class ClientEntity extends ModelSource {
    x: number = 0;
    z: number = 0;
    yaw: number = 0;
    needsForwardDrawPadding: boolean = false;
    size: number = 1;
    readyanim: number = -1;
    turnleftanim: number = -1;
    turnrightanim: number = -1;
    walkanim: number = -1;
    walkanim_b: number = -1;
    walkanim_l: number = -1;
    walkanim_r: number = -1;
    runanim: number = -1;
    chat: JagString | null = null;
    chatTimer: number = 100;
    chatColour: number = 0;
    chatEffect: number = 0;
    damageValues: Int32Array = new Int32Array(4);
    damageTypes: Int32Array = new Int32Array(4);
    damageCycles: Int32Array = new Int32Array(4);
    combatCycle: number = -1000;
    targetId: number = -1;
    targetTileX: number = 0;
    targetTileZ: number = 0;
    secondarySeqId: number = -1;
    secondarySeqFrame: number = 0;
    secondarySeqCycle: number = 0;
    primarySeqId: number = -1;
    primarySeqFrame: number = 0;
    primarySeqCycle: number = 0;
    primarySeqDelay: number = 0;
    primarySeqLoop: number = 0;
    spotanimId: number = -1;
    spotanimFrame: number = 0;
    spotanimCycle: number = 0;
    spotanimLastCycle: number = 0;
    spotanimHeight: number = 0;
    exactStartX: number = 0;
    exactEndX: number = 0;
    exactStartZ: number = 0;
    exactEndZ: number = 0;
    exactMoveEnd: number = 0;
    exactMoveStart: number = 0;
    exactMoveFacing: number = 0;
    cycle: number = 0;
    height: number = -32768;
    dstYaw: number = 0;
    turnCycle: number = 0;
    turnspeed: number = 32;
    routeLength: number = 0;
    routeX: Int32Array = new Int32Array(10);
    routeZ: Int32Array = new Int32Array(10);
    routeRun: boolean[] = new Array(10).fill(false);
    animDelayMove: number = 0;
    preanimRouteLength: number = 0;

    // todo: sort
    y: number = 0;
    field4109: number = 0; // current hitpoints (464 sends raw HP; bar width = cur*30/max at draw)
    maxHealth: number = 30;

    // MOBA continuous combat plane (opcode-210/211/215 fine-pos stream): while true, the
    // render position comes from FineStream.interpolate and the walk interpolator is
    // bypassed. Stream state is ABSOLUTE fine coords (128 units/tile), rebuild-safe.
    fineStreamed: boolean = false;
    fineStreamFromX: number = 0;
    fineStreamFromZ: number = 0;
    fineStreamToX: number = 0;
    fineStreamToZ: number = 0;
    fineStreamStartCycle: number = 0;

    // jag::oldscape::ClientNpc::Teleport
    teleport(arg0: boolean, arg1: number, arg2: number): void {
        if (this.primarySeqId !== -1 && SeqType.list(this.primarySeqId).postanim_move === 1) {
            this.primarySeqId = -1;
        }

        if (!arg0) {
            const var4 = arg1 - this.routeX[0];
            const var5 = arg2 - this.routeZ[0];

            if (var4 >= -8 && var4 <= 8 && var5 >= -8 && var5 <= 8) {
                if (this.routeLength < 9) {
                    this.routeLength++;
                }

                for (let var6 = this.routeLength; var6 > 0; var6--) {
                    this.routeX[var6] = this.routeX[var6 - 1];
                    this.routeZ[var6] = this.routeZ[var6 - 1];
                    this.routeRun[var6] = this.routeRun[var6 - 1];
                }

                this.routeRun[0] = false;
                this.routeX[0] = arg1;
                this.routeZ[0] = arg2;
                return;
            }
        }

        this.routeX[0] = arg1;
        this.routeZ[0] = arg2;
        this.preanimRouteLength = 0;
        this.z = this.size * 64 + this.routeZ[0] * 128;
        this.animDelayMove = 0;
        this.x = this.size * 64 + this.routeX[0] * 128;
        this.routeLength = 0;
    }

    // jag::oldscape::ClientNpc::MoveCode
    moveCode(arg0: boolean, arg1: number): void {
        let var3 = this.routeX[0];
        let var4 = this.routeZ[0];

        if (this.primarySeqId !== -1 && SeqType.list(this.primarySeqId).postanim_move === 1) {
            this.primarySeqId = -1;
        }

        if (this.routeLength < 9) {
            this.routeLength++;
        }

        for (let var5 = this.routeLength; var5 > 0; var5--) {
            this.routeX[var5] = this.routeX[var5 - 1];
            this.routeZ[var5] = this.routeZ[var5 - 1];
            this.routeRun[var5] = this.routeRun[var5 - 1];
        }

        this.routeRun[0] = arg0;

        if (arg1 === 0) {
            var4++;
            var3--;
        }
        if (arg1 === 1) {
            var4++;
        }
        if (arg1 === 2) {
            var3++;
            var4++;
        }
        if (arg1 === 3) {
            var3--;
        }
        if (arg1 === 4) {
            var3++;
        }
        if (arg1 === 5) {
            var4--;
            var3--;
        }
        if (arg1 === 6) {
            var4--;
        }
        if (arg1 === 7) {
            var3++;
            var4--;
        }

        this.routeX[0] = var3;
        this.routeZ[0] = var4;
    }

    // jag::oldscape::ClientEntity::AbortRoute
    abortRoute(): void {
        this.routeLength = 0;
        this.preanimRouteLength = 0;
    }

    // jag::oldscape::ClientEntity::Ready
    ready(): boolean {
        return false;
    }

    // jag::oldscape::ClientEntity::AddHeadbar
    addHitmark(arg0: number, arg1: number, arg2: number): void {
        for (let var4 = 0; var4 < 4; var4++) {
            if (this.damageCycles[var4] <= arg0) {
                this.damageValues[var4] = arg2;
                this.damageTypes[var4] = arg1;
                this.damageCycles[var4] = arg0 + 70;
                return;
            }
        }
    }

    getHeight(): number {
        return this.height === -32768 ? 200 : -this.height;
    }
}
