// Client -> Server opcodes, RETARGETED from rev-500 to the 464 numbering the RuneJS server
// expects (authority: server/src/engine/net/handler/** + docs/protocol/lc500-outgoing.md).
// Transport is plaintext (ISAAC disabled both ways) so the wire byte == this enum value.
// Symbols with no 464 equivalent are set to 202 (IDLE_TIMER, size 0) as a benign no-op and must
// NOT be sent on 464 (their send sites are off the login->walk->combat path; guard as needed).
export const enum ClientProt {
    IDLE_TIMER = 202,
    NO_TIMEOUT = 7,
    SOUND_SONGEND = 202, // no 464 packet — do not send
    MAP_BUILD_COMPLETE = 202, // no 464 packet — send site removed (was 213 -> -3 consume-all desync)
    CLOSE_MODAL = 71,
    URL_REQUEST = 202, // no 464 packet — do not send

    EVENT_MOUSE_MOVE = 174, // 464 EVENT (var-byte, self-framing)
    EVENT_MOUSE_CLICK = 174,
    EVENT_CAMERA_POSITION = 128,
    EVENT_APPLET_FOCUS = 174,

    SET_CHATFILTERSETTINGS = 11, // 464 CHAT_SETMODE
    SEND_SNAPSHOT = 99,
    MESSAGE_PUBLIC = 115,
    MESSAGE_PRIVATE = 238,
    MESSAGE_QUICKCHAT_PUBLIC = 202, // no clean 464 map — off path
    MESSAGE_QUICKCHAT_PRIVATE = 202,

    FRIENDLIST_ADD = 197,
    IGNORELIST_ADD = 102,
    FRIENDLIST_DEL = 133,
    IGNORELIST_DEL = 214,

    FRIEND_SETRANK = 202, // off path
    CLAN_KICKUSER = 202,
    CLAN_JOINCHAT_LEAVECHAT = 202,

    CLIENT_CHEAT = 165,
    MOVE_GAMECLICK = 143,
    MOVE_MINIMAPCLICK = 50,
    MOVE_OPCLICK = 36,

    // MOBA fine plane: sub-tile ground click while fineStreamed (u16LE absX, u8 subX,
    // u16LE absZ, u8 subZ — fixed size 6) and QERT skillshot cast (u8 ability, u8 plane,
    // u16LE absX, u16LE absY, u8 subX, u8 subZ — fixed size 8)
    FINEMOVE_CLICK = 61,
    SKILLSHOT_CAST = 60,

    RESUME_PAUSEBUTTON = 240,
    RESUME_P_COUNTDIALOG = 78,
    RESUME_P_NAMEDIALOG = 150,
    IF_PLAYER_DESIGN = 49, // 464 char design accept: [u8 gender][7x u8 idk][5x u8 colour] (size 13)
    RESUME_P_STRINGDIALOG = 150, // 464: same var-byte [u8 len+1][string NUL] channel as name dialog; server treats both identically
    RESUME_P_OBJDIALOG = 202, // off path

    OPPLAYER1 = 84, // attack
    OPPLAYER2 = 180, // alt opt
    OPPLAYER3 = 185, // follow
    OPPLAYER4 = 180,
    OPPLAYER5 = 180,
    OPPLAYER6 = 180,
    OPPLAYER7 = 180,
    OPPLAYER8 = 180,
    OPPLAYERU = 110,
    OPPLAYERT = 123,

    OPNPC1 = 156,
    OPNPC2 = 129,
    OPNPC3 = 19,
    OPNPC4 = 51,
    OPNPC5 = 43,
    OPNPC6 = 176, // npc EXAMINE (LEShortA npc type id, size 2)
    OPNPCU = 187,
    OPNPCT = 69,

    OPLOC1 = 44,
    OPLOC2 = 119,
    OPLOC3 = 120,
    OPLOC4 = 127,
    OPLOC5 = 250,
    OPLOC6 = 97, // examine
    OPLOCU = 103,
    OPLOCT = 207,

    OPOBJ1 = 216, // 464: all pickup options -> 216
    OPOBJ2 = 216,
    OPOBJ3 = 216,
    OPOBJ4 = 216,
    OPOBJ5 = 216,
    OPOBJ6 = 205, // ground-item EXAMINE (u16LE obj id, size 2) — NOT the take opcode
    OPOBJU = 172,
    OPOBJT = 152,

    OPHELD1 = 101,
    OPHELD2 = 88,
    OPHELD3 = 159,
    OPHELD4 = 86,
    OPHELD5 = 220,
    OPHELDU = 166,
    OPHELDT = 163,

    IF_BUTTON = 153,

    // if1 invs
    INV_BUTTON1 = 113,
    INV_BUTTON2 = 37,
    INV_BUTTON3 = 134,
    INV_BUTTON4 = 137,
    INV_BUTTON5 = 140,
    INV_BUTTOND = 121,

    // if3 invs — 464 has no if3 button opcodes; route through IF_BUTTON (153, size 4).
    // Body layout is a follow-up (S8); off the critical path.
    // 464 per-option if3 button opcodes (server sizes 6: [i32 BE hash][u16 BE slot]).
    // Sending these on 153 (size 4) poisoned the stream with 2 extra bytes per click.
    IF_BUTTON1 = 113,
    IF_BUTTON2 = 37,
    IF_BUTTON3 = 134,
    IF_BUTTON4 = 137,
    IF_BUTTON5 = 140,
    // options 6-10 (Java opcodes 210/148/104/9/28) are NOT in the server's size table (-3 =
    // swallow buffer) — never send; ifButtonX suppresses them.
    IF_BUTTOND = 132,
    IF_BUTTONT = 153,
}
