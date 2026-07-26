export default class Statics {
    // 464 server->client packet sizes (from Java AppletListener.anIntArray1465, via the busted
    // client-ts Protocol.ts). >=0 fixed body, -1 = 1-byte length (VAR_BYTE), -2 = BE u16 length
    // (VAR_SHORT). Indexed by the 464 opcode on the wire. Replaces the rev-500 table so packet
    // boundaries match this RuneJS server. Extracted verbatim (tools/extract, no hand-transcription).
    static readonly field224: number[] = [
        4, 10, 4, 0, 0, 2, 0, 0, 4, 6, 0, 0, 0, 0, 0, 6, 2, 4, 0, 0, 0, 0, 0, -1, 0, 0, 7, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 0, 3,
        5, 0, 0, 0, 0, 0, 0, -2, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 6, 0, 0, 0, 0, 0, -2, 0, 0, -1, 0, 0, -2, 0, 2, 0, -2,
        0, 0, 6, -1, 0, 0, 5, 0, 1, -1, -2, 0, -2, 0, 0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 11, 0, 0, 0, -1, 0, 0, 0, 5, 6, 10, 0, 0, 0, 0, 0,
        -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 4, 0, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 2,
        6, 0, 0, 1, 0, 0, 6, 0, 2, 0, 0, 0, 0, 4, -2, 0, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        // opcodes 210-216 = MOBA fine-plane custom server->client packets (fine-pos glide, missiles,
        // debug overlay) sent directly to the socket when fine-move/combat is active. Standard 464
        // leaves them size 0; without the true size the client mis-frames them and desyncs the whole
        // incoming stream -> "Connection destroyed". Sizes: 210 FINE_POS=10, 211 LOCAL_FINE_POS=8,
        // 212 MISSILE_SPAWN=23 (audit: server writes 23B — SHORT+4xINT+SHORT+SHORT+BYTE; the old 20
        // desynced 3 bytes per skillshot), 213 MISSILE_DETONATE=14, 215 REMOTE_FINE_POS=10, 216
        // DEBUG_OVERLAY=1. These are read + skipped (no handler -> sentinel); glide render is later.
        0, 8, 0, 0, 0, 0, 0, 6, 7, 0, 10, 8, 23, 14, -2, 10, 1, 0, 17, 0, 0, -2, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 3, 7, 14,
        0, 0, 0, 0, 6, 3, 0, 0, 0, 0, 0, 0, -2, 0, 12, 0
    ];

    // Translate a 464 server->client opcode to the rev-500 opcode the tcpInInner dispatch chain
    // expects. Only render/HUD-critical packets are mapped; unmapped -> 5000 sentinel, which no
    // dispatch branch matches, so the packet is consumed (field224 gave the right size) and skipped,
    // keeping the stream in sync. Bodies of mapped packets may still mis-parse until the S5/S6 body
    // reorders land, but framing stays correct.
    static readonly serverOpcode464to500: number[] = (() => {
        const m: number[] = new Array(256).fill(5000);
        m[221] = 79; // rebuild normal
        m[222] = 21; // rebuild region
        m[90] = 116; // player sync
        m[174] = 19; // npc sync
        m[245] = 11; // varp small
        m[37] = 72; // varp large
        m[68] = 70; // varp reset
        // Interface (if3) packets. 464 if_open (238) packs its target as (childSlot << 16) | window,
        // but LC500's IfType.get() wants (group << 16) | file, so the opcode-25 handler swaps the two
        // 16-bit words (without the swap, group=64 -> openInterface(64) alloc'd huge -> browser OOM).
        m[238] = 25; // if_open (sub) — word-swapped in handler
        m[137] = 4137; // if_close — 464 body [i32 BE hash] + inbound-71 ack
        m[47] = 4047; // if_settext — 464 body [i32 ME1 hash][string]
        m[69] = 53; // if_runscript — 464 layout matches the rev-500 handler exactly
        m[254] = 4254; // access mask (IF_SETEVENTS) — enables component right-click options
        // zone protocol (ground items, dynamic locs, projectiles, tile spotanims)
        m[132] = 4132; // zone anchor — 464 sends Z FIRST, raw bytes
        m[159] = 4159; // clear zone
        m[112] = 4112; // ground item add
        m[39] = 4039; // ground item remove
        m[17] = 4017; // loc add
        m[16] = 4016; // loc remove
        m[186] = 4186; // map spotanim
        m[218] = 4218; // projectile
        // component content setters (item/model displays, chatheads, colour, hide, player options)
        m[114] = 4114; // item/obj on component (interface item displays, e.g. equip-stats)
        m[207] = 4207; // npc head on component (dialogue chathead)
        m[8] = 4008; // player head on component (dialogue chathead)
        m[9] = 4009; // raw model on component
        m[63] = 4063; // seq anim on component
        m[244] = 4244; // component colour
        m[142] = 4142; // component hide/show
        m[72] = 4072; // player right-click option
        // NOTE: move-child (201) left unmapped -> size-skipped (needs layout plumbing; deferred)
        // cutscene camera + hints + PM/friends (rev-500 handler bodies verified byte-identical
        // to the 464 wire except where a dedicated 4xxx handler is used)
        m[113] = 192; // camera MOVE: [u8 lx][u8 lz][u16 BE height][u8 rate][u8 accel] — exact match
        m[82] = 223; // camera LOOK: same layout — exact match
        m[99] = 4099; // camera reset (no body)
        m[160] = 4160; // hint icon — 464 body differs from rev-500 213 (no slot/icon byte)
        m[50] = 6; // PM receive: [i64 name][u16+u24 dedup][u8 rights][huffman] — exact match
        m[23] = 172; // PM sent echo: [i64 to][huffman] — exact match
        m[152] = 84; // friends-server status: [u8] — exact match
        m[100] = 16; // friend update: [i64 name][u16 world][u8] — handler patched to skip rev-500's world-name string
        m[167] = 240; // logout (no body) — without this the client hung on a dead socket instead of returning to the title screen
        m[40] = 113; // synth sound: [u16 BE id][u8 loops][u16 BE delay] — rev-500 handler exact
        m[156] = 237; // social/chat settings: [u8 public][u8 private][u8 trade] — rev-500 handler exact (sent on every login)
        m[92] = 186; // inv full
        m[120] = 17; // inv partial
        m[190] = 204; // skill / stat
        m[163] = 68; // run energy
        m[108] = 117; // game message
        m[77] = 4977; // window pane — 464 body is LEShortA windowId only (no mode byte like rev-500 86)
        // MOBA fine plane: glide streams (FineStream.ts render path), fine missiles, debug overlay
        m[211] = 4211; // LOCAL_FINE_POS -> dedicated handler
        m[210] = 4210; // FINE_POS (npc glide)
        m[215] = 4215; // REMOTE_FINE_POS (other players' glide)
        m[212] = 4212; // MISSILE_SPAWN (client-flown fine missile)
        m[213] = 4213; // MISSILE_DETONATE (impact burst / pierce)
        m[216] = 4216; // debug overlay toggle (::fm 6)
        // m[132] handled above (4132 — the rev-500 163 handler read X first / wrong transform)
        return m;
    })();
    static field2920: Int32Array | null = null;
    static field1734: Int32Array | null = null;

    static method740(): void {
        if (Statics.field1734 !== null && Statics.field2920 !== null) {
            return;
        }
        Statics.field1734 = new Int32Array(256);
        Statics.field2920 = new Int32Array(256);
        for (let var0 = 0; var0 < 256; var0++) {
            const var1 = (var0 / 255.0) * 6.283185307179586;
            Statics.field1734[var0] = (Math.sin(var1) * 4096.0) | 0;
            Statics.field2920[var0] = (Math.cos(var1) * 4096.0) | 0;
        }
    }

    static method1080(arg0: number, arg1: number): number {
        const var2 = (arg1 - 1) & (arg0 >> 31);
        return (var2 + ((arg0 + (arg0 >>> 31)) % arg1)) | 0;
    }

    static method812(arg0: number, arg1: { nextInt(): number }): number {
        if (arg0 <= 0) {
            throw new Error();
        } else if (Statics.method1017(arg0)) {
            return Number((BigInt(arg1.nextInt() >>> 0) * BigInt(arg0)) >> 32n);
        } else {
            const var2 = (-2147483648 - Number(4294967296n % BigInt(arg0))) | 0;
            let var3: number;
            do {
                var3 = arg1.nextInt();
            } while (var2 <= var3);
            return Statics.method1080(var3, arg0);
        }
    }

    static method1017(arg0: number): boolean {
        return ((-arg0 & arg0) | 0) === arg0;
    }
}
