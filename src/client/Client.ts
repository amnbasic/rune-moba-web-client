import '#3rdparty/audio.js';

import JagException from '#/callstack/JagException.js';
import ClientBuild from '#/client/ClientBuild.js';
import FogOfWar from '#/client/FogOfWar.js';
import FineStream from '#/client/FineStream.js';
import SkillshotOverlay from '#/client/SkillshotOverlay.js';
import AbilityBarOverlay from '#/client/AbilityBarOverlay.js';
import XpDropOverlay from '#/client/XpDropOverlay.js';
import ScreenMode from '#/client/ScreenMode.js';
import ScreenSizeDialog from '#/client/ScreenSizeDialog.js';
import HudPanelOverlay from '#/client/HudPanelOverlay.js';
import MobaCamera from '#/client/MobaCamera.js';
import ClanChannelUser from '#/client/ClanChannelUser.js';
import ClientScript from '#/client/ClientScript.js';
import ClientDynamicProvider from '#/client/ClientDynamicProvider.js';
import ClientInvCache from '#/client/ClientInvCache.js';
import ClientKeyboardListener from '#/client/ClientKeyboardListener.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import GameShell from '#/client/GameShell.js';
import HookReq from '#/client/HookReq.js';
import MouseTracking from '#/client/MouseTracking.js';
import MouseWheelListener from '#/client/MouseWheelListener.js';
import PrivilegedRequest from '#/client/PrivilegedRequest.js';
import ScriptRunner from '#/client/ScriptRunner.js';
import Skills from '#/constants/Skills.js';
import Text from '#/constants/Text.js';
import StockMarketSlot from '#/client/StockMarketSlot.js';
import SubInterface from '#/client/SubInterface.js';
import TitleScreen from '#/client/TitleScreen.js';

import FloType from '#/config/FloType.js';
import FluType from '#/config/FluType.js';
import SeqType from '#/config/SeqType.js';
import LocType from '#/config/LocType.js';
import ObjType from '#/config/ObjType.js';
import NpcType from '#/config/NpcType.js';
import IdkType from '#/config/IdkType.js';
import SpotType from '#/config/SpotType.js';
import VarpType from '#/config/VarpType.js';
import VarBitType from '#/config/VarBitType.js';
import IfType from '#/config/IfType.js';
import ParamType from '#/config/ParamType.js';
import QuickChatCatType from '#/config/QuickChatCatType.js';
import QuickChatPhraseType from '#/config/QuickChatPhraseType.js';
import QuickChatPhrase from '#/client/QuickChatPhrase.js';
import ServerActive from '#/config/ServerActive.js';
import StructType from '#/config/StructType.js';
import InvType from '#/config/InvType.js';
import EnumType from '#/config/EnumType.js';
import VarCache from '#/var/VarCache.js';

import ClientEntity from '#/dash3d/ClientEntity.js';
import ClientLocAnim from '#/dash3d/ClientLocAnim.js';
import ClientNpc from '#/dash3d/ClientNpc.js';
import ClientObj from '#/dash3d/ClientObj.js';
import ClientObjNode from '#/dash3d/ClientObjNode.js';
import ClientPlayer from '#/dash3d/ClientPlayer.js';
import ClientProj from '#/dash3d/ClientProj.js';
import ClientProjNode from '#/dash3d/ClientProjNode.js';
import CollisionMap, { BuildArea } from '#/dash3d/CollisionMap.js';
import PlayerModel from '#/dash3d/PlayerModel.js';
import Statics from '#/deob/Statics.js';
import HintArrow from '#/dash3d/HintArrow.js';
import LocChange from '#/dash3d/LocChange.js';
import MapSpotAnim from '#/dash3d/MapSpotAnim.js';
import MapSpotAnimNode from '#/dash3d/MapSpotAnimNode.js';
import World from '#/dash3d/World.js';
import type { SceneTag } from '#/dash3d/ModelSource.js';

import HashTable from '#/datastruct/HashTable.js';
import IntNode from '#/datastruct/IntNode.js';
import LinkList from '#/datastruct/LinkList.js';

import JavaRandom from '#/util/JavaRandom.js';
import Timer from '#/util/Timer.js';

import Pix2D from '#/graphics/Pix2D.js';
import Pix3D from '#/dash3d/Pix3D.js';
import GlRenderer from '#/dash3d/GlRenderer.js';
import PixMap from '#/graphics/PixMap.js';
import ModelLit from '#/dash3d/ModelLit.js';
import ModelUnlit from '#/dash3d/ModelUnlit.js';
import Pix8 from '#/graphics/Pix8.js';
import Pix32 from '#/graphics/Pix32.js';
import PixFont from '#/graphics/PixFont.js';
import PixLoader from '#/graphics/PixLoader.js';
import type SoftwarePixFont from '#/graphics/SoftwarePixFont.js';
import SoftwarePix32 from '#/graphics/SoftwarePix32.js';
import SoftwarePix8 from '#/graphics/SoftwarePix8.js';
import SoftwareModelLit from '#/dash3d/SoftwareModelLit.js';

import ClientStream from '#/io/ClientStream.js';
import Database from '#/io/Database.js';
import Packet from '#/io/Packet.js';
import Js5Loader from '#/js5/Js5Loader.js';
import Js5Net from '#/js5/Js5Net.js';
import Js5NetThread from '#/js5/Js5NetThread.js';
import TextureManager from '#/dash3d/TextureManager.js';
import RecolsRunescape from '#/dash3d/RecolsRunescape.js';
import RecolsStellardawn from '#/dash3d/RecolsStellardawn.js';

import WordPack from '#/wordfilter2/WordPack.js';
import Huffman from '#/wordfilter2/Huffman.js';

import BgSound from '#/sound/BgSound.js';
import JagFX from '#/sound/JagFX.js';
import Decimator from '#/sound/Decimator.js';
import MidiManager from '#/midi2/MidiManager.js';
import MidiPlayer from '#/midi2/MidiPlayer.js';
import Mixer from '#/sound/Mixer.js';
import PcmPlayer from '#/sound/PcmPlayer.js';
import WaveStream from '#/sound/WaveStream.js';
import PacketBit from '#/io/PacketBit.js';
import JagString from '#/jstring/JagString.js';
import { ClientProt } from '#/client/ClientProt.js';

const enum ClientMainState {
    LOADING = 0,
    TITLE_LOADING = 5,
    TITLE = 10,
    LOGIN = 20,
    MAP_BUILD = 25,
    GAME = 30,
    RECONNECT = 40,
    ERROR = 1000
}

export class Client extends GameShell {
    static mouseTracked: boolean = false;
    static worldid: number = 1;
    static modewhat: number = 0;
    static modewhere: number = 0;
    static modegame: number = 0;
    static memServer: boolean = false;
    static lowMem: boolean = false;
    static lang: number = 0;
    static js: number = 1;
    static plug: number = 0;
    static affid: number = 0;
    static state: number = ClientMainState.LOADING;
    static js5Loading: boolean = true;
    static loopCycle: number = 0;
    static prevMouseClickTime: number = 0;
    static mouseTracking: MouseTracking = new MouseTracking();
    static mouseTrackedX: number = 0;
    static mouseTrackedY: number = 0;
    static mouseTrackedDelta: number = 0;
    static focusIn: boolean = true;
    static showFps: boolean = false;
    static rebootTimer: number = 0;
    static readonly field1171: (HintArrow | null)[] = new Array(4).fill(null);

    // jag::oldscape::ReceivePlayerPositions::m_tempP
    private static tempP: Packet = new Packet(new Uint8Array(5000));

    static lastAddress: PrivilegedRequest | null = null;
    static loadingStep: number = 0;
    private static js5SocketReq: Promise<void> | null = null;
    private static js5Stream: ClientStream | null = null;
    private static js5ConnectState: number = 0;
    private static js5ConnectCooldown: number = 0;
    private static js5ConnectTime: number = 0;
    public static anims: Js5Loader | null = null;
    public static bases: Js5Loader | null = null;
    public static configs: Js5Loader | null = null;
    public static interfaces: Js5Loader | null = null;
    public static jagFX: Js5Loader | null = null;
    public static maps: Js5Loader | null = null;
    public static songs: Js5Loader | null = null;
    public static models: Js5Loader | null = null;
    public static sprites: Js5Loader | null = null;
    public static textures: Js5Loader | null = null;
    public static binary: Js5Loader | null = null;
    public static jingles: Js5Loader | null = null;
    public static scripts: Js5Loader | null = null;
    public static fontmetrics: Js5Loader | null = null;
    public static vorbis: Js5Loader | null = null;
    public static patches: Js5Loader | null = null;
    public static configLoc: Js5Loader | null = null;
    public static configEnum: Js5Loader | null = null;
    public static configNpc: Js5Loader | null = null;
    public static configObj: Js5Loader | null = null;
    public static configSeq: Js5Loader | null = null;
    public static configSpot: Js5Loader | null = null;
    public static configVarbit: Js5Loader | null = null;
    public static worldmap: Js5Loader | null = null;
    public static quickchat: Js5Loader | null = null;
    public static quickchatGlobal: Js5Loader | null = null;
    public static materials: Js5Loader | null = null;
    static js5Errors: number = 0;
    private static loginStep: number = 0;
    private static loginWaitingTime: number = 0;
    private static loginFailCount: number = 0;
    private static loginHopTimer: number = 0;
    static loginHost: string = '127.0.0.1';
    static npc: (ClientNpc | null)[] = new Array(32768).fill(null);
    static npcCount: number = 0;
    static npcIds: Int32Array = new Int32Array(32768);
    private static loginSocketReq: Promise<void> | null = null;
    private static stream: ClientStream | null = null;
    private static prevStream: ClientStream | null = null;
    static out: PacketBit = new PacketBit(5000);
    private static loginout: PacketBit = new PacketBit(5000);
    private static in: PacketBit = new PacketBit(5000);
    static psize: number = 0;
    static ptype: number = 0;
    static timeoutTimer: number = 0;
    static noTimeoutTimer: number = 0;
    static logoutTimer: number = 0;
    static ptype0: number = 0;
    static ptype1: number = 0;
    static ptype2: number = 0;
    static networkError: boolean = false;
    static p11: PixFont | null = null;
    static p12: PixFont | null = null;
    static b12: PixFont | null = null;
    static mapBuildBaseX: number = 0;
    static mapBuildBaseZ: number = 0;
    static lastBuiltLevel: number = 0;
    static mapBuildCentreZoneX: number = 0;
    static mapBuildCentreZoneZ: number = 0;
    static collision: (CollisionMap | null)[] = new Array(BuildArea.LEVELS).fill(null);
    static readonly LOC_SHAPE_TO_LAYER: readonly number[] = [0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3];
    static zoneUpdateX: number = 0;
    static zoneUpdateZ: number = 0;

    // jag::oldscape::movement::RouteFinding::m_dirMap
    static dirMap: Int32Array = new Int32Array(BuildArea.SIZE * BuildArea.SIZE);

    // jag::oldscape::movement::RouteFinding::m_distMap
    static distMap: Int32Array = new Int32Array(BuildArea.SIZE * BuildArea.SIZE);

    // jag::oldscape::movement::RouteFinding::m_routeX
    static routeX: Int32Array = new Int32Array(4096);

    // jag::oldscape::movement::RouteFinding::m_routeZ
    static routeZ: Int32Array = new Int32Array(4096);

    static macroCameraX: number = 0;
    static macroCameraXModifier: number = 2;
    static macroCameraZ: number = 0;
    static macroCameraZModifier: number = 2;
    static macroCameraAngle: number = 0;
    static macroCameraAngleModifier: number = 1;
    static macroCameraCycle: number = 0;
    static macroMinimapAngle: number = 0;
    static macroMinimapAngleModifier: number = 2;
    static macroMinimapZoom: number = 0;
    static macroMinimapZoomModifier: number = 1;
    static macroMinimapCycle: number = 0;
    static worldUpdateNum: number = 0;
    static compass: SoftwarePix32 | null = null;
    static hintMapedge: (SoftwarePix32 | null)[] | null = null;
    static mapscene: (SoftwarePix8 | null)[] = new Array(50).fill(null);
    static mapfunction: (SoftwarePix32 | null)[] = new Array(50).fill(null);
    static hitmarks: (Pix32 | null)[] = new Array(20).fill(null);
    static headiconsPk: (Pix32 | null)[] | null = null;
    static headiconsPrayer: (Pix32 | null)[] | null = null;
    static headiconsHint: (Pix32 | null)[] | null = null;
    static hintMapmarkers: (Pix32 | null)[] | null = null;
    static cross: (Pix32 | null)[] = new Array(8).fill(null);
    static mapdots: (Pix32 | null)[] | null = null;
    static scrollbar: (Pix8 | null)[] | null = null;
    static modIcons: Pix8[] = [];
    static readonly SCROLLBAR_TRACK: number = 0x23201b;
    static readonly SCROLLBAR_GRIP_FOREGROUND: number = 0x4d4233;
    static readonly SCROLLBAR_GRIP_HIGHLIGHT: number = 0x766654;
    static readonly SCROLLBAR_GRIP_LOWLIGHT: number = 0x332d25;
    static scrollGrabbed: boolean = false;
    static scrollInputPadding: number = 0;
    static camX: number = 0;
    static camY: number = 0;
    static camZ: number = 0;
    static camPitch: number = 0;
    static camYaw: number = 0;
    static orbitCameraPitch: number = 128;
    static orbitCameraYaw: number = 0;
    static orbitCameraPitchVelocity: number = 0;
    static orbitCameraYawVelocity: number = 0;
    static orbitCameraX: number = 0;
    static orbitCameraZ: number = 0;
    static sendCameraDelay: number = 0;
    static sendCamera: boolean = true;
    static cameraPitchClamp: number = 0;
    static chatCount: number = 0;
    static readonly MAX_CHATS: number = 50;
    static chatX: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatY: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatHeight: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatWidth: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatColour: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatEffect: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chatTimer: Int32Array = new Int32Array(Client.MAX_CHATS);
    static chats: (string | null)[] = new Array(Client.MAX_CHATS).fill(null);
    static tileLastOccupiedCycle: Int32Array[] = Array.from({ length: BuildArea.SIZE }, () => new Int32Array(BuildArea.SIZE));
    static sceneCycle: number = 0;
    static projectX: number = -1;
    static projectY: number = -1;
    static crossX: number = 0;
    static crossY: number = 0;
    static crossCycle: number = 0;
    static crossMode: number = 0;
    static selectedCom: IfType | null = null;
    static selectedCycle: number = 0;
    static selectedItem: number = 0;
    static objDragCom: IfType | null = null;
    static hoveredSlotCom: IfType | null = null;
    static objDragSlot: number = 0;
    static objGrabX: number = 0;
    static objGrabY: number = 0;
    static objGrabThreshold: boolean = false;
    static objDragCycles: number = 0;
    static hoveredSlot: number = 0;
    static chatDisabled: number = 0;
    static players: (ClientPlayer | null)[] = new Array(2048).fill(null);
    static playerCount: number = 0;
    static playerIds: Int32Array = new Int32Array(2048);
    static entityUpdateCount: number = 0;
    static entityUpdateIds: Int32Array = new Int32Array(2048);
    static playerAppearanceBuffer: (Packet | null)[] = new Array(2048).fill(null);
    static minusedlevel: number = 0;
    static selfSlot: number = -1;
    static localPlayer: ClientPlayer | null = null;
    static membersAccount: number = 0;
    static entityRemovalCount: number = 0;
    static entityRemovalIds: Int32Array = new Int32Array(1000);
    static playerOp: (string | null)[] = new Array(8).fill(null);
    static playerOpPriority: boolean[] = new Array(8).fill(false);
    static readonly ANGLE_TO_DIR: readonly number[] = [768, 1024, 1280, 512, 1536, 256, 0, 1792];
    static groundObj: (LinkList<ClientObjNode> | null)[][][] = Array.from({ length: BuildArea.LEVELS }, () => Array.from({ length: BuildArea.SIZE }, () => new Array(BuildArea.SIZE).fill(null)));
    static locChanges: LinkList<LocChange> = new LinkList();
    static projectiles: LinkList<ClientProjNode> = new LinkList();
    static spotanims: LinkList<MapSpotAnimNode> = new LinkList();
    static statEffectiveLevel: Int32Array = new Int32Array(25);
    static statBaseLevel: Int32Array = new Int32Array(25);
    static statXP: Int32Array = new Int32Array(25);
    static oneMouseButton: number = 0;
    static isMenuOpen: boolean = false;
    static menuNumEntries: number = 0;
    static menuMouseX: number = -1;
    static menuMouseY: number = -1;
    static tooltipCom: IfType | null = null;
    static tooltipNum: number = 0;
    private static readonly tooltipRedraw: number = 50;
    static useMode: number = 0;
    static objComId: number = 0;
    static objSelectedName: string | null = null;
    static objSelectedComId: number = 0;
    static objSelectedSlot: number = 0;
    static targetMode: boolean = false;
    static targetCom: number = -1;
    static targetMask: number = 0;
    static targetSub: number = 0;
    static targetVerb: string | null = null;
    static targetOp: string | null = null;
    static toplevelinterface: number = -1;
    static subinterfaces: HashTable<SubInterface> = new HashTable(8);
    static overCom: IfType | null = null;
    static chatEffects: number = 0;
    static bankArrangeMode: number = 0;
    static resumePauseCom: IfType | null = null;
    static runenergy: number = 0;
    static runweight: number = 0;
    static staffmodlevel: number = 0;
    static readonly showOpIndex: boolean = false;
    static dragCom: IfType | null = null;
    static dragLayer: IfType | null = null;
    static dragChildren: (IfType | null)[] | null = null;
    static dragChildX: number = 0;
    static dragChildY: number = 0;
    static dragPickupX: number = 0;
    static dragPickupY: number = 0;
    static dropCom: IfType | null = null;
    static dragParentFound: boolean = false;
    static dragParentX: number = -1;
    static dragParentY: number = -1;
    static dragCurrentX: number = -1;
    static dragCurrentY: number = -1;
    static dragAlive: boolean = false;
    static dragTime: number = 0;
    static transmitNum: number = 1;
    static varTransmit: Int32Array = new Int32Array(32);
    static varTransmitNum: number = 0;
    static invTransmit: Int32Array = new Int32Array(32);
    static invTransmitNum: number = 0;
    static statTransmit: Int32Array = new Int32Array(32);
    static statTransmitNum: number = 0;
    static chatTransmitNum: number = 0;
    static friendTransmitNum: number = 0;
    static clanTransmitNum: number = 0;
    static miscTransmitNum: number = 0;
    static mouseWheel: MouseWheelListener | null = null;
    static mouseWheelRotation: number = 0;
    // QoL camera state: wheel zoom (orbit distance base, classic = 600) + viewport rect for hit test
    static cameraZoom: number = 600;
    static viewportX: number = 0;
    static viewportY: number = 0;
    static viewportW: number = 0;
    static viewportH: number = 0;
    static hookRequests: LinkList<HookReq> = new LinkList();
    static hookRequestsTimer: LinkList<HookReq> = new LinkList();
    static hookRequestsMouseStop: LinkList<HookReq> = new LinkList();
    static serverActive: HashTable<IntNode> = new HashTable(512);
    private static componentDrawCount: number = 0;
    private static componentDrawTime: number = -2;
    private static componentDirtyArea: boolean[] = new Array(100).fill(false);
    private static componentBlitArea: boolean[] = new Array(100).fill(false);
    private static componentRedraw: boolean[] = new Array(100).fill(false);
    private static componentDrawX: Int32Array = new Int32Array(100);
    private static componentDrawY: Int32Array = new Int32Array(100);
    private static componentDrawWidth: Int32Array = new Int32Array(100);
    private static componentDrawHeight: Int32Array = new Int32Array(100);
    static componentRectDebug: number = 0;
    static chatType: Int32Array = new Int32Array(100);
    static chatUsername: (string | null)[] = new Array(100).fill(null);
    static chatScreenName: (string | null)[] = new Array(100).fill(null);
    static chatText: (string | null)[] = new Array(100).fill(null);
    static chatHistoryLength: number = 0;
    static readonly CHAT_COLOURS: readonly number[] = [0xffff00, 0xff0000, 0xff00, 0xffff, 0xff00ff, 0xffffff];
    static chatPublicMode: number = 0;
    static chatPrivateMode: number = 0;
    static chatTradeMode: number = 0;
    static readonly messageIds: bigint[] = new Array(100).fill(0n);
    static privateMessageCount: number = 0;
    static chatMinKick: number = 0;
    static chatRank: number = 0;
    static friendChatList: (ClanChannelUser | null)[] | null = null;
    static friendChatCount: number = 0;
    static keypresses: number = 0;
    static keypressKeychars: Int32Array = new Int32Array(128);
    static keypressKeycodes: Int32Array = new Int32Array(128);
    static chatDisplayName: string | null = null;
    static chatOwnerName: string | null = null;
    static minimapLevel: number = -1;
    static minimapFlagX: number = 0;
    static minimapFlagZ: number = 0;
    static minimapState: number = 0;
    static waveCount: number = 0;
    static readonly waveSoundIds: Int32Array = new Int32Array(50);
    static readonly waveLoops: Int32Array = new Int32Array(50);
    static readonly waveDelay: Int32Array = new Int32Array(50);
    static readonly waveAmbient: Int32Array = new Int32Array(50);
    static readonly waveSounds: (JagFX | null)[] = new Array(50).fill(null);
    static cinemaCam: boolean = false;
    static camShake: boolean[] = new Array(5).fill(false);
    static camShakeAxis: Int32Array = new Int32Array(5);
    static camShakeRan: Int32Array = new Int32Array(5);
    static camShakeAmp: Int32Array = new Int32Array(5);
    static camShakeCycle: Int32Array = new Int32Array(5);
    static camMoveToLx: number = 0;
    static camMoveToLz: number = 0;
    static camMoveToHei: number = 0;
    static camMoveToRate: number = 0;
    static camMoveToRate2: number = 0;
    static camLookAtLx: number = 0;
    static camLookAtLz: number = 0;
    static camLookAtHei: number = 0;
    static camLookAtRate: number = 0;
    static camLookAtRate2: number = 0;
    static mixer: Mixer | null = null;
    static decimator: Decimator | null = null;
    static synthPlayer: PcmPlayer | null = null;
    static midiPlayer: PcmPlayer | null = null;
    static friendCount: number = 0;
    static friendServerStatus: number = 0;

    // ---- unsorted ----

    // todo: custom
    private loginSocket: WebSocket | null = null;
    private loginSocketError: boolean = false;
    private loginSocketToken: number = 0;
    private js5Socket: WebSocket | null = null;
    private js5SocketError: unknown = null;
    private js5SocketToken: number = 0;
    private js5ServiceBusy: boolean = false;
    public db: Database | null = null;

    // todo: singleton
    private js5Net: Js5Net = new Js5Net();

    private static feedbackRand: JavaRandom = new JavaRandom();
    private static feedbackSeed: number = 0;
    static playermod: number = 0;
    static underage: number = 0;
    static mapQuickchat: number = 0;
    static clientpalette: Int16Array = new Int16Array(256);
    static settings: string = '';
    static field4179: number = 32767;
    static userhash: bigint = 0n;
    static readonly field1098: bigint = 7162900525229798032761816791230527296329313291232324290237849263501208207972894053929065636522363163621000728841182238772712427862772219676577293600221789n;
    static readonly field515: bigint = 58778699976184461502525193738213253649000149147835990136706041084440742975821n;
    static midiVolume: number = 255;
    static readonly MENUACTION_PLAYER: readonly number[] = [30, 58, 29, 45, 37, 16, 1, 50];
    static loginSeed: bigint = 0n;
    static stockTransmitNum: number = 0;
    static countFont: SoftwarePixFont | null = null; // field2966
    static field2045: number = 0;
    private static field3861: number = 0;
    private static field2751: number = 1;
    private static field2652: number = 1;
    private static field3754: number = 0;
    static regionmode: boolean = false;
    static field268: Int32Array[] = [];
    static field453: Int32Array = new Int32Array(0);
    static field2402: Int32Array = new Int32Array(0);
    static dbgGameDrawErrs: number = 0; // DEV: throttle gameDraw crash logging
    static dbgSeenTcp: Set<number> = new Set(); // DEV: dedupe tcpIn parse errors by opcode
    static dbgGameLoopN: number = 0; // DEV: gameLoop iteration counter
    static layoutGuard: number = 0; // SAFETY: bounds computeLayerLayout recursion so a bad parentId can't hard-freeze the tab
    static field10: bigint = 0n;
    static field3519: bigint = 0n;
    static mapflag: SoftwarePix32 | null = null;
    static brightness: number = 3;
    static field580: number = 256;
    static field921: number = 205;
    static field926: number = 32767;
    static field2527: number = 1;
    static field1578: number = 1;
    static field3083: number = 320;
    static field4175: number = 256;
    static moveAction: string = Text.walkhere;
    // MOBA League click scheme: menu rows in [sceneRowStart, sceneRowEnd) were built
    // by minimenuBuildSceneActions this frame (walk-here / entity ops). 0/0 = none.
    static sceneRowStart: number = 0;
    static sceneRowEnd: number = 0;
    // Scene-pass pick bounds captured at raster time — with the half-res scratch
    // bound, live Pix3D.minX/maxX would be the WRONG (full-res) space by the time
    // the menu build maps the walk-row pick coords.
    static scenePickMinX: number = 0;
    static scenePickMaxX: number = 512;
    static scenePickMinY: number = 0;
    static scenePickMaxY: number = 334;
    // ::perf overlay: smoothed per-stage frame timings (ms).
    static showPerf: boolean = false;
    static showFpsCounter: boolean = true;
    // WASD camera mode (::settings toggle, like the Java client's login button): when
    // on, W/A/S/D drive the camera and are CONSUMED so they never type into chat
    // (type via Enter//: as usual); when off they type like vanilla.
    static wasdMode: boolean = true;
    static perfSceneMs: number = 0;
    static perfPresentMs: number = 0;
    static menuX: number = 0;
    static menuY: number = 0;
    static menuWidth: number = 0;
    static menuHeight: number = 0;
    static menuParamB: Int32Array = new Int32Array(500);
    static menuParamC: Int32Array = new Int32Array(500);
    static menuAction: Int32Array = new Int32Array(500);
    static menuParamA: SceneTag[] = new Array(500).fill(0);
    static menuVerb: (string | null)[] = new Array(500).fill(null);
    static menuSubject: (string | null)[] = new Array(500).fill(null);
    static qaOpTest: boolean = false;
    static field2483: Int32Array = new Int32Array(100);
    static field2741: (JagString | null)[] = new Array(100).fill(null);
    static field3203: bigint[] = new Array(100).fill(0n);
    static field1150: number = 0;
    static field930: number = 0;
    static field2745: Int32Array = new Int32Array(1000);
    static field2577: Int32Array = new Int32Array(1000);
    static field2501: Int32Array = new Int32Array(1000);
    static field4525: (Pix32 | null)[] | null = null;
    static field2010: Pix32 | null = null;
    static field3532: boolean = false;
    static field1801: number = 0;
    static field890: number = 0;
    static nextMidiSong: number = -1;
    static playingJingle: boolean = false;
    static waveVolume: number = 127;
    static ambientVolume: number = 127;
    static field2186: number = 0;
    static field2086: bigint[] = new Array(200).fill(0n);
    static field370: (JagString | null)[] = new Array(200).fill(null);
    static field3092: Int32Array = new Int32Array(200);
    static field845: Int32Array = new Int32Array(200);
    static field1120: boolean[] = new Array(200).fill(false);
    static field3238: (string | null)[] = new Array(200).fill('');
    static field140: StockMarketSlot[] = Array.from({ length: 6 }, () => new StockMarketSlot());
    static idkDesign: PlayerModel = new PlayerModel();
    static idkDesignButton1: number = -1;
    static idkDesignButton2: number = -1;
    static field941: number = 0;
    static dragging: boolean = false;

    // ----

    static setLowMem(): void {
        Client.lowMem = true;
        World.lowMem = true;
    }

    static setHighMem(): void {
        Client.lowMem = false;
        World.lowMem = false;
    }

    override onKilled(): void {}

    override init(): void {
        if (!this.checkhost()) {
            return;
        }
        let param = this.getParameter('worldid');
        if (param !== null) {
            const parsed = Number.parseInt(param, 10);
            if (Number.isNaN(parsed)) {
                throw new Error();
            }
            Client.worldid = parsed;
        }
        param = this.getParameter('modewhat');
        if (param !== null) {
            const parsed = Number.parseInt(param, 10);
            if (Number.isNaN(parsed)) {
                throw new Error();
            }
            Client.modewhat = parsed;
        }
        param = this.getParameter('modewhere');
        if (param !== null) {
            const parsed = Number.parseInt(param, 10);
            if (Number.isNaN(parsed)) {
                throw new Error();
            }
            Client.modewhere = parsed;
        }
        const lowmem = this.getParameter('lowmem');
        if (lowmem !== null && lowmem === '1') {
            Client.setLowMem();
        } else {
            Client.setHighMem();
        }
        const members = this.getParameter('members');
        // Default to a MEMBERS world when the applet param is absent (this server is members
        // content; memServer=false renames every members item to "Members object" and strips ops).
        Client.memServer = members === null || members !== '0';
        const lang = this.getParameter('lang');
        if (lang !== null && lang === '1') {
            Text.swapGerman();
            Client.lang = 1;
        }
        const game = this.getParameter('game');
        Client.modegame = game !== null && game === '1' ? 1 : 0;
        try {
            const js = Number.parseInt(this.getParameter('js')!, 10);
            const plug = Number.parseInt(this.getParameter('plug')!, 10);
            const affid = Number.parseInt(this.getParameter('affid')!, 10);
            if (Number.isNaN(js) || Number.isNaN(plug) || Number.isNaN(affid)) {
                throw new Error();
            }
            Client.js = js;
            Client.plug = plug;
            Client.affid = affid;
        } catch {}
        Client.settings = this.getParameter('settings') ?? '';
        Client.loginHost = this.getCodeBase().hostname;
        this.startCommon(765, 503, 500);
    }

    override async maininit() {
        Client.clientpalette = LocType.clientpalette = NpcType.clientpalette = ObjType.clientpalette = new Int16Array(256);
        if (Client.modegame === 1) {
            PlayerModel.recol1d = RecolsStellardawn.recol1d;
            PlayerModel.recol2d = RecolsStellardawn.recol2d;
            PlayerModel.recol2s = RecolsStellardawn.recol2s;
            PlayerModel.recol1s = RecolsStellardawn.recol1s;
        } else {
            PlayerModel.recol1s = RecolsRunescape.recol1s;
            PlayerModel.recol2s = RecolsRunescape.recol2s;
            PlayerModel.recol1d = RecolsRunescape.recol1d;
            PlayerModel.recol2d = RecolsRunescape.recol2d;
        }
        ClientKeyboardListener.setupKeyCodeMap();
        ClientKeyboardListener.addListeners(GameShell.canvas!);
        ClientMouseListener.addListeners(GameShell.canvas!);
        Client.mouseWheel = MouseWheelListener.getProvider();
        Client.mouseWheel?.addListeners(GameShell.canvas!);

        try {
            this.db = new Database(await Database.openDatabase());
        } catch {
            // possibly incognito mode
            this.db = null;
        }
        Js5NetThread.db = this.db;
        GameShell.loadingText = Text.loading_title;
        if (Client.modewhere !== 0) {
            Client.showFps = true;
        }

        Client.loadingStep = 0;
        Client.setMainState(ClientMainState.LOADING);
    }

    override async mainloop() {
        Client.loopCycle++;
        if (Client.loopCycle % 100 === 0) console.log('[dbg] loop=' + Client.loopCycle + ' state=' + Client.state);
        if (Client.loopCycle % 1000 === 1) {
            const now = new Date();
            Client.feedbackSeed = now.getHours() * 600 + now.getMinutes() * 10 + ((now.getSeconds() / 6) | 0);
            Client.feedbackRand.setSeed(Client.feedbackSeed);
        }
        await this.serviceNetClient();
        Js5NetThread.processCompleted();
        MidiManager.updateFadeOut();
        Client.doAudio();
        ClientKeyboardListener.cycle();
        ClientMouseListener.cycle();
        if (Client.mouseWheel !== null) {
            Client.mouseWheelRotation = Client.mouseWheel.getRotation();
        }
        if (Client.state === ClientMainState.LOADING) {
            await this.mainLoad();
            GameShell.doneslowupdate();
        } else if (Client.state === ClientMainState.TITLE_LOADING) {
            TitleScreen.loop(this);
            await this.mainLoad();
            GameShell.doneslowupdate();
        } else if (Client.state === ClientMainState.TITLE) {
            TitleScreen.loop(this);
        } else if (Client.state === ClientMainState.LOGIN) {
            TitleScreen.loop(this);
            await this.loginPoll();
        } else if (Client.state === ClientMainState.MAP_BUILD) {
            Client.mapBuildLoop();
        }

        if (Client.state === ClientMainState.GAME) {
            if (Client.dbgGameLoopN++ % 50 === 0) console.log('[dbg] gameLoop start #' + Client.dbgGameLoopN);
            try {
                await this.gameLoop();
            } catch (e) {
                console.error('[dbg] gameLoop threw:', e);
            }
            if (Client.dbgGameLoopN % 50 === 1) console.log('[dbg] gameLoop done #' + Client.dbgGameLoopN);
        } else if (Client.state === ClientMainState.RECONNECT) {
            await this.loginPoll();
        }
        if (Client.state === 25) console.log('[dbg] mainloop END state=25');
    }

    // jag::oldscape::Client::MainRedraw
    override async mainredraw() {
        let redraw = false;

        const loaded = MidiManager.updateLoading();
        if (loaded && Client.playingJingle && Client.midiPlayer !== null) {
            Client.midiPlayer.play();
        }

        if (GameShell.fullredraw) {
            redraw = true;
            GameShell.fullredraw = false;
        }

        if (Client.state === ClientMainState.LOADING) {
            GameShell.drawProgress(null, TitleScreen.loadString, redraw, TitleScreen.loadPos);
        } else if (Client.state === ClientMainState.TITLE_LOADING || Client.state === ClientMainState.TITLE || Client.state === ClientMainState.LOGIN) {
            TitleScreen.draw(Client.p11!, Client.b12!);
        } else if (Client.state === ClientMainState.MAP_BUILD) {
            if (Client.field3861 === 1) {
                if (Client.field3754 > Client.field2751) {
                    Client.field2751 = Client.field3754;
                }
                const progress: number = (((Client.field2751 - Client.field3754) * 50) / Client.field2751) | 0;
                Client.messageBox(`${Text.loading}<br>(${progress}%)`, false);
            } else if (Client.field3861 === 2) {
                if (Client.field2045 > Client.field2652) {
                    Client.field2652 = Client.field2045;
                }
                const progress: number = ((((Client.field2652 - Client.field2045) * 50) / Client.field2652) | 0) + 50;
                Client.messageBox(`${Text.loading}<br>(${progress}%)`, false);
            } else {
                Client.messageBox(Text.loading, false);
            }
        } else if (Client.state === ClientMainState.GAME) {
            try {
                if (Client.dbgGameLoopN % 100 === 0) console.log('[dbg] gameDraw call');
                this.gameDraw();
                if (Client.dbgGameLoopN % 100 === 0) console.log('[dbg] gameDraw ok');
                // WASD chat mode hint — drawn AFTER the whole interface tree so the
                // chat components can't paint over it (Java WasdCamera reference).
                if (Client.wasdMode && !Client.mobaTyping && Client.toplevelinterface === 548 && Client.p12 !== null) {
                    const hcMinX = Pix2D.clipMinX;
                    const hcMinY = Pix2D.clipMinY;
                    const hcMaxX = Pix2D.clipMaxX;
                    const hcMaxY = Pix2D.clipMaxY;
                    Pix2D.setClipping(0, 0, Pix2D.width, Pix2D.height);
                    const hintY = (ScreenMode.mode === ScreenMode.FIXED ? 357 : 357 + (GameShell.sHei - 503)) + 94;
                    // sits immediately AFTER the "name: *" input prompt (measured, so any
                    // username length works)
                    let hintX = 26;
                    if (Client.localPlayer !== null && Client.localPlayer.name) {
                        hintX = 12 + Client.p12.stringWid(Client.localPlayer.name.toString() + ': *') + 8;
                    }
                    Client.p12.drawString('Press Enter to chat...', hintX, hintY, 0xffff00, 0);
                    Pix2D.setClipping(hcMinX, hcMinY, hcMaxX, hcMaxY);
                }
            } catch (e) {
                // DEV: a broken 464 game-frame interface makes gameDraw throw; catching it keeps the
                // render loop (and the 3D scene) alive instead of crashing the tab. Log the first few.
                if (Client.dbgGameDrawErrs++ < 4) console.error('[dbg] gameDraw threw:', e);
            }
        } else if (Client.state === ClientMainState.RECONNECT) {
            Client.messageBox(Text.conlost + '<br>' + Text.attempt_to_reestablish, false);
        }

        const perfPresentT0: number = performance.now();
        if (Client.state === ClientMainState.GAME && Client.componentRectDebug === 0 && !redraw) {
            try {
                if (ScreenMode.mode !== ScreenMode.FIXED) {
                    // Resizable/fullscreen: every component is dirty every frame, so the
                    // per-component loop became a full-frame RGBA-conversion STORM (each
                    // draw2 converts before its sub-blit). ONE full present instead —
                    // the exact Java round-3 blit lesson.
                    GameShell.drawArea.draw(0, 0);
                    for (let i = 0; i < Client.componentDrawCount; i++) {
                        Client.componentBlitArea[i] = false;
                    }
                } else {
                    for (let i = 0; i < Client.componentDrawCount; i++) {
                        if (Client.componentBlitArea[i]) {
                            GameShell.drawArea.draw2(Client.componentDrawHeight[i], Client.componentDrawWidth[i], Client.componentDrawY[i], Client.componentDrawX[i]);
                            Client.componentBlitArea[i] = false;
                        }
                    }
                }
            } catch {}
        } else if (Client.state > ClientMainState.LOADING) {
            try {
                GameShell.drawArea.draw(0, 0);
                for (let i = 0; i < Client.componentDrawCount; i++) {
                    Client.componentBlitArea[i] = false;
                }
            } catch {}
        }
        Client.perfPresentMs = Client.perfPresentMs * 0.9 + (performance.now() - perfPresentT0) * 0.1;
    }

    override mainquit(): void {
        Client.mouseTracking.active = false;
        Client.stream?.close();
        Client.stream = null;
        ClientKeyboardListener.removeListeners(GameShell.canvas!);
        ClientMouseListener.removeListeners(GameShell.canvas!);
        Client.mouseWheel?.removeListeners(GameShell.canvas!);
        ClientKeyboardListener.shutdown();
        ClientMouseListener.shutdown();
        Client.mouseWheel = null;
        Client.midiPlayer?.shutdown();
        Client.midiPlayer = null;
        Client.synthPlayer?.shutdown();
        Client.synthPlayer = null;
        Js5Net.close();
        Js5NetThread.shutdown();
        Client.js5Stream?.close();
        Client.js5Stream = null;
    }

    // jag::oldscape::Client::SetMainState
    static async setMainState(state: number): Promise<void> {
        if (Client.state === state) {
            return;
        }

        if (state === ClientMainState.LOGIN || state === ClientMainState.RECONNECT) {
            Client.loginStep = 0;
            Client.loginWaitingTime = 0;
            Client.loginFailCount = 0;
        }

        if (state !== ClientMainState.LOGIN && state !== ClientMainState.RECONNECT && Client.prevStream) {
            Client.prevStream.close();
            Client.prevStream = null;
        }

        if (Client.state === ClientMainState.MAP_BUILD) {
            Client.field2045 = 0;
            Client.field3861 = 0;
            Client.field2751 = 1;
            Client.field2652 = 1;
            Client.field3754 = 0;
        }

        if (state === ClientMainState.TITLE_LOADING || state === ClientMainState.TITLE || state === ClientMainState.LOGIN) {
            if (Client.binary && Client.sprites) {
                await TitleScreen.open(Client.binary, null, Client.sprites);
            }
        } else {
            TitleScreen.close();
        }

        Client.state = state;
    }

    // jag::oldscape::Client::ServiceNetClient
    async serviceNetClient(): Promise<void> {
        if (Client.state === ClientMainState.ERROR) {
            return;
        }

        if (this.js5ServiceBusy) {
            return;
        }

        this.js5ServiceBusy = true;
        try {
            if (Client.state === 25) console.log('[dbg] svc enter state25');
            const ok = await this.js5Net.loop();
            if (Client.state === 25) console.log('[dbg] svc js5loop done ok=' + ok);
            if (!ok) {
                console.log('[dbg] svc js5connect start');
                await this.js5connect();
                console.log('[dbg] svc js5connect done');
            }
        } finally {
            this.js5ServiceBusy = false;
        }
    }

    async js5connect(): Promise<void> {
        if (Js5Net.crcErrorCount >= 4) {
            this.error('js5crc');
            Client.state = ClientMainState.ERROR;
            return;
        }

        if (Js5Net.ioErrorCount >= 4) {
            if (Client.state <= ClientMainState.TITLE_LOADING) {
                this.error('js5io');
                Client.state = ClientMainState.ERROR;
                return;
            }

            Js5Net.ioErrorCount = 3;
            Client.js5ConnectCooldown = 3000;
        }

        if (Client.js5ConnectCooldown-- > 0) {
            return;
        }

        try {
            if (Client.js5ConnectState === 0) {
                this.js5Socket = null;
                this.js5SocketError = null;
                const token = this.js5SocketToken;
                Client.js5SocketReq = new Promise<WebSocket>((resolve, reject): void => {
                    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                    const socket = new WebSocket(`${protocol}://${window.location.host}`, 'binary');
                    socket.addEventListener('open', (): void => {
                        resolve(socket);
                    });
                    socket.addEventListener('error', (): void => {
                        reject(socket);
                    });
                })
                    .then(socket => {
                        if (token === this.js5SocketToken) {
                            this.js5Socket = socket;
                        } else {
                            socket.close();
                        }
                    })
                    .catch(error => {
                        if (token === this.js5SocketToken) {
                            this.js5SocketError = error;
                        }
                    });
                Client.js5ConnectState++;
            }

            if (Client.js5ConnectState === 1) {
                if (this.js5SocketError) {
                    this.js5error(-1);
                    return;
                }

                if (this.js5Socket) {
                    Client.js5ConnectState++;
                }
            }

            if (Client.js5ConnectState === 2) {
                Client.js5Stream = new ClientStream(this.js5Socket!);
                this.js5Socket = null;

                const packet = new Packet(new Uint8Array(5));
                packet.p1(15);
                packet.p4(464); // 465 cache served by RuneJS js5-update-server (EXPECTED_VERSION=464); rev-500 default (500) is rejected with [6]
                Client.js5Stream.write(5, packet.data);
                Client.js5ConnectState++;
                Client.js5ConnectTime = performance.now();
            }

            if (Client.js5ConnectState === 3) {
                const available = Client.js5Stream?.available() ?? 0;
                if (available < 0) {
                    this.js5error(-2);
                    return;
                }

                if (Client.state <= ClientMainState.TITLE_LOADING || available > 0) {
                    const response = await Client.js5Stream!.read();
                    if (response !== 0) {
                        this.js5error(response);
                        return;
                    }

                    Client.js5ConnectState++;
                } else if (performance.now() - Client.js5ConnectTime > 30000) {
                    this.js5error(-2);
                    return;
                }
            }

            if (Client.js5ConnectState === 4) {
                this.js5Net.init(Client.js5Stream!, Client.state > ClientMainState.LOGIN);
                Client.js5ConnectState = 0;
                Client.js5Errors = 0;
                Client.js5SocketReq = null;
                Client.js5Stream = null;
            }
        } catch {
            this.js5error(-3);
        }
    }

    js5error(code: number): void {
        Client.js5SocketReq = null;
        Client.js5ConnectState = 0;
        Client.js5Stream?.close();
        Client.js5Stream = null;
        this.js5Socket?.close();
        this.js5Socket = null;
        this.js5SocketError = null;
        this.js5SocketToken++;
        Client.js5Errors++;

        if (Client.js5Errors >= 2 && (code === 7 || code === 9)) {
            if (Client.state > ClientMainState.TITLE_LOADING) {
                Client.js5ConnectCooldown = 3000;
            } else {
                this.error('js5connect_full');
                Client.state = ClientMainState.ERROR;
            }
        } else if (Client.js5Errors >= 2 && code === 6) {
            this.error('js5connect_outofdate');
            Client.state = ClientMainState.ERROR;
        } else if (Client.js5Errors >= 4) {
            if (Client.state <= ClientMainState.TITLE_LOADING) {
                this.error('js5connect');
                Client.state = ClientMainState.ERROR;
            } else {
                Client.js5ConnectCooldown = 3000;
            }
        }
    }

    // jag::oldscape::Client::MainLoad
    async mainLoad(): Promise<void> {
        if (Client.loadingStep === 0) {
            TitleScreen.loadPos = 5;
            TitleScreen.loadString = Text.mainload0b;
            Client.loadingStep = 10;
        } else if (Client.loadingStep === 10) {
            ClientBuild.mapl = Array.from({ length: BuildArea.LEVELS }, () => Array.from({ length: BuildArea.SIZE }, () => new Uint8Array(BuildArea.SIZE)));

            World.init();
            ClientBuild.groundh = World.groundh;
            for (let level: number = 0; level < BuildArea.LEVELS; level++) {
                Client.collision[level] = new CollisionMap(104, 104);
            }
            TitleScreen.loadPos = 10;
            TitleScreen.loadString = Text.mainload10;
            Client.loadingStep = 30;
        } else if (Client.loadingStep === 30) {
            Client.anims = this.openJs5(0, true, true, false);
            Client.bases = this.openJs5(1, true, true, false);
            Client.configs = this.openJs5(2, true, false, true);
            Client.interfaces = this.openJs5(3, true, true, false);
            Client.jagFX = this.openJs5(4, true, true, false);
            Client.maps = this.openJs5(5, true, true, true);
            Client.songs = this.openJs5(6, false, true, true);
            Client.models = this.openJs5(7, true, true, false);
            Client.sprites = this.openJs5(8, true, true, false);
            Client.textures = this.openJs5(9, true, true, false);
            Client.binary = this.openJs5(10, true, true, false);
            Client.jingles = this.openJs5(11, true, true, false);
            Client.scripts = this.openJs5(12, true, true, false);
            Client.fontmetrics = this.openJs5(13, true, true, false);
            Client.vorbis = this.openJs5(14, false, true, false);
            Client.patches = this.openJs5(15, true, true, false);
            // 465 cache has NO detached config archives (idx 16-26 do not exist). Every config
            // type lives as a flat group inside idx2 (Client.configs). Alias the rev-500 config
            // loaders to configs so the load gate + *Type.init() resolve without hanging on a
            // missing 255:16..26 ref-table. Per-type idx2 group is set in each *Type's getFileId.
            Client.configLoc = Client.configs;
            Client.configEnum = Client.configs;
            Client.configNpc = Client.configs;
            Client.configObj = Client.configs;
            Client.configSeq = Client.configs;
            Client.configSpot = Client.configs;
            Client.configVarbit = Client.configs;
            Client.worldmap = Client.configs; // worldmap archive absent this rev; only lazily used
            Client.quickchat = Client.configs; // quickchat archives absent this rev; only lazily used
            Client.quickchatGlobal = Client.configs;
            Client.materials = Client.configs; // materials archive absent this rev (textures = idx9)

            Client.loadingStep = 40;
            TitleScreen.loadPos = 15;
            TitleScreen.loadString = Text.mainload30;
        } else if (Client.loadingStep === 40) {
            const anims = Client.anims!;
            const bases = Client.bases!;
            const configs = Client.configs!;
            const interfaces = Client.interfaces!;
            const jagFX = Client.jagFX!;
            const maps = Client.maps!;
            const songs = Client.songs!;
            const models = Client.models!;
            const sprites = Client.sprites!;
            const textures = Client.textures!;
            const binary = Client.binary!;
            const jingles = Client.jingles!;
            const scripts = Client.scripts!;
            const fontmetrics = Client.fontmetrics!;
            const vorbis = Client.vorbis!;
            const patches = Client.patches!;
            const configLoc = Client.configLoc!;
            const configEnum = Client.configEnum!;
            const configNpc = Client.configNpc!;
            const configObj = Client.configObj!;
            const configSeq = Client.configSeq!;
            const configSpot = Client.configSpot!;
            const configVarbit = Client.configVarbit!;
            const worldmap = Client.worldmap!;
            const quickchat = Client.quickchat!;
            const quickchatGlobal = Client.quickchatGlobal!;
            const materials = Client.materials!;

            let progress = ((anims.getIndexPercentage() * 4) / 100) | 0;
            progress = (progress + (((bases.getIndexPercentage() * 4) / 100) | 0)) | 0;
            progress = (progress + ((configs.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + (((interfaces.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((jagFX.getIndexPercentage() * 6) / 100) | 0)) | 0;
            progress = (progress + (((maps.getIndexPercentage() * 4) / 100) | 0)) | 0;
            progress = (progress + (((songs.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((models.getIndexPercentage() * 50) / 100) | 0)) | 0;
            progress = (progress + (((sprites.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((textures.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((binary.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((jingles.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((scripts.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((fontmetrics.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((vorbis.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + (((patches.getIndexPercentage() * 2) / 100) | 0)) | 0;
            progress = (progress + ((configLoc.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configEnum.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configNpc.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configObj.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configSeq.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configSpot.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((configVarbit.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((worldmap.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((quickchat.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((quickchatGlobal.getIndexPercentage() / 100) | 0)) | 0;
            progress = (progress + ((materials.getIndexPercentage() / 100) | 0)) | 0;

            if (progress === 100) {
                TitleScreen.loadPos = 20;
                TitleScreen.loadString = Text.mainload40b;
                TitleScreen.getGroupIds(songs, binary, sprites);
                Client.loadingStep = 45;
            } else {
                if (progress !== 0) {
                    TitleScreen.loadString = `${Text.mainload40}${progress}%`;
                }

                TitleScreen.loadPos = 20;
            }
        } else if (Client.loadingStep === 45) {
            PcmPlayer.init(!Client.lowMem);
            const midiStream = new MidiPlayer();
            midiStream.setPatchAndBank();
            Client.midiPlayer = PcmPlayer.getPlayer(0, GameShell.canvas, 22050);
            Client.midiPlayer.playStream(midiStream);
            MidiManager.init(Client.vorbis!, midiStream, Client.jagFX!, Client.patches!);
            Client.synthPlayer = PcmPlayer.getPlayer(1, GameShell.canvas, 2048);
            Client.mixer = new Mixer();
            Client.synthPlayer.playStream(Client.mixer);
            Client.decimator = new Decimator(22050, PcmPlayer.frequency);
            Client.loadingStep = 50;
            TitleScreen.loadString = Text.mainload45;
            TitleScreen.loadPos = 30;
        } else if (Client.loadingStep === 50) {
            const sprites = Client.sprites!;
            const fontmetrics = Client.fontmetrics!;

            let loaded = 0;
            if (sprites.requestDownload('p11_full')) {
                loaded++;
            }
            if (sprites.requestDownload('p12_full')) {
                loaded++;
            }
            if (sprites.requestDownload('b12_full')) {
                loaded++;
            }
            if (fontmetrics.requestDownload('p11_full')) {
                loaded++;
            }
            if (fontmetrics.requestDownload('p12_full')) {
                loaded++;
            }
            if (fontmetrics.requestDownload('b12_full')) {
                loaded++;
            }

            if (loaded < 6) {
                TitleScreen.loadString = `${Text.mainload50}${((loaded * 100) / 6) | 0}%`;
                TitleScreen.loadPos = 35;
            } else {
                TitleScreen.loadPos = 35;
                Client.loadingStep = 60;
                TitleScreen.loadString = Text.mainload50b;
            }
        } else if (Client.loadingStep === 60) {
            const binary = Client.binary!;
            const sprites = Client.sprites!;

            const ready = TitleScreen.ready(binary, sprites);
            const readyMax = TitleScreen.readyMax();
            if (ready < readyMax) {
                TitleScreen.loadString = `${Text.mainload60}${((ready * 100) / readyMax) | 0}%`;
                TitleScreen.loadPos = 40;
            } else {
                TitleScreen.loadPos = 40;
                TitleScreen.loadString = Text.mainload60b;
                Client.loadingStep = 65;
            }
        } else if (Client.loadingStep === 65) {
            const sprites = Client.sprites!;
            const fontmetrics = Client.fontmetrics!;
            const binary = Client.binary!;

            Client.p11 = PixLoader.makePixFont(fontmetrics, sprites, '', 'p11_full')!;
            Client.countFont = Client.p11 as SoftwarePixFont | null;
            Client.p12 = PixLoader.makePixFont(fontmetrics, sprites, '', 'p12_full')!;
            Client.b12 = PixLoader.makePixFont(fontmetrics, sprites, '', 'b12_full')!;
            TitleScreen.loadPos = 45;
            TitleScreen.loadString = Text.mainload65;
            await TitleScreen.open(binary, null, sprites);
            Client.setMainState(ClientMainState.TITLE_LOADING);
            Client.loadingStep = 70;
        } else if (Client.loadingStep === 70) {
            const configs = Client.configs!;
            const models = Client.models!;
            const bases = Client.bases!;
            const anims = Client.anims!;
            const interfaces = Client.interfaces!;
            const sprites = Client.sprites!;
            const fontmetrics = Client.fontmetrics!;
            const configLoc = Client.configLoc!;
            const configEnum = Client.configEnum!;
            const configNpc = Client.configNpc!;
            const configObj = Client.configObj!;
            const configSeq = Client.configSeq!;
            const configSpot = Client.configSpot!;
            const configVarbit = Client.configVarbit!;
            const quickchat = Client.quickchat!;
            const quickchatGlobal = Client.quickchatGlobal!;

            configs.requestFullDownload();
            let progress = configs.getTotalLoadProgress();
            configLoc.requestFullDownload();
            progress += configLoc.getTotalLoadProgress();
            configEnum.requestFullDownload();
            progress += configEnum.getTotalLoadProgress();
            configNpc.requestFullDownload();
            progress += configNpc.getTotalLoadProgress();
            configObj.requestFullDownload();
            progress += configObj.getTotalLoadProgress();
            configSeq.requestFullDownload();
            progress += configSeq.getTotalLoadProgress();
            configSpot.requestFullDownload();
            progress += configSpot.getTotalLoadProgress();
            configVarbit.requestFullDownload();
            progress += configVarbit.getTotalLoadProgress();
            quickchat.requestFullDownload();
            progress += quickchat.getTotalLoadProgress();
            quickchatGlobal.requestFullDownload();
            progress += quickchatGlobal.getTotalLoadProgress();

            if (progress >= 1000) {
                ParamType.init(configs);
                FloType.init(configs);
                FluType.init(configs);
                IdkType.init(models, configs);
                LocType.init(configLoc, models, Client.memServer, Client.lowMem);
                NpcType.init(configNpc, models);
                ObjType.init(Client.memServer, configObj, Client.countFont, models);
                StructType.init(configs);
                SeqType.init(configSeq, anims, bases);
                SpotType.init(models, configSpot);
                VarBitType.init(configVarbit);
                VarpType.init(configs);
                IfType.init(sprites, interfaces, fontmetrics, models);
                InvType.init(configs);
                EnumType.init(configEnum);
                QuickChatPhraseType.init(quickchatGlobal, new ClientDynamicProvider(), quickchat);
                QuickChatCatType.init(quickchat, quickchatGlobal);

                TitleScreen.loadString = Text.mainload70b;
                TitleScreen.loadPos = 50;
                ObjType.initWearable();
                Client.loadingStep = 80;
            } else {
                TitleScreen.loadString = `${Text.mainload70}${(progress / 10) | 0}%`;
                TitleScreen.loadPos = 50;
            }
        } else if (Client.loadingStep === 80) {
            const sprites = Client.sprites!;

            let loaded = 0;

            if (!Client.compass) {
                const compass = PixLoader.makeSoftwarePix32('compass', sprites, '');
                if (compass !== null) {
                    compass.trim();
                    Client.compass = compass;
                }
            } else {
                loaded++;
            }

            if (!Client.mapscene[0]) {
                const mapscene = PixLoader.makeSoftwarePix8Array('mapscene', '', sprites);
                if (mapscene) Client.mapscene = mapscene;
            } else {
                loaded++;
            }

            if (!Client.mapfunction[0]) {
                const mapfunction = PixLoader.makeSoftwarePix32Array('mapfunction', '', sprites);
                if (mapfunction) Client.mapfunction = mapfunction;
            } else {
                loaded++;
            }

            if (!Client.hitmarks[0]) {
                const hitmarks = PixLoader.makePix32Array('hitmarks', sprites, '');
                if (hitmarks) Client.hitmarks = hitmarks;
            } else {
                loaded++;
            }

            if (Client.headiconsPk === null) {
                Client.headiconsPk = PixLoader.makePix32Array('headicons_pk', sprites, '');
            } else {
                loaded++;
            }

            if (Client.headiconsPrayer === null) {
                Client.headiconsPrayer = PixLoader.makePix32Array('headicons_prayer', sprites, '');
            } else {
                loaded++;
            }

            if (Client.headiconsHint === null) {
                Client.headiconsHint = PixLoader.makePix32Array('headicons_hint', sprites, ''); // 465 name (rev-500: hint_headicons)
            } else {
                loaded++;
            }

            if (Client.hintMapmarkers === null) {
                const mapmarker = PixLoader.makePix32Array('mapmarker', sprites, ''); // 465 name (rev-500: hint_mapmarkers)
                if (mapmarker) {
                    Client.hintMapmarkers = mapmarker;
                }
            } else {
                loaded++;
            }

            if (Client.hintMapedge === null) {
                const mapedge = PixLoader.makeSoftwarePix32Array('mapedge', '', sprites); // 465 name (rev-500: hint_mapedge)
                if (mapedge) {
                    for (const image of mapedge) {
                        image.trim();
                    }
                    Client.hintMapedge = mapedge;
                }
            } else {
                loaded++;
            }

            // 464 has no separate 'mapflag' sprite — the 'mapmarker' group carries the minimap
            // markers: file 0 = click-destination flag, file 1 = hint marker (Java oracle:
            // Class4_Sub10.aSpriteArray2022 loaded from "mapmarker", flag drawn from [0]).
            if (Client.mapflag === null && Client.hintMapmarkers !== null && Client.hintMapmarkers.length > 0) {
                Client.mapflag = Client.hintMapmarkers[0] as SoftwarePix32 | null;
            }
            loaded++;

            // mapback (minimap frame + mask source) MUST load here at boot: the js5 name-hash
            // tables are discarded after loading, so an in-game name lookup NPEs. Doesn't gate
            // boot progress — retried each pass until built.
            if (Client.mapback === null) {
                Client.loadMapback();
            }

            if (!Client.cross[0]) {
                const cross = PixLoader.makePix32Array('cross', sprites, '');
                if (cross) Client.cross = cross;
            } else {
                loaded++;
            }

            if (Client.mapdots === null) {
                const mapdots = PixLoader.makePix32Array('mapdots', sprites, '');
                if (mapdots) {
                    Client.mapdots = mapdots;
                }
            } else {
                loaded++;
            }

            if (Client.scrollbar === null) {
                const scrollbar = PixLoader.makePix8Array('scrollbar', sprites, '');
                if (scrollbar) {
                    Client.scrollbar = scrollbar;
                }
            } else {
                loaded++;
            }

            if (Client.modIcons.length === 0) {
                const modIcons = PixLoader.makePix8Array('mod_icons', sprites, '');
                if (modIcons) Client.modIcons = modIcons;
            } else {
                loaded++;
            }

            loaded++;

            if (loaded < 15) {
                TitleScreen.loadString = `${Text.mainload80}${((loaded * 100) / 15) | 0}%`;
                TitleScreen.loadPos = 60;
            } else {
                const randR: number = ((Math.random() * 21.0) | 0) - 10;
                const randG: number = ((Math.random() * 21.0) | 0) - 10;
                const randB: number = ((Math.random() * 21.0) | 0) - 10;
                const rand: number = ((Math.random() * 41.0) | 0) - 20;

                Client.p11!.setIcons(Client.modIcons, null);
                Client.p12!.setIcons(Client.modIcons, null);
                Client.b12!.setIcons(Client.modIcons, null);
                for (const image of Client.mapfunction) {
                    image!.rgbAdjust(randR + rand, randB + rand, randG + rand);
                }
                Client.mapscene[0]!.rgbAdjust(randR + rand, randB + rand, randG + rand);

                TitleScreen.loadPos = 60;
                Client.loadingStep = 90;
                Client.field4525 = Client.mapfunction;
                TitleScreen.loadString = Text.mainload80b;
            }
        } else if (Client.loadingStep === 90) {
            const textures = Client.textures!;
            const sprites = Client.sprites!;
            const materials = Client.materials!;

            if (materials.requestFullDownload()) {
                const manager = new TextureManager(textures, materials, sprites, 20, Client.lowMem);
                Pix3D.setTextures(manager);
                Pix3D.initColourTable(0.7);

                TitleScreen.loadString = Text.mainload90b;
                Client.loadingStep = 110;
                TitleScreen.loadPos = 70;
            } else {
                TitleScreen.loadString = `${Text.mainload90}${materials.getTotalLoadProgress()}%`;
                TitleScreen.loadPos = 70;
            }
        } else if (Client.loadingStep === 110) {
            Client.mouseTracking = new MouseTracking();
            Client.mouseTracking.run();

            TitleScreen.loadString = Text.mainload110;
            TitleScreen.loadPos = 75;
            Client.loadingStep = 120;
        } else if (Client.loadingStep === 120) {
            const binary = Client.binary!;
            if (binary.requestDownload('huffman', '')) {
                const huffman = new Huffman(binary.getFile('huffman', '')!);
                WordPack.setHuffman(huffman);

                Client.loadingStep = 130;
                TitleScreen.loadString = Text.mainload120b;
                TitleScreen.loadPos = 80;
            } else {
                TitleScreen.loadString = Text.mainload120 + '0%';
                TitleScreen.loadPos = 80;
            }
        } else if (Client.loadingStep === 130) {
            const interfaces = Client.interfaces!;
            const scripts = Client.scripts!;
            const fontmetrics = Client.fontmetrics!;

            if (!interfaces.requestFullDownload()) {
                TitleScreen.loadString = `${Text.mainload130}${((interfaces.getTotalLoadProgress() * 4) / 5) | 0}%`;
                TitleScreen.loadPos = 85;
            } else if (!scripts.requestFullDownload()) {
                TitleScreen.loadString = `${Text.mainload130}${(((scripts.getTotalLoadProgress() / 6) | 0) + 80) | 0}%`;
                TitleScreen.loadPos = 85;
            } else if (fontmetrics.requestFullDownload()) {
                TitleScreen.loadPos = 100;
                Client.loadingStep = 140;
                TitleScreen.loadString = Text.mainload130b;
            } else {
                TitleScreen.loadString = `${Text.mainload130}${(((fontmetrics.getTotalLoadProgress() / 20) | 0) + 96) | 0}%`;
                TitleScreen.loadPos = 85;
            }
        } else if (Client.loadingStep === 140) {
            Client.maps!.discardNames(false);
            Client.songs!.discardNames(true);
            Client.sprites!.discardNames(true);
            Client.fontmetrics!.discardNames(true);
            Client.binary!.discardNames(true);
            Client.interfaces!.discardNames(true);
            Client.setMainState(ClientMainState.TITLE);
        }
    }

    // jag::oldscape::Client::OpenJs5
    openJs5(archive: number, remoteEnabled: boolean, discardUnpacked: boolean, discardPacked: boolean): Js5Loader {
        const loader = new Js5Loader(archive, this.js5Net, discardPacked, discardUnpacked, remoteEnabled);
        return loader;
    }

    // jag::oldscape::Client::LoginPoll
    async loginPoll(): Promise<void> {
        try {
            if (Client.loginStep === 0) {
                if (Client.stream) {
                    Client.stream.close();
                    Client.stream = null;
                }
                Client.loginWaitingTime = 0;
                Client.loginStep = 1;
                Client.networkError = false;
                Client.loginSocketReq = null;
                this.loginSocket = null;
                this.loginSocketError = false;
                this.loginSocketToken++;
            }

            if (Client.loginStep === 1) {
                if (!Client.loginSocketReq) {
                    const token = this.loginSocketToken;
                    Client.loginSocketReq = new Promise<WebSocket>((resolve, reject): void => {
                        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                        const socket = new WebSocket(`${protocol}://${window.location.host}`, 'binary');
                        socket.addEventListener('open', (): void => {
                            resolve(socket);
                        });
                        socket.addEventListener('error', (): void => {
                            reject(socket);
                        });
                    })
                        .then(socket => {
                            if (token === this.loginSocketToken && (Client.state === ClientMainState.LOGIN || Client.state === ClientMainState.RECONNECT)) {
                                this.loginSocket = socket;
                            } else {
                                socket.close();
                            }
                        })
                        .catch(() => {
                            if (token === this.loginSocketToken) {
                                this.loginSocketError = true;
                            }
                        });
                }
                if (this.loginSocketError) {
                    throw new Error('login socket failed');
                }
                if (this.loginSocket) {
                    Client.stream = new ClientStream(this.loginSocket);
                    Client.loginStep = 2;
                    Client.loginSocketReq = null;
                    this.loginSocket = null;
                }
            }

            if (!Client.stream) {
                return;
            }

            if (Client.loginStep === 2) {
                const userhash = JagString.fromLatin1String(TitleScreen.loginUser).toUserhash();
                Client.userhash = userhash;
                Client.out.pos = 0;
                Client.out.p1(14);
                Client.out.p1(Number(userhash >> 16n) & 0x1f);
                Client.stream.write(2, Client.out.data);
                Client.loginStep = 3;
                Client.in.pos = 0;
            }

            if (Client.loginStep === 3) {
                if (Client.midiPlayer !== null) {
                    Client.midiPlayer.skipNextAcceptedCheck();
                }
                if (Client.synthPlayer !== null) {
                    Client.synthPlayer.skipNextAcceptedCheck();
                }
                if (Client.stream.available() <= 0) {
                    Client.loginWaitingTime++;
                    if (Client.loginWaitingTime > 2000) {
                        if (Client.loginFailCount < 1) {
                            Client.loginFailCount++;
                            Client.loginStep = 0;
                        } else {
                            Client.loginError(-3);
                        }
                    }
                    return;
                }

                const response = await Client.stream.read();
                if (Client.midiPlayer !== null) {
                    Client.midiPlayer.skipNextAcceptedCheck();
                }
                if (Client.synthPlayer !== null) {
                    Client.synthPlayer.skipNextAcceptedCheck();
                }
                if (response !== 0) {
                    Client.loginError(response);
                    return;
                }
                Client.in.pos = 0;
                Client.loginStep = 4;
            }

            if (Client.loginStep === 4) {
                if (Client.in.pos < 8) {
                    let available = Client.stream.available();
                    if (available > 8 - Client.in.pos) {
                        available = 8 - Client.in.pos;
                    }
                    if (available > 0) {
                        await Client.stream.readBytes(Client.in.data, Client.in.pos, available);
                        Client.in.pos += available;
                    }
                }

                if (Client.in.pos === 8) {
                    Client.in.pos = 0;
                    Client.loginSeed = Client.in.g8();
                    Client.loginStep = 5;
                }
            }

            if (Client.loginStep === 5) {
                const anims = Client.anims!;
                const bases = Client.bases!;
                const configs = Client.configs!;
                const interfaces = Client.interfaces!;
                const jagFX = Client.jagFX!;
                const maps = Client.maps!;
                const songs = Client.songs!;
                const models = Client.models!;
                const sprites = Client.sprites!;
                const textures = Client.textures!;
                const binary = Client.binary!;
                const jingles = Client.jingles!;
                const scripts = Client.scripts!;
                const fontmetrics = Client.fontmetrics!;
                const vorbis = Client.vorbis!;
                const patches = Client.patches!;
                const seed: Int32Array = new Int32Array([(Math.random() * 99999999) | 0, (Math.random() * 99999999) | 0, Number(Client.loginSeed >> 32n) | 0, Number(Client.loginSeed & 0xffffffffn) | 0]);

                // === 464 login block (target: server sav-login-server.ts:128-173). ===
                // RSA is plaintext-patched on the 464 side, so the inner "RSA" block is written raw
                // (no rsaenc). Inner block: [10][ck1][ck2][serverKey i64][gameClientId][user i64][pass].
                Client.out.pos = 0;
                Client.out.p1(10); // block id
                Client.out.p4(seed[0]); // clientKey1
                Client.out.p4(seed[1]); // clientKey2
                Client.out.p4(seed[2]); // serverKey hi
                Client.out.p4(seed[3]); // serverKey lo
                Client.out.p4(0); // gameClientId (server echoes it back; not verified)
                Client.out.p8(JagString.fromLatin1String(TitleScreen.loginUser).toUserhash());
                Client.out.pjstr(TitleScreen.loginPass);

                // Outer block: type, size, version 464, lowDetail, 16 archive CRCs (idx 0-15),
                // rsaLen byte, then the plaintext inner block. size = 69-byte header + 1 rsaLen + block.
                Client.loginout.pos = 0;
                Client.loginout.p1(Client.state === ClientMainState.RECONNECT ? 18 : 16);
                Client.loginout.p1(Client.out.pos + 70);
                Client.loginout.p4(464);
                Client.loginout.p1(Client.lowMem ? 1 : 0);
                Client.loginout.p4(anims.crc); // idx 0
                Client.loginout.p4(bases.crc); // idx 1
                Client.loginout.p4(configs.crc); // idx 2
                Client.loginout.p4(interfaces.crc); // idx 3
                Client.loginout.p4(jagFX.crc); // idx 4
                Client.loginout.p4(maps.crc); // idx 5
                Client.loginout.p4(songs.crc); // idx 6
                Client.loginout.p4(models.crc); // idx 7
                Client.loginout.p4(sprites.crc); // idx 8
                Client.loginout.p4(textures.crc); // idx 9
                Client.loginout.p4(binary.crc); // idx 10
                Client.loginout.p4(jingles.crc); // idx 11
                Client.loginout.p4(scripts.crc); // idx 12
                Client.loginout.p4(fontmetrics.crc); // idx 13
                Client.loginout.p4(vorbis.crc); // idx 14
                Client.loginout.p4(patches.crc); // idx 15
                Client.loginout.p1(Client.out.pos); // rsaLen = plaintext inner-block length
                Client.loginout.pdata(Client.out.pos, Client.out.data);

                Client.stream.write(Client.loginout.pos, Client.loginout.data);
                Client.out.seed(seed);
                for (let i: number = 0; i < 4; i++) {
                    seed[i] = (seed[i] + 50) | 0;
                }
                Client.in.seed(seed);

                Client.loginStep = 6;
            }

            if (Client.loginStep === 6 && Client.stream.available() > 0) {
                const response = await Client.stream.read();
                if (response === 21 && Client.state === ClientMainState.LOGIN) {
                    Client.loginStep = 7;
                } else if (response === 2) {
                    Client.loginStep = 9;
                } else if (response === 15 && Client.state === ClientMainState.RECONNECT) {
                    Client.reconnectDone();
                    return;
                } else if (response === 23 && Client.loginFailCount < 1) {
                    Client.loginFailCount++;
                    Client.loginStep = 0;
                } else {
                    Client.loginError(response);
                    return;
                }
            }

            if (Client.loginStep === 7 && Client.stream.available() > 0) {
                Client.loginHopTimer = ((await Client.stream.read()) + 3) * 60;
                Client.loginStep = 8;
            }

            if (Client.loginStep === 8) {
                Client.loginWaitingTime = 0;
                TitleScreen.loginMes(`${(Client.loginHopTimer / 60) | 0}${Text.loginhop_c}`, Text.loginhop_a, Text.loginhop_b);
                if (--Client.loginHopTimer <= 0) {
                    Client.loginStep = 0;
                }
            } else {
                if (Client.loginStep === 9 && Client.stream.available() >= 5) {
                    // 464 login-success response is only 5 bytes: [rights][flagged=0][u16 worldIndex]
                    // [membership=0] (server gateway-server.ts:212-220). The rev-500 client read 8
                    // fields here; the extra 3 reads consumed the first game packet and desynced the
                    // whole stream (client hung on "connecting", server saw garbage opcodes).
                    Client.staffmodlevel = await Client.stream.read(); // rights (crown level)
                    Client.playermod = Client.staffmodlevel > 0 ? 1 : 0;
                    await Client.stream.read(); // account flagged — unused by 464
                    Client.selfSlot = await Client.stream.read();
                    Client.selfSlot <<= 8;
                    Client.selfSlot += await Client.stream.read(); // worldIndex (u16)
                    Client.membersAccount = await Client.stream.read(); // membership
                    Client.underage = 0;
                    Client.mapQuickchat = 0;
                    Client.mouseTracked = false;

                    await Client.stream.readBytes(Client.in.data, 0, 1);
                    Client.in.pos = 0;
                    Client.ptype = Client.in.g1Enc();

                    await Client.stream.readBytes(Client.in.data, 0, 2);
                    Client.in.pos = 0;
                    Client.psize = Client.in.g2();

                    Client.loginStep = 10;
                }

                if (Client.loginStep !== 10) {
                    Client.loginWaitingTime++;
                    if (Client.loginWaitingTime > 2000) {
                        if (Client.loginFailCount < 1) {
                            Client.loginFailCount++;
                            Client.loginStep = 0;
                        } else {
                            Client.loginError(-3);
                        }
                    }
                } else if (Client.stream.available() >= Client.psize) {
                    Client.in.pos = 0;
                    await Client.stream.readBytes(Client.in.data, 0, Client.psize);

                    Client.loginDone();
                    Client.mapBuildCentreZoneX = -1;
                    Client.rebuildPacket(false);
                    Client.ptype = -1;
                }
            }
        } catch (e) {
            if (e instanceof WebSocket || (e instanceof Error && e.message === 'login socket failed')) {
                if (Client.loginFailCount < 1) {
                    Client.loginFailCount++;
                    Client.loginStep = 0;
                } else {
                    Client.loginError(-2);
                }
            } else {
                throw e;
            }
        }
    }

    // jag::oldscape::Client::GameLoop
    async gameLoop(): Promise<void> {
        if (Client.rebootTimer > 1) {
            Client.rebootTimer--;
            Client.miscTransmitNum = Client.transmitNum;
        }

        if (Client.logoutTimer > 0) {
            Client.logoutTimer--;
        }

        if (Client.networkError) {
            Client.networkError = false;
            Client.lostCon();
            return;
        }

        for (let i: number = 0; i < 100 && (await this.tcpIn()); i++) {
            // empty
        }

        if (Client.state !== ClientMainState.GAME) {
            return;
        }

        if (!Client.mouseTracked) {
            Client.mouseTracking.length = 0;
        } else if (ClientMouseListener.mouseClickButton !== 0 || Client.mouseTracking.length >= 40) {
            Client.out.p1Enc(ClientProt.EVENT_MOUSE_MOVE);
            Client.out.p1(0);
            const start = Client.out.pos;
            let count = 0;

            for (let i = 0; i < Client.mouseTracking.length && Client.out.pos - start < 240; i++) {
                count++;

                let y = Client.mouseTracking.y[i];
                if (y < 0) {
                    y = 0;
                } else if (y > 502) {
                    y = 502;
                }

                let x = Client.mouseTracking.x[i];
                if (x < 0) {
                    x = 0;
                } else if (x > 764) {
                    x = 764;
                }

                let pos = y * 765 + x;
                if (Client.mouseTracking.y[i] === -1 && Client.mouseTracking.x[i] === -1) {
                    x = -1;
                    y = -1;
                    pos = 0x7ffff;
                }

                if (x !== Client.mouseTrackedX || y !== Client.mouseTrackedY) {
                    let dx = x - Client.mouseTrackedX;
                    Client.mouseTrackedX = x;
                    let dy = y - Client.mouseTrackedY;
                    Client.mouseTrackedY = y;

                    if (Client.mouseTrackedDelta < 8 && dx >= -32 && dx <= 31 && dy >= -32 && dy <= 31) {
                        dx += 32;
                        dy += 32;
                        Client.out.p2((Client.mouseTrackedDelta << 12) + (dx << 6) + dy);
                        Client.mouseTrackedDelta = 0;
                    } else if (Client.mouseTrackedDelta < 8) {
                        Client.out.p3(0x800000 + (Client.mouseTrackedDelta << 19) + pos);
                        Client.mouseTrackedDelta = 0;
                    } else {
                        Client.out.p4(0xc0000000 + (Client.mouseTrackedDelta << 19) + pos);
                        Client.mouseTrackedDelta = 0;
                    }
                } else if (Client.mouseTrackedDelta < 2047) {
                    Client.mouseTrackedDelta++;
                }
            }

            Client.out.psize1(Client.out.pos - start);

            if (count >= Client.mouseTracking.length) {
                Client.mouseTracking.length = 0;
            } else {
                Client.mouseTracking.length -= count;

                for (let i = 0; i < Client.mouseTracking.length; i++) {
                    Client.mouseTracking.x[i] = Client.mouseTracking.x[i + count];
                    Client.mouseTracking.y[i] = Client.mouseTracking.y[i + count];
                }
            }
        }

        if (ClientMouseListener.mouseClickButton !== 0) {
            let delta = ((ClientMouseListener.mouseClickTime - Client.prevMouseClickTime) / 50) | 0;
            if (delta > 4095) {
                delta = 4095;
            }

            Client.prevMouseClickTime = ClientMouseListener.mouseClickTime;

            let y = ClientMouseListener.mouseClickY;
            if (y < 0) {
                y = 0;
            } else if (y > 502) {
                y = 502;
            }

            let x = ClientMouseListener.mouseClickX;
            if (x < 0) {
                x = 0;
            } else if (x > 764) {
                x = 764;
            }

            const pos = y * 765 + x;

            let button = 0;
            if (ClientMouseListener.mouseClickButton === 2) {
                button = 1;
            }

            // DO NOT SEND: rev-500 mouse-click event has a 4-byte body, but this 464 server's
            // opcode 174 is size 0 — the body bytes would inject into the stream as garbage
            // opcodes; any that hit a -3 size-table entry make the server discard its ENTIRE
            // input buffer, eating real packets (this was the "walk only works sometimes" bug).
            void button;
            void pos;
        }

        if (Client.sendCameraDelay > 0) {
            Client.sendCameraDelay--;
        }

        if (ClientKeyboardListener.keyHeld[96] || ClientKeyboardListener.keyHeld[97] || ClientKeyboardListener.keyHeld[98] || ClientKeyboardListener.keyHeld[99]) {
            Client.sendCamera = true;
        }

        if (Client.sendCamera && Client.sendCameraDelay <= 0) {
            Client.sendCameraDelay = 20;
            Client.sendCamera = false;
            // 464 op 128 (Java GroundDecoration:219-223): u16 LE-shortA then u16 BE. Server
            // discards the 4 bytes, but keep byte-parity with the Java client.
            Client.out.p1Enc(ClientProt.EVENT_CAMERA_POSITION);
            Client.out.p2_alt3(Client.orbitCameraPitch);
            Client.out.p2(Client.orbitCameraYaw);
        }

        if (GameShell.focus && !Client.focusIn) {
            Client.focusIn = true;
            // DO NOT SEND: focus event body byte would inject garbage (server 174 = size 0).
        } else if (!GameShell.focus && Client.focusIn) {
            Client.focusIn = false;
            // DO NOT SEND: see above.
        }

        Client.checkMinimap();
        if (Client.state !== ClientMainState.GAME) {
            return;
        }

        Client.locChangeDoQueue();
        Client.soundsDoQueue();

        Client.timeoutTimer++;
        if (Client.timeoutTimer > 750) {
            Client.lostCon();
            return;
        }

        Client.movePlayers();
        Client.moveNpcs();
        Client.timeoutChat();

        // if (WorldMap.mapCom !== null) {
        //     WorldMap.loop();
        // }

        if (Client.crossMode !== 0) {
            Client.crossCycle += 20;

            if (Client.crossCycle >= 400) {
                Client.crossMode = 0;
            }
        }

        Client.worldUpdateNum++;

        if (Client.selectedCom !== null) {
            Client.selectedCycle++;

            if (Client.selectedCycle >= 15) {
                Client.componentUpdated(Client.selectedCom);
                Client.selectedCom = null;
            }
        }

        if (Client.objDragCom !== null) {
            Client.componentUpdated(Client.objDragCom);
            Client.objDragCycles++;

            if (ClientMouseListener.mouseX > Client.objGrabX + 5 || ClientMouseListener.mouseX < Client.objGrabX - 5 || ClientMouseListener.mouseY > Client.objGrabY + 5 || ClientMouseListener.mouseY < Client.objGrabY - 5) {
                Client.objGrabThreshold = true;
            }

            if (ClientMouseListener.mouseButton === 0) {
                if (Client.objGrabThreshold && Client.objDragCycles >= 5) {
                    if (Client.objDragCom === Client.hoveredSlotCom && Client.hoveredSlot !== Client.objDragSlot) {
                        const com: IfType = Client.objDragCom!;

                        let mode = 0;
                        if (Client.bankArrangeMode == 1 && com.clientCode == 206) {
                            mode = 1;
                        }
                        if (com.linkObjType![Client.hoveredSlot] <= 0) {
                            mode = 0;
                        }

                        if (ServerActive.isObjReplaceEnabled(Client.getActive(com))) {
                            const src = Client.objDragSlot;
                            const dst = Client.hoveredSlot;

                            com.linkObjType![dst] = com.linkObjType![src];
                            com.linkObjNumber![dst] = com.linkObjNumber![src];
                            com.linkObjType![src] = -1;
                            com.linkObjNumber![src] = 0;
                        } else if (mode == 1) {
                            let src = Client.objDragSlot;
                            const dst = Client.hoveredSlot;

                            while (src != dst) {
                                if (src > dst) {
                                    com.swapSlots(src, src - 1);
                                    src--;
                                } else if (src < dst) {
                                    com.swapSlots(src, src + 1);
                                    src++;
                                }
                            }
                        } else {
                            com.swapSlots(Client.objDragSlot, Client.hoveredSlot);
                        }

                        Client.out.p1Enc(ClientProt.INV_BUTTOND);
                        // 464 inv-swap 121 (9B): shortA toSlot, byteA swapType, intME_A iface, u16LE fromSlot
                        Client.out.p1(Client.hoveredSlot >> 8);
                        Client.out.p1(Client.hoveredSlot + 128);
                        Client.out.p1(mode + 128);
                        Client.out.p1(com.parentId >> 8);
                        Client.out.p1(com.parentId);
                        Client.out.p1(com.parentId >> 24);
                        Client.out.p1(com.parentId >> 16);
                        Client.out.p2_alt1(Client.objDragSlot);
                    }
                } else if ((Client.oneMouseButton === 1 || Client.isAddFriendOption(Client.menuNumEntries - 1)) && Client.menuNumEntries > 2) {
                    this.openMenu();
                } else if (Client.menuNumEntries > 0) {
                    Client.doAction(Client.menuNumEntries - 1);
                }

                Client.selectedCycle = 10;
                ClientMouseListener.mouseClickButton = 0;
                Client.objDragCom = null;
            }
        }

        const previousTooltipCom: IfType | null = Client.tooltipCom;
        const previousOverCom: IfType | null = Client.overCom;
        Client.dragParentFound = false;
        Client.dropCom = null;
        Client.overCom = null;
        Client.dragging = false;
        Client.tooltipCom = null;

        Client.keypresses = 0;
        while (ClientKeyboardListener.pollKey() && Client.keypresses < 128) {
            if (Client.mobaFilterKey(ClientKeyboardListener.code, ClientKeyboardListener.ch)) {
                continue;
            }
            Client.keypressKeycodes[Client.keypresses] = ClientKeyboardListener.code;
            Client.keypressKeychars[Client.keypresses] = ClientKeyboardListener.ch;
            Client.keypresses++;
        }

        // WorldMap.mapCom = null;
        if (Client.toplevelinterface !== -1) {
            Client.loopInterface(0, GameShell.sHei, 0, 0, GameShell.sWid, Client.toplevelinterface, 0);
        }

        Client.transmitNum++;
        const isLiveHookRequest = (req: HookReq): boolean => {
            const com = req.component!;
            if (com.subId < 0) {
                return true;
            }
            const parent = IfType.get(com.layerId);
            return parent !== null && parent.subcomponents !== null && parent.subcomponents.length > com.subId && parent.subcomponents[com.subId] === com;
        };
        while (true) {
            const req = Client.hookRequestsTimer.popFront();
            if (!req) {
                break;
            }
            if (!isLiveHookRequest(req)) {
                continue;
            }
            ScriptRunner.executeScript(req, 200000);
        }
        while (true) {
            const req = Client.hookRequestsMouseStop.popFront();
            if (!req) {
                break;
            }
            if (!isLiveHookRequest(req)) {
                continue;
            }
            ScriptRunner.executeScript(req, 200000);
        }
        while (true) {
            const req = Client.hookRequests.popFront();
            if (!req) {
                break;
            }
            if (!isLiveHookRequest(req)) {
                continue;
            }
            ScriptRunner.executeScript(req, 200000);
        }

        // if (Client.field3532 && WorldMap.mapCom === null) {
        //     Client.field3532 = false;
        // }
        if (Client.dragCom !== null) {
            this.loopIf3Drag();
        }
        if (World.groundX !== -1) {
            const x: number = World.groundX;
            const z: number = World.groundZ;
            const localPlayer = Client.localPlayer!;
            let success: boolean;
            if (SkillshotOverlay.armedAbility !== 0) {
                // Armed skillshot: the ground click FIRES the cast at the picked tile
                // instead of walking (Java GroundDecoration armed-fire branch). No
                // click-cross, matching Java.
                SkillshotOverlay.fireAtTile(x, z);
                success = false;
            } else if (localPlayer.fineStreamed) {
                // fine-move mode: sub-tile click (opcode 61) — the server glides the
                // player; no client-side path predictor (Java GroundDecoration hook)
                success = FineStream.sendFineClick(x, z);
            } else {
                success = Client.tryMove(0, 0, z, x, localPlayer.routeX[0], 0, 0, 0, true, 0, localPlayer.routeZ[0]);
            }
            World.groundX = -1;

            if (success) {
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossCycle = 0;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossMode = 1;
            }
        }

        this.mouseLoop();

        if (previousOverCom !== Client.overCom) {
            if (previousOverCom !== null) {
                Client.componentUpdated(previousOverCom);
            }
            if (Client.overCom !== null) {
                Client.componentUpdated(Client.overCom);
            }
        }
        if (previousTooltipCom !== Client.tooltipCom && Client.tooltipNum === Client.tooltipRedraw) {
            if (previousTooltipCom !== null) {
                Client.componentUpdated(previousTooltipCom);
            }
            if (Client.tooltipCom !== null) {
                Client.componentUpdated(Client.tooltipCom);
            }
        }
        if (Client.tooltipCom === null) {
            if (Client.tooltipNum > 0) {
                Client.tooltipNum--;
            }
        } else if (Client.tooltipNum < Client.tooltipRedraw) {
            Client.tooltipNum++;
            if (Client.tooltipNum === Client.tooltipRedraw) {
                Client.componentUpdated(Client.tooltipCom);
            }
        }

        Client.followCamera();
        if (Client.cinemaCam) {
            Client.cinemaCamera();
        }

        for (let i: number = 0; i < 5; i++) {
            Client.camShakeCycle[i]++;
        }

        const mouseIdle = ClientMouseListener.getIdleTimer();
        const keyboardIdle = ClientKeyboardListener.getIdleTimer();
        if (mouseIdle > 4500 && keyboardIdle > 4500) {
            Client.logoutTimer = 250;
            ClientMouseListener.setIdleTimer(4000);

            Client.out.p1Enc(ClientProt.IDLE_TIMER);
        }

        Client.macroCameraCycle++;
        Client.macroMinimapCycle++;
        Client.noTimeoutTimer++;
        if (Client.macroCameraCycle > 500) {
            Client.macroCameraCycle = 0;

            const rand: number = (Math.random() * 8.0) | 0;
            if ((rand & 0x4) === 4) {
                Client.macroCameraAngle += Client.macroCameraAngleModifier;
            }
            if ((rand & 0x2) === 2) {
                Client.macroCameraZ += Client.macroCameraZModifier;
            }
            if ((rand & 0x1) === 1) {
                Client.macroCameraX += Client.macroCameraXModifier;
            }
        }

        if (Client.macroMinimapCycle > 500) {
            Client.macroMinimapCycle = 0;

            const rand: number = (Math.random() * 8.0) | 0;
            if ((rand & 0x2) === 2) {
                Client.macroMinimapZoom += Client.macroMinimapZoomModifier;
            }
            if ((rand & 0x1) === 1) {
                Client.macroMinimapAngle += Client.macroMinimapAngleModifier;
            }
        }

        if (Client.macroMinimapZoom < -20) {
            Client.macroMinimapZoomModifier = 1;
        }
        if (Client.macroMinimapZoom > 10) {
            Client.macroMinimapZoomModifier = -1;
        }
        if (Client.macroCameraZ < -55) {
            Client.macroCameraZModifier = 2;
        }
        if (Client.macroMinimapAngle < -60) {
            Client.macroMinimapAngleModifier = 2;
        }
        if (Client.macroCameraAngle < -40) {
            Client.macroCameraAngleModifier = 1;
        }
        if (Client.macroCameraZ > 55) {
            Client.macroCameraZModifier = -2;
        }
        if (Client.macroCameraAngle > 40) {
            Client.macroCameraAngleModifier = -1;
        }
        if (Client.macroMinimapAngle > 60) {
            Client.macroMinimapAngleModifier = -2;
        }
        if (Client.macroCameraX < -50) {
            Client.macroCameraXModifier = 2;
        }
        if (Client.macroCameraX > 50) {
            Client.macroCameraXModifier = -2;
        }
        if (Client.noTimeoutTimer > 50) {
            Client.out.p1Enc(ClientProt.NO_TIMEOUT);
            Client.out.p1(0); // 464 op 7 (NO_TIMEOUT) carries a 1-byte body
        }

        try {
            if (Client.stream && Client.out.pos > 0) {
                Client.stream.write(Client.out.pos, Client.out.data);
                Client.out.pos = 0;
                Client.noTimeoutTimer = 0;
            }
        } catch (e) {
            if (e instanceof WebSocket && e.readyState === 3) {
                // IO error
                Client.lostCon();
                return;
            } else {
                // logic error
                Client.logout();
            }
        }
    }

    // jag::oldscape::Client::GameDraw
    gameDraw(): void {
        // MOBA screen modes: watch the ::fs varp / mode transitions, then stamp the
        // pane-548 layout for the current mode before anything draws.
        ScreenMode.tick();
        ScreenMode.applyLayout();
        if (!Client.isMenuOpen) {
            Client.menuAction[0] = 1007;
            Client.menuVerb[0] = Text.cancel;
            Client.menuNumEntries = 1;
            Client.menuSubject[0] = '';
            Client.sceneRowStart = 0;
            Client.sceneRowEnd = 0;
        }
        if (Client.toplevelinterface !== -1) {
            Client.animateInterface(Client.toplevelinterface);
        }
        for (let i = 0; i < Client.componentDrawCount; i++) {
            if (Client.componentDirtyArea[i]) {
                Client.componentBlitArea[i] = true;
            }
            Client.componentRedraw[i] = Client.componentDirtyArea[i];
            Client.componentDirtyArea[i] = false;
        }
        Client.hoveredSlotCom = null;
        Client.menuMouseY = -1;
        Client.componentDrawTime = Client.loopCycle;
        Client.menuMouseX = -1;
        if (Client.toplevelinterface !== -1) {
            Client.componentDrawCount = 0;
            this.drawInterface(GameShell.sHei, Client.toplevelinterface, 0, -1, 0, 0, 0, GameShell.sWid);
        }
        Pix2D.resetClipping();
        Client.sortMinimenu();
        if (Client.isMenuOpen) {
            this.drawMinimenu();
        } else if (Client.menuMouseY !== -1) {
            Client.drawFeedback(Client.menuMouseX, Client.menuMouseY);
        }
        if (Client.componentRectDebug === 3) {
            for (let i = 0; i < Client.componentDrawCount; i++) {
                if (Client.componentRedraw[i]) {
                    Pix2D.fillRectTrans(Client.componentDrawX[i], Client.componentDrawY[i], Client.componentDrawWidth[i], Client.componentDrawHeight[i], 0xff00ff, 128);
                } else if (Client.componentBlitArea[i]) {
                    Pix2D.fillRectTrans(Client.componentDrawX[i], Client.componentDrawY[i], Client.componentDrawWidth[i], Client.componentDrawHeight[i], 0xff0000, 128);
                }
            }
        }
        BgSound.doMix(Client.localPlayer!.z, Client.worldUpdateNum, Client.localPlayer!.x, Client.minusedlevel);
        Client.worldUpdateNum = 0;
    }

    // jag::oldscape::Client::LoginDone
    static loginDone(): void {
        console.log('[dbg] loginDone -> entering game, psize=' + Client.psize + ' ptype=' + Client.ptype);
        Client.prevMouseClickTime = 0;
        Client.mouseTracking.length = 0;
        Client.mouseTrackedDelta = 0;
        Client.focusIn = true;
        GameShell.focus = true;
        Client.ptype2 = -1;
        Client.out.pos = 0;
        Client.ptype1 = -1;
        Client.logoutTimer = 0;
        Client.ptype0 = -1;
        Client.rebootTimer = 0;
        Client.timeoutTimer = 0;
        Client.ptype = -1;
        Client.in.pos = 0;
        for (let var0 = 0; var0 < Client.field1171.length; var0++) {
            Client.field1171[var0] = null;
        }
        Client.menuNumEntries = 0;
        Client.isMenuOpen = false;
        ClientMouseListener.setIdleTimer(0);

        for (let var1 = 0; var1 < 100; var1++) {
            Client.chatText[var1] = null;
        }
        Client.chatHistoryLength = 0;

        Client.minimapFlagZ = 0;
        Client.macroMinimapZoom = ((Math.random() * 30.0) | 0) - 20;
        Client.minimapFlagX = 0;
        Client.macroMinimapAngle = ((Math.random() * 120.0) | 0) - 60;
        Client.playerCount = 0;
        Client.macroCameraZ = ((Math.random() * 110.0) | 0) - 55;
        Client.orbitCameraYaw = (((Math.random() * 20.0) | 0) - 10) & 0x7ff;
        Client.waveCount = 0;
        Client.minimapState = 0;
        Client.macroCameraAngle = ((Math.random() * 80.0) | 0) - 40;
        Client.macroCameraX = ((Math.random() * 100.0) | 0) - 50;
        Client.targetMode = false;
        Client.minimapLevel = -1;
        Client.npcCount = 0;
        Client.useMode = 0;

        for (let var2 = 0; var2 < 2048; var2++) {
            Client.players[var2] = null;
            Client.playerAppearanceBuffer[var2] = null;
        }

        for (let var3 = 0; var3 < 32768; var3++) {
            Client.npc[var3] = null;
        }

        Client.localPlayer = Client.players[2047] = new ClientPlayer();
        Client.projectiles.clear();
        Client.spotanims.clear();

        for (let var4 = 0; var4 < 4; var4++) {
            for (let var5 = 0; var5 < 104; var5++) {
                for (let var6 = 0; var6 < 104; var6++) {
                    Client.groundObj[var4][var5][var6] = null;
                }
            }
        }

        Client.locChanges = new LinkList();
        Client.friendCount = 0;
        Client.friendServerStatus = 0;
        for (let var7 = 0; var7 < VarpType.numDefinitions; var7++) {
            const var8 = VarpType.list(var7);
            if (var8 !== null && var8.clientcode === 0) {
                VarCache.varServ[var7] = 0;
                VarCache.var[var7] = 0;
            }
        }
        for (let var9 = 0; var9 < VarCache.varcInt.length; var9++) {
            VarCache.varcInt[var9] = -1;
        }
        if (Client.toplevelinterface !== -1) {
            IfType.unloadInterface(Client.toplevelinterface);
        }
        for (let var10 = Client.subinterfaces.search() as SubInterface | null; var10 !== null; var10 = Client.subinterfaces.findnext() as SubInterface | null) {
            Client.closeSubInterface(var10, true);
        }
        Client.toplevelinterface = -1;
        Client.subinterfaces = new HashTable<SubInterface>(8);
        Client.menuNumEntries = 0;
        Client.resumePauseCom = null;
        Client.isMenuOpen = false;
        Client.idkDesign.setAppearance(-1, null, new Int32Array(5), false);

        for (let var11 = 0; var11 < 8; var11++) {
            Client.playerOp[var11] = null;
            Client.playerOpPriority[var11] = false;
        }

        ClientInvCache.deleteAll();
        Client.js5Loading = true;
        for (let var12 = 0; var12 < 100; var12++) {
            Client.componentDirtyArea[var12] = true;
        }
        Client.friendChatCount = 0;
        Client.chatDisplayName = null;
        Client.friendChatList = null;
        for (let var13 = 0; var13 < 6; var13++) {
            Client.field140[var13] = new StockMarketSlot();
        }
        for (let var14 = 0; var14 < 25; var14++) {
            Client.statEffectiveLevel[var14] = 0;
            Client.statBaseLevel[var14] = 0;
            Client.statXP[var14] = 0;
        }
        XpDropOverlay.resetForLogout();
        SkillshotOverlay.armedAbility = 0;
        SkillshotOverlay.resetKit();
        AbilityBarOverlay.resetForLogout();
        Client.mobaTyping = false;
        Client.clientpalette = LocType.clientpalette = NpcType.clientpalette = ObjType.clientpalette = new Int16Array(256);
        Client.sendCamera = true;
        Client.moveAction = Text.walkhere;
    }

    // jag::oldscape::Client::LoginError
    static loginError(arg0: number): void {
        if (arg0 === -3) {
            TitleScreen.loginMes(Text.loginm3_c, Text.loginm3_a, Text.loginm3_b);
        } else if (arg0 === -2) {
            TitleScreen.loginMes(Text.loginm2_c, Text.loginm2_a, Text.loginm2_b);
        } else if (arg0 === -1) {
            TitleScreen.loginMes(Text.loginm1_c, Text.loginm1_a, Text.loginm1_b);
        } else if (arg0 === 3) {
            TitleScreen.loginMes(Text.login3_c, Text.login3_a, Text.login3_b);
        } else if (arg0 === 4) {
            TitleScreen.loginMes(Text.login4_c, Text.login4_a, Text.login4_b);
        } else if (arg0 === 5) {
            TitleScreen.loginMes(Text.login5_c, Text.login5_a, Text.login5_b);
        } else if (arg0 === 6) {
            TitleScreen.loginMes(Text.login6_c, Text.login6_a, Text.login6_b);
        } else if (arg0 === 7) {
            TitleScreen.loginMes(Text.login7_c, Text.login7_a, Text.login7_b);
        } else if (arg0 === 8) {
            TitleScreen.loginMes(Text.login8_c, Text.login8_a, Text.login8_b);
        } else if (arg0 === 9) {
            TitleScreen.loginMes(Text.login9_c, Text.login9_a, Text.login9_b);
        } else if (arg0 === 10) {
            TitleScreen.loginMes(Text.login10_c, Text.login10_a, Text.login10_b);
        } else if (arg0 === 11) {
            TitleScreen.loginMes(Text.login11_c, Text.login11_a, Text.login11_b);
        } else if (arg0 === 12) {
            TitleScreen.loginMes(Text.login12_c, Text.login12_a, Text.login12_b);
        } else if (arg0 === 13) {
            TitleScreen.loginMes(Text.login13_c, Text.login13_a, Text.login13_b);
        } else if (arg0 === 14) {
            TitleScreen.loginMes(Text.login14_c, Text.login14_a, Text.login14_b);
        } else if (arg0 === 16) {
            TitleScreen.loginMes(Text.login16_c, Text.login16_a, Text.login16_b);
        } else if (arg0 === 17) {
            TitleScreen.loginMes(Text.login17_c, Text.login17_a, Text.login17_b);
        } else if (arg0 === 18) {
            TitleScreen.loginMes(Text.login18_c, Text.login18_a, Text.login18_b);
        } else if (arg0 === 19) {
            TitleScreen.loginMes(Text.login19_c, Text.login19_a, Text.login19_b);
        } else if (arg0 === 20) {
            TitleScreen.loginMes(Text.login20_c, Text.login20_a, Text.login20_b);
        } else if (arg0 === 22) {
            TitleScreen.loginMes(Text.login22_c, Text.login22_a, Text.login22_b);
        } else if (arg0 === 23) {
            TitleScreen.loginMes(Text.login23_c, Text.login23_a, Text.login23_b);
        } else if (arg0 === 24) {
            TitleScreen.loginMes(Text.login24_c, Text.login24_a, Text.login24_b);
        } else if (arg0 === 25) {
            TitleScreen.loginMes(Text.login25_c, Text.login25_a, Text.login25_b);
        } else if (arg0 === 26) {
            TitleScreen.loginMes(Text.login26_c, Text.login26_a, Text.login26_b);
        } else if (arg0 === 27) {
            TitleScreen.loginMes(Text.login27_c, Text.login27_a, Text.login27_b);
        } else {
            TitleScreen.loginMes(Text.loginmis_c, Text.loginmis_a, Text.loginmis_b);
        }

        Client.setMainState(10);
    }

    // jag::oldscape::Client::ReconnectDone
    static reconnectDone(): void {
        Client.ptype2 = -1;
        Client.rebootTimer = 0;
        Client.ptype = -1;
        Client.out.pos = 0;
        Client.timeoutTimer = 0;
        Client.menuNumEntries = 0;
        Client.minimapState = 0;
        Client.ptype0 = -1;
        Client.in.pos = 0;
        Client.psize = 0;
        Client.ptype1 = -1;
        Client.minimapFlagX = 0;
        Client.isMenuOpen = false;

        for (let var0 = 0; var0 < Client.players.length; var0++) {
            if (Client.players[var0] !== null) {
                Client.players[var0]!.targetId = -1;
            }
        }

        for (let var1 = 0; var1 < Client.npc.length; var1++) {
            if (Client.npc[var1] !== null) {
                Client.npc[var1]!.targetId = -1;
            }
        }

        ClientInvCache.deleteAll();
        Client.setMainState(30);
        for (let var2 = 0; var2 < 100; var2++) {
            Client.componentDirtyArea[var2] = true;
        }
    }

    // jag::oldscape::Client::Logout
    static logout(): void {
        if (Client.stream != null) {
            Client.stream.close();
            Client.stream = null;
        }

        Client.clearCaches();
        World.resetMap();

        for (let var0 = 0; var0 < 4; var0++) {
            Client.collision[var0]!.reset();
        }

        // WorldMap.reset();
        MidiManager.fadeStop();
        Client.playingJingle = false;
        Client.nextMidiSong = -1;
        BgSound.reset();
        Client.setMainState(10);
    }

    static clearCaches(): void {
        FloType.resetCache();
        FluType.resetCache();
        IdkType.resetCache();
        LocType.resetCache();
        NpcType.resetCache();
        ObjType.resetCache();
        SeqType.resetCache();
        SpotType.resetCache();
        VarBitType.resetCache();
        VarpType.resetCache();
        PlayerModel.resetCache();
        IfType.resetCache();
        (Pix3D.textureManager as TextureManager).reset();
        ClientScript.cache.clear();
        Client.anims!.discardAllFiles();
        Client.bases!.discardAllFiles();
        Client.interfaces!.discardAllFiles();
        Client.jagFX!.discardAllFiles();
        Client.maps!.discardAllFiles();
        Client.songs!.discardAllFiles();
        Client.models!.discardAllFiles();
        Client.sprites!.discardAllFiles();
        Client.binary!.discardAllFiles();
        Client.jingles!.discardAllFiles();
        Client.scripts!.discardAllFiles();
    }

    // jag::oldscape::Client::LostCon
    static lostCon(): void {
        if (Client.logoutTimer > 0) {
            Client.logout();
        } else {
            Client.setMainState(40);
            Client.prevStream = Client.stream;
            Client.stream = null;
        }
    }

    static doAudio(): void {
        if (Client.synthPlayer !== null) {
            Client.synthPlayer.cycle();
        }
        if (Client.midiPlayer !== null) {
            Client.midiPlayer.cycle();
        }
    }

    // jag::oldscape::Client::TriggerSeqSound
    static triggerSeqSound(arg0: boolean, arg1: number, arg2: number, arg3: number, arg4: SeqType): void {
        if (Client.waveCount >= 50 || arg4.sound === null || arg4.sound.length < 1 || arg2 >= arg4.sound.length || arg4.sound[arg2] === null) {
            return;
        }
        const var5: number = arg4.sound[arg2]![0];
        let var6: number = var5 >> 8;
        const var7: number = (var5 >> 4) & 0x7;
        const var8: number = var5 & 0xf;
        if (arg4.sound[arg2]!.length > 1) {
            const var9: number = (Math.random() * arg4.sound[arg2]!.length) | 0;
            if (var9 > 0) {
                var6 = arg4.sound[arg2]![var9];
            }
        }
        if (var8 === 0) {
            if (arg0) {
                Client.playSynth(var7, 0, var6);
            }
        } else if (Client.ambientVolume !== 0) {
            Client.waveSoundIds[Client.waveCount] = var6;
            Client.waveLoops[Client.waveCount] = var7;
            Client.waveDelay[Client.waveCount] = 0;
            const var10: number = ((arg3 - 64) / 128) | 0;
            Client.waveSounds[Client.waveCount] = null;
            const var11: number = ((arg1 - 64) / 128) | 0;
            Client.waveAmbient[Client.waveCount] = (var10 << 16) + (var11 << 8) + var8;
            Client.waveCount++;
        }
    }

    // jag::oldscape::Client::PlaySongs
    static playSongs(arg0: number): void {
        if (arg0 === -1 && !Client.playingJingle) {
            MidiManager.stop();
        } else if (arg0 !== -1 && (arg0 !== Client.nextMidiSong || !MidiManager.isInitialised()) && Client.midiVolume !== 0 && !Client.playingJingle) {
            MidiManager.swapSongs(Client.midiVolume, arg0, Client.songs!);
        }
        Client.nextMidiSong = arg0;
    }

    // jag::oldscape::Client::PlayJingle
    static playJingle(arg0: number, arg1: number): void {
        if (Client.midiVolume !== 0 && arg0 !== -1) {
            MidiManager.play(Client.jingles!, arg0, Client.midiVolume);
            Client.playingJingle = true;
        }
    }

    // jag::oldscape::Client::PlaySynth
    static playSynth(arg0: number, arg1: number, arg2: number): void {
        if (Client.waveVolume === 0 || arg0 === 0 || Client.waveCount >= 50 || arg2 === -1) {
            return;
        }
        Client.waveSoundIds[Client.waveCount] = arg2;
        Client.waveLoops[Client.waveCount] = arg0;
        Client.waveDelay[Client.waveCount] = arg1;
        Client.waveSounds[Client.waveCount] = null;
        Client.waveAmbient[Client.waveCount] = 0;
        Client.waveCount++;
    }

    // jag::oldscape::minimap::Minimap::GlMinimap
    static minimapLoop(arg0: number, arg1: number, arg2: IfType): void {
        if (Client.minimapState !== 0 && Client.minimapState !== 3) {
            return;
        }

        const var3: number = arg1 - ((arg2.renderHeight / 2) | 0);
        const var4: number = arg0 - ((arg2.renderWidth / 2) | 0);
        const var5: number = (Client.orbitCameraYaw + Client.macroMinimapAngle) & 0x7ff;
        const var6: number = Pix3D.cosTable[var5];
        const var7: number = Pix3D.sinTable[var5];
        const var8: number = ((Client.macroMinimapZoom + 256) * var6) >> 8;
        const var9: number = ((Client.macroMinimapZoom + 256) * var7) >> 8;
        const var10: number = (var4 * var8 + var9 * var3) >> 11;
        const var11: number = (var10 + Client.localPlayer!.x) >> 7;
        const var12: number = (var8 * var3 - var4 * var9) >> 11;
        const var13: number = (Client.localPlayer!.z - var12) >> 7;
        const var14: boolean = Client.tryMove(0, 0, var13, var11, Client.localPlayer!.routeX[0], 0, 0, 1, true, 0, Client.localPlayer!.routeZ[0]);
        if (!var14) {
            return;
        }
        Client.out.p1(var4);
        Client.out.p1(var3);
        Client.out.p2(Client.orbitCameraYaw);
        Client.out.p1(57);
        Client.out.p1(Client.macroMinimapAngle);
        Client.out.p1(Client.macroMinimapZoom);
        Client.out.p1(89);
        Client.out.p2(Client.localPlayer!.x);
        Client.out.p2(Client.localPlayer!.z);
        Client.out.p1(Client.field2186);
        Client.out.p1(63);
    }

    // jag::oldscape::Client::GlTimeoutChat
    static timeoutChat(): void {
        for (let var0: number = -1; var0 < Client.playerCount; var0++) {
            let var1: number;
            if (var0 === -1) {
                var1 = 2047;
            } else {
                var1 = Client.playerIds[var0];
            }

            const var2: ClientPlayer | null = Client.players[var1];
            if (var2 !== null && var2.chatTimer > 0) {
                var2.chatTimer--;

                if (var2.chatTimer === 0) {
                    var2.chat = null;
                }
            }
        }

        for (let var3: number = 0; var3 < Client.npcCount; var3++) {
            const var4: number = Client.npcIds[var3];
            const var5: ClientNpc | null = Client.npc[var4];

            if (var5 !== null && var5.chatTimer > 0) {
                var5.chatTimer--;

                if (var5.chatTimer === 0) {
                    var5.chat = null;
                }
            }
        }
    }

    // jag::oldscape::Client::DoCheat
    static doCheat(arg0: string): void {
        if (Client.staffmodlevel >= 2) {
            if (arg0.toLowerCase() === '::gc') {
                const memory = (globalThis.performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
                const usedKb = memory !== undefined && memory.usedJSHeapSize !== undefined ? (memory.usedJSHeapSize / 1024) | 0 : 0;
                Client.addChat('mem=' + usedKb + 'k', 0, '');
            }
            if (arg0.toLowerCase() === '::clientdrop') {
                Client.lostCon();
            }
            if (arg0.toLowerCase() === '::fpson') {
                Client.showFps = true;
            }
            if (arg0.toLowerCase() === '::fpsoff') {
                Client.showFps = false;
            }
            if (arg0.toLowerCase() === '::autoshadow on') {
                // hd
            }
            if (arg0.toLowerCase() === '::autoshadow off') {
                // hd
            }
            if (arg0.toLowerCase() === '::noclip') {
                for (let var4 = 0; var4 < 4; var4++) {
                    for (let var5 = 1; var5 < 103; var5++) {
                        for (let var6 = 1; var6 < 103; var6++) {
                            Client.collision[var4]!.flags[var5][var6] = 0;
                        }
                    }
                }
            }
            if (arg0.startsWith('::fps') && Client.modewhere !== 0) {
                GameShell.setFramerate(Number.parseInt(arg0.substring(6), 10));
            }
            if (arg0.toLowerCase() === '::errortest' && Client.modewhere === 2) {
                throw new Error();
            }
            if (arg0.startsWith('::rect_debug')) {
                Client.componentRectDebug = Number.parseInt(arg0.substring(12).trim(), 10);
                Client.addChat('rect_debug=' + Client.componentRectDebug, 0, '');
            }
            if (arg0.toLowerCase() === '::qa_op_test') {
                Client.qaOpTest = true;
            }
        }

        if (arg0.toLowerCase() === '::perf') {
            Client.showPerf = !Client.showPerf;
            Client.addChat('perf overlay ' + (Client.showPerf ? 'on' : 'off'), 0, '');
            return;
        }
        if (arg0.toLowerCase() === '::vsync') {
            Timer.rafAlign = !Timer.rafAlign;
            Client.addChat('vsync frame pacing ' + (Timer.rafAlign ? 'on (rAF)' : 'off (setTimeout)'), 0, '');
            return;
        }
        if (arg0.toLowerCase() === '::settings' || arg0.toLowerCase() === '::fs') {
            // Settings panel (screen size + perf toggles). ::fs kept as an alias; a
            // preset click applies via ScreenMode.applyPreset — that click is the
            // user gesture the browser Fullscreen API requires. Fully client-side.
            ScreenSizeDialog.open = !ScreenSizeDialog.open;
            return;
        }

        Client.out.p1Enc(ClientProt.CLIENT_CHEAT);
        Client.out.p1(arg0.length - 1);
        Client.out.pjstr(arg0.substring(2));
    }

    // jag::oldscape::Client::GlFollowCamera
    static followCamera(): void {
        // QoL: mousewheel zoom while the pointer is over the 3D viewport (consumed here so
        // interface scrollbars under other areas keep their wheel behaviour)
        if (
            Client.mouseWheelRotation !== 0 &&
            ClientMouseListener.mouseX >= Client.viewportX &&
            ClientMouseListener.mouseX < Client.viewportX + Client.viewportW &&
            ClientMouseListener.mouseY >= Client.viewportY &&
            ClientMouseListener.mouseY < Client.viewportY + Client.viewportH &&
            !ScreenSizeDialog.open &&
            !ScreenMode.cursorOverHud(ClientMouseListener.mouseX, ClientMouseListener.mouseY) &&
            !AbilityBarOverlay.mouseOverBar(ClientMouseListener.mouseX, ClientMouseListener.mouseY) &&
            !HudPanelOverlay.mouseOverGrid(ClientMouseListener.mouseX, ClientMouseListener.mouseY)
        ) {
            Client.cameraZoom += Client.mouseWheelRotation * 45;
            if (Client.cameraZoom < 300) {
                Client.cameraZoom = 300;
            } else if (Client.cameraZoom > 1200) {
                Client.cameraZoom = 1200;
            }
            Client.mouseWheelRotation = 0;
        }

        // QoL: middle-button drag rotates the camera (Java-client style): dx -> yaw, dy -> pitch.
        // clampCameraAngle() (called after the velocity step) bounds the pitch.
        if (ClientMouseListener.middleDown) {
            const dragDx: number = ClientMouseListener.nextMouseX - ClientMouseListener.middleLastX;
            const dragDy: number = ClientMouseListener.nextMouseY - ClientMouseListener.middleLastY;
            Client.orbitCameraYaw = (Client.orbitCameraYaw - dragDx * 2) & 0x7ff;
            Client.orbitCameraPitch += dragDy;
            ClientMouseListener.middleLastX = ClientMouseListener.nextMouseX;
            ClientMouseListener.middleLastY = ClientMouseListener.nextMouseY;
        }

        // WASD aliases the arrow keys for camera control (A=48, D=50, W=33, S=49 in the
        // client's internal keycodes), gated on the ::settings WASD toggle. While on,
        // the MOBA key filter consumes the letters so they never type into chat.
        // typing mode: the letters go to chat, so they must not ALSO pan the camera
        // (arrow keys still steer while typing — Java WasdCamera behaviour)
        const wasd: boolean = Client.wasdMode && !Client.mobaTyping;
        const var0: number = Client.localPlayer!.z + Client.macroCameraZ;
        if (ClientKeyboardListener.keyHeld[96] || (wasd && ClientKeyboardListener.keyHeld[48])) {
            Client.orbitCameraYawVelocity += ((-Client.orbitCameraYawVelocity - 24) / 2) | 0;
        } else if (ClientKeyboardListener.keyHeld[97] || (wasd && ClientKeyboardListener.keyHeld[50])) {
            Client.orbitCameraYawVelocity += ((24 - Client.orbitCameraYawVelocity) / 2) | 0;
        } else {
            Client.orbitCameraYawVelocity = (Client.orbitCameraYawVelocity / 2) | 0;
        }

        if (ClientKeyboardListener.keyHeld[98] || (wasd && ClientKeyboardListener.keyHeld[33])) {
            Client.orbitCameraPitchVelocity += ((12 - Client.orbitCameraPitchVelocity) / 2) | 0;
        } else if (ClientKeyboardListener.keyHeld[99] || (wasd && ClientKeyboardListener.keyHeld[49])) {
            Client.orbitCameraPitchVelocity += ((-Client.orbitCameraPitchVelocity - 12) / 2) | 0;
        } else {
            Client.orbitCameraPitchVelocity = (Client.orbitCameraPitchVelocity / 2) | 0;
        }

        // MOBA free camera (SPACE lock toggle + League edge-pan): when unlocked the
        // focus target is the free anchor instead of the champion; the stock >500
        // snap below makes re-locking jump-cut straight back to the champion.
        MobaCamera.tick();
        const var1: number = MobaCamera.targetEast(Client.localPlayer!.x + Client.macroCameraX);
        const mcNorth: number = MobaCamera.targetNorth(var0);
        if (Client.orbitCameraX - var1 < -500 || Client.orbitCameraX - var1 > 500 || Client.orbitCameraZ - mcNorth < -500 || Client.orbitCameraZ - mcNorth > 500) {
            Client.orbitCameraX = var1;
            Client.orbitCameraZ = mcNorth;
        }

        if (var1 !== Client.orbitCameraX) {
            Client.orbitCameraX += ((var1 - Client.orbitCameraX) / 16) | 0;
        }

        Client.orbitCameraYaw += (Client.orbitCameraYawVelocity / 2) | 0;
        Client.orbitCameraPitch += (Client.orbitCameraPitchVelocity / 2) | 0;
        if (Client.orbitCameraZ !== mcNorth) {
            Client.orbitCameraZ += ((mcNorth - Client.orbitCameraZ) / 16) | 0;
        }
        Client.clampCameraAngle();
    }

    // jag::oldscape::Client::GlCinemaCamera
    static cinemaCamera(): void {
        const var0: number = Client.camMoveToLx * 128 + 64;
        const var1: number = Client.camMoveToLz * 128 + 64;
        const var2: number = Client.getAvH(var0, var1, Client.minusedlevel) - Client.camMoveToHei;
        if (Client.camX < var0) {
            Client.camX += (((Client.camMoveToRate2 * (var0 - Client.camX)) / 1000) | 0) + Client.camMoveToRate;
            if (var0 < Client.camX) {
                Client.camX = var0;
            }
        }
        if (var1 > Client.camZ) {
            Client.camZ += ((((var1 - Client.camZ) * Client.camMoveToRate2) / 1000) | 0) + Client.camMoveToRate;
            if (var1 < Client.camZ) {
                Client.camZ = var1;
            }
        }
        if (var0 < Client.camX) {
            Client.camX -= ((((Client.camX - var0) * Client.camMoveToRate2) / 1000) | 0) + Client.camMoveToRate;
            if (var0 > Client.camX) {
                Client.camX = var0;
            }
        }
        const var3: number = Client.camLookAtLx * 128 + 64;
        if (Client.camZ > var1) {
            Client.camZ -= Client.camMoveToRate + (((Client.camMoveToRate2 * (Client.camZ - var1)) / 1000) | 0);
            if (Client.camZ < var1) {
                Client.camZ = var1;
            }
        }
        if (Client.camY < var2) {
            Client.camY += (((Client.camMoveToRate2 * (var2 - Client.camY)) / 1000) | 0) + Client.camMoveToRate;
            if (Client.camY > var2) {
                Client.camY = var2;
            }
        }
        const var4: number = Client.camLookAtLz * 128 + 64;
        if (var2 < Client.camY) {
            Client.camY -= Client.camMoveToRate + ((((Client.camY - var2) * Client.camMoveToRate2) / 1000) | 0);
            if (Client.camY < var2) {
                Client.camY = var2;
            }
        }
        const var5: number = Client.getAvH(var3, var4, Client.minusedlevel) - Client.camLookAtHei;
        const var6: number = var3 - Client.camX;
        const var7: number = var5 - Client.camY;
        const var8: number = var4 - Client.camZ;
        const var9: number = Math.sqrt(var6 * var6 + var8 * var8) | 0;
        let var10: number = ((Math.atan2(var7, var9) * 325.949) | 0) & 0x7ff;
        const var11: number = ((Math.atan2(var6, var8) * -325.949) | 0) & 0x7ff;
        if (var10 < 128) {
            var10 = 128;
        }
        let var12: number = var11 - Client.camYaw;
        if (var12 > 1024) {
            var12 -= 2048;
        }
        if (var10 > 383) {
            var10 = 383;
        }
        if (var12 < -1024) {
            var12 += 2048;
        }
        if (Client.camPitch < var10) {
            Client.camPitch += ((((var10 - Client.camPitch) * Client.camLookAtRate2) / 1000) | 0) + Client.camLookAtRate;
            if (Client.camPitch > var10) {
                Client.camPitch = var10;
            }
        }
        if (var12 > 0) {
            Client.camYaw += (((Client.camLookAtRate2 * var12) / 1000) | 0) + Client.camLookAtRate;
            Client.camYaw &= 0x7ff;
        }
        if (var12 < 0) {
            Client.camYaw -= Client.camLookAtRate + (((Client.camLookAtRate2 * -var12) / 1000) | 0);
            Client.camYaw &= 0x7ff;
        }
        if (Client.camPitch > var10) {
            Client.camPitch -= ((((Client.camPitch - var10) * Client.camLookAtRate2) / 1000) | 0) + Client.camLookAtRate;
            if (Client.camPitch < var10) {
                Client.camPitch = var10;
            }
        }
        let var13: number = var11 - Client.camYaw;
        if (var13 > 1024) {
            var13 -= 2048;
        }
        if (var13 < -1024) {
            var13 += 2048;
        }
        if ((var13 < 0 && var12 > 0) || (var13 > 0 && var12 < 0)) {
            Client.camYaw = var11;
        }
    }

    // jag::oldscape::Client::GlDoSoundsQueue
    static soundsDoQueue(): void {
        for (let var0: number = 0; var0 < Client.waveCount; var0++) {
            const var10002: number = Client.waveDelay[var0]--;
            if (Client.waveDelay[var0] >= -10) {
                let var2: JagFX | null = Client.waveSounds[var0];
                if (var2 === null) {
                    var2 = JagFX.load(Client.jagFX!, Client.waveSoundIds[var0], 0);
                    if (var2 === null) {
                        continue;
                    }
                    Client.waveDelay[var0] += var2.optimiseStart();
                    Client.waveSounds[var0] = var2;
                }
                if (Client.waveDelay[var0] < 0) {
                    let var3: number;
                    if (Client.waveAmbient[var0] === 0) {
                        var3 = Client.waveVolume;
                    } else {
                        const var4: number = (Client.waveAmbient[var0] & 0xff) * 128;
                        const var5: number = (Client.waveAmbient[var0] >> 16) & 0xff;
                        let var6: number = var5 * 128 + 64 - Client.localPlayer!.x;
                        if (var6 < 0) {
                            var6 = -var6;
                        }
                        const var7: number = (Client.waveAmbient[var0] >> 8) & 0xff;
                        let var8: number = var7 * 128 + 64 - Client.localPlayer!.z;
                        if (var8 < 0) {
                            var8 = -var8;
                        }
                        let var9: number = var8 + var6 - 128;
                        if (var4 < var9) {
                            Client.waveDelay[var0] = -100;
                            continue;
                        }
                        if (var9 < 0) {
                            var9 = 0;
                        }
                        if (var4 === 0) {
                            throw new Error();
                        }
                        var3 = (Math.imul(var4 - var9, Client.ambientVolume) / var4) | 0;
                    }
                    if (var3 > 0) {
                        const var10 = var2.toWave().decimate(Client.decimator!);
                        const var11: WaveStream = WaveStream.newRatePercent(var10, var3)!;
                        var11.setLoopCount(Client.waveLoops[var0] - 1);
                        Client.mixer!.playStream(var11);
                    }
                    Client.waveDelay[var0] = -100;
                }
            } else {
                Client.waveCount--;
                for (let var1: number = var0; var1 < Client.waveCount; var1++) {
                    Client.waveSoundIds[var1] = Client.waveSoundIds[var1 + 1];
                    Client.waveSounds[var1] = Client.waveSounds[var1 + 1];
                    Client.waveLoops[var1] = Client.waveLoops[var1 + 1];
                    Client.waveDelay[var1] = Client.waveDelay[var1 + 1];
                    Client.waveAmbient[var1] = Client.waveAmbient[var1 + 1];
                }
                var0--;
            }
        }

        if (Client.playingJingle && !MidiManager.isInitialised()) {
            if (Client.midiVolume !== 0 && Client.nextMidiSong !== -1) {
                MidiManager.play(Client.songs!, Client.nextMidiSong, Client.midiVolume);
            }
            Client.playingJingle = false;
        } else if (Client.midiVolume !== 0 && Client.nextMidiSong !== -1 && !MidiManager.isInitialised()) {
            // DO NOT SEND: no 464 song-end packet — the 4-byte body would inject garbage into the
            // stream (202 is size 0 server-side). Fires every time a music track ends.
            Client.nextMidiSong = -1;
        }
    }

    // jag::oldscape::Client::GlMovePlayers
    static movePlayers(): void {
        for (let var0: number = -1; var0 < Client.playerCount; var0++) {
            let var1: number;
            if (var0 === -1) {
                var1 = 2047;
            } else {
                var1 = Client.playerIds[var0];
            }

            const var2: ClientPlayer | null = Client.players[var1];
            if (var2 !== null) {
                Client.moveEntity(var2.size, var2);
            }
        }
    }

    // jag::oldscape::Client::GlMoveNpcs
    static moveNpcs(): void {
        for (let var0: number = 0; var0 < Client.npcCount; var0++) {
            const var1: number = Client.npcIds[var0];
            const var2: ClientNpc | null = Client.npc[var1];

            if (var2 !== null) {
                Client.moveEntity(var2.type!.size, var2);
            }
        }
    }

    // jag::oldscape::Client::GlMoveEntity
    static moveEntity(arg0: number, arg1: ClientEntity): void {
        if (arg1.fineStreamed) {
            // MOBA fine plane: the stream owns the render position; yaw smoother and
            // seq ticker below still run as normal (Java Client.method31)
            FineStream.interpolate(arg1);
        } else if (arg1.exactMoveEnd > Client.loopCycle) {
            Client.exactMove1(arg1);
        } else if (arg1.exactMoveStart < Client.loopCycle) {
            Client.routeMove(arg1);
        } else {
            Client.exactMove2(arg1);
        }

        if (!arg1.fineStreamed && (arg1.x < 128 || arg1.z < 128 || arg1.x >= 13184 || arg1.z >= 13184)) {
            arg1.z = arg1.size * 64 + arg1.routeZ[0] * 128;
            arg1.x = arg1.routeX[0] * 128 + arg1.size * 64;
            arg1.exactMoveStart = 0;
            arg1.spotanimId = -1;
            arg1.exactMoveEnd = 0;
            arg1.primarySeqId = -1;
            arg1.abortRoute();
        }

        if (!arg1.fineStreamed && arg1 === Client.localPlayer && (arg1.x < 1536 || arg1.z < 1536 || arg1.x >= 11776 || arg1.z >= 11776)) {
            arg1.spotanimId = -1;
            arg1.exactMoveStart = 0;
            arg1.exactMoveEnd = 0;
            arg1.z = arg1.size * 64 + arg1.routeZ[0] * 128;
            arg1.primarySeqId = -1;
            arg1.x = arg1.size * 64 + arg1.routeX[0] * 128;
            arg1.abortRoute();
        }

        Client.entityFace(arg1);
        Client.entityAnim(arg1);
    }

    // jag::oldscape::Client::GlExactMove1
    static exactMove1(arg0: ClientEntity): void {
        const var1: number = arg0.exactMoveEnd - Client.loopCycle;
        if (arg0.exactMoveFacing === 0) {
            arg0.dstYaw = 1024;
        }
        arg0.animDelayMove = 0;
        if (arg0.exactMoveFacing === 1) {
            arg0.dstYaw = 1536;
        }
        if (arg0.exactMoveFacing === 2) {
            arg0.dstYaw = 0;
        }
        if (arg0.exactMoveFacing === 3) {
            arg0.dstYaw = 512;
        }
        const var2: number = arg0.exactStartZ * 128 + arg0.size * 64;
        arg0.z += ((var2 - arg0.z) / var1) | 0;
        const var3: number = arg0.size * 64 + arg0.exactStartX * 128;
        arg0.x += ((var3 - arg0.x) / var1) | 0;
    }

    // jag::oldscape::Client::GlExactMove2
    static exactMove2(arg0: ClientEntity): void {
        if (arg0.exactMoveStart === Client.loopCycle || arg0.primarySeqId === -1 || arg0.primarySeqDelay !== 0 || arg0.primarySeqCycle + 1 > SeqType.list(arg0.primarySeqId).delay![arg0.primarySeqFrame]) {
            const var1: number = Client.loopCycle - arg0.exactMoveEnd;
            const var2: number = arg0.exactStartX * 128 + arg0.size * 64;
            const var3: number = arg0.exactMoveStart - arg0.exactMoveEnd;
            const var4: number = arg0.exactStartZ * 128 + arg0.size * 64;
            const var5: number = arg0.exactEndX * 128 + arg0.size * 64;
            const var6: number = arg0.exactEndZ * 128 + arg0.size * 64;
            arg0.z = (((var3 - var1) * var4 + var6 * var1) / var3) | 0;
            arg0.x = (((var3 - var1) * var2 + var5 * var1) / var3) | 0;
        }

        arg0.animDelayMove = 0;

        if (arg0.exactMoveFacing === 0) {
            arg0.dstYaw = 1024;
        }
        if (arg0.exactMoveFacing === 1) {
            arg0.dstYaw = 1536;
        }
        if (arg0.exactMoveFacing === 2) {
            arg0.dstYaw = 0;
        }
        if (arg0.exactMoveFacing === 3) {
            arg0.dstYaw = 512;
        }

        arg0.yaw = arg0.dstYaw;
    }

    // jag::oldscape::Client::GlRouteMove
    static routeMove(arg0: ClientEntity): void {
        arg0.secondarySeqId = arg0.readyanim;
        if (arg0.routeLength === 0) {
            arg0.animDelayMove = 0;
            return;
        }
        if (arg0.primarySeqId !== -1 && arg0.primarySeqDelay === 0) {
            const var1: SeqType = SeqType.list(arg0.primarySeqId);
            if (arg0.preanimRouteLength > 0 && var1.preanim_move === 0) {
                arg0.animDelayMove++;
                return;
            }
            if (arg0.preanimRouteLength <= 0 && var1.postanim_move === 0) {
                arg0.animDelayMove++;
                return;
            }
        }
        const var2: number = arg0.x;
        const var3: number = arg0.size * 64 + arg0.routeX[arg0.routeLength - 1] * 128;
        const var4: number = arg0.z;
        const var5: number = arg0.routeZ[arg0.routeLength - 1] * 128 + arg0.size * 64;
        if (var3 - var2 > 256 || var3 - var2 < -256 || var5 - var4 > 256 || var5 - var4 < -256) {
            arg0.x = var3;
            arg0.z = var5;
            return;
        }
        if (var2 >= var3) {
            if (var3 >= var2) {
                if (var5 > var4) {
                    arg0.dstYaw = 1024;
                } else if (var5 < var4) {
                    arg0.dstYaw = 0;
                }
            } else if (var4 < var5) {
                arg0.dstYaw = 768;
            } else if (var5 >= var4) {
                arg0.dstYaw = 512;
            } else {
                arg0.dstYaw = 256;
            }
        } else if (var4 < var5) {
            arg0.dstYaw = 1280;
        } else if (var5 < var4) {
            arg0.dstYaw = 1792;
        } else {
            arg0.dstYaw = 1536;
        }
        let var6: number = arg0.walkanim_b;
        let var7: number = (arg0.dstYaw - arg0.yaw) & 0x7ff;
        if (var7 > 1024) {
            var7 -= 2048;
        }
        if (var7 >= -256 && var7 <= 256) {
            var6 = arg0.walkanim;
        } else if (var7 >= 256 && var7 < 768) {
            var6 = arg0.walkanim_r;
        } else if (var7 >= -768 && var7 <= -256) {
            var6 = arg0.walkanim_l;
        }
        if (var6 === -1) {
            var6 = arg0.walkanim;
        }
        let var8: number = 4;
        let var9: boolean = true;
        arg0.secondarySeqId = var6;
        if (arg0 instanceof ClientNpc) {
            var9 = (arg0 as ClientNpc).type!.walksmoothing;
        }
        if (var9) {
            if (arg0.dstYaw !== arg0.yaw && arg0.targetId === -1 && arg0.turnspeed !== 0) {
                var8 = 2;
            }
            if (arg0.routeLength > 2) {
                var8 = 6;
            }
            if (arg0.routeLength > 3) {
                var8 = 8;
            }
            if (arg0.animDelayMove > 0 && arg0.routeLength > 1) {
                var8 = 8;
                arg0.animDelayMove--;
            }
        } else {
            if (arg0.routeLength > 1) {
                var8 = 6;
            }
            if (arg0.routeLength > 2) {
                var8 = 8;
            }
            if (arg0.animDelayMove > 0 && arg0.routeLength > 1) {
                var8 = 8;
                arg0.animDelayMove--;
            }
        }
        if (arg0.routeRun[arg0.routeLength - 1]) {
            var8 <<= 0x1;
        }
        if (var3 > var2) {
            arg0.x += var8;
            if (arg0.x > var3) {
                arg0.x = var3;
            }
        } else if (var3 < var2) {
            arg0.x -= var8;
            if (var3 > arg0.x) {
                arg0.x = var3;
            }
        }
        if (var8 >= 8 && arg0.walkanim === arg0.secondarySeqId && arg0.runanim !== -1) {
            arg0.secondarySeqId = arg0.runanim;
        }
        if (var5 > var4) {
            arg0.z += var8;
            if (var5 < arg0.z) {
                arg0.z = var5;
            }
        } else if (var5 < var4) {
            arg0.z -= var8;
            if (var5 > arg0.z) {
                arg0.z = var5;
            }
        }
        if (var3 !== arg0.x || arg0.z !== var5) {
            return;
        }
        arg0.routeLength--;
        if (arg0.preanimRouteLength > 0) {
            arg0.preanimRouteLength--;
            return;
        }
    }

    // jag::oldscape::Client::GlEntityFace
    static entityFace(arg0: ClientEntity): void {
        if (arg0.turnspeed === 0) {
            return;
        }

        if (arg0.targetId !== -1 && arg0.targetId < 32768) {
            const var1: ClientNpc | null = Client.npc[arg0.targetId];
            if (var1 !== null) {
                const var2: number = arg0.z - var1.z;
                const var3: number = arg0.x - var1.x;

                if (var3 !== 0 || var2 !== 0) {
                    arg0.dstYaw = ((Math.atan2(var3, var2) * 325.949) | 0) & 0x7ff;
                }
            }
        }

        if (arg0.targetId >= 32768) {
            let var4: number = arg0.targetId - 32768;
            if (var4 === Client.selfSlot) {
                var4 = 2047;
            }

            const var5: ClientPlayer | null = Client.players[var4];
            if (var5 !== null) {
                const var6: number = arg0.x - var5.x;
                const var7: number = arg0.z - var5.z;

                if (var6 !== 0 || var7 !== 0) {
                    arg0.dstYaw = ((Math.atan2(var6, var7) * 325.949) | 0) & 0x7ff;
                }
            }
        }

        if ((arg0.targetTileX !== 0 || arg0.targetTileZ !== 0) && (arg0.routeLength === 0 || arg0.animDelayMove > 0)) {
            const var8: number = arg0.size * 64 + arg0.z - (-Client.mapBuildBaseZ + arg0.targetTileZ + -Client.mapBuildBaseZ) * 64 - 64;
            const var9: number = arg0.x + (arg0.size - 1) * 64 - (arg0.targetTileX - Client.mapBuildBaseX - Client.mapBuildBaseX) * 64;

            if (var9 !== 0 || var8 !== 0) {
                arg0.dstYaw = ((Math.atan2(var9, var8) * 325.949) | 0) & 0x7ff;
            }

            arg0.targetTileZ = 0;
            arg0.targetTileX = 0;
        }

        const var10: number = (arg0.dstYaw - arg0.yaw) & 0x7ff;
        if (var10 === 0) {
            arg0.turnCycle = 0;
            return;
        }

        arg0.turnCycle++;
        if (var10 > 1024) {
            arg0.yaw -= arg0.turnspeed;
            let var11: boolean = true;
            if (var10 < arg0.turnspeed || 2048 - arg0.turnspeed < var10) {
                arg0.yaw = arg0.dstYaw;
                var11 = false;
            }
            if (arg0.readyanim === arg0.secondarySeqId && (arg0.turnCycle > 25 || var11)) {
                if (arg0.turnleftanim === -1) {
                    arg0.secondarySeqId = arg0.walkanim;
                } else {
                    arg0.secondarySeqId = arg0.turnleftanim;
                }
            }
        } else {
            arg0.yaw += arg0.turnspeed;
            let var12: boolean = true;
            if (arg0.turnspeed > var10 || 2048 - arg0.turnspeed < var10) {
                arg0.yaw = arg0.dstYaw;
                var12 = false;
            }
            if (arg0.secondarySeqId === arg0.readyanim && (arg0.turnCycle > 25 || var12)) {
                if (arg0.turnrightanim === -1) {
                    arg0.secondarySeqId = arg0.walkanim;
                } else {
                    arg0.secondarySeqId = arg0.turnrightanim;
                }
            }
        }

        arg0.yaw &= 0x7ff;
    }

    // jag::oldscape::Client::GlEntityAnim
    static entityAnim(arg0: ClientEntity): void {
        arg0.needsForwardDrawPadding = false;
        if (arg0.secondarySeqId !== -1) {
            const var1: SeqType = SeqType.list(arg0.secondarySeqId);
            if (var1 === null || var1.frames === null) {
                arg0.secondarySeqId = -1;
            } else {
                arg0.secondarySeqCycle++;
                if (arg0.secondarySeqFrame < var1.frames.length && var1.delay![arg0.secondarySeqFrame] < arg0.secondarySeqCycle) {
                    arg0.secondarySeqCycle = 1;
                    arg0.secondarySeqFrame++;
                    Client.triggerSeqSound(arg0 === Client.localPlayer, arg0.z, arg0.secondarySeqFrame, arg0.x, var1);
                }
                if (arg0.secondarySeqFrame >= var1.frames.length) {
                    arg0.secondarySeqFrame = 0;
                    arg0.secondarySeqCycle = 0;
                    Client.triggerSeqSound(arg0 === Client.localPlayer, arg0.z, arg0.secondarySeqFrame, arg0.x, var1);
                }
            }
        }
        if (arg0.spotanimId !== -1 && Client.loopCycle >= arg0.spotanimLastCycle) {
            if (arg0.spotanimFrame < 0) {
                arg0.spotanimFrame = 0;
            }
            const var2: number = SpotType.list(arg0.spotanimId).anim;
            if (var2 === -1) {
                arg0.spotanimId = -1;
            } else {
                const var3: SeqType = SeqType.list(var2);
                if (var3 === null || var3.frames === null) {
                    arg0.spotanimId = -1;
                } else {
                    arg0.spotanimCycle++;
                    if (var3.frames.length > arg0.spotanimFrame && var3.delay![arg0.spotanimFrame] < arg0.spotanimCycle) {
                        arg0.spotanimFrame++;
                        arg0.spotanimCycle = 1;
                        Client.triggerSeqSound(Client.localPlayer === arg0, arg0.z, arg0.spotanimFrame, arg0.x, var3);
                    }
                    if (arg0.spotanimFrame >= var3.frames.length) {
                        arg0.spotanimId = -1;
                    }
                }
            }
        }
        if (arg0.primarySeqId !== -1 && arg0.primarySeqDelay <= 1) {
            const var4: SeqType = SeqType.list(arg0.primarySeqId);
            if (var4.preanim_move === 1 && arg0.preanimRouteLength > 0 && arg0.exactMoveEnd <= Client.loopCycle && Client.loopCycle > arg0.exactMoveStart) {
                arg0.primarySeqDelay = 1;
                return;
            }
        }
        if (arg0.primarySeqId !== -1 && arg0.primarySeqDelay === 0) {
            const var5: SeqType = SeqType.list(arg0.primarySeqId);
            if (var5 === null || var5.frames === null) {
                arg0.primarySeqId = -1;
            } else {
                arg0.primarySeqCycle++;
                if (arg0.primarySeqFrame < var5.frames.length && var5.delay![arg0.primarySeqFrame] < arg0.primarySeqCycle) {
                    arg0.primarySeqCycle = 1;
                    arg0.primarySeqFrame++;
                    Client.triggerSeqSound(arg0 === Client.localPlayer, arg0.z, arg0.primarySeqFrame, arg0.x, var5);
                }
                if (arg0.primarySeqFrame >= var5.frames.length) {
                    arg0.primarySeqLoop++;
                    arg0.primarySeqFrame -= var5.loops;
                    if (arg0.primarySeqLoop >= var5.maxloops) {
                        arg0.primarySeqId = -1;
                    } else if (arg0.primarySeqFrame >= 0 && arg0.primarySeqFrame < var5.frames.length) {
                        Client.triggerSeqSound(arg0 === Client.localPlayer, arg0.z, arg0.primarySeqFrame, arg0.x, var5);
                    } else {
                        arg0.primarySeqId = -1;
                    }
                }
                arg0.needsForwardDrawPadding = var5.reachforward;
            }
        }
        if (arg0.primarySeqDelay > 0) {
            arg0.primarySeqDelay--;
        }
    }

    // jag::oldscape::Client::TriggerPlayerAnim
    static triggerPlayerAnim(arg0: number, arg1: number, arg2: ClientPlayer): void {
        if (arg0 === arg2.primarySeqId && arg0 !== -1) {
            const var3 = SeqType.list(arg0);
            const var4 = var3.duplicatebehaviour;
            if (var4 === 1) {
                arg2.primarySeqCycle = 0;
                arg2.primarySeqLoop = 0;
                arg2.primarySeqFrame = 0;
                arg2.primarySeqDelay = arg1;
                Client.triggerSeqSound(arg2 === Client.localPlayer, arg2.z, arg2.primarySeqFrame, arg2.x, var3);
            }
            if (var4 === 2) {
                arg2.primarySeqLoop = 0;
            }
        } else if (arg0 === -1 || arg2.primarySeqId === -1 || SeqType.list(arg0).priority >= SeqType.list(arg2.primarySeqId).priority) {
            arg2.primarySeqFrame = 0;
            arg2.primarySeqDelay = arg1;
            arg2.preanimRouteLength = arg2.routeLength;
            arg2.primarySeqId = arg0;
            arg2.primarySeqLoop = 0;
            arg2.primarySeqCycle = 0;
            if (arg2.primarySeqId !== -1) {
                Client.triggerSeqSound(Client.localPlayer === arg2, arg2.z, arg2.primarySeqFrame, arg2.x, SeqType.list(arg2.primarySeqId));
            }
        }
    }

    // jag::oldscape::Client::MessageBox
    static messageBox(message: string, redraw: boolean): void {
        const width = Client.p12!.predictWidthMultiline(message, 250);
        const height = Client.p12!.predictLinesMultiline(message, 250) * 13;
        Pix2D.fillRect(6, 6, width + 8, height + 8, 0x0);
        Pix2D.drawRect(6, 6, width + 8, height + 8, 0xffffff);
        Client.p12!.drawStringMultiline(message, 10, 10, width, height, 0xffffff, -1, 1, 1, 0);
        Client.dirtyArea(height + 8, width + 8, 6, 6);
        if (!redraw) {
            Client.blitArea(10, height, width, 10);
        } else {
            GameShell.drawArea.draw(0, 0);
        }
    }

    gameDrawMain(width: number, x: number, height: number, y: number): void {
        Client.sceneCycle++;
        const perfSceneT0: number = performance.now();

        Client.addPlayers(true);
        Client.addNpcs(true);
        Client.addPlayers(false);
        Client.addNpcs(false);
        Client.addProjectiles();
        Client.addMapAnim();

        if (!Client.cinemaCam) {
            let pitch: number = Client.orbitCameraPitch;
            if (((Client.cameraPitchClamp / 256) | 0) > pitch) {
                pitch = (Client.cameraPitchClamp / 256) | 0;
            }
            if (Client.camShake[4] && Client.camShakeRan[4] + 128 > pitch) {
                pitch = Client.camShakeRan[4] + 128;
            }

            const yaw: number = (Client.orbitCameraYaw + Client.macroCameraAngle) & 0x7ff;

            Client.camFollow(Client.orbitCameraX, Client.getAvH(Client.localPlayer!.x, Client.localPlayer!.z, Client.minusedlevel) - 50, yaw, pitch, pitch * 3 + Client.cameraZoom, height, Client.orbitCameraZ);
        }

        let level: number;
        if (Client.cinemaCam) {
            level = Client.roofCheck2();
        } else {
            level = Client.roofCheck();
        }

        const camX: number = Client.camX;
        const camY: number = Client.camY;
        const camZ: number = Client.camZ;
        const camPitch: number = Client.camPitch;
        const camYaw: number = Client.camYaw;

        for (let axis: number = 0; axis < 5; axis++) {
            if (!Client.camShake[axis]) {
                continue;
            }

            const jitter = (Math.random() * (Client.camShakeAxis[axis] * 2 + 1) - Client.camShakeAxis[axis] + Math.sin(Client.camShakeCycle[axis] * (Client.camShakeAmp[axis] / 100.0)) * Client.camShakeRan[axis]) | 0;
            if (axis === 0) {
                Client.camX += jitter;
            } else if (axis === 1) {
                Client.camY += jitter;
            } else if (axis === 2) {
                Client.camZ += jitter;
            } else if (axis === 3) {
                Client.camYaw = (Client.camYaw + jitter) & 0x7ff;
            } else if (axis === 4) {
                Client.camPitch += jitter;

                if (Client.camPitch < 128) {
                    Client.camPitch = 128;
                }

                if (Client.camPitch > 383) {
                    Client.camPitch = 383;
                }
            }
        }

        // MOBA half-res render: in non-FIXED modes the scene rasters into a scaled-down
        // scratch buffer (a software raster's cost is pixel count) and 2x-upscales into
        // the frame; picking/click coords auto-map through Pix3D.minX/maxX. The scene
        // pass projects with sceneFocal / scale (constant vertical FOV); overlays and
        // all UI draw full-res at 512 after the bracket.
        // GPU renderer: full-res always (raster cost is the GPU's problem); the 2D
        // frame keeps a TRANSPARENT hole where the GL canvas below shows through.
        const glScene: boolean = GlRenderer.enabled && GlRenderer.ready();
        const sceneScale: number = glScene ? 1 : ScreenMode.activeScale();
        const sceneW: number = (width / sceneScale) | 0;
        const sceneH: number = (height / sceneScale) | 0;
        if (sceneScale !== 1) {
            ScreenMode.bindSceneBuffer(sceneW, sceneH);
        } else {
            Pix2D.setClipping(x, y, x + width, y + height);
        }
        Pix3D.setRenderClipping();
        if (glScene) {
            GlRenderer.resize(GameShell.sWid, GameShell.sHei);
            GlRenderer.beginScene(x, y, width, height);
            GlRenderer.dimAlpha = ScreenSizeDialog.open ? 120 / 256 : 0;
        }
        Pix3D.focal = Math.max(1, (ScreenMode.sceneFocal / sceneScale) | 0);
        Client.scenePickMinX = Pix3D.minX;
        Client.scenePickMaxX = Pix3D.maxX;
        Client.scenePickMinY = Pix3D.minY;
        Client.scenePickMaxY = Pix3D.maxY;

        if (ClientMouseListener.mouseX >= x && ClientMouseListener.mouseX < x + width && ClientMouseListener.mouseY >= y && ClientMouseListener.mouseY < y + height) {
            ModelLit.mouseCheck = true;
            SoftwareModelLit.pickedCount = 0;
            if (width === 0) {
                throw new Error();
            }
            ModelLit.mouseX = (Pix3D.minX + ((Math.imul(Pix3D.maxX - Pix3D.minX, ClientMouseListener.mouseX - x) / width) | 0)) | 0;
            if (height === 0) {
                throw new Error();
            }
            ModelLit.mouseY = (((Math.imul(ClientMouseListener.mouseY - y, Pix3D.maxY - Pix3D.minY) / height) | 0) + Pix3D.minY) | 0;
        } else {
            ModelLit.mouseCheck = false;
            SoftwareModelLit.pickedCount = 0;
        }

        // MOBA: per-frame hover ground pick for the skillshot aim overlay — same
        // coordinate mapping the model picker uses just above.
        World.updateHoverPicking(ModelLit.mouseCheck, Client.minusedlevel, ModelLit.mouseX, ModelLit.mouseY);

        Client.doAudio();
        // GL mode: punch the transparent hole (PixMap alpha-0 sentinel) so the GL
        // scene below shows through; software mode: classic black clear.
        Pix2D.fillRect(Pix2D.clipMinX, Pix2D.clipMinY, Pix2D.clipMaxX - Pix2D.clipMinX, Pix2D.clipMaxY - Pix2D.clipMinY, glScene ? PixMap.GL_TRANSPARENT : 0x0);
        World.renderAll(Client.camX, Client.camY, Client.camZ, Client.camPitch, Client.camYaw, level, null, null, null, null, null, null, Client.localPlayer!.x >> 7, Client.localPlayer!.z >> 7);
        Client.doAudio();
        World.removeSprites();
        Pix3D.focal = 512;
        if (glScene) {
            GlRenderer.flush();
        }
        if (sceneScale !== 1) {
            // back to the frame buffer, upscale the scene, re-clip to the viewport
            GameShell.drawArea.bind();
            ScreenMode.blitSceneBuffer(GameShell.drawArea.data, GameShell.drawArea.width, x, y, sceneScale);
            Pix2D.setClipping(x, y, x + width, y + height);
            if (sceneW * sceneScale < width) {
                Pix2D.fillRect(x + sceneW * sceneScale, y, width - sceneW * sceneScale, height, 0x0);
            }
            if (sceneH * sceneScale < height) {
                Pix2D.fillRect(x, y + sceneH * sceneScale, width, height - sceneH * sceneScale, 0x0);
            }
        }
        Client.perfSceneMs = Client.perfSceneMs * 0.9 + (performance.now() - perfSceneT0) * 0.1;
        if (Client.loopCycle % 250 === 0) {
            // every ~5s -> dbg.log, so perf is diagnosable from the log alone
            console.log('[perf] fps=' + GameShell.fps + ' tick=' + GameShell.perfLogicMs.toFixed(1) + 'ms draw=' + GameShell.perfDrawMs.toFixed(1) + 'ms scene=' + Client.perfSceneMs.toFixed(1) + 'ms blit=' + Client.perfPresentMs.toFixed(1) + 'ms 3d=1/' + ScreenMode.activeScale() + ' vsync=' + Timer.rafAlign + ' vp=' + width + 'x' + height);
        }
        // FPS readout, below the top-left hover-option text so they never overlap;
        // ::perf adds the per-stage breakdown. Toggle rows live in ::settings.
        if (Client.p12 !== null && Client.showFpsCounter) {
            Client.p12.drawString('Fps: ' + GameShell.fps, x + 5, y + 45, 0xffff00, 0);
            if (Client.showPerf) {
                Client.p12.drawString('tick ' + GameShell.perfLogicMs.toFixed(1) + '  draw ' + GameShell.perfDrawMs.toFixed(1) + 'ms', x + 5, y + 58, 0xffff00, 0);
                Client.p12.drawString('scene ' + Client.perfSceneMs.toFixed(1) + '  blit ' + Client.perfPresentMs.toFixed(1) + 'ms  3d 1/' + ScreenMode.activeScale() + (Timer.rafAlign ? '  vsync' : ''), x + 5, y + 71, 0xffff00, 0);
            }
        }
        Client.entityOverlays(x, y, height, width);
        Client.coordArrow(x, y, height, width);
        FineStream.viewportX = x;
        FineStream.viewportY = y;
        FineStream.viewportW = width;
        FineStream.viewportH = height;
        // MOBA overlay pass (Java Class24.method788 order): XP drops, skillshot aim,
        // ability bar, then the fine-plane debug labels on top.
        XpDropOverlay.render(x, y, width);
        SkillshotOverlay.render(x, y, width, height);
        // Overhead cast bar (cast paradigm): floats above the local champion during a
        // windup/channel — predicted at fire-click from the per-slot cast varps.
        SkillshotOverlay.renderCastBar(x, y, width, height);
        AbilityBarOverlay.render(x, y, width, height);
        HudPanelOverlay.render();
        FineStream.renderDebug(x, y);
        // Screen-size picker (::fs): modal, drawn last so it sits on top of everything.
        ScreenSizeDialog.render(x, y, width, height);
        (Pix3D.textureManager as TextureManager).runAnims(Client.worldUpdateNum);
        Client.otherOverlays(x, height, y, width);
        Client.camX = camX;
        Client.camY = camY;
        Client.camZ = camZ;
        Client.camPitch = camPitch;
        Client.camYaw = camYaw;
        if (Client.js5Loading && this.js5Net.urgentQueueSize() === 0) {
            Client.js5Loading = false;
        }
        if (Client.js5Loading) {
            Pix2D.fillRect(x, y, width, height, 0x0);
            Client.messageBox(Text.loading, false);
        }
        if (!Client.js5Loading && !Client.isMenuOpen && x <= ClientMouseListener.mouseX && ClientMouseListener.mouseX < width + x && y <= ClientMouseListener.mouseY && ClientMouseListener.mouseY < height + y) {
            Client.minimenuBuildSceneActions(ClientMouseListener.mouseY, x, height, width, y, ClientMouseListener.mouseX);
            Client.sceneRowEnd = Client.menuNumEntries;
        }
        // MOBA overlay menu rows, injected LAST so a hovered overlay control is the
        // top (left-click) row — the ability bar beats "Walk here", like Java's
        // click-frame injection in GraphicsBuffer.method682.
        if (!Client.js5Loading && !Client.isMenuOpen) {
            XpDropOverlay.addMenuItemsIfHovered(ClientMouseListener.mouseX, ClientMouseListener.mouseY);
            AbilityBarOverlay.addMenuItemsIfHovered(ClientMouseListener.mouseX, ClientMouseListener.mouseY);
            HudPanelOverlay.addMenuItemsIfHovered(ClientMouseListener.mouseX, ClientMouseListener.mouseY);
        }
    }

    // jag::oldscape::Client::GdmAddPlayerToWorld
    static addPlayers(arg0: boolean): void {
        if (Client.localPlayer!.x >> 7 === Client.minimapFlagX && Client.minimapFlagZ === Client.localPlayer!.z >> 7) {
            Client.minimapFlagX = 0;
        }
        let var1: number = Client.playerCount;
        if (arg0) {
            var1 = 1;
        }
        for (let var2: number = 0; var2 < var1; var2++) {
            let var3: ClientPlayer | null;
            let var4: SceneTag;
            if (arg0) {
                var4 = 8791798054912n;
                var3 = Client.localPlayer;
            } else {
                var3 = Client.players[Client.playerIds[var2]];
                var4 = BigInt(Client.playerIds[var2]) << 32n;
            }
            if (var3 !== null && var3.ready()) {
                if (!arg0 && FogOfWar.hidePlayer(var3)) {
                    continue; // MOBA fog: fogged enemy — never inserted = never seen/clicked
                }
                const var6: number = var3.x >> 7;
                var3.lowMem = false;
                if (((Client.lowMem && Client.playerCount > 50) || Client.playerCount > 200) && !arg0 && var3.readyanim === var3.secondarySeqId) {
                    var3.lowMem = true;
                }
                const var7: number = var3.z >> 7;
                if (var6 >= 0 && var6 < 104 && var7 >= 0 && var7 < 104) {
                    if (var3.locModel === null || Client.loopCycle < var3.locStartCycle || Client.loopCycle >= var3.locEndCycle) {
                        if ((var3.x & 0x7f) === 64 && (var3.z & 0x7f) === 64) {
                            if (Client.sceneCycle === Client.tileLastOccupiedCycle[var6][var7]) {
                                continue;
                            }
                            Client.tileLastOccupiedCycle[var6][var7] = Client.sceneCycle;
                        }
                        var3.y = Client.getAvH(var3.x, var3.z, Client.minusedlevel);
                        World.addDynamic(Client.minusedlevel, var3.x, var3.z, var3.y, 60, var3, var3.yaw, var4, var3.needsForwardDrawPadding);
                    } else {
                        var3.lowMem = false;
                        var3.y = Client.getAvH(var3.x, var3.z, Client.minusedlevel);
                        World.addDynamic(Client.minusedlevel, var3.x, var3.z, var3.y, var3, var3.yaw, var4, var3.minTileX, var3.minTileZ, var3.maxTileX, var3.maxTileZ);
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::GdmAddNPCs
    static addNpcs(arg0: boolean): void {
        for (let var1: number = 0; var1 < Client.npcCount; var1++) {
            const var2: ClientNpc | null = Client.npc[Client.npcIds[var1]];
            let var3: SceneTag = (BigInt(Client.npcIds[var1]) << 32n) | 0x20000000n;
            if (var2 !== null && var2.ready() && arg0 === var2.type!.alwaysontop && var2.type!.isMultiNpcVisible()) {
                if (FogOfWar.hideNpc(var2)) {
                    continue; // MOBA fog: fogged non-ally npc
                }
                const var5: number = var2.x >> 7;
                const var6: number = var2.z >> 7;
                if (var5 >= 0 && var5 < 104 && var6 >= 0 && var6 < 104) {
                    if (var2.size === 1 && (var2.x & 0x7f) === 64 && (var2.z & 0x7f) === 64) {
                        if (Client.sceneCycle === Client.tileLastOccupiedCycle[var5][var6]) {
                            continue;
                        }
                        Client.tileLastOccupiedCycle[var5][var6] = Client.sceneCycle;
                    }
                    if (!var2.type!.active) {
                        var3 |= -9223372036854775808n;
                    }
                    var2.y = Client.getAvH(var2.x + (var2.size - 1) * 64, var2.z - (-(var2.size * 64) + 64), Client.minusedlevel);
                    World.addDynamic(Client.minusedlevel, var2.x, var2.z, var2.y, (var2.size - 1) * 64 + 60, var2, var2.yaw, var3, var2.needsForwardDrawPadding);
                }
            }
        }
    }

    // jag::oldscape::Client::GdmAddProjectiles
    static addProjectiles(): void {
        for (let var0 = Client.projectiles.head(); var0 !== null; var0 = Client.projectiles.next()) {
            const var1 = var0.proj;
            if (var1.level !== Client.minusedlevel || Client.loopCycle > var1.t2) {
                var0.unlink();
            } else if (var1.t1 <= Client.loopCycle) {
                if (var1.target > 0) {
                    const var2: ClientNpc | null = Client.npc[var1.target - 1];
                    if (var2 !== null && var2.x >= 0 && var2.x < 13312 && var2.z >= 0 && var2.z < 13312) {
                        var1.setTarget(var2.x, Client.loopCycle, Client.getAvH(var2.x, var2.z, var1.level) - var1.h2, var2.z);
                    }
                }
                if (var1.target < 0) {
                    const var3: number = -var1.target - 1;
                    let var4: ClientPlayer | null;
                    if (var3 === Client.selfSlot) {
                        var4 = Client.localPlayer;
                    } else {
                        var4 = Client.players[var3];
                    }
                    if (var4 !== null && var4.x >= 0 && var4.x < 13312 && var4.z >= 0 && var4.z < 13312) {
                        var1.setTarget(var4.x, Client.loopCycle, Client.getAvH(var4.x, var4.z, var1.level) - var1.h2, var4.z);
                    }
                }
                var1.move(Client.worldUpdateNum);
                World.addDynamic(Client.minusedlevel, var1.x | 0, var1.z | 0, var1.y | 0, 60, var1, var1.yaw, -1, false);
            }
        }
    }

    // jag::oldscape::Client::GdmAddMapAnim
    static addMapAnim(): void {
        for (let var0 = Client.spotanims.head(); var0 !== null; var0 = Client.spotanims.next()) {
            const var1 = var0.spotanim;
            if (var1.level !== Client.minusedlevel || var1.animComplete) {
                var0.unlink();
            } else if (var1.startCycle <= Client.loopCycle) {
                var1.doAnim(Client.worldUpdateNum);

                if (var1.animComplete) {
                    var0.unlink();
                } else {
                    World.addDynamic(var1.level, var1.x, var1.z, var1.y, 60, var1, 0, -1, false);
                }
            }
        }
    }

    // jag::oldscape::Client::CamFollow
    static camFollow(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number): void {
        const var7: number = (2048 - arg2) & 0x7ff;
        let var8: number = 0;
        let var9: number = 0;
        let var10: number = arg4;
        const var11: number = (2048 - arg3) & 0x7ff;
        if (var11 !== 0) {
            const var12: number = Pix3D.sinTable[var11];
            const var13: number = Pix3D.cosTable[var11];
            var9 = (var12 * -arg4) >> 16;
            var10 = (var13 * arg4) >> 16;
        }
        if (var7 !== 0) {
            const var14: number = Pix3D.sinTable[var7];
            const var15: number = Pix3D.cosTable[var7];
            var8 = (var10 * var14) >> 16;
            var10 = (var15 * var10) >> 16;
        }
        Client.camY = arg1 - var9;
        Client.camX = arg0 - var8;
        Client.camZ = arg6 - var10;
        Client.camYaw = arg2;
        Client.camPitch = arg3;
    }

    // jag::oldscape::Client::GdmRoofCheck2
    static roofCheck2(): number {
        const var0: number = Client.getAvH(Client.camX, Client.camZ, Client.minusedlevel);
        return var0 - Client.camY >= 800 || (ClientBuild.mapl[Client.minusedlevel][Client.camX >> 7][Client.camZ >> 7] & 0x4) === 0 ? 3 : Client.minusedlevel;
    }

    // jag::oldscape::Client::GdmRoofCheck
    static roofCheck(): number {
        let var0: number = 3;
        if (Client.camPitch < 310) {
            let var1: number = Client.camX >> 7;
            let var2: number = Client.camZ >> 7;
            const var3: number = Client.localPlayer!.x >> 7;
            if ((ClientBuild.mapl[Client.minusedlevel][var1][var2] & 0x4) !== 0) {
                var0 = Client.minusedlevel;
            }
            let var4: number;
            if (var1 < var3) {
                var4 = var3 - var1;
            } else {
                var4 = var1 - var3;
            }
            const var5: number = Client.localPlayer!.z >> 7;
            let var6: number;
            if (var5 > var2) {
                var6 = var5 - var2;
            } else {
                var6 = var2 - var5;
            }
            if (var6 >= var4) {
                const var7: number = ((var4 * 65536) / var6) | 0;
                let var8: number = 32768;
                while (var5 !== var2) {
                    if (var5 > var2) {
                        var2++;
                    } else if (var2 > var5) {
                        var2--;
                    }
                    var8 += var7;
                    if ((ClientBuild.mapl[Client.minusedlevel][var1][var2] & 0x4) !== 0) {
                        var0 = Client.minusedlevel;
                    }
                    if (var8 >= 65536) {
                        var8 -= 65536;
                        if (var3 > var1) {
                            var1++;
                        } else if (var3 < var1) {
                            var1--;
                        }
                        if ((ClientBuild.mapl[Client.minusedlevel][var1][var2] & 0x4) !== 0) {
                            var0 = Client.minusedlevel;
                        }
                    }
                }
            } else {
                const var9: number = ((var6 * 65536) / var4) | 0;
                let var10: number = 32768;
                while (var1 !== var3) {
                    if (var1 < var3) {
                        var1++;
                    } else if (var1 > var3) {
                        var1--;
                    }
                    var10 += var9;
                    if ((ClientBuild.mapl[Client.minusedlevel][var1][var2] & 0x4) !== 0) {
                        var0 = Client.minusedlevel;
                    }
                    if (var10 >= 65536) {
                        if (var2 < var5) {
                            var2++;
                        } else if (var2 > var5) {
                            var2--;
                        }
                        if ((ClientBuild.mapl[Client.minusedlevel][var1][var2] & 0x4) !== 0) {
                            var0 = Client.minusedlevel;
                        }
                        var10 -= 65536;
                    }
                }
            }
        }
        if ((ClientBuild.mapl[Client.minusedlevel][Client.localPlayer!.x >> 7][Client.localPlayer!.z >> 7] & 0x4) !== 0) {
            var0 = Client.minusedlevel;
        }
        return var0;
    }

    // jag::oldscape::Client::GdmEntityOverlays
    static entityOverlays(arg0: number, arg1: number, arg2: number, arg3: number): void {
        Client.chatCount = 0;
        for (let var4: number = -1; var4 < Client.npcCount + Client.playerCount; var4++) {
            let var5: ClientEntity | null;
            if (var4 === -1) {
                var5 = Client.localPlayer;
            } else if (var4 >= Client.playerCount) {
                var5 = Client.npc[Client.npcIds[var4 - Client.playerCount]];
            } else {
                var5 = Client.players[Client.playerIds[var4]];
            }
            if (var5 !== null && var5.ready()) {
                if (var5 instanceof ClientNpc) {
                    let var6: NpcType | null = var5.type;
                    if (var6!.multinpc !== null) {
                        var6 = var6!.getMultiNpc();
                    }
                    if (var6 === null) {
                        continue;
                    }
                }
                if (var4 >= Client.playerCount) {
                    let var12: NpcType | null = (var5 as ClientNpc).type;
                    if (var12!.multinpc !== null) {
                        var12 = var12!.getMultiNpc();
                    }
                    if (var12!.headicon >= 0 && Client.headiconsPrayer!.length > var12!.headicon) {
                        Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight() + 15, var5);
                        if (Client.projectX > -1) {
                            Client.headiconsPrayer![var12!.headicon]!.plotSprite(Client.projectX + arg0 - 12, Client.projectY + -30 + arg1);
                        }
                    }
                    const var13 = Client.field1171;
                    for (let var14: number = 0; var14 < var13.length; var14++) {
                        const var15: HintArrow | null = var13[var14];
                        if (var15 !== null && var15.hintType === 1 && var15.hintTarget === Client.npcIds[var4 - Client.playerCount] && Client.loopCycle % 20 < 10) {
                            Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight() + 15, var5);
                            if (Client.projectX > -1) {
                                Client.headiconsHint![var15.field2137]!.plotSprite(Client.projectX + arg0 - 12, Client.projectY + arg1 - 28);
                            }
                        }
                    }
                } else {
                    let var7: number = 30;
                    const var8: ClientPlayer = var5 as ClientPlayer;
                    if (var8.headiconPk !== -1 || var8.headiconPrayer !== -1) {
                        Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight() + 15, var5);
                        if (Client.projectX > -1) {
                            if (var8.headiconPk !== -1) {
                                Client.headiconsPk![var8.headiconPk]!.plotSprite(Client.projectX + arg0 - 12, Client.projectY + -30 + arg1);
                                var7 += 25;
                            }
                            if (var8.headiconPrayer !== -1) {
                                Client.headiconsPrayer![var8.headiconPrayer]!.plotSprite(arg0 + Client.projectX - 12, arg1 - -Client.projectY + -var7);
                                var7 += 25;
                            }
                        }
                    }
                    if (var4 >= 0) {
                        const var9 = Client.field1171;
                        for (let var10: number = 0; var10 < var9.length; var10++) {
                            const var11: HintArrow | null = var9[var10];
                            if (var11 !== null && var11.hintType === 10 && Client.playerIds[var4] === var11.hintTarget) {
                                Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight() + 15, var5);
                                if (Client.projectX > -1) {
                                    Client.headiconsHint![var11.field2137]!.plotSprite(arg0 + Client.projectX - 12, arg1 - (-Client.projectY + var7));
                                }
                            }
                        }
                    }
                }
                if (var5.chat !== null && (Client.playerCount <= var4 || Client.chatPublicMode === 0 || Client.chatPublicMode === 3 || (Client.chatPublicMode === 1 && Client.isFriend((var5 as ClientPlayer).name)))) {
                    Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight(), var5);
                    if (Client.projectX > -1 && Client.MAX_CHATS > Client.chatCount) {
                        Client.chatWidth[Client.chatCount] = (Client.b12!.stringWid(var5.chat.toString()) / 2) | 0;
                        Client.chatHeight[Client.chatCount] = Client.b12!.ascent;
                        Client.chatX[Client.chatCount] = Client.projectX;
                        Client.chatY[Client.chatCount] = Client.projectY;
                        Client.chatColour[Client.chatCount] = var5.chatColour;
                        Client.chatEffect[Client.chatCount] = var5.chatEffect;
                        Client.chatTimer[Client.chatCount] = var5.chatTimer;
                        Client.chats[Client.chatCount] = var5.chat.toString();
                        Client.chatCount++;
                    }
                }
                if (var5.combatCycle > Client.loopCycle) {
                    Client.getOverlayPos(arg3 >> 1, arg2 >> 1, var5.getHeight() + 15, var5);
                    if (Client.projectX > -1) {
                        // 464 sends raw curHP/maxHP; scale to the 30px bar like Java Model.java:189-191
                        let barW: number = var5.maxHealth > 0 ? ((var5.field4109 * 30) / var5.maxHealth) | 0 : 30;
                        if (barW > 30) {
                            barW = 30;
                        }
                        Pix2D.fillRect(arg0 + Client.projectX - 15, Client.projectY + -3 + arg1, barW, 5, 65280);
                        Pix2D.fillRect(barW + arg0 + Client.projectX - 15, arg1 + -3 + Client.projectY, 30 - barW, 5, 16711680);
                    }
                }
                for (let var16: number = 0; var16 < 4; var16++) {
                    if (Client.loopCycle < var5.damageCycles[var16]) {
                        Client.getOverlayPos(arg3 >> 1, arg2 >> 1, (var5.getHeight() / 2) | 0, var5);
                        if (Client.projectX > -1) {
                            if (var16 === 1) {
                                Client.projectY -= 20;
                            }
                            if (var16 === 2) {
                                Client.projectY -= 10;
                                Client.projectX -= 15;
                            }
                            if (var16 === 3) {
                                Client.projectY -= 10;
                                Client.projectX += 15;
                            }
                            Client.hitmarks[var5.damageTypes[var16]]!.plotSprite(arg0 + Client.projectX - 12, arg1 + -12 + Client.projectY);
                            Client.p11!.centreString(var5.damageValues[var16].toString(), arg0 + Client.projectX - 1, Client.projectY + 3 + arg1, 16777215, 0);
                        }
                    }
                }
            }
        }
        for (let var17: number = 0; var17 < Client.chatCount; var17++) {
            const var18: number = Client.chatX[var17];
            let var19: number = Client.chatY[var17];
            const var20: number = Client.chatWidth[var17];
            let var21: boolean = true;
            const var22: number = Client.chatHeight[var17];
            while (var21) {
                var21 = false;
                for (let var23: number = 0; var23 < var17; var23++) {
                    if (
                        Client.chatY[var23] - Client.chatHeight[var23] < var19 + 2 &&
                        var19 - var22 < Client.chatY[var23] + 2 &&
                        var18 - var20 < Client.chatX[var23] - -Client.chatWidth[var23] &&
                        Client.chatX[var23] - Client.chatWidth[var23] < var20 + var18 &&
                        var19 > Client.chatY[var23] - Client.chatHeight[var23]
                    ) {
                        var19 = Client.chatY[var23] - Client.chatHeight[var23];
                        var21 = true;
                    }
                }
            }
            Client.projectX = Client.chatX[var17];
            Client.projectY = Client.chatY[var17] = var19;
            const var24: string = Client.chats[var17]!;
            if (Client.chatEffects === 0) {
                let var25: number = 16776960;
                if (Client.chatColour[var17] < 6) {
                    var25 = Client.CHAT_COLOURS[Client.chatColour[var17]];
                }
                if (Client.chatColour[var17] === 6) {
                    var25 = Client.sceneCycle % 20 >= 10 ? 16776960 : 16711680;
                }
                if (Client.chatColour[var17] === 7) {
                    var25 = Client.sceneCycle % 20 >= 10 ? 65535 : 255;
                }
                if (Client.chatColour[var17] === 8) {
                    var25 = Client.sceneCycle % 20 < 10 ? 45056 : 8454016;
                }
                if (Client.chatColour[var17] === 9) {
                    const var26: number = 150 - Client.chatTimer[var17];
                    if (var26 < 50) {
                        var25 = var26 * 1280 + 16711680;
                    } else if (var26 < 100) {
                        var25 = 16384000 + 16776960 - var26 * 327680;
                    } else if (var26 < 150) {
                        var25 = (var26 - 100) * 5 + 65280;
                    }
                }
                if (Client.chatColour[var17] === 10) {
                    const var27: number = 150 - Client.chatTimer[var17];
                    if (var27 < 50) {
                        var25 = var27 * 5 + 16711680;
                    } else if (var27 < 100) {
                        var25 = 16711935 - (var27 - 50) * 327680;
                    } else if (var27 < 150) {
                        var25 = var27 * 327680 + 500 + 255 - var27 * 5 - 32768000;
                    }
                }
                if (Client.chatColour[var17] === 11) {
                    const var28: number = 150 - Client.chatTimer[var17];
                    if (var28 < 50) {
                        var25 = 16777215 - var28 * 327685;
                    } else if (var28 < 100) {
                        var25 = (var28 - 50) * 327685 + 65280;
                    } else if (var28 < 150) {
                        var25 = 16777215 - (var28 - 100) * 327680;
                    }
                }
                if (Client.chatEffect[var17] === 0) {
                    Client.b12!.centreString(var24, arg0 + Client.projectX, Client.projectY + arg1, var25, 0);
                }
                if (Client.chatEffect[var17] === 1) {
                    Client.b12!.centreStringWave(var24, Client.projectX + arg0, Client.projectY + arg1, var25, Client.sceneCycle);
                }
                if (Client.chatEffect[var17] === 2) {
                    Client.b12!.centreStringWave2(var24, arg0 + Client.projectX, arg1 - -Client.projectY, var25, Client.sceneCycle);
                }
                if (Client.chatEffect[var17] === 3) {
                    Client.b12!.centreStringWave3(var24, Client.projectX + arg0, arg1 + Client.projectY, var25, Client.sceneCycle, 150 - Client.chatTimer[var17]);
                }
                if (Client.chatEffect[var17] === 4) {
                    const var29: number = (((150 - Client.chatTimer[var17]) * (Client.b12!.stringWid(var24) + 100)) / 150) | 0;
                    Pix2D.setSubClipping(arg0 + Client.projectX - 50, arg1, arg0 + Client.projectX + 50, arg1 + arg2);
                    Client.b12!.drawString(var24, arg0 + Client.projectX + 50 - var29, arg1 - -Client.projectY, var25, 0);
                    Pix2D.setClipping(arg0, arg1, arg0 + arg3, arg2 + arg1);
                }
                if (Client.chatEffect[var17] === 5) {
                    let var30: number = 0;
                    const var31: number = 150 - Client.chatTimer[var17];
                    if (var31 < 25) {
                        var30 = var31 - 25;
                    } else if (var31 > 125) {
                        var30 = var31 - 125;
                    }
                    Pix2D.setSubClipping(arg0, Client.projectY + arg1 - Client.b12!.ascent - 1, arg3 + arg0, Client.projectY + arg1 + 5);
                    Client.b12!.centreString(var24, arg0 + Client.projectX, arg1 + (Client.projectY - -var30), var25, 0);
                    Pix2D.setClipping(arg0, arg1, arg0 + arg3, arg1 + arg2);
                }
            } else {
                Client.b12!.centreString(var24, arg0 + Client.projectX, arg1 + Client.projectY, 16776960, 0);
            }
        }
    }

    // jag::oldscape::Client::GdmCoordArrow
    static coordArrow(arg0: number, arg1: number, arg2: number, arg3: number): void {
        const var4 = Client.field1171;
        for (let var5 = 0; var5 < var4.length; var5++) {
            const var6 = var4[var5];
            if (var6 !== null && var6.hintType === 2) {
                Client.getOverlayPos(arg2 >> 1, var6.hintHeight * 2, ((var6.hintTileX - Client.mapBuildBaseX) << 7) + var6.hintOffsetX, arg3 >> 1, var6.hintOffsetZ + ((var6.hintTileZ - Client.mapBuildBaseZ) << 7));
                if (Client.projectX > -1 && Client.loopCycle % 20 < 10) {
                    Client.headiconsHint![var6.field2137]!.plotSprite(arg0 + Client.projectX - 12, Client.projectY + (arg1 - 28));
                }
            }
        }
    }

    static otherOverlays(arg0: number, arg1: number, arg2: number, arg3: number): void {
        if (Client.crossMode === 1) {
            Client.cross[(Client.crossCycle / 100) | 0]!.plotSprite(Client.crossX - 8, Client.crossY - 8);
        }
        if (Client.crossMode === 2) {
            Client.cross[((Client.crossCycle / 100) | 0) + 4]!.plotSprite(Client.crossX - 8, Client.crossY - 8);
        }

        Client.getSpecialArea();

        if (Client.showFps) {
            const x: number = arg0 + ScreenMode.viewportWidth - 5;
            let y: number = arg2 + 20;

            let colour: number = 0xffff00;
            if (GameShell.fps < 15) {
                colour = 0xff0000;
            }

            Client.p12!.rightString('Fps:' + GameShell.fps, x, y, colour, -1);
            y += 15;

            let memoryUsage = -1;
            if (typeof window.performance['memory' as keyof Performance] !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const memory = window.performance['memory' as keyof Performance] as any;
                memoryUsage = (memory.usedJSHeapSize / 1024) | 0;
            }

            if (memoryUsage !== -1) {
                Client.p12!.rightString('Mem:' + memoryUsage + 'k', x, y, 0xffff00, -1);
            }
        }
    }

    // jag::oldscape::Client::GdmOtherOverlays
    static getSpecialArea(): void {
        Client.chatDisabled = 0;
        const var0: number = Client.mapBuildBaseX + (Client.localPlayer!.x >> 7);
        const var1: number = Client.mapBuildBaseZ + (Client.localPlayer!.z >> 7);

        if (var0 >= 3053 && var0 <= 3156 && var1 >= 3056 && var1 <= 3136) {
            Client.chatDisabled = 1;
        }
        if (var0 >= 3072 && var0 <= 3118 && var1 >= 9492 && var1 <= 9535) {
            Client.chatDisabled = 1;
        }
        if (Client.chatDisabled === 1 && var0 >= 3139 && var0 <= 3199 && var1 >= 3008 && var1 <= 3062) {
            Client.chatDisabled = 0;
        }
    }

    // jag::oldscape::Client::GetOverlayPos
    static getOverlayPos(arg0: number, arg1: number, arg2: number, arg3: ClientEntity): void;
    static getOverlayPos(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number): void;
    static getOverlayPos(arg0: number, arg1: number, arg2: number, arg3: ClientEntity | number, arg4?: number): void {
        if (arg3 instanceof ClientEntity) {
            Client.getOverlayPos(arg1, arg2, arg3.x, arg0, arg3.z);
            return;
        }
        if (arg2 < 128 || arg4! < 128 || arg2 > 13056 || arg4! > 13056) {
            Client.projectX = -1;
            Client.projectY = -1;
            return;
        }

        const var5 = Client.getAvH(arg2, arg4!, Client.minusedlevel) - arg1;
        const var6 = arg4! - Client.camZ;
        const var7 = arg2 - Client.camX;
        const var8 = var5 - Client.camY;
        const var9 = Pix3D.sinTable[Client.camPitch];
        const var10 = Pix3D.cosTable[Client.camPitch];
        const var11 = Pix3D.cosTable[Client.camYaw];
        const var12 = Pix3D.sinTable[Client.camYaw];
        const var13 = (var11 * var7 + var6 * var12) >> 16;
        const var14 = (var11 * var6 - var12 * var7) >> 16;
        const var16 = (var10 * var8 - var9 * var14) >> 16;
        const var17 = (var8 * var9 + var10 * var14) >> 16;
        if (var17 < 50) {
            Client.projectX = -1;
            Client.projectY = -1;
        } else {
            // overlays draw at FULL res after the scene pass — always the full sceneFocal
            Client.projectY = (((var16 * ScreenMode.sceneFocal) / var17) | 0) + arg0;
            Client.projectX = arg3 + (((var13 * ScreenMode.sceneFocal) / var17) | 0);
        }
    }

    // jag::oldscape::Client::GetAvH
    static getAvH(arg0: number, arg1: number, arg2: number): number {
        const var3: number = arg1 >> 7;
        const var4: number = arg0 >> 7;
        if (var4 < 0 || var3 < 0 || var4 > 103 || var3 > 103) {
            return 0;
        }
        const var5: number = arg1 & 0x7f;
        let var6: number = arg2;
        const var7: number = arg0 & 0x7f;
        if (arg2 < 3 && (ClientBuild.mapl[1][var4][var3] & 0x2) === 2) {
            var6 = arg2 + 1;
        }
        const var8: number = (ClientBuild.groundh![var6][var4 + 1][var3] * var7 + (128 - var7) * ClientBuild.groundh![var6][var4][var3]) >> 7;
        const var9: number = (ClientBuild.groundh![var6][var4 + 1][var3 + 1] * var7 + ClientBuild.groundh![var6][var4][var3 + 1] * (128 - var7)) >> 7;
        return (var5 * var9 + (128 - var5) * var8) >> 7;
    }

    // jag::oldscape::Client::RebuildPacket
    static rebuildPacket(arg0: boolean): void {
        Client.regionmode = arg0;
        if (!Client.regionmode) {
            // 464 RebuildNormal (opcode 221): regionY (ShortA) is sent FIRST, then the XTEA block,
            // then regionX (LEShort), localX (Short BE), level (byte), localY (Short BE). The stock
            // rev-500 order read XTEA first (count from pos 0), which consumed regionY into the key
            // block and slid every field by 2 bytes -> garbage coords -> OOB crash on the login rebuild.
            const var4: number = Client.in.g2_alt2(); // regionY (ShortA), read first
            const var1: number = ((Client.psize - Client.in.pos) / 16) | 0; // XTEA count, after regionY
            Client.field268 = Array.from({ length: var1 }, () => new Int32Array(4));
            for (let var2: number = 0; var2 < var1; var2++) {
                for (let var3: number = 0; var3 < 4; var3++) {
                    Client.field268[var2][var3] = Client.in.g4_int1(); // 464 int1 middle-endian XTEA key
                }
            }
            let var5: boolean = false;
            const var7: number = Client.in.g2_alt1(); // regionX (LEShort)
            const var6: number = Client.in.g2(); // localX (Short BE)
            const var8: number = Client.in.g1(); // level (plain byte)
            const var9: number = Client.in.g2(); // localY (Short BE)
            Client.field2402 = new Int32Array(var1);
            ClientBuild.field2731 = new Int32Array(var1);
            ClientBuild.field774 = new Array(var1).fill(null);
            Client.field453 = new Int32Array(var1);
            ClientBuild.field3221 = new Array(var1).fill(null);
            let var10: number = 0;
            if ((((var7 / 8) | 0) === 48 || ((var7 / 8) | 0) === 49) && ((var4 / 8) | 0) === 48) {
                var5 = true;
            }
            if (((var7 / 8) | 0) === 48 && ((var4 / 8) | 0) === 148) {
                var5 = true;
            }
            for (let var11: number = ((var7 - 6) / 8) | 0; var11 <= (((var7 + 6) / 8) | 0); var11++) {
                for (let var12: number = ((var4 - 6) / 8) | 0; var12 <= (((var4 + 6) / 8) | 0); var12++) {
                    const var13: number = (var11 << 8) + var12;
                    if (var5 && (var12 === 49 || var12 === 149 || var12 === 147 || var11 === 50 || (var11 === 49 && var12 === 47))) {
                        ClientBuild.field2731![var10] = var13;
                        Client.field453[var10] = -1;
                        Client.field2402[var10] = -1;
                    } else {
                        ClientBuild.field2731![var10] = var13;
                        Client.field453[var10] = Client.maps!.getGroupId(`m${var11}_${var12}`);
                        Client.field2402[var10] = Client.maps!.getGroupId(`l${var11}_${var12}`);
                    }
                    var10++;
                }
            }
            console.log('[dbg] rebuildN xtea=' + var1 + ' regionX=' + var7 + ' regionY=' + var4 + ' localX=' + var6 + ' localY=' + var9 + ' level=' + var8);
            Client.startRebuild(var8, var9, var7, var4, var6);
            console.log('[dbg] startRebuild returned, state=' + Client.state);
            return;
        }
        // 464 RebuildConstructed (op 222) header — 9 bytes (Java InteractiveObject.method1086:
        // method235 regionY, method240 level, method235 regionX, method235 localY, method223 localX).
        // The rev-500 5-byte header started the bit grid 4 bytes early and read 2 phantom trailing
        // shorts after the XTEA block.
        const var34: number = Client.in.g2_alt3(); // regionY, u16 LE-shortA
        const var14: number = Client.in.g1_alt3(); // level, byteS
        const var15: number = Client.in.g2_alt3(); // regionX, u16 LE-shortA
        const var16: number = Client.in.g2_alt3(); // localY, u16 LE-shortA
        const var37: number = Client.in.g2_alt2(); // localX, u16 BE-shortA
        Client.in.gBitStart();
        for (let var17: number = 0; var17 < 4; var17++) {
            for (let var18: number = 0; var18 < 13; var18++) {
                for (let var19: number = 0; var19 < 13; var19++) {
                    const var20: number = Client.in.gBit(1);
                    if (var20 === 1) {
                        ClientBuild.zoneMapArchiveIds[var17][var18][var19] = Client.in.gBit(26);
                    } else {
                        ClientBuild.zoneMapArchiveIds[var17][var18][var19] = -1;
                    }
                }
            }
        }
        Client.in.gBitEnd();
        const var21: number = ((Client.psize - Client.in.pos) / 16) | 0;
        Client.field268 = Array.from({ length: var21 }, () => new Int32Array(4));
        for (let var22: number = 0; var22 < var21; var22++) {
            for (let var23: number = 0; var23 < 4; var23++) {
                Client.field268[var22][var23] = Client.in.g4();
            }
        }
        // 464: nothing follows the XTEA blocks (rev-500 read localX/regionY here; that over-read)
        Client.field453 = new Int32Array(var21);
        Client.field2402 = new Int32Array(var21);
        ClientBuild.field3221 = new Array(var21).fill(null);
        ClientBuild.field2731 = new Int32Array(var21);
        ClientBuild.field774 = new Array(var21).fill(null);
        let var26: number = 0;
        for (let var27: number = 0; var27 < 4; var27++) {
            for (let var28: number = 0; var28 < 13; var28++) {
                for (let var29: number = 0; var29 < 13; var29++) {
                    const var30: number = ClientBuild.zoneMapArchiveIds[var27][var28][var29];
                    if (var30 !== -1) {
                        const var31: number = (var30 >> 3) & 0x7ff;
                        const var32: number = (var30 >> 14) & 0x3ff;
                        let var33: number = ((var31 / 8) | 0) + (((var32 / 8) | 0) << 8);
                        for (let var34: number = 0; var34 < var26; var34++) {
                            if (var33 === ClientBuild.field2731![var34]) {
                                var33 = -1;
                                break;
                            }
                        }
                        if (var33 !== -1) {
                            ClientBuild.field2731![var26] = var33;
                            const var35: number = (var33 >> 8) & 0xff;
                            const var36: number = var33 & 0xff;
                            Client.field453[var26] = Client.maps!.getGroupId(`m${var35}_${var36}`);
                            Client.field2402[var26] = Client.maps!.getGroupId(`l${var35}_${var36}`);
                            var26++;
                        }
                    }
                }
            }
        }
        Client.startRebuild(var14, var16, var15, var34, var37);
    }

    // jag::oldscape::Client::StartRebuild
    static startRebuild(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number): void {
        if (arg2 === Client.mapBuildCentreZoneX && Client.mapBuildCentreZoneZ === arg3 && (arg0 === Client.lastBuiltLevel || !Client.lowMem)) {
            return;
        }

        Client.lastBuiltLevel = arg0;
        if (!Client.lowMem) {
            Client.lastBuiltLevel = 0;
        }
        Client.mapBuildCentreZoneZ = arg3;
        Client.mapBuildCentreZoneX = arg2;
        Client.setMainState(25);
        Client.messageBox(Text.loading, true);
        const var5: number = Client.mapBuildBaseX;
        const var6: number = Client.mapBuildBaseZ;
        Client.mapBuildBaseZ = arg3 * 8 - 48;
        const var7: number = Client.mapBuildBaseZ - var6;
        Client.mapBuildBaseX = (arg2 - 6) * 8;
        const var8: number = Client.mapBuildBaseX - var5;
        for (let var9: number = 0; var9 < 32768; var9++) {
            const var10: ClientNpc | null = Client.npc[var9];
            if (var10 !== null) {
                for (let var11: number = 0; var11 < 10; var11++) {
                    var10.routeX[var11] -= var8;
                    var10.routeZ[var11] -= var7;
                }
                var10.z -= var7 * 128;
                var10.x -= var8 * 128;
            }
        }
        for (let var12: number = 0; var12 < 2048; var12++) {
            const var13: ClientPlayer | null = Client.players[var12];
            if (var13 !== null) {
                for (let var14: number = 0; var14 < 10; var14++) {
                    var13.routeX[var14] -= var8;
                    var13.routeZ[var14] -= var7;
                }
                var13.x -= var8 * 128;
                var13.z -= var7 * 128;
            }
        }
        Client.minusedlevel = arg0;
        let var15: number = 0;
        let var16: number = 104;
        Client.localPlayer!.teleport(false, arg4, arg1);
        let var17: number = 0;
        let var18: number = 1;
        if (var8 < 0) {
            var16 = -1;
            var18 = -1;
            var15 = 103;
        }
        let var19: number = 1;
        let var20: number = 104;
        if (var7 < 0) {
            var20 = -1;
            var19 = -1;
            var17 = 103;
        }
        for (let var21: number = var15; var21 !== var16; var21 += var18) {
            for (let var22: number = var17; var22 !== var20; var22 += var19) {
                const var23: number = var8 + var21;
                const var24: number = var22 + var7;
                for (let var25: number = 0; var25 < 4; var25++) {
                    if (var23 >= 0 && var24 >= 0 && var23 < 104 && var24 < 104) {
                        Client.groundObj[var25][var21][var22] = Client.groundObj[var25][var23][var24];
                    } else {
                        Client.groundObj[var25][var21][var22] = null;
                    }
                }
            }
        }
        for (let var26 = Client.locChanges.head() as LocChange | null; var26 !== null; var26 = Client.locChanges.next() as LocChange | null) {
            var26.x -= var8;
            var26.z -= var7;
            if (var26.x < 0 || var26.z < 0 || var26.x >= 104 || var26.z >= 104) {
                var26.unlink();
            }
        }
        if (Client.minimapFlagX !== 0) {
            Client.minimapFlagX -= var8;
            Client.minimapFlagZ -= var7;
        }
        Client.minimapLevel = -1;
        Client.cinemaCam = false;
        Client.waveCount = 0;
        Client.spotanims.clear();
        Client.projectiles.clear();
    }

    // jag::oldscape::Client::PreventTimeout
    static preventTimeout(arg0: boolean): void {
        Client.doAudio();
        Client.noTimeoutTimer++;
        if (Client.noTimeoutTimer < 50 && !arg0) {
            return;
        }
        Client.noTimeoutTimer = 0;

        if (Client.networkError || Client.stream === null) {
            return;
        }

        Client.out.p1Enc(ClientProt.NO_TIMEOUT);
        Client.out.p1(0); // 464 op 7 (NO_TIMEOUT) carries a 1-byte body
        try {
            Client.stream.write(Client.out.pos, Client.out.data);
            Client.out.pos = 0;
        } catch (var1) {
            Client.networkError = true;
        }
    }

    // jag::oldscape::Client::GlCheckMinimap
    static checkMinimap(): void {
        if (Client.lowMem && Client.minusedlevel !== Client.lastBuiltLevel) {
            Client.startRebuild(Client.minusedlevel, Client.localPlayer!.routeZ[0], Client.mapBuildCentreZoneX, Client.mapBuildCentreZoneZ, Client.localPlayer!.routeX[0]);
        } else if (Client.minusedlevel !== Client.minimapLevel) {
            Client.minimapLevel = Client.minusedlevel;
            Client.minimapBuildBuffer(Client.minusedlevel);
        }
    }

    // jag::oldscape::Client::MapBuildLoop
    static mapBuildLoop(): void {
        console.log('[dbg] mBL enter');
        Client.preventTimeout(false);
        let var0: boolean = true;
        Client.field3754 = 0;
        for (let var1: number = 0; var1 < ClientBuild.field3221!.length; var1++) {
            if (Client.field453[var1] !== -1 && ClientBuild.field3221![var1] === null) {
                ClientBuild.field3221![var1] = Client.maps!.getFile(0, Client.field453[var1]);
                if (ClientBuild.field3221![var1] === null) {
                    var0 = false;
                    Client.field3754++;
                }
            }
            if (Client.field2402[var1] !== -1 && ClientBuild.field774![var1] === null) {
                ClientBuild.field774![var1] = Client.maps!.fetchFile(Client.field268[var1], Client.field2402[var1], 0);
                if (ClientBuild.field774![var1] === null) {
                    var0 = false;
                    Client.field3754++;
                }
            }
        }
        // Wait for the (tiny) texture-defs group too: the scene build bakes minimap + lowmem
        // ground colours from texture averages — building early baked water/roofs black until
        // the next region rebuild.
        if (Pix3D.textureManager instanceof TextureManager && !Pix3D.textureManager.defsReady()) {
            var0 = false;
            Client.field3754++;
        }
        {
            const m = ClientBuild.field3221!.filter(x => x !== null).length;
            const l = ClientBuild.field774!.filter(x => x !== null).length;
            console.log('[dbg] mBL files m=' + m + '/' + ClientBuild.field3221!.length + ' l=' + l + '/' + ClientBuild.field774!.length + ' waiting=' + Client.field3754 + ' var0=' + var0);
        }
        if (!var0) {
            Client.field3861 = 1;
            return;
        }
        Client.field2045 = 0;
        let var2: boolean = true;
        for (let var3: number = 0; var3 < ClientBuild.field3221!.length; var3++) {
            const var4: Uint8Array | null = ClientBuild.field774![var3];
            if (var4 !== null) {
                let var5: number = (ClientBuild.field2731![var3] >> 8) * 64 - Client.mapBuildBaseX;
                let var6: number = (ClientBuild.field2731![var3] & 0xff) * 64 - Client.mapBuildBaseZ;
                if (Client.regionmode) {
                    var5 = 10;
                    var6 = 10;
                }
                const var7: boolean = ClientBuild.checkLocations(var4, var6, var5);
                var2 = var2 && var7;
            }
        }
        console.log('[dbg] mBL checkLoc ' + (var2 ? 'OK->build scene' : 'waiting loc-models') + ' missing=' + Client.field2045);
        if (!var2) {
            Client.field3861 = 2;
            return;
        }
        if (Client.field3861 !== 0) {
            Client.messageBox(Text.loading + '<br>(100%)', true);
        }
        Client.doAudio();
        Client.clearCaches();
        World.resetMap();
        for (let var7: number = 0; var7 < 4; var7++) {
            Client.collision[var7]!.reset();
        }
        for (let var8: number = 0; var8 < 4; var8++) {
            for (let var9: number = 0; var9 < 104; var9++) {
                for (let var10: number = 0; var10 < 104; var10++) {
                    ClientBuild.mapl[var8][var9][var10] = 0;
                }
            }
        }
        BgSound.reset();
        Client.doAudio();
        Client.doAudio();
        Client.preventTimeout(true);
        ClientBuild.init();
        if (!Client.regionmode) {
            ClientBuild.loadGround();
            Client.preventTimeout(true);
            ClientBuild.loadLocations();
        }
        if (Client.regionmode) {
            ClientBuild.loadGroundRegion();
            Client.preventTimeout(true);
            ClientBuild.loadLocationsRegion();
        }
        Client.clearCaches();
        Client.preventTimeout(true);
        Client.doAudio();
        ClientBuild.finishBuild(Client.collision);
        Client.preventTimeout(true);
        Client.doAudio();
        let var11: number = ClientBuild.minusedlevel;
        if (Client.minusedlevel < var11) {
            var11 = Client.minusedlevel;
        }
        if (var11 < Client.minusedlevel - 1) {
        }
        if (Client.lowMem) {
            World.fillBaseLevel(ClientBuild.minusedlevel);
        } else {
            World.fillBaseLevel(0);
        }
        ClientBuild.quit();
        for (let var12: number = 0; var12 < 104; var12++) {
            for (let var13: number = 0; var13 < 104; var13++) {
                Client.showObject(var12, var13);
            }
        }
        Client.doAudio();
        Client.locChangePostBuildCorrect();
        Client.clearCaches();
        if (!Client.regionmode) {
            const var14: number = ((Client.mapBuildCentreZoneX - 6) / 8) | 0;
            const var15: number = ((Client.mapBuildCentreZoneZ - 6) / 8) | 0;
            const var16: number = ((Client.mapBuildCentreZoneX + 6) / 8) | 0;
            const var17: number = ((Client.mapBuildCentreZoneZ + 6) / 8) | 0;
            for (let var18: number = var14 - 1; var18 <= var16 + 1; var18++) {
                for (let var19: number = var15 - 1; var19 <= var17 + 1; var19++) {
                    if (var14 > var18 || var16 < var18 || var19 < var15 || var19 > var17) {
                        Client.maps!.updateCacheHint(`m${var18}_${var19}`);
                        Client.maps!.updateCacheHint(`l${var18}_${var19}`);
                    }
                }
            }
        }
        console.log('[dbg] scene BUILT -> setMainState(GAME=30)');
        Client.setMainState(30);
        Client.doAudio();
        // 464 has no client map-build-complete packet; sending rev-500 opcode 213 hit the server's
        // -3 (consume-all) path and desynced the whole flush. Do not send it.
        GameShell.doneslowupdate();
    }

    // jag::oldscape::minimap::Minimap::DrawDetail
    static drawDetail(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number): void {
        const var5: SceneTag = World.wallType(arg2, arg4, arg0);
        if (BigInt(var5) !== 0n) {
            const var7: number = (Number(BigInt.asIntN(32, BigInt(var5))) >> 20) & 0x3;
            const var8: number = (Number(BigInt.asIntN(32, BigInt(var5))) >> 14) & 0x1f;
            let var9: number = arg3;
            const var10: Int32Array = Pix2D.pixels;
            const var11: number = arg4 * 4 + (52736 - arg0 * 512) * 4 + 24624;
            const var12: number = Number((BigInt(var5) >> 32n) & 0x7fffffffn);
            if (BigInt(var5) > 0n) {
                var9 = arg1;
            }
            const var13: LocType = LocType.list(var12);
            if (var13.mapscene === -1) {
                if (var8 === 0 || var8 === 2) {
                    if (var7 === 0) {
                        var10[var11] = var9;
                        var10[var11 + 512] = var9;
                        var10[var11 + 1024] = var9;
                        var10[var11 + 1536] = var9;
                    } else if (var7 === 1) {
                        var10[var11] = var9;
                        var10[var11 + 1] = var9;
                        var10[var11 + 2] = var9;
                        var10[var11 + 3] = var9;
                    } else if (var7 === 2) {
                        var10[var11 + 3] = var9;
                        var10[var11 + 515] = var9;
                        var10[var11 + 1024 + 3] = var9;
                        var10[var11 + 3 + 1536] = var9;
                    } else if (var7 === 3) {
                        var10[var11 + 1536] = var9;
                        var10[var11 + 1 + 1536] = var9;
                        var10[var11 + 2 + 1536] = var9;
                        var10[var11 + 1536 + 3] = var9;
                    }
                }
                if (var8 === 3) {
                    if (var7 === 0) {
                        var10[var11] = var9;
                    } else if (var7 === 1) {
                        var10[var11 + 3] = var9;
                    } else if (var7 === 2) {
                        var10[var11 + 1536 + 3] = var9;
                    } else if (var7 === 3) {
                        var10[var11 + 1536] = var9;
                    }
                }
                if (var8 === 2) {
                    if (var7 === 3) {
                        var10[var11] = var9;
                        var10[var11 + 512] = var9;
                        var10[var11 + 1024] = var9;
                        var10[var11 + 1536] = var9;
                    } else if (var7 === 0) {
                        var10[var11] = var9;
                        var10[var11 + 1] = var9;
                        var10[var11 + 2] = var9;
                        var10[var11 + 3] = var9;
                    } else if (var7 === 1) {
                        var10[var11 + 3] = var9;
                        var10[var11 + 512 + 3] = var9;
                        var10[var11 + 3 + 1024] = var9;
                        var10[var11 + 1536 + 3] = var9;
                    } else if (var7 === 2) {
                        var10[var11 + 1536] = var9;
                        var10[var11 + 1536 + 1] = var9;
                        var10[var11 + 1538] = var9;
                        var10[var11 + 3 + 1536] = var9;
                    }
                }
            } else {
                const var14: SoftwarePix8 | null = Client.mapscene[var13.mapscene];
                if (var14 !== null) {
                    const var15: number = ((var13.width * 4 - var14.wi) / 2) | 0;
                    const var16: number = ((var13.length * 4 - var14.hi) / 2) | 0;
                    var14.plotSprite(arg4 * 4 + var15 + 48, 48 - -((104 - (arg0 - -var13.length)) * 4) + var16);
                }
            }
        }
        const var17: SceneTag = World.sceneType(arg2, arg4, arg0);
        if (BigInt(var17) !== 0n) {
            const var19: number = (Number(BigInt.asIntN(32, BigInt(var17))) >> 20) & 0x3;
            const var20: number = (Number(BigInt.asIntN(32, BigInt(var17))) >> 14) & 0x1f;
            const var21: number = Number((BigInt(var17) >> 32n) & 0x7fffffffn);
            const var22: LocType = LocType.list(var21);
            if (var22.mapscene !== -1) {
                const var23: SoftwarePix8 | null = Client.mapscene[var22.mapscene];
                if (var23 !== null) {
                    const var24: number = ((var22.width * 4 - var23.wi) / 2) | 0;
                    const var25: number = ((var22.length * 4 - var23.hi) / 2) | 0;
                    var23.plotSprite(arg4 * 4 + var24 + 48, var25 + (-var22.length + -arg0 + 104) * 4 + 48);
                }
            } else if (var20 === 9) {
                let var26: number = 15658734;
                const var27: Int32Array = Pix2D.pixels;
                if (BigInt(var17) > 0n) {
                    var26 = 15597568;
                }
                const var28: number = arg4 * 4 + (103 - arg0) * 512 * 4 + 24624;
                if (var19 === 0 || var19 === 2) {
                    var27[var28 + 1536] = var26;
                    var27[var28 + 1025] = var26;
                    var27[var28 + 514] = var26;
                    var27[var28 + 3] = var26;
                } else {
                    var27[var28] = var26;
                    var27[var28 + 1 + 512] = var26;
                    var27[var28 + 1024 + 2] = var26;
                    var27[var28 + 1539] = var26;
                }
            }
        }
        const var29: SceneTag = World.gdType(arg2, arg4, arg0);
        if (BigInt(var29) === 0n) {
            return;
        }
        const var31: number = Number((BigInt(var29) >> 32n) & 0x7fffffffn);
        const var32: LocType = LocType.list(var31);
        if (var32.mapscene !== -1) {
            const var33: SoftwarePix8 | null = Client.mapscene[var32.mapscene];
            if (var33 !== null) {
                const var34: number = ((var32.width * 4 - var33.wi) / 2) | 0;
                const var35: number = ((var32.length * 4 - var33.hi) / 2) | 0;
                var33.plotSprite(var34 + arg4 * 4 + 48, (-arg0 + 104 + -var32.length) * 4 + 48 - -var35);
            }
        }
    }

    static interactWithLoc(arg0: number, arg1: SceneTag, arg2: number): boolean {
        const var4: number = Number((BigInt(arg1) >> 32n) & 0x7fffffffn);
        const var5: number = (Number(BigInt.asIntN(32, BigInt(arg1))) >> 14) & 0x1f;
        const var6: number = (Number(BigInt.asIntN(32, BigInt(arg1))) >> 20) & 0x3;
        if (var5 === 10 || var5 === 11 || var5 === 22) {
            const var7: LocType = LocType.list(var4);
            let var8: number;
            let var9: number;
            if (var6 === 0 || var6 === 2) {
                var8 = var7.length;
                var9 = var7.width;
            } else {
                var9 = var7.length;
                var8 = var7.width;
            }
            let var10: number = var7.forceapproach;
            if (var6 !== 0) {
                var10 = ((var10 << var6) & 0xf) + (var10 >> (4 - var6));
            }
            Client.tryMove(var8, 0, arg0, arg2, Client.localPlayer!.routeX[0], var9, 0, 2, true, var10, Client.localPlayer!.routeZ[0]);
        } else {
            Client.tryMove(0, var6, arg0, arg2, Client.localPlayer!.routeX[0], 0, var5 + 1, 2, true, 0, Client.localPlayer!.routeZ[0]);
        }

        Client.crossY = ClientMouseListener.mouseClickY;
        Client.crossMode = 2;
        Client.crossX = ClientMouseListener.mouseClickX;
        Client.crossCycle = 0;

        return true;
    }

    static tryMove(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: boolean, arg9: number, arg10: number): boolean {
        if (Client.localPlayer!.size === 2) {
            return Client.tryMove2(arg8, arg10, arg5, arg0, arg4, arg6, arg1, arg3, arg9, arg7, arg2);
        } else if (Client.localPlayer!.size > 2) {
            return Client.tryMove2P(arg5, arg3, Client.localPlayer!.size, arg6, arg2, arg4, arg1, arg8, arg10, arg7, arg9, arg0);
        } else {
            return Client.tryMoveN(arg2, arg6, arg10, arg4, arg3, arg0, arg1, arg5, arg7, arg9, arg8);
        }
    }

    static tryMove2(arg0: boolean, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number, arg9: number, arg10: number): boolean {
        for (let var11 = 0; var11 < BuildArea.SIZE; var11++) {
            for (let var12 = 0; var12 < BuildArea.SIZE; var12++) {
                Client.dirMap[var11 * BuildArea.SIZE + var12] = 0;
                Client.distMap[var11 * BuildArea.SIZE + var12] = 99999999;
            }
        }
        Client.dirMap[arg4 * BuildArea.SIZE + arg1] = 99;
        Client.distMap[arg4 * BuildArea.SIZE + arg1] = 0;
        let var13 = arg4;
        let var14 = arg1;
        const var15 = 0;
        Client.routeX[0] = arg4;
        let var30 = var15 + 1;
        Client.routeZ[0] = arg1;
        let var16 = false;
        let var17 = 0;
        const var18 = Client.collision[Client.minusedlevel]!.flags;
        while (var30 !== var17) {
            var13 = Client.routeX[var17];
            var14 = Client.routeZ[var17];
            var17 = (var17 + 1) & 0xfff;
            if (var13 === arg7 && arg10 === var14) {
                var16 = true;
                break;
            }
            if (arg5 !== 0) {
                if ((arg5 < 5 || arg5 === 10) && Client.collision[Client.minusedlevel]!.testWall(var14, arg5 - 1, arg7, arg10, 2, arg6, var13)) {
                    var16 = true;
                    break;
                }
                if (arg5 < 10 && Client.collision[Client.minusedlevel]!.testWDecor(arg6, var13, arg5 - 1, arg10, 2, var14, arg7)) {
                    var16 = true;
                    break;
                }
            }
            if (arg2 !== 0 && arg3 !== 0 && Client.collision[Client.minusedlevel]!.testLoc(2, arg10, arg2, var14, arg3, var13, arg7, arg8)) {
                var16 = true;
                break;
            }
            const var19 = Client.distMap[var13 * BuildArea.SIZE + var14] + 1;
            if (var13 > 0 && Client.dirMap[(var13 - 1) * BuildArea.SIZE + var14] === 0 && (var18[var13 - 1][var14] & 0x12c010e) === 0 && (var18[var13 - 1][var14 + 1] & 0x12c0138) === 0) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + var14] = 2;
                var30 = (var30 + 1) & 0xfff;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + var14] = var19;
            }
            if (var13 < 102 && Client.dirMap[(var13 + 1) * BuildArea.SIZE + var14] === 0 && (var18[var13 + 2][var14] & 0x12c0183) === 0 && (var18[var13 + 2][var14 + 1] & 0x12c01e0) === 0) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + var14] = 8;
                var30 = (var30 + 1) & 0xfff;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + var14] = var19;
            }
            if (var14 > 0 && Client.dirMap[var13 * BuildArea.SIZE + (var14 - 1)] === 0 && (var18[var13][var14 - 1] & 0x12c010e) === 0 && (var18[var13 + 1][var14 - 1] & 0x12c0183) === 0) {
                Client.routeX[var30] = var13;
                Client.routeZ[var30] = var14 - 1;
                Client.dirMap[var13 * BuildArea.SIZE + (var14 - 1)] = 1;
                var30 = (var30 + 1) & 0xfff;
                Client.distMap[var13 * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (var14 < 102 && Client.dirMap[var13 * BuildArea.SIZE + (var14 + 1)] === 0 && (var18[var13][var14 + 2] & 0x12c0138) === 0 && (var18[var13 + 1][var14 + 2] & 0x12c01e0) === 0) {
                Client.routeX[var30] = var13;
                Client.routeZ[var30] = var14 + 1;
                Client.dirMap[var13 * BuildArea.SIZE + (var14 + 1)] = 4;
                Client.distMap[var13 * BuildArea.SIZE + (var14 + 1)] = var19;
                var30 = (var30 + 1) & 0xfff;
            }
            if (
                var13 > 0 &&
                var14 > 0 &&
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] === 0 &&
                (var18[var13 - 1][var14] & 0x12c0138) === 0 &&
                (var18[var13 - 1][var14 - 1] & 0x12c010e) === 0 &&
                (var18[var13][var14 - 1] & 0x12c0183) === 0
            ) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14 - 1;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] = 3;
                var30 = (var30 + 1) & 0xfff;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (
                var13 < 102 &&
                var14 > 0 &&
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] === 0 &&
                (var18[var13 + 1][var14 - 1] & 0x12c010e) === 0 &&
                (var18[var13 + 2][var14 - 1] & 0x12c0183) === 0 &&
                (var18[var13 + 2][var14] & 0x12c01e0) === 0
            ) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14 - 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] = 9;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (
                var13 > 0 &&
                var14 < 102 &&
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] === 0 &&
                (var18[var13 - 1][var14 + 1] & 0x12c010e) === 0 &&
                (var18[var13 - 1][var14 + 2] & 0x12c0138) === 0 &&
                (var18[var13][var14 + 2] & 0x12c01e0) === 0
            ) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14 + 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] = 6;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] = var19;
            }
            if (
                var13 < 102 &&
                var14 < 102 &&
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] === 0 &&
                (var18[var13 + 1][var14 + 2] & 0x12c0138) === 0 &&
                (var18[var13 + 2][var14 + 2] & 0x12c01e0) === 0 &&
                (var18[var13 + 2][var14 + 1] & 0x12c0183) === 0
            ) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14 + 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] = 12;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] = var19;
            }
        }
        Client.field2186 = 0;
        if (!var16) {
            if (!arg0) {
                return false;
            }
            let var20 = 1000;
            let var21 = 100;
            for (let var22 = arg7 - 10; var22 <= arg7 + 10; var22++) {
                for (let var23 = arg10 - 10; var23 <= arg10 + 10; var23++) {
                    if (var22 >= 0 && var23 >= 0 && var22 < 104 && var23 < 104 && Client.distMap[var22 * BuildArea.SIZE + var23] < 100) {
                        let var24 = 0;
                        let var25 = 0;
                        if (var23 < arg10) {
                            var25 = arg10 - var23;
                        } else if (var23 > arg10 + arg3 - 1) {
                            var25 = var23 + 1 - arg10 - arg3;
                        }
                        if (var22 < arg7) {
                            var24 = arg7 - var22;
                        } else if (arg2 + arg7 - 1 < var22) {
                            var24 = var22 + 1 - arg2 - arg7;
                        }
                        const var26 = var24 * var24 + var25 * var25;
                        if (var20 > var26 || (var20 === var26 && var21 > Client.distMap[var22 * BuildArea.SIZE + var23])) {
                            var21 = Client.distMap[var22 * BuildArea.SIZE + var23];
                            var13 = var22;
                            var14 = var23;
                            var20 = var26;
                        }
                    }
                }
            }
            if (var20 === 1000) {
                return false;
            }
            if (var13 === arg4 && var14 === arg1) {
                return false;
            }
            Client.field2186 = 1;
        }
        const var27 = 0;
        Client.routeX[0] = var13;
        let var31 = var27 + 1;
        Client.routeZ[0] = var14;
        let var28: number;
        let var29 = (var28 = Client.dirMap[var13 * BuildArea.SIZE + var14]);
        while (var13 !== arg4 || var14 !== arg1) {
            if (var29 !== var28) {
                var28 = var29;
                Client.routeX[var31] = var13;
                Client.routeZ[var31++] = var14;
            }
            if ((var29 & 0x2) !== 0) {
                var13++;
            } else if ((var29 & 0x8) !== 0) {
                var13--;
            }
            if ((var29 & 0x1) !== 0) {
                var14++;
            } else if ((var29 & 0x4) !== 0) {
                var14--;
            }
            var29 = Client.dirMap[var13 * BuildArea.SIZE + var14];
        }
        if (var31 > 0) {
            Client.moveClick(arg9, Client.routeX, Client.routeZ, var31);
            return true;
        } else if (arg9 === 1) {
            return false;
        } else {
            return true;
        }
    }

    static tryMove2P(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: boolean, arg8: number, arg9: number, arg10: number, arg11: number): boolean {
        for (let var12 = 0; var12 < BuildArea.SIZE; var12++) {
            for (let var13 = 0; var13 < BuildArea.SIZE; var13++) {
                Client.dirMap[var12 * BuildArea.SIZE + var13] = 0;
                Client.distMap[var12 * BuildArea.SIZE + var13] = 99999999;
            }
        }
        Client.dirMap[arg5 * BuildArea.SIZE + arg8] = 99;
        Client.distMap[arg5 * BuildArea.SIZE + arg8] = 0;
        let var14 = arg5;
        let var15 = arg8;
        let var16 = 0;
        let var17 = false;
        const var18 = 0;
        Client.routeX[0] = arg5;
        let var39 = var18 + 1;
        Client.routeZ[0] = arg8;
        const var19 = Client.collision[Client.minusedlevel]!.flags;
        label367: while (var16 !== var39) {
            var15 = Client.routeZ[var16];
            var14 = Client.routeX[var16];
            var16 = (var16 + 1) & 0xfff;
            if (var14 === arg1 && arg4 === var15) {
                var17 = true;
                break;
            }
            if (arg3 !== 0) {
                if ((arg3 < 5 || arg3 === 10) && Client.collision[Client.minusedlevel]!.testWall(var15, arg3 - 1, arg1, arg4, arg2, arg6, var14)) {
                    var17 = true;
                    break;
                }
                if (arg3 < 10 && Client.collision[Client.minusedlevel]!.testWDecor(arg6, var14, arg3 - 1, arg4, arg2, var15, arg1)) {
                    var17 = true;
                    break;
                }
            }
            if (arg0 !== 0 && arg11 !== 0 && Client.collision[Client.minusedlevel]!.testLoc(arg2, arg4, arg0, var15, arg11, var14, arg1, arg10)) {
                var17 = true;
                break;
            }
            const var20 = Client.distMap[var14 * BuildArea.SIZE + var15] + 1;
            if (var14 > 0 && Client.dirMap[(var14 - 1) * BuildArea.SIZE + var15] === 0 && (var19[var14 - 1][var15] & 0x12c010e) === 0 && (var19[var14 - 1][var15 + arg2 - 1] & 0x12c0138) === 0) {
                let var21 = 1;
                while (true) {
                    if (arg2 - 1 <= var21) {
                        Client.routeX[var39] = var14 - 1;
                        Client.routeZ[var39] = var15;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[(var14 - 1) * BuildArea.SIZE + var15] = 2;
                        Client.distMap[(var14 - 1) * BuildArea.SIZE + var15] = var20;
                        break;
                    }
                    if ((var19[var14 - 1][var21 + var15] & 0x12c013e) !== 0) {
                        break;
                    }
                    var21++;
                }
            }
            if (var14 < 102 && Client.dirMap[(var14 + 1) * BuildArea.SIZE + var15] === 0 && (var19[var14 + arg2][var15] & 0x12c0183) === 0 && (var19[var14 + arg2][arg2 + var15 - 1] & 0x12c01e0) === 0) {
                let var22 = 1;
                while (true) {
                    if (var22 >= arg2 - 1) {
                        Client.routeX[var39] = var14 + 1;
                        Client.routeZ[var39] = var15;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[(var14 + 1) * BuildArea.SIZE + var15] = 8;
                        Client.distMap[(var14 + 1) * BuildArea.SIZE + var15] = var20;
                        break;
                    }
                    if ((var19[var14 + arg2][var22 + var15] & 0x12c01e3) !== 0) {
                        break;
                    }
                    var22++;
                }
            }
            if (var15 > 0 && Client.dirMap[var14 * BuildArea.SIZE + (var15 - 1)] === 0 && (var19[var14][var15 - 1] & 0x12c010e) === 0 && (var19[arg2 + var14 - 1][var15 - 1] & 0x12c0183) === 0) {
                let var23 = 1;
                while (true) {
                    if (arg2 - 1 <= var23) {
                        Client.routeX[var39] = var14;
                        Client.routeZ[var39] = var15 - 1;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[var14 * BuildArea.SIZE + (var15 - 1)] = 1;
                        Client.distMap[var14 * BuildArea.SIZE + (var15 - 1)] = var20;
                        break;
                    }
                    if ((var19[var14 + var23][var15 - 1] & 0x12c018f) !== 0) {
                        break;
                    }
                    var23++;
                }
            }
            if (var15 < 102 && Client.dirMap[var14 * BuildArea.SIZE + (var15 + 1)] === 0 && (var19[var14][arg2 + var15] & 0x12c0138) === 0 && (var19[arg2 + var14 - 1][var15 + arg2] & 0x12c01e0) === 0) {
                let var24 = 1;
                while (true) {
                    if (var24 >= arg2 - 1) {
                        Client.routeX[var39] = var14;
                        Client.routeZ[var39] = var15 + 1;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[var14 * BuildArea.SIZE + (var15 + 1)] = 4;
                        Client.distMap[var14 * BuildArea.SIZE + (var15 + 1)] = var20;
                        break;
                    }
                    if ((var19[var14 + var24][arg2 + var15] & 0x12c01f8) !== 0) {
                        break;
                    }
                    var24++;
                }
            }
            if (
                var14 > 0 &&
                var15 > 0 &&
                Client.dirMap[(var14 - 1) * BuildArea.SIZE + (var15 - 1)] === 0 &&
                (var19[var14 - 1][var15 + arg2 - 2] & 0x12c0138) === 0 &&
                (var19[var14 - 1][var15 - 1] & 0x12c010e) === 0 &&
                (var19[arg2 + var14 - 2][var15 - 1] & 0x12c0183) === 0
            ) {
                let var25 = 1;
                while (true) {
                    if (var25 >= arg2 - 1) {
                        Client.routeX[var39] = var14 - 1;
                        Client.routeZ[var39] = var15 - 1;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[(var14 - 1) * BuildArea.SIZE + (var15 - 1)] = 3;
                        Client.distMap[(var14 - 1) * BuildArea.SIZE + (var15 - 1)] = var20;
                        break;
                    }
                    if ((var19[var14 - 1][var15 + var25 - 1] & 0x12c013e) !== 0 || (var19[var14 + var25 - 1][var15 - 1] & 0x12c018f) !== 0) {
                        break;
                    }
                    var25++;
                }
            }
            if (
                var14 < 102 &&
                var15 > 0 &&
                Client.dirMap[(var14 + 1) * BuildArea.SIZE + (var15 - 1)] === 0 &&
                (var19[var14 + 1][var15 - 1] & 0x12c010e) === 0 &&
                (var19[arg2 + var14][var15 - 1] & 0x12c0183) === 0 &&
                (var19[arg2 + var14][var15 + arg2 - 2] & 0x12c01e0) === 0
            ) {
                let var26 = 1;
                while (true) {
                    if (arg2 - 1 <= var26) {
                        Client.routeX[var39] = var14 + 1;
                        Client.routeZ[var39] = var15 - 1;
                        Client.dirMap[(var14 + 1) * BuildArea.SIZE + (var15 - 1)] = 9;
                        Client.distMap[(var14 + 1) * BuildArea.SIZE + (var15 - 1)] = var20;
                        var39 = (var39 + 1) & 0xfff;
                        break;
                    }
                    if ((var19[var14 + arg2][var26 + var15 - 1] & 0x12c01e3) !== 0 || (var19[var14 + var26 + 1][var15 - 1] & 0x12c018f) !== 0) {
                        break;
                    }
                    var26++;
                }
            }
            if (
                var14 > 0 &&
                var15 < 102 &&
                Client.dirMap[(var14 - 1) * BuildArea.SIZE + (var15 + 1)] === 0 &&
                (var19[var14 - 1][var15 + 1] & 0x12c010e) === 0 &&
                (var19[var14 - 1][arg2 + var15] & 0x12c0138) === 0 &&
                (var19[var14][var15 + arg2] & 0x12c01e0) === 0
            ) {
                let var27 = 1;
                while (true) {
                    if (var27 >= arg2 - 1) {
                        Client.routeX[var39] = var14 - 1;
                        Client.routeZ[var39] = var15 + 1;
                        var39 = (var39 + 1) & 0xfff;
                        Client.dirMap[(var14 - 1) * BuildArea.SIZE + (var15 + 1)] = 6;
                        Client.distMap[(var14 - 1) * BuildArea.SIZE + (var15 + 1)] = var20;
                        break;
                    }
                    if ((var19[var14 - 1][var27 + var15 + 1] & 0x12c013e) !== 0 || (var19[var14 + var27 - 1][var15 + arg2] & 0x12c01f8) !== 0) {
                        break;
                    }
                    var27++;
                }
            }
            if (
                var14 < 102 &&
                var15 < 102 &&
                Client.dirMap[(var14 + 1) * BuildArea.SIZE + (var15 + 1)] === 0 &&
                (var19[var14 + 1][arg2 + var15] & 0x12c0138) === 0 &&
                (var19[arg2 + var14][arg2 + var15] & 0x12c01e0) === 0 &&
                (var19[arg2 + var14][var15 + 1] & 0x12c0183) === 0
            ) {
                for (let var28 = 1; var28 < arg2 - 1; var28++) {
                    if ((var19[var28 + var14 + 1][var15 + arg2] & 0x12c01f8) !== 0 || (var19[arg2 + var14][var15 + var28 + 1] & 0x12c01e3) !== 0) {
                        continue label367;
                    }
                }
                Client.routeX[var39] = var14 + 1;
                Client.routeZ[var39] = var15 + 1;
                var39 = (var39 + 1) & 0xfff;
                Client.dirMap[(var14 + 1) * BuildArea.SIZE + (var15 + 1)] = 12;
                Client.distMap[(var14 + 1) * BuildArea.SIZE + (var15 + 1)] = var20;
            }
        }
        Client.field2186 = 0;
        if (!var17) {
            if (!arg7) {
                return false;
            }
            let var29 = 1000;
            let var30 = 100;
            for (let var31 = arg1 - 10; var31 <= arg1 + 10; var31++) {
                for (let var32 = arg4 - 10; var32 <= arg4 + 10; var32++) {
                    if (var31 >= 0 && var32 >= 0 && var31 < 104 && var32 < 104 && Client.distMap[var31 * BuildArea.SIZE + var32] < 100) {
                        let var33 = 0;
                        if (arg1 > var31) {
                            var33 = arg1 - var31;
                        } else if (arg0 + arg1 - 1 < var31) {
                            var33 = var31 + 1 - arg1 - arg0;
                        }
                        let var34 = 0;
                        if (arg4 > var32) {
                            var34 = arg4 - var32;
                        } else if (var32 > arg11 + arg4 - 1) {
                            var34 = var32 + 1 - arg11 - arg4;
                        }
                        const var35 = var33 * var33 + var34 * var34;
                        if (var29 > var35 || (var29 === var35 && var30 > Client.distMap[var31 * BuildArea.SIZE + var32])) {
                            var14 = var31;
                            var29 = var35;
                            var30 = Client.distMap[var31 * BuildArea.SIZE + var32];
                            var15 = var32;
                        }
                    }
                }
            }
            if (var29 === 1000) {
                return false;
            }
            if (var14 === arg5 && var15 === arg8) {
                return false;
            }
            Client.field2186 = 1;
        }
        const var36 = 0;
        Client.routeX[0] = var14;
        let var40 = var36 + 1;
        Client.routeZ[0] = var15;
        let var37: number;
        let var38 = (var37 = Client.dirMap[var14 * BuildArea.SIZE + var15]);
        while (var14 !== arg5 || var15 !== arg8) {
            if (var38 !== var37) {
                var37 = var38;
                Client.routeX[var40] = var14;
                Client.routeZ[var40++] = var15;
            }
            if ((var38 & 0x1) !== 0) {
                var15++;
            } else if ((var38 & 0x4) !== 0) {
                var15--;
            }
            if ((var38 & 0x2) !== 0) {
                var14++;
            } else if ((var38 & 0x8) !== 0) {
                var14--;
            }
            var38 = Client.dirMap[var14 * BuildArea.SIZE + var15];
        }
        if (var40 > 0) {
            Client.moveClick(arg9, Client.routeX, Client.routeZ, var40);
            return true;
        } else if (arg9 === 1) {
            return false;
        } else {
            return true;
        }
    }

    static tryMoveN(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number, arg9: number, arg10: boolean): boolean {
        for (let var11 = 0; var11 < BuildArea.SIZE; var11++) {
            for (let var12 = 0; var12 < BuildArea.SIZE; var12++) {
                Client.dirMap[var11 * BuildArea.SIZE + var12] = 0;
                Client.distMap[var11 * BuildArea.SIZE + var12] = 99999999;
            }
        }
        Client.dirMap[arg3 * BuildArea.SIZE + arg2] = 99;
        let var13 = arg3;
        Client.distMap[arg3 * BuildArea.SIZE + arg2] = 0;
        let var14 = arg2;
        const var15 = 0;
        Client.routeX[0] = arg3;
        let var16 = 0;
        let var30 = var15 + 1;
        Client.routeZ[0] = arg2;
        const var17 = Client.collision[Client.minusedlevel]!.flags;
        let var18 = false;
        while (var16 !== var30) {
            var14 = Client.routeZ[var16];
            var13 = Client.routeX[var16];
            var16 = (var16 + 1) & 0xfff;
            if (var13 === arg4 && arg0 === var14) {
                var18 = true;
                break;
            }
            if (arg1 !== 0) {
                if ((arg1 < 5 || arg1 === 10) && Client.collision[Client.minusedlevel]!.testWall(var14, arg1 - 1, arg4, arg0, 1, arg6, var13)) {
                    var18 = true;
                    break;
                }
                if (arg1 < 10 && Client.collision[Client.minusedlevel]!.testWDecor(arg6, var13, arg1 - 1, arg0, 1, var14, arg4)) {
                    var18 = true;
                    break;
                }
            }
            if (arg7 !== 0 && arg5 !== 0 && Client.collision[Client.minusedlevel]!.testLoc(1, arg0, arg7, var14, arg5, var13, arg4, arg9)) {
                var18 = true;
                break;
            }
            const var19 = Client.distMap[var13 * BuildArea.SIZE + var14] + 1;
            if (var13 > 0 && Client.dirMap[(var13 - 1) * BuildArea.SIZE + var14] === 0 && (var17[var13 - 1][var14] & 0x12c0108) === 0) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + var14] = 2;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + var14] = var19;
            }
            if (var13 < 103 && Client.dirMap[(var13 + 1) * BuildArea.SIZE + var14] === 0 && (var17[var13 + 1][var14] & 0x12c0180) === 0) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + var14] = 8;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + var14] = var19;
            }
            if (var14 > 0 && Client.dirMap[var13 * BuildArea.SIZE + (var14 - 1)] === 0 && (var17[var13][var14 - 1] & 0x12c0102) === 0) {
                Client.routeX[var30] = var13;
                Client.routeZ[var30] = var14 - 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[var13 * BuildArea.SIZE + (var14 - 1)] = 1;
                Client.distMap[var13 * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (var14 < 103 && Client.dirMap[var13 * BuildArea.SIZE + (var14 + 1)] === 0 && (var17[var13][var14 + 1] & 0x12c0120) === 0) {
                Client.routeX[var30] = var13;
                Client.routeZ[var30] = var14 + 1;
                Client.dirMap[var13 * BuildArea.SIZE + (var14 + 1)] = 4;
                var30 = (var30 + 1) & 0xfff;
                Client.distMap[var13 * BuildArea.SIZE + (var14 + 1)] = var19;
            }
            if (
                var13 > 0 &&
                var14 > 0 &&
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] === 0 &&
                (var17[var13 - 1][var14 - 1] & 0x12c010e) === 0 &&
                (var17[var13 - 1][var14] & 0x12c0108) === 0 &&
                (var17[var13][var14 - 1] & 0x12c0102) === 0
            ) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14 - 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] = 3;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (
                var13 < 103 &&
                var14 > 0 &&
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] === 0 &&
                (var17[var13 + 1][var14 - 1] & 0x12c0183) === 0 &&
                (var17[var13 + 1][var14] & 0x12c0180) === 0 &&
                (var17[var13][var14 - 1] & 0x12c0102) === 0
            ) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14 - 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] = 9;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + (var14 - 1)] = var19;
            }
            if (
                var13 > 0 &&
                var14 < 103 &&
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] === 0 &&
                (var17[var13 - 1][var14 + 1] & 0x12c0138) === 0 &&
                (var17[var13 - 1][var14] & 0x12c0108) === 0 &&
                (var17[var13][var14 + 1] & 0x12c0120) === 0
            ) {
                Client.routeX[var30] = var13 - 1;
                Client.routeZ[var30] = var14 + 1;
                var30 = (var30 + 1) & 0xfff;
                Client.dirMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] = 6;
                Client.distMap[(var13 - 1) * BuildArea.SIZE + (var14 + 1)] = var19;
            }
            if (
                var13 < 103 &&
                var14 < 103 &&
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] === 0 &&
                (var17[var13 + 1][var14 + 1] & 0x12c01e0) === 0 &&
                (var17[var13 + 1][var14] & 0x12c0180) === 0 &&
                (var17[var13][var14 + 1] & 0x12c0120) === 0
            ) {
                Client.routeX[var30] = var13 + 1;
                Client.routeZ[var30] = var14 + 1;
                Client.dirMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] = 12;
                Client.distMap[(var13 + 1) * BuildArea.SIZE + (var14 + 1)] = var19;
                var30 = (var30 + 1) & 0xfff;
            }
        }
        Client.field2186 = 0;
        if (!var18) {
            if (!arg10) {
                return false;
            }
            let var20 = 1000;
            let var21 = 100;
            for (let var22 = arg4 - 10; var22 <= arg4 + 10; var22++) {
                for (let var23 = arg0 - 10; var23 <= arg0 + 10; var23++) {
                    if (var22 >= 0 && var23 >= 0 && var22 < 104 && var23 < 104 && Client.distMap[var22 * BuildArea.SIZE + var23] < 100) {
                        let var24 = 0;
                        if (var22 < arg4) {
                            var24 = arg4 - var22;
                        } else if (arg7 + arg4 - 1 < var22) {
                            var24 = var22 + 1 - arg7 - arg4;
                        }
                        let var25 = 0;
                        if (var23 < arg0) {
                            var25 = arg0 - var23;
                        } else if (var23 > arg5 + arg0 - 1) {
                            var25 = var23 + 1 - arg0 - arg5;
                        }
                        const var26 = var25 * var25 + var24 * var24;
                        if (var20 > var26 || (var20 === var26 && var21 > Client.distMap[var22 * BuildArea.SIZE + var23])) {
                            var21 = Client.distMap[var22 * BuildArea.SIZE + var23];
                            var20 = var26;
                            var14 = var23;
                            var13 = var22;
                        }
                    }
                }
            }
            if (var20 === 1000) {
                return false;
            }
            if (arg3 === var13 && var14 === arg2) {
                return false;
            }
            Client.field2186 = 1;
        }
        const var27 = 0;
        Client.routeX[0] = var13;
        let var31 = var27 + 1;
        Client.routeZ[0] = var14;
        let var28: number;
        let var29 = (var28 = Client.dirMap[var13 * BuildArea.SIZE + var14]);
        while (arg3 !== var13 || var14 !== arg2) {
            if (var28 !== var29) {
                Client.routeX[var31] = var13;
                var28 = var29;
                Client.routeZ[var31++] = var14;
            }
            if ((var29 & 0x1) !== 0) {
                var14++;
            } else if ((var29 & 0x4) !== 0) {
                var14--;
            }
            if ((var29 & 0x2) !== 0) {
                var13++;
            } else if ((var29 & 0x8) !== 0) {
                var13--;
            }
            var29 = Client.dirMap[var13 * BuildArea.SIZE + var14];
        }
        if (var31 > 0) {
            Client.moveClick(arg8, Client.routeX, Client.routeZ, var31);
            return true;
        } else if (arg8 === 1) {
            return false;
        } else {
            return true;
        }
    }

    static moveClick(arg0: number, arg1: Int32Array, arg2: Int32Array, arg3: number): void {
        let var4: number = arg3;
        if (arg3 > 25) {
            var4 = 25;
        }
        arg3--;
        let var5: number = arg2[arg3];
        let var6: number = arg1[arg3];

        // 464 MOVE body: ctrl(byteS, FIRST), destY(u16LE), destX(shortA), then steps×(relX byteS,
        // relY byteS). Game-click (143) appends 14 trailing mouse bytes (server does size-=14);
        // minimap(50)/op(36) do not. (rev-500 wrote destY-BE first, ctrl as byteC, destX last.)
        const steps: number = var4 - 1;
        if (arg0 === 0) {
            Client.out.p1Enc(ClientProt.MOVE_GAMECLICK);
            Client.out.p1(5 + steps + steps + 14);
        }
        if (arg0 === 1) {
            Client.out.p1Enc(ClientProt.MOVE_MINIMAPCLICK);
            Client.out.p1(5 + steps + steps);
        }
        if (arg0 === 2) {
            Client.out.p1Enc(ClientProt.MOVE_OPCLICK);
            Client.out.p1(5 + steps + steps);
        }

        Client.out.p1(128 - (ClientKeyboardListener.keyHeld[82] ? 1 : 0)); // ctrl/run byteS
        const destY: number = var5 + Client.mapBuildBaseZ;
        Client.out.p1(destY); // destY u16LE
        Client.out.p1(destY >> 8);
        const destX: number = var6 + Client.mapBuildBaseX;
        Client.out.p1(destX >> 8); // destX shortA
        Client.out.p1(destX + 128);
        Client.minimapFlagX = arg1[0];
        Client.minimapFlagZ = arg2[0];
        for (let var7: number = 1; var7 < var4; var7++) {
            arg3--;
            Client.out.p1(128 - (arg1[arg3] - var6)); // relX byteS
            Client.out.p1(128 - (arg2[arg3] - var5)); // relY byteS
        }
        if (arg0 === 0) {
            for (let var8: number = 0; var8 < 14; var8++) {
                Client.out.p1(0); // 143 trailing mouse bytes (server discards)
            }
        }
    }

    async tcpIn(): Promise<boolean> {
        try {
            return await this.tcpInInner();
        } catch (e) {
            if (e instanceof WebSocket) {
                Client.lostCon();
                return true;
            }
            let message = `T2 - ${Client.ptype},${Client.ptype1},${Client.ptype2} - ${Client.psize}`;
            if (Client.localPlayer !== null) {
                message += `,${Client.localPlayer.routeX[0] + Client.mapBuildBaseX},${Client.localPlayer.routeZ[0] + Client.mapBuildBaseZ}`;
            }
            message += ' - ';
            for (let i = 0; i < Client.psize && i < 50; i++) {
                message += `${Client.in.data[i]},`;
            }
            JagException.report(message, e);
            Client.logout();
            return true;
        }
    }

    async tcpInInner(): Promise<boolean> {
        if (!Client.stream) {
            return false;
        }

        try {
            let available: number = Client.stream.available();
            if (available === 0) {
                return false;
            }

            if (Client.ptype === -1) {
                await Client.stream.readBytes(Client.in.data, 0, 1);
                Client.in.pos = 0;
                Client.ptype = Client.in.g1Enc();
                Client.psize = Statics.field224[Client.ptype]; // 464 size table
                if (Client.state === 30) console.log('[dbg] pkt raw=' + Client.ptype + ' sz=' + Client.psize + ' ->' + Statics.serverOpcode464to500[Client.ptype]);
                Client.ptype = Statics.serverOpcode464to500[Client.ptype]; // 464 opcode -> rev-500 dispatch (5000 = skip)
                available--;
            }

            if (Client.psize === -1) {
                if (available <= 0) {
                    return false;
                }

                await Client.stream.readBytes(Client.in.data, 0, 1);
                Client.psize = Client.in.data[0] & 0xff;
                available--;
            }

            if (Client.psize === -2) {
                if (available <= 1) {
                    return false;
                }

                await Client.stream.readBytes(Client.in.data, 0, 2);
                Client.in.pos = 0;
                Client.psize = Client.in.g2();
                available -= 2;
            }

            if (available < Client.psize) {
                return false;
            }

            Client.in.pos = 0;
            await Client.stream.readBytes(Client.in.data, 0, Client.psize);

            Client.timeoutTimer = 0;
            Client.ptype2 = Client.ptype1;
            Client.ptype1 = Client.ptype0;
            Client.ptype0 = Client.ptype;

            if (Client.ptype === 239) {
                const from: number = Client.in.g4();
                const to: number = Client.in.g4();
                const fromSub = Client.subinterfaces.find(BigInt(from));
                const toSub = Client.subinterfaces.find(BigInt(to));
                if (toSub !== null) {
                    Client.closeSubInterface(toSub, fromSub === null || fromSub.id !== toSub.id);
                }
                if (fromSub !== null) {
                    fromSub.unlink();
                    Client.subinterfaces.put(BigInt(to), fromSub);
                }
                const fromCom = IfType.get(from);
                if (fromCom !== null) {
                    Client.componentUpdated(fromCom);
                }
                const toCom = IfType.get(to);
                if (toCom !== null) {
                    Client.componentUpdated(toCom);
                    Client.computeLayerLayout(true, toCom);
                }
                if (Client.toplevelinterface !== -1) {
                    Client.runHookImmediate(Client.toplevelinterface, 1);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 120) {
                const modelZoom: number = Client.in.g2_alt2();
                const modelYAn: number = Client.in.g2_alt2();
                const comId: number = Client.in.g4_alt3();
                const modelXAn: number = Client.in.g2_alt1();

                const com = IfType.get(comId)!;
                if (modelXAn !== com.modelXAn || com.modelYAn !== modelYAn || modelZoom !== com.modelZoom) {
                    com.modelYAn = modelYAn;
                    com.modelZoom = modelZoom;
                    com.modelXAn = modelXAn;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4) {
                const yStep: number = Client.in.g2_alt3();
                const xStep: number = Client.in.g2();
                const comId: number = Client.in.g4_alt2();

                const com = IfType.get(comId)!;
                Client.ptype = -1;
                com.modelSpin = ((xStep << 16) + yStep) | 0;

                return true;
            }

            if (Client.ptype === 4114) {
                // 464 item/obj on component (114): [i32 LE zoom-divisor][u16 BE itemId (65535=clear)][i32 LE hash]
                const icDiv: number = Client.in.g4_alt1();
                let icObj: number = Client.in.g2();
                if (icObj === 65535) {
                    icObj = -1;
                }
                const icComId: number = Client.in.g4_alt1();
                const icCom: IfType | null = IfType.get(icComId);
                if (icCom !== null) {
                    if (icCom.v3) {
                        icCom.invobject = icObj;
                        icCom.invcount = icDiv;
                        const t: ObjType = ObjType.list(icObj);
                        icCom.field3498 = t.yof2d;
                        icCom.modelZoom = t.zoom2d;
                        icCom.modelYAn = t.yan2d;
                        icCom.modelXAn = t.xan2d;
                        icCom.field3365 = t.xof2d;
                        icCom.modelZAn = t.zan2d;
                        if (icCom.modelBaseWidth > 0) {
                            icCom.modelZoom = ((icCom.modelZoom * 32) / icCom.modelBaseWidth) | 0;
                        } else if (icCom.width > 0) {
                            icCom.modelZoom = ((icCom.modelZoom * 32) / icCom.width) | 0;
                        }
                        Client.componentUpdated(icCom);
                    } else if (icObj === -1) {
                        icCom.model1Type = 0;
                    } else {
                        const t: ObjType = ObjType.list(icObj);
                        icCom.modelZoom = ((t.zoom2d * 100) / icDiv) | 0;
                        icCom.modelYAn = t.yan2d;
                        icCom.model1Type = 4;
                        icCom.modelXAn = t.xan2d;
                        icCom.model1Id = icObj;
                        Client.componentUpdated(icCom);
                    }
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4207) {
                // 464 npc head on component (207): [u16 LE-shortA npcId][i32 BE hash]
                let nhNpc: number = Client.in.g2_alt3();
                if (nhNpc === 65535) {
                    nhNpc = -1;
                }
                const nhComId: number = Client.in.g4();
                const nhCom: IfType | null = IfType.get(nhComId);
                if (nhCom !== null && (nhCom.model1Type !== 2 || nhCom.model1Id !== nhNpc)) {
                    nhCom.model1Id = nhNpc;
                    nhCom.model1Type = 2;
                    Client.componentUpdated(nhCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4008) {
                // 464 player head on component (8): [i32 LE hash] — local player's own head
                const phComId: number = Client.in.g4_alt1();
                const phCom: IfType | null = IfType.get(phComId);
                if (phCom !== null) {
                    phCom.model1Type = 3;
                    phCom.model1Id = Client.localPlayer!.model!.method1427();
                    Client.componentUpdated(phCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4009) {
                // 464 raw model on component (9): [i32 ME1 hash][u16 BE-shortA modelId]
                const smComId: number = Client.in.g4_int1();
                let smModel: number = Client.in.g2_alt2();
                if (smModel === 65535) {
                    smModel = -1;
                }
                const smCom: IfType | null = IfType.get(smComId);
                if (smCom !== null && (smCom.model1Type !== 1 || smModel !== smCom.model1Id)) {
                    smCom.model1Type = 1;
                    smCom.model1Id = smModel;
                    Client.componentUpdated(smCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4063) {
                // 464 anim on component (63): [i32 ME2 hash][i16 LE seqId] (-1 restarts)
                const caComId: number = Client.in.g4_alt3();
                let caSeq: number = Client.in.g2_alt1(); // u16 LE
                if (caSeq > 32767) {
                    caSeq -= 65536; // sign-extend to i16 (-1 = restart)
                }
                const caCom: IfType | null = IfType.get(caComId);
                if (caCom !== null && (caCom.modelAnim !== caSeq || caSeq === -1)) {
                    caCom.modelAnim = caSeq;
                    caCom.animCycle = 0;
                    caCom.animFrame = 0;
                    Client.componentUpdated(caCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4244) {
                // 464 colour (244): [i32 BE hash][u16 BE-shortA rgb555] -> expand 5:5:5 to 8:8:8
                const clComId: number = Client.in.g4();
                const clColour: number = Client.in.g2_alt2();
                const clR: number = (clColour >> 10) & 0x1f;
                const clG: number = (clColour >> 5) & 0x1f;
                const clB: number = clColour & 0x1f;
                const clRgb: number = (clR << 19) + (clG << 11) + (clB << 3);
                const clCom: IfType | null = IfType.get(clComId);
                if (clCom !== null && clRgb !== clCom.colour) {
                    clCom.colour = clRgb;
                    Client.componentUpdated(clCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4142) {
                // 464 hide/show (142): [byteS hidden(0/1)][i32 ME1 hash]
                const hdHide: boolean = Client.in.g1_alt3() === 1;
                const hdComId: number = Client.in.g4_int1();
                const hdCom: IfType | null = IfType.get(hdComId);
                if (hdCom !== null && hdHide !== hdCom.hide) {
                    hdCom.hide = hdHide;
                    Client.componentUpdated(hdCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4072) {
                // 464 player option (72): [string ("null"=clear)][byteS slot 1-8][byteC top 0/1]
                let poOp: string | null = Client.in.gjstr();
                const poSlot: number = Client.in.g1_alt3();
                const poTop: number = Client.in.g1_alt2();
                if (poSlot >= 1 && poSlot <= 8) {
                    if (poOp.toLowerCase() === 'null') {
                        poOp = null;
                    }
                    Client.playerOp[poSlot - 1] = poOp;
                    Client.playerOpPriority[poSlot - 1] = poTop === 1;
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4099) {
                // 464 camera reset (99, no body): end any cutscene + stop shakes
                Client.cinemaCam = false;
                for (let i = 0; i < Client.camShake.length; i++) {
                    Client.camShake[i] = false;
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4160) {
                // 464 hint icon (160, fixed 6): [u8 type] then type 1=npc/10=player: [u16 index][3 junk]
                // (65535 clears); types 2-6 = tile with edge offsets: [u16 x][u16 z][u8 height]
                const htType: number = Client.in.g1();
                const arrow = new HintArrow();
                arrow.field2137 = 0;
                if (htType === 1 || htType === 10) {
                    arrow.hintType = htType;
                    arrow.hintTarget = Client.in.g2();
                    Client.in.pos += 3;
                    if (arrow.hintTarget === 65535) {
                        arrow.hintType = 0;
                    }
                } else if (htType >= 2 && htType <= 6) {
                    if (htType === 2) {
                        arrow.hintOffsetX = 64;
                        arrow.hintOffsetZ = 64;
                    } else if (htType === 3) {
                        arrow.hintOffsetX = 0;
                        arrow.hintOffsetZ = 64;
                    } else if (htType === 4) {
                        arrow.hintOffsetX = 128;
                        arrow.hintOffsetZ = 64;
                    } else if (htType === 5) {
                        arrow.hintOffsetX = 64;
                        arrow.hintOffsetZ = 0;
                    } else {
                        arrow.hintOffsetX = 64;
                        arrow.hintOffsetZ = 128;
                    }
                    arrow.hintType = 2;
                    arrow.hintTileX = Client.in.g2();
                    arrow.hintTileZ = Client.in.g2();
                    arrow.hintHeight = Client.in.g1();
                } else {
                    // type 0 (clear) or unknown: consume the 5 remaining body bytes
                    Client.in.pos += 5;
                }
                Client.field1171[0] = arrow;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4132) {
                // 464 zone anchor (132): [u8 offsetZ][u8 offsetX] — Z FIRST, raw bytes (no transform).
                Client.zoneUpdateZ = Client.in.g1();
                Client.zoneUpdateX = Client.in.g1();
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4159) {
                // 464 clear zone (159): [byteA zoneBaseX][byteA zoneBaseZ] — wipe ground items in the 8x8 zone.
                const zx: number = Client.in.g1_alt1();
                const zz: number = Client.in.g1_alt1();
                for (let x = zx; x < zx + 8; x++) {
                    for (let z = zz; z < zz + 8; z++) {
                        if (x >= 0 && z >= 0 && x < 104 && z < 104 && Client.groundObj[Client.minusedlevel][x][z] !== null) {
                            Client.groundObj[Client.minusedlevel][x][z] = null;
                            Client.showObject(x, z);
                        }
                    }
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4112) {
                // 464 ground item ADD (112): [u16 BE itemId][u16 LE count][byteS (x<<4)|z]
                const objId: number = Client.in.g2();
                const objCount: number = Client.in.g2_alt1();
                const objOff: number = Client.in.g1_alt3();
                const objX: number = Client.zoneUpdateX + ((objOff >> 4) & 0x7);
                const objZ: number = Client.zoneUpdateZ + (objOff & 0x7);
                if (objX >= 0 && objZ >= 0 && objX < 104 && objZ < 104) {
                    const obj: ClientObj = new ClientObj();
                    obj.id = objId & 0x7fff;
                    obj.count = objCount;
                    if (Client.groundObj[Client.minusedlevel][objX][objZ] === null) {
                        Client.groundObj[Client.minusedlevel][objX][objZ] = new LinkList();
                    }
                    Client.groundObj[Client.minusedlevel][objX][objZ]!.push(new ClientObjNode(obj));
                    Client.showObject(objX, objZ);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4039) {
                // 464 ground item REMOVE (39): [shortA itemId][byteS (x<<4)|z]
                const delId: number = Client.in.g2_alt2();
                const delOff: number = Client.in.g1_alt3();
                const delX: number = Client.zoneUpdateX + ((delOff >> 4) & 0x7);
                const delZ: number = Client.zoneUpdateZ + (delOff & 0x7);
                if (delX >= 0 && delZ >= 0 && delX < 104 && delZ < 104) {
                    const list = Client.groundObj[Client.minusedlevel][delX][delZ];
                    if (list !== null) {
                        for (let n: ClientObjNode | null = list.head(); n !== null; n = list.next()) {
                            if (n.obj.id === (delId & 0x7fff)) {
                                n.unlink();
                                break;
                            }
                        }
                        if (list.head() === null) {
                            Client.groundObj[Client.minusedlevel][delX][delZ] = null;
                        }
                        Client.showObject(delX, delZ);
                    }
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4017) {
                // 464 loc ADD (17): [byteA (x<<4)|z][u16 LE locId][byteA (shape<<2)|rot]
                const addOff: number = Client.in.g1_alt1();
                const addLocId: number = Client.in.g2_alt1();
                const addSr: number = Client.in.g1_alt1();
                const addX: number = Client.zoneUpdateX + ((addOff >> 4) & 0x7);
                const addZ: number = Client.zoneUpdateZ + (addOff & 0x7);
                if (addX >= 0 && addZ >= 0 && addX < 104 && addZ < 104) {
                    Client.locChangeCreate(0, addZ, Client.LOC_SHAPE_TO_LAYER[addSr >> 2], addSr & 0x3, -1, addSr >> 2, Client.minusedlevel, addX, addLocId);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4016) {
                // 464 loc REMOVE (16): [byteA (shape<<2)|rot][byteA (x<<4)|z] — restores the cache-baked loc.
                const remSr: number = Client.in.g1_alt1();
                const remOff: number = Client.in.g1_alt1();
                const remX: number = Client.zoneUpdateX + ((remOff >> 4) & 0x7);
                const remZ: number = Client.zoneUpdateZ + (remOff & 0x7);
                if (remX >= 0 && remZ >= 0 && remX < 104 && remZ < 104) {
                    Client.locChangeCreate(0, remZ, Client.LOC_SHAPE_TO_LAYER[remSr >> 2], remSr & 0x3, -1, remSr >> 2, Client.minusedlevel, remX, -1);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4186) {
                // 464 map spotanim (186): [u8 (x<<4)|z][u16 BE id][u8 height][u16 BE delay]
                const saOff: number = Client.in.g1();
                const saId: number = Client.in.g2();
                const saHeight: number = Client.in.g1();
                const saDelay: number = Client.in.g2();
                const saX: number = Client.zoneUpdateX + ((saOff >> 4) & 0x7);
                const saZ: number = Client.zoneUpdateZ + (saOff & 0x7);
                if (saX >= 0 && saZ >= 0 && saX < 104 && saZ < 104) {
                    const saFx: number = saX * 128 + 64;
                    const saFz: number = saZ * 128 + 64;
                    Client.spotanims.push(new MapSpotAnimNode(new MapSpotAnim(saId, Client.minusedlevel, saFx, saFz, Client.getAvH(saFx, saFz, Client.minusedlevel) - saHeight, saDelay, Client.loopCycle)));
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4218) {
                // 464 projectile (218): off, dx, dz, targetLock, spotanim, startH*4, endH*4,
                // delay, duration, peak, arc, sourceLock — all coords tile-level, rendered at centres.
                const pjOff: number = Client.in.g1();
                const pjDx: number = Client.in.g1b();
                const pjDz: number = Client.in.g1b();
                const pjTarget: number = Client.in.g2b();
                const pjSpot: number = Client.in.g2();
                const pjStartH: number = Client.in.g1() * 4;
                const pjEndH: number = Client.in.g1() * 4;
                const pjDelay: number = Client.in.g2();
                const pjDuration: number = Client.in.g2();
                const pjPeak: number = Client.in.g1();
                const pjArc: number = Client.in.g1();
                Client.in.g2b(); // source lockon — not used by the renderer
                const pjSx: number = Client.zoneUpdateX + ((pjOff >> 4) & 0x7);
                const pjSz: number = Client.zoneUpdateZ + (pjOff & 0x7);
                const pjTx: number = pjSx + pjDx;
                const pjTz: number = pjSz + pjDz;
                if (pjSx >= 0 && pjSz >= 0 && pjSx < 104 && pjSz < 104 && pjTx >= 0 && pjTz >= 0 && pjTx < 104 && pjTz < 104 && pjSpot !== 65535) {
                    const pjFsx: number = pjSx * 128 + 64;
                    const pjFsz: number = pjSz * 128 + 64;
                    const pjFtx: number = pjTx * 128 + 64;
                    const pjFtz: number = pjTz * 128 + 64;
                    const proj: ClientProj = new ClientProj(pjSpot, Client.minusedlevel, pjFsx, pjFsz, Client.getAvH(pjFsx, pjFsz, Client.minusedlevel) - pjStartH, pjDelay + Client.loopCycle, Client.loopCycle + pjDuration, pjPeak, pjArc, pjTarget, pjEndH);
                    proj.setTarget(pjFtx, pjDelay + Client.loopCycle, Client.getAvH(pjFtx, pjFtz, Client.minusedlevel) - pjEndH, pjFtz);
                    Client.projectiles.push(new ClientProjNode(proj));
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4254) {
                // 464 access mask (254): [i32 BE hash][u16 LE endSlot][i32 ME2 mask][shortA startSlot]
                // — without these, if3 components have no live right-click options ("buttons dead").
                const amHash: number = Client.in.g4();
                let amEnd: number = Client.in.g2_alt1();
                if (amEnd === 65535) {
                    amEnd = -1;
                }
                const amMask: number = Client.in.g4_alt3();
                let amStart: number = Client.in.g2_alt2();
                if (amStart === 65535) {
                    amStart = -1;
                }
                for (let slot = amStart; slot <= amEnd; slot++) {
                    const key = (BigInt(amHash) << 32n) + BigInt(slot);
                    const node = Client.serverActive.find(key);
                    if (node !== null) {
                        node.unlink();
                    }
                    Client.serverActive.put(key, new IntNode(amMask));
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4047) {
                // 464 if_settext (47): [i32 ME1 componentHash][string]
                const stComId: number = Client.in.g4_int1();
                const stText: string = Client.in.gjstr();
                const stCom: IfType | null = IfType.get(stComId);
                if (stCom !== null && stText !== stCom.text) {
                    stCom.text = stText;
                    Client.componentUpdated(stCom);
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4137) {
                // 464 if_close (137): [i32 BE (window<<16)|position]. The server pre-arms a close
                // counter and expects an inbound 71 ack (like the patched Java client sends).
                const clHash: number = Client.in.g4();
                const clSub = Client.subinterfaces.find(BigInt(clHash));
                if (clSub !== null) {
                    Client.closeSubInterface(clSub, true);
                }
                if (Client.resumePauseCom !== null) {
                    Client.componentUpdated(Client.resumePauseCom);
                    Client.resumePauseCom = null;
                }
                Client.out.p1Enc(ClientProt.CLOSE_MODAL);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4211) {
                // MOBA fine-plane LOCAL glide (211): [i32 fineX LE][i32 fineZ LE] in ABSOLUTE fine
                // units (tile*128 + subtile; fineX == -1 = end-of-stream sentinel). FineStream owns
                // the render position while streamed; the sync channel keeps owning the logical
                // tile (routeX/Z[0]) via the walk bits the server emits for shadow steps.
                const fineX: number = Client.in.g4_alt1();
                const fineZ: number = Client.in.g4_alt1();
                FineStream.onLocalFinePos(fineX, fineZ);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4210) {
                // MOBA fine-plane NPC glide (210): [u16 BE npc worldIndex][i32 LE fineX][i32 LE fineZ]
                const fnIndex: number = Client.in.g2();
                const fnX: number = Client.in.g4_alt1();
                const fnZ: number = Client.in.g4_alt1();
                FineStream.onFinePos(fnIndex, fnX, fnZ);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4215) {
                // MOBA fine-plane REMOTE player glide (215): [u16 BE player index][i32 LE fineX][i32 LE fineZ]
                const fpIndex: number = Client.in.g2();
                const fpX: number = Client.in.g4_alt1();
                const fpZ: number = Client.in.g4_alt1();
                FineStream.onRemotePlayerFinePos(fpIndex, fpX, fpZ);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4212) {
                // MOBA fine missile spawn (212): [u16 BE id][i32 LE startX][i32 LE startZ]
                // [i32 LE endX][i32 LE endZ][u16 BE durationCycles][u16 BE spotanim][u8 heightOff]
                const msId: number = Client.in.g2();
                const msSX: number = Client.in.g4_alt1();
                const msSZ: number = Client.in.g4_alt1();
                const msEX: number = Client.in.g4_alt1();
                const msEZ: number = Client.in.g4_alt1();
                const msDur: number = Client.in.g2();
                const msSa: number = Client.in.g2();
                const msH: number = Client.in.g1();
                FineStream.onMissileSpawn(msId, msSX, msSZ, msEX, msEZ, msDur, msSa, msH);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4213) {
                // MOBA fine missile impact (213): [u16 BE id][i32 LE hitX][i32 LE hitZ]
                // [u16 BE impactSpotanim][u8 height][u8 keepFlying (1 = pierced, keep in flight)]
                const miId: number = Client.in.g2();
                const miX: number = Client.in.g4_alt1();
                const miZ: number = Client.in.g4_alt1();
                const miSa: number = Client.in.g2();
                const miH: number = Client.in.g1();
                const miKeep: number = Client.in.g1();
                FineStream.onMissileImpact(miId, miX, miZ, miSa, miH, miKeep !== 0);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4216) {
                // MOBA fine-plane debug overlay toggle (216, ::fm 6): payload byte unused
                Client.in.g1();
                FineStream.debugOverlay = !FineStream.debugOverlay;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 4977) {
                // 464 window-pane (77): open the top-level window. Body = LEShortA windowId only
                // (548 = fixed game frame, 549 = welcome). Sets toplevelinterface so gameDraw has a
                // component tree to render — window 548 carries the clientCode-1337 3D viewport.
                const windowId: number = Client.in.g2_alt3();
                console.log('[dbg] window-pane -> toplevelinterface=' + windowId + ' ifType=' + (IfType.get(windowId) !== null ? 'ok' : 'NULL'));
                Client.toplevelinterface = windowId;
                Client.ifAnimReset(windowId);
                Client.computeTopLevelInterfaceLayout();
                ScriptRunner.executeOnLoad(windowId);
                Client.componentDirtyArea.fill(true);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 86) {
                const mode: number = Client.in.g1();
                const interfaceId: number = Client.in.g2_alt3();
                if (mode === 1) {
                    World.resetMap();
                    for (let level = 0; level < 4; level++) {
                        Client.collision[level]!.reset();
                    }
                } else if (mode === 2) {
                    // WorldMap.reset();
                    Client.setMainState(ClientMainState.MAP_BUILD);
                }
                Client.toplevelinterface = interfaceId;
                Client.ifAnimReset(interfaceId);
                Client.computeTopLevelInterfaceLayout();
                ScriptRunner.executeOnLoad(Client.toplevelinterface);
                Client.componentDirtyArea.fill(true);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 249) {
                const colour: number = Client.in.g2_alt3();
                const comId: number = Client.in.g4();

                const r: number = (colour >> 10) & 0x1f;
                const g: number = (colour >> 5) & 0x1f;
                const b: number = colour & 0x1f;
                const rgb: number = (r << 19) + (g << 11) + (b << 3);

                const com = IfType.get(comId)!;
                if (rgb !== com.colour) {
                    com.colour = rgb;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 191) {
                const hide: boolean = Client.in.g1_alt2() === 1;
                const comId: number = Client.in.g4_alt3();

                const com = IfType.get(comId)!;
                if (hide !== com.hide) {
                    com.hide = hide;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 139) {
                const comId: number = Client.in.g4_alt3();
                const countOrZoom: number = Client.in.g4_alt3();
                let objId: number = Client.in.g2_alt2();
                if (objId === 65535) {
                    objId = -1;
                }

                const com = IfType.get(comId)!;

                if (com.v3) {
                    com.invobject = objId;
                    com.invcount = countOrZoom;
                    const type: ObjType = ObjType.list(objId);
                    com.field3498 = type.yof2d;
                    com.modelZoom = type.zoom2d;
                    com.modelYAn = type.yan2d;
                    com.modelXAn = type.xan2d;
                    com.field3365 = type.xof2d;
                    com.modelZAn = type.zan2d;
                    if (com.modelBaseWidth > 0) {
                        com.modelZoom = ((com.modelZoom * 32) / com.modelBaseWidth) | 0;
                    } else if (com.width > 0) {
                        com.modelZoom = ((com.modelZoom * 32) / com.width) | 0;
                    }
                    Client.componentUpdated(com);
                } else if (objId === -1) {
                    Client.ptype = -1;
                    com.model1Type = 0;
                    return true;
                } else {
                    const type: ObjType = ObjType.list(objId);
                    com.modelZoom = ((type.zoom2d * 100) / countOrZoom) | 0;
                    com.modelYAn = type.yan2d;
                    com.model1Type = 4;
                    com.modelXAn = type.xan2d;
                    com.model1Id = objId;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 96) {
                let modelId: number = Client.in.g2_alt1();
                if (modelId === 65535) {
                    modelId = -1;
                }
                const comId: number = Client.in.g4_alt1();

                const com = IfType.get(comId)!;
                if (com.model1Type !== 1 || modelId !== com.model1Id) {
                    com.model1Type = 1;
                    com.model1Id = modelId;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 149) {
                const seqId: number = Client.in.g2_alt3();
                const delay: number = Client.in.g1_alt1();
                const npcId: number = Client.in.g2();
                const npc = Client.npc[npcId];
                if (npc !== null) {
                    Client.triggerNpcAnim(seqId, delay, npc);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 162) {
                const comId: number = Client.in.g4_alt1();
                const seqId: number = Client.in.g2b_alt2();

                const com = IfType.get(comId)!;
                if (com.modelAnim !== seqId || seqId === -1) {
                    com.modelAnim = seqId;
                    com.animCycle = 0;
                    com.animFrame = 0;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 100) {
                const comId = Client.in.g4();
                const com = IfType.get(comId)!;
                com.model1Type = 3;
                com.model1Id = Client.localPlayer!.model!.method1427();
                Client.componentUpdated(com);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 25) {
                // 464 if_open (238) packs the target as (childSlot << 16) | window; LC500's IfType.get()
                // wants (group << 16) | file, so swap the two 16-bit words.
                const packed: number = Client.in.g4();
                const componentId: number = ((packed & 0xffff) << 16) | ((packed >>> 16) & 0xffff);
                const interfaceId: number = Client.in.g2();
                const mode: number = Client.in.g1();
                console.log('[dbg] if_open sub: win=' + (componentId >> 16) + ' slot=' + (componentId & 0xffff) + ' iface=' + interfaceId);
                const existing = Client.subinterfaces.find(BigInt(componentId));
                if (existing !== null) {
                    Client.closeSubInterface(existing, existing.id !== interfaceId);
                }
                Client.openSubInterface(mode, componentId, interfaceId);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 214) {
                const comId: number = Client.in.g4_alt3();
                const text = Client.in.gjstr();

                const com = IfType.get(comId)!;
                if (text !== com.text) {
                    com.text = text;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 26) {
                const comId: number = Client.in.g4_alt2();
                let npcId: number = Client.in.g2_alt3();
                if (npcId === 65535) {
                    npcId = -1;
                }

                const com = IfType.get(comId)!;
                if (com.model1Type !== 2 || com.model1Id !== npcId) {
                    com.model1Id = npcId;
                    com.model1Type = 2;
                    Client.componentUpdated(com);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 244) {
                const comId: number = Client.in.g4_alt2();
                const x: number = Client.in.g2b_alt2();
                const y: number = Client.in.g2b_alt3();

                const com = IfType.get(comId)!;
                com.yAlignment = 0;
                com.renderY = com.y = y;
                com.xAlignment = 0;
                com.renderX = com.x = x;
                Client.componentUpdated(com);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 220) {
                const comId: number = Client.in.g4_alt3();
                let pos: number = Client.in.g2_alt2();

                const com = IfType.get(comId)!;
                if (com !== null && com.type === 0) {
                    if (com.scrollHeight - com.renderHeight < pos) {
                        pos = com.scrollHeight - com.renderHeight;
                    }
                    if (pos < 0) {
                        pos = 0;
                    }
                    if (com.scrollPosY !== pos) {
                        com.scrollPosY = pos;
                        Client.componentUpdated(com);
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 200) {
                const comId = Client.in.g4_alt3();
                const inv = IfType.get(comId)!;
                for (let i: number = 0; i < inv.linkObjType!.length; i++) {
                    inv.linkObjType![i] = 0;
                    inv.linkObjNumber![i] = 0;
                }
                Client.componentUpdated(inv);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 241) {
                const comId: number = Client.in.g2();
                ClientInvCache.delete(comId);
                Client.invTransmit[Client.invTransmitNum++ & 0x1f] = comId & 0x7fff;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 186) {
                const comId: number = Client.in.g4();
                let invId: number = Client.in.g2();
                const inv: IfType | null = comId < 0 ? null : IfType.get(comId);
                if (inv !== null) {
                    for (let i: number = 0; i < inv.linkObjType!.length; i++) {
                        inv.linkObjType![i] = 0;
                        inv.linkObjNumber![i] = 0;
                    }
                }
                if (comId < -70000) {
                    invId += 32768;
                }
                ClientInvCache.clear(invId);
                const size: number = Client.in.g2();
                for (let i: number = 0; i < size; i++) {
                    // 464 inv-full (92) per item: byteC count FIRST (u32 BE ext if 255), then u16LE itemId+1.
                    // (rev-500 read shortA id first + byteS count — scrambled ids: ::runes showed sharks.)
                    let count: number = Client.in.g1_alt2();
                    if (count === 255) {
                        count = Client.in.g4();
                    }
                    const id: number = Client.in.g2_alt1();
                    if (inv !== null && inv.linkObjType!.length > i) {
                        inv.linkObjType![i] = id;
                        inv.linkObjNumber![i] = count;
                    }
                    ClientInvCache.set(invId, count, i, id - 1);
                }
                if (inv !== null) {
                    Client.componentUpdated(inv);
                }
                Client.legacyUpdated();
                Client.invTransmit[Client.invTransmitNum++ & 0x1f] = invId & 0x7fff;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 17) {
                const comId: number = Client.in.g4();
                let invId: number = Client.in.g2();
                if (comId < -70000) {
                    invId += 32768;
                }
                const inv: IfType | null = comId < 0 ? null : IfType.get(comId);

                while (Client.in.pos < Client.psize) {
                    const slot: number = Client.in.gsmart();
                    const id: number = Client.in.g2();
                    let count: number = 0;
                    if (id !== 0) {
                        count = Client.in.g1();
                        if (count === 255) {
                            count = Client.in.g4();
                        }
                    }
                    if (inv !== null && slot >= 0 && slot < inv.linkObjType!.length) {
                        inv.linkObjType![slot] = id;
                        inv.linkObjNumber![slot] = count;
                    }
                    ClientInvCache.set(invId, count, slot, id - 1);
                }
                if (inv !== null) {
                    Client.componentUpdated(inv);
                }
                Client.legacyUpdated();
                Client.invTransmit[Client.invTransmitNum++ & 0x1f] = invId & 0x7fff;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 223) {
                Client.cinemaCam = true;

                Client.camLookAtLx = Client.in.g1();
                Client.camLookAtLz = Client.in.g1();
                Client.camLookAtHei = Client.in.g2();
                Client.camLookAtRate = Client.in.g1();
                Client.camLookAtRate2 = Client.in.g1();

                if (Client.camLookAtRate2 >= 100) {
                    const sceneX: number = Client.camLookAtLx * 128 + 64;
                    const sceneZ: number = Client.camLookAtLz * 128 + 64;
                    const sceneY: number = Client.getAvH(sceneX, sceneZ, Client.minusedlevel) - Client.camLookAtHei;

                    const deltaX: number = sceneX - Client.camX;
                    const deltaY: number = sceneY - Client.camY;
                    const deltaZ: number = sceneZ - Client.camZ;

                    const distance: number = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ) | 0;

                    Client.camPitch = ((Math.atan2(deltaY, distance) * 325.949) | 0) & 0x7ff;
                    Client.camYaw = ((Math.atan2(deltaX, deltaZ) * -325.949) | 0) & 0x7ff;

                    if (Client.camPitch < 128) {
                        Client.camPitch = 128;
                    } else if (Client.camPitch > 383) {
                        Client.camPitch = 383;
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 221) {
                const axis: number = Client.in.g1();
                const shakeAxis: number = Client.in.g1();
                const ran: number = Client.in.g1();
                const amp: number = Client.in.g1();
                const cycle: number = Client.in.g2();

                Client.camShake[axis] = true;
                Client.camShakeAxis[axis] = shakeAxis;
                Client.camShakeRan[axis] = ran;
                Client.camShakeAmp[axis] = amp;
                Client.camShakeCycle[axis] = cycle;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 192) {
                Client.cinemaCam = true;

                Client.camMoveToLx = Client.in.g1();
                Client.camMoveToLz = Client.in.g1();
                Client.camMoveToHei = Client.in.g2();
                Client.camMoveToRate = Client.in.g1();
                Client.camMoveToRate2 = Client.in.g1();

                if (Client.camMoveToRate2 >= 100) {
                    Client.camX = Client.camMoveToLx * 128 + 64;
                    Client.camZ = Client.camMoveToLz * 128 + 64;
                    Client.camY = Client.getAvH(Client.camX, Client.camZ, Client.minusedlevel) - Client.camMoveToHei;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 253) {
                Client.cinemaCam = false;

                for (let i: number = 0; i < 5; i++) {
                    Client.camShake[i] = false;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 19) {
                Client.getNpcPos();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 116) {
                Client.getPlayerPos();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 117) {
                const message: string = Client.in.gjstr();

                if (message.endsWith(':tradereq:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        Client.addChat(Text.tradereq, 4, player);
                    }
                } else if (message.endsWith('chalreq')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        const text = message.substring(message.indexOf(':') + 1, message.length - 9);
                        Client.addChat(text, 8, player);
                    }
                } else if (message.endsWith(':assistreq:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        Client.addChat('', 10, player);
                    }
                } else if (message.endsWith(':clan:')) {
                    const player: string = message.substring(0, message.indexOf(':clan:'));
                    Client.addChat(player, 11, '');
                } else if (message.endsWith(':trade:')) {
                    const player: string = message.substring(0, message.indexOf(':trade:'));
                    if (Client.chatDisabled === 0) {
                        Client.addChat(player, 12, '');
                    }
                } else if (message.endsWith(':assist:')) {
                    const player: string = message.substring(0, message.indexOf(':assist:'));
                    if (Client.chatDisabled === 0) {
                        Client.addChat(player, 13, '');
                    }
                } else if (message.endsWith(':duelstake:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        Client.addChat('', 14, player);
                    }
                } else if (message.endsWith(':duelfriend:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        Client.addChat('', 15, player);
                    }
                } else if (message.endsWith(':clanreq:')) {
                    const player: string = message.substring(0, message.indexOf(':'));
                    const username = JagString.fromLatin1String(player).toUserhash();

                    let ignored: boolean = false;
                    for (let i: number = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === username) {
                            ignored = true;
                            break;
                        }
                    }

                    if (!ignored && Client.chatDisabled === 0) {
                        Client.addChat('', 16, player);
                    }
                } else {
                    Client.addChat(message, 0, '');
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 188) {
                Client.privateMessageCount = (Client.psize / 8) | 0;
                for (let i: number = 0; i < Client.privateMessageCount; i++) {
                    Client.messageIds[i] = Client.in.g8();
                    Client.field2741[i] = JagString.toRawUsername(Client.messageIds[i]);
                }

                Client.friendTransmitNum = Client.transmitNum;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 237) {
                Client.chatPublicMode = Client.in.g1();
                Client.chatPrivateMode = Client.in.g1();
                Client.chatTradeMode = Client.in.g1();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 66) {
                const data = new Uint8Array(Client.psize);
                Client.in.gIsaacArrayBuffer(Client.psize, data);
                GameShell.openUrl(JagString.fromBytes(0, data, Client.psize));
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 235) {
                Client.settings = Client.in.gjstr();
                GameShell.setCookie(Client.settings);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 189) {
                Client.field580 = Client.in.g2();
                if (Client.field580 <= 0) {
                    Client.field580 = 256;
                }
                Client.field921 = Client.in.g2_alt2();
                Client.ptype = -1;
                if (Client.field921 <= 0) {
                    Client.field921 = 205;
                }
                return true;
            }

            if (Client.ptype === 197) {
                Client.field3083 = Client.in.g2_alt3();
                if (Client.field3083 <= 0) {
                    Client.field3083 = 320;
                }
                Client.field4175 = Client.in.g2_alt2();
                Client.ptype = -1;
                if (Client.field4175 <= 0) {
                    Client.field4175 = 256;
                }
                return true;
            }

            if (Client.ptype === 65) {
                Client.field926 = Client.in.g2();
                if (Client.field926 <= 0) {
                    Client.field926 = 32767;
                } else if (Client.field926 < Client.field2527) {
                    Client.field926 = Client.field2527;
                }
                Client.field1578 = Client.in.g2_alt1();
                if (Client.field1578 <= 0) {
                    Client.field1578 = 1;
                }
                Client.field4179 = Client.in.g2_alt1();
                if (Client.field4179 <= 0) {
                    Client.field4179 = 32767;
                } else if (Client.field4179 < Client.field1578) {
                    Client.field4179 = Client.field1578;
                }
                Client.field2527 = Client.in.g2_alt3();
                if (Client.field2527 <= 0) {
                    Client.field2527 = 1;
                }
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 53) {
                const types = Client.in.gjstr();
                const args: (number | string)[] = new Array(types.length + 1);
                for (let i = types.length - 1; i >= 0; i--) {
                    args[i + 1] = types.charCodeAt(i) === 115 ? Client.in.gjstr() : Client.in.g4();
                }
                args[0] = Client.in.g4();
                const req = new HookReq();
                req.onop = args;
                ScriptRunner.executeScript(req, 200000);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 101) {
                Client.moveAction = Client.psize === 0 ? Text.walkhere : Client.in.gjstr();
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 6) {
                const from: bigint = Client.in.g8();
                const messageId: bigint = (BigInt(Client.in.g2()) << 32n) + BigInt(Client.in.g3());
                const staffModLevel: number = Client.in.g1();

                let ignored: boolean = false;
                for (let i: number = 0; i < 100; i++) {
                    if (Client.field3203[i] === messageId) {
                        ignored = true;
                        break;
                    }
                }

                if (staffModLevel <= 1) {
                    if (Client.underage === 1 || Client.mapQuickchat === 1) {
                        ignored = true;
                    } else {
                        for (let i: number = 0; i < Client.privateMessageCount; i++) {
                            if (Client.messageIds[i] === from) {
                                ignored = true;
                                break;
                            }
                        }
                    }
                }

                if (!ignored && Client.chatDisabled === 0) {
                    Client.field3203[Client.field1150] = messageId;
                    Client.field1150 = (Client.field1150 + 1) % 100;

                    const filtered: string = PixFont.escape(JagString.fromLatin1String(WordPack.unpack2(Client.in)).toSentenceCase().toString());

                    if (staffModLevel === 2 || staffModLevel === 3) {
                        Client.addChat(filtered, 7, '<img=1>' + JagString.toRawUsername(from)!.toScreenName().toString());
                    } else if (staffModLevel === 1) {
                        Client.addChat(filtered, 7, '<img=0>' + JagString.toRawUsername(from)!.toScreenName().toString());
                    } else {
                        Client.addChat(filtered, 3, JagString.toRawUsername(from)!.toScreenName().toString());
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 172) {
                const to: bigint = Client.in.g8();
                const filtered: string = PixFont.escape(JagString.fromLatin1String(WordPack.unpack2(Client.in)).toSentenceCase().toString());

                Client.addChat(filtered, 6, JagString.toRawUsername(to)!.toScreenName().toString());

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 187) {
                const to: bigint = Client.in.g8();
                const phraseId: number = Client.in.g2();
                const text: string = QuickChatPhraseType.list(phraseId).getText(Client.in);
                Client.addChat(text, phraseId, JagString.toRawUsername(to)!.toScreenName().toString(), 19, null);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 203) {
                const from: bigint = Client.in.g8();
                const messageIdHigh = BigInt(Client.in.g2());
                const messageIdLow = BigInt(Client.in.g3());
                const staffModLevel: number = Client.in.g1();
                const phraseId: number = Client.in.g2();
                const messageId = messageIdLow + (messageIdHigh << 32n);
                let ignored = false;
                for (let i = 0; i < 100; i++) {
                    if (Client.field3203[i] === messageId) {
                        ignored = true;
                        break;
                    }
                }
                if (!ignored && staffModLevel <= 1) {
                    for (let i = 0; i < Client.privateMessageCount; i++) {
                        if (Client.messageIds[i] === from) {
                            ignored = true;
                            break;
                        }
                    }
                }
                if (!ignored && Client.chatDisabled === 0) {
                    Client.field3203[Client.field1150] = messageId;
                    Client.field1150 = (Client.field1150 + 1) % 100;
                    const text: string = QuickChatPhraseType.list(phraseId).getText(Client.in);
                    const sender = (staffModLevel === 2 ? '<img=1>' : staffModLevel === 1 ? '<img=0>' : '') + JagString.toRawUsername(from)!.toScreenName().toString();
                    Client.addChat(text, phraseId, sender, 18, null);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 74 || Client.ptype === 129) {
                const senderHash: bigint = Client.in.g8();
                Client.in.g1b();
                const chatOwner: bigint = Client.in.g8();
                const messageIdHigh = BigInt(Client.in.g2());
                const messageIdLow = BigInt(Client.in.g3());
                const messageId = messageIdLow + (messageIdHigh << 32n);
                const staffModLevel: number = Client.in.g1();
                let ignored = false;
                for (let i = 0; i < 100; i++) {
                    if (Client.field3203[i] === messageId) {
                        ignored = true;
                        break;
                    }
                }
                if (!ignored && staffModLevel <= 1) {
                    if (Client.ptype === 74 && (Client.underage === 1 || Client.mapQuickchat === 1)) {
                        ignored = true;
                    } else {
                        for (let i = 0; i < Client.privateMessageCount; i++) {
                            if (Client.messageIds[i] === senderHash) {
                                ignored = true;
                                break;
                            }
                        }
                    }
                }
                if (Client.ptype === 129) {
                    const phraseId = Client.in.g2();
                    if (!ignored && Client.chatDisabled === 0) {
                        Client.field3203[Client.field1150] = messageId;
                        Client.field1150 = (Client.field1150 + 1) % 100;
                        const text = QuickChatPhraseType.list(phraseId).getText(Client.in);
                        const sender = (staffModLevel === 2 || staffModLevel === 3 ? '<img=1>' : staffModLevel === 1 ? '<img=0>' : '') + JagString.toRawUsername(senderHash)!.toScreenName().toString();
                        const screenName = JagString.toRawUsername(chatOwner)!.toScreenName().toString();
                        Client.addChat(text, phraseId, sender, 20, screenName);
                    }
                } else {
                    if (!ignored && Client.chatDisabled === 0) {
                        Client.field3203[Client.field1150] = messageId;
                        Client.field1150 = (Client.field1150 + 1) % 100;
                        const text = PixFont.escape(JagString.fromLatin1String(WordPack.unpack2(Client.in)).toSentenceCase().toString());
                        const sender = (staffModLevel === 2 || staffModLevel === 3 ? '<img=1>' : staffModLevel === 1 ? '<img=0>' : '') + JagString.toRawUsername(senderHash)!.toScreenName().toString();
                        const screenName = JagString.toRawUsername(chatOwner)!.toScreenName().toString();
                        Client.friendAddChat(sender, text, screenName);
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 205) {
                let userhash: bigint = Client.in.g8();
                const world: number = Client.in.g2();
                const remove = (userhash & (1n << 63n)) !== 0n;
                const rank: number = Client.in.g1b();
                if (remove) {
                    if (Client.friendChatCount === 0) {
                        Client.ptype = -1;
                        return true;
                    }
                    userhash &= 0x7fffffffffffffffn;
                    for (let i = 0; i < Client.friendChatCount; i++) {
                        const user = Client.friendChatList![i]!;
                        if (user.key === userhash && user.world === world) {
                            for (let j = i; j < Client.friendChatCount - 1; j++) {
                                Client.friendChatList![j] = Client.friendChatList![j + 1];
                            }
                            Client.friendChatCount--;
                            Client.friendChatList![Client.friendChatCount] = null;
                            break;
                        }
                    }
                } else {
                    const worldName = Client.in.gjstr();
                    const rawName = JagString.toRawUsername(userhash)!;
                    let insert = Client.friendChatCount - 1;
                    for (; insert >= 0; insert--) {
                        const user = Client.friendChatList![insert]!;
                        const cmp = user.name!.compare(rawName);
                        if (cmp === 0) {
                            user.world = world;
                            user.rank = rank;
                            user.displayName = worldName;
                            if (userhash === Client.userhash) {
                                Client.chatRank = rank;
                            }
                            Client.clanTransmitNum = Client.transmitNum;
                            Client.ptype = -1;
                            return true;
                        }
                        if (cmp < 0) {
                            break;
                        }
                    }
                    if (Client.friendChatList!.length <= Client.friendChatCount) {
                        Client.ptype = -1;
                        return true;
                    }
                    for (let i = Client.friendChatCount - 1; i > insert; i--) {
                        Client.friendChatList![i + 1] = Client.friendChatList![i];
                    }
                    const user = new ClanChannelUser();
                    user.key = userhash;
                    user.name = rawName;
                    user.displayName = worldName;
                    user.world = world;
                    user.rank = rank;
                    Client.friendChatList![insert + 1] = user;
                    Client.friendChatCount++;
                    if (userhash === Client.userhash) {
                        Client.chatRank = rank;
                    }
                }
                Client.clanTransmitNum = Client.transmitNum;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 229) {
                Client.clanTransmitNum = Client.transmitNum;
                const ownerHash: bigint = Client.in.g8();
                if (ownerHash === 0n) {
                    Client.friendChatCount = 0;
                    Client.chatDisplayName = null;
                    Client.chatOwnerName = null;
                    Client.friendChatList = null;
                    Client.chatRank = 0;
                    Client.ptype = -1;
                    return true;
                }
                const displayHash: bigint = Client.in.g8();
                Client.chatDisplayName = JagString.toRawUsername(displayHash)!.toString();
                Client.chatOwnerName = JagString.toRawUsername(ownerHash)!.toString();
                Client.chatMinKick = Client.in.g1b();
                const count: number = Client.in.g1();
                if (count === 255) {
                    Client.ptype = -1;
                    return true;
                }
                Client.friendChatCount = count;
                const users = new Array<ClanChannelUser | null>(100).fill(null);
                for (let i = 0; i < Client.friendChatCount; i++) {
                    const user = new ClanChannelUser();
                    user.key = Client.in.g8();
                    user.name = JagString.toRawUsername(user.key);
                    user.world = Client.in.g2();
                    user.rank = Client.in.g1b();
                    user.displayName = Client.in.gjstr();
                    if (user.key === Client.userhash) {
                        Client.chatRank = user.rank;
                    }
                    users[i] = user;
                }
                users.sort((a, b) => (a === null ? 1 : b === null ? -1 : a.name!.compare(b.name!)));
                Client.friendChatList = users;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 84) {
                Client.friendServerStatus = Client.in.g1();
                Client.ptype = -1;
                Client.friendTransmitNum = Client.transmitNum;
                return true;
            }

            if (Client.ptype === 16) {
                let username: bigint = Client.in.g8();
                let sameWorld = true;
                const world: number = Client.in.g2();
                const rank: number = Client.in.g1();
                if (username < 0n) {
                    sameWorld = false;
                    username &= 0x7fffffffffffffffn;
                }
                // 464 friend packet (op 100, fixed 11) has NO world-name string — rev-500 read
                // one when world > 0, which would overrun the body.
                const worldName = '';

                let displayName: string | null = JagString.toRawUsername(username)!.toScreenName().toString();
                for (let i: number = 0; i < Client.friendCount; i++) {
                    if (username === Client.field2086[i]) {
                        if (Client.field3092[i] !== world) {
                            Client.field3092[i] = world;
                            if (world > 0) {
                                Client.addChat(displayName + Text.friendlogin, 5, '');
                            }
                            if (world === 0) {
                                Client.addChat(displayName + Text.friendlogout, 5, '');
                            }
                        }

                        displayName = null;
                        Client.field3092[i] = world;
                        Client.field3238[i] = worldName;
                        Client.field845[i] = rank;
                        Client.field1120[i] = sameWorld;
                        break;
                    }
                }

                if (displayName && Client.friendCount < 200) {
                    Client.field2086[Client.friendCount] = username;
                    Client.field370[Client.friendCount] = JagString.toRawUsername(username)!.toScreenName();
                    Client.field3092[Client.friendCount] = world;
                    Client.field3238[Client.friendCount] = worldName;
                    Client.field845[Client.friendCount] = rank;
                    Client.field1120[Client.friendCount] = sameWorld;
                    Client.friendCount++;
                }

                Client.friendTransmitNum = Client.transmitNum;
                let sorted: boolean = false;
                while (!sorted) {
                    sorted = true;

                    for (let i: number = 0; i < Client.friendCount - 1; i++) {
                        if ((Client.field3092[i] !== Client.worldid && Client.field3092[i + 1] === Client.worldid) || (Client.field3092[i] === 0 && Client.field3092[i + 1] !== 0)) {
                            const oldField3092: number = Client.field3092[i];
                            Client.field3092[i] = Client.field3092[i + 1];
                            Client.field3092[i + 1] = oldField3092;

                            const oldField370: JagString | null = Client.field370[i];
                            Client.field370[i] = Client.field370[i + 1];
                            Client.field370[i + 1] = oldField370;

                            const oldField2086: bigint = Client.field2086[i];
                            Client.field2086[i] = Client.field2086[i + 1];
                            Client.field2086[i + 1] = oldField2086;

                            const oldRank: number = Client.field845[i];
                            Client.field845[i] = Client.field845[i + 1];
                            Client.field845[i + 1] = oldRank;

                            const oldSameWorld: boolean = Client.field1120[i];
                            Client.field1120[i] = Client.field1120[i + 1];
                            Client.field1120[i + 1] = oldSameWorld;

                            const oldWorldName: string | null = Client.field3238[i];
                            Client.field3238[i] = Client.field3238[i + 1];
                            Client.field3238[i + 1] = oldWorldName;
                            sorted = false;
                        }
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 108) {
                const slot: number = Client.in.g1();
                if (Client.in.g1() === 0) {
                    Client.field140[slot] = new StockMarketSlot();
                } else {
                    Client.in.pos--;
                    Client.field140[slot] = new StockMarketSlot(Client.in);
                }

                Client.ptype = -1;
                Client.stockTransmitNum = Client.transmitNum;
                return true;
            }

            if (Client.ptype === 22) {
                GameShell.updateUID192(Client.in);
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 77) {
                const target: number = Client.in.g4_alt3();
                let spotanim: number = Client.in.g2_alt3();
                const delay: number = Client.in.g2();
                const height: number = Client.in.g2();
                if (target >> 30 !== 0) {
                    const level = (target >> 28) & 0x3;
                    const x = ((target >> 14) & 0x3fff) - Client.mapBuildBaseX;
                    const z = (target & 0x3fff) - Client.mapBuildBaseZ;
                    if (x >= 0 && z >= 0 && x < 104 && z < 104) {
                        const worldX = x * 128 + 64;
                        const worldZ = z * 128 + 64;
                        Client.spotanims.push(new MapSpotAnimNode(new MapSpotAnim(spotanim, level, worldX, worldZ, Client.getAvH(worldX, worldZ, level) - height, delay, Client.loopCycle)));
                    }
                } else if (target >> 29 !== 0) {
                    const npc = Client.npc[target & 0xffff];
                    if (npc !== null) {
                        npc.spotanimId = spotanim;
                        if (npc.spotanimId === 65535) {
                            npc.spotanimId = -1;
                        }
                        npc.spotanimFrame = 0;
                        npc.spotanimLastCycle = Client.loopCycle + delay;
                        npc.spotanimHeight = height;
                        if (Client.loopCycle < npc.spotanimLastCycle) {
                            npc.spotanimFrame = -1;
                        }
                        npc.spotanimCycle = 0;
                    }
                } else if (target >> 28 !== 0) {
                    const index = target & 0xffff;
                    const player = index === Client.selfSlot ? Client.localPlayer : Client.players[index];
                    if (player !== null) {
                        player.spotanimCycle = 0;
                        player.spotanimHeight = height;
                        player.spotanimFrame = 0;
                        player.spotanimId = spotanim;
                        if (player.spotanimId === 65535) {
                            player.spotanimId = -1;
                        }
                        player.spotanimLastCycle = Client.loopCycle + delay;
                        if (Client.loopCycle < player.spotanimLastCycle) {
                            player.spotanimFrame = -1;
                        }
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 242) {
                const componentId: number = Client.in.g4();
                const sub = Client.subinterfaces.find(BigInt(componentId));
                if (sub !== null) {
                    Client.closeSubInterface(sub, true);
                }
                if (Client.resumePauseCom !== null) {
                    Client.componentUpdated(Client.resumePauseCom);
                    Client.resumePauseCom = null;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 166) {
                if (Client.toplevelinterface !== -1) {
                    Client.runHookImmediate(Client.toplevelinterface, 0);
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 255) {
                Client.minimapFlagX = 0;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 54) {
                Client.legacyUpdated();
                Client.runweight = Client.in.g2b();
                Client.miscTransmitNum = Client.transmitNum;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 213) {
                const info: number = Client.in.g1();
                const slot: number = info >> 6;
                const arrow = new HintArrow();
                arrow.hintType = info & 0x3f;
                arrow.field2137 = Client.in.g1();
                if (arrow.field2137 >= 0 && arrow.field2137 < Client.headiconsHint!.length) {
                    if (arrow.hintType === 1 || arrow.hintType === 10) {
                        arrow.hintTarget = Client.in.g2();
                        Client.in.pos += 3;
                    } else if (arrow.hintType >= 2 && arrow.hintType <= 6) {
                        if (arrow.hintType === 2) {
                            arrow.hintOffsetX = 64;
                            arrow.hintOffsetZ = 64;
                        } else if (arrow.hintType === 3) {
                            arrow.hintOffsetX = 0;
                            arrow.hintOffsetZ = 64;
                        } else if (arrow.hintType === 4) {
                            arrow.hintOffsetX = 128;
                            arrow.hintOffsetZ = 64;
                        } else if (arrow.hintType === 5) {
                            arrow.hintOffsetX = 64;
                            arrow.hintOffsetZ = 0;
                        } else if (arrow.hintType === 6) {
                            arrow.hintOffsetX = 64;
                            arrow.hintOffsetZ = 128;
                        }

                        arrow.hintType = 2;
                        arrow.hintTileX = Client.in.g2();
                        arrow.hintTileZ = Client.in.g2();
                        arrow.hintHeight = Client.in.g1();
                    }
                    arrow.field2136 = Client.in.g2();
                    if (arrow.field2136 === 65535) {
                        arrow.field2136 = -1;
                    }
                    Client.field1171[slot] = arrow;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 146) {
                const active: number = Client.in.g4_alt1();
                const componentId: number = Client.in.g4_alt2();
                let start: number = Client.in.g2();
                if (start === 65535) {
                    start = -1;
                }
                let end: number = Client.in.g2_alt3();
                if (end === 65535) {
                    end = -1;
                }
                for (let subId = start; subId <= end; subId++) {
                    const key = (BigInt(componentId) << 32n) + BigInt(subId);
                    const node = Client.serverActive.find(key);
                    if (node !== null) {
                        node.unlink();
                    }
                    Client.serverActive.put(key, new IntNode(active));
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 184) {
                Client.rebootTimer = Client.in.g2_alt1() * 30;

                Client.ptype = -1;
                Client.miscTransmitNum = Client.transmitNum;
                return true;
            }

            if (Client.ptype === 204) {
                Client.legacyUpdated();
                // 464 body (op 190): [u8 byteS skillId][i32 LE xp][u8 level] — rev-500 read
                // [byteC stat][byteA level][ME2 xp], which decoded stat as 128+ (silently dropped
                // by the Int32Array(25)) => every skill displayed 0/0.
                const stat: number = Client.in.g1_alt3();
                const xp: number = Client.in.g4_alt1();
                const level: number = Client.in.g1();

                Client.statXP[stat] = xp;
                Client.statEffectiveLevel[stat] = level;
                Client.statBaseLevel[stat] = 1;
                XpDropOverlay.onUpdateSkill(stat, xp);

                for (let i: number = 0; i < 98; i++) {
                    if (xp >= Skills.skillxp[i]) {
                        Client.statBaseLevel[stat] = i + 2;
                    }
                }
                Client.statTransmit[Client.statTransmitNum++ & 0x1f] = stat;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 68) {
                Client.legacyUpdated();
                Client.runenergy = Client.in.g1();

                Client.ptype = -1;
                Client.miscTransmitNum = Client.transmitNum;
                return true;
            }

            if (Client.ptype === 248) {
                for (let i: number = 0; i < Client.players.length; i++) {
                    const player: ClientPlayer | null = Client.players[i];
                    if (!player) {
                        continue;
                    }

                    player.primarySeqId = -1;
                }

                for (let i: number = 0; i < Client.npc.length; i++) {
                    const npc: ClientNpc | null = Client.npc[i];
                    if (!npc) {
                        continue;
                    }

                    npc.primarySeqId = -1;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 177) {
                const address = Client.in.g4_alt2();

                // todo: resolve DNS over HTTP
                Client.lastAddress = new PrivilegedRequest();
                Client.lastAddress.intArg = address;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 240) {
                Client.logout();

                Client.ptype = -1;
                return false;
            }

            if (Client.ptype === 233) {
                let op: string | null = Client.in.gjstr();
                const index: number = Client.in.g1();
                const priority: number = Client.in.g1();

                if (index >= 1 && index <= 8) {
                    if (op.toLowerCase() === 'null') {
                        op = null;
                    }

                    Client.playerOp[index - 1] = op;
                    Client.playerOpPriority[index - 1] = priority === 0;
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 147) {
                Client.minimapState = Client.in.g1();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 243) {
                Client.orbitCameraPitch = Client.in.g2_alt1();
                Client.orbitCameraYaw = Client.in.g2_alt2();
                Client.clampCameraAngle();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 114) {
                const info: number = Client.in.g1();
                const localZ: number = Client.in.g1_alt3();
                const localX: number = Client.in.g1_alt2();

                Client.minusedlevel = info >> 1;
                Client.localPlayer!.teleport((info & 0x1) === 1, localX, localZ);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 79) {
                Client.rebuildPacket(false);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 12) {
                const end = Client.psize + Client.in.pos;
                const top = Client.in.g2();
                let count = Client.in.g2();
                if (top !== Client.toplevelinterface) {
                    Client.toplevelinterface = top;
                    Client.ifAnimReset(Client.toplevelinterface);
                    Client.computeTopLevelInterfaceLayout();
                    ScriptRunner.executeOnLoad(Client.toplevelinterface);
                    Client.componentDirtyArea.fill(true);
                }
                while (count-- > 0) {
                    const componentId = Client.in.g4();
                    const interfaceId = Client.in.g2();
                    const mode = Client.in.g1();
                    let sub = Client.subinterfaces.find(BigInt(componentId));
                    if (sub !== null && sub.id !== interfaceId) {
                        Client.closeSubInterface(sub, true);
                        sub = null;
                    }
                    if (sub === null) {
                        sub = Client.openSubInterface(mode, componentId, interfaceId);
                    }
                    sub.field3235 = true;
                }
                for (let sub = Client.subinterfaces.search() as SubInterface | null; sub !== null; sub = Client.subinterfaces.findnext() as SubInterface | null) {
                    if (sub.field3235) {
                        sub.field3235 = false;
                    } else {
                        Client.closeSubInterface(sub, true);
                    }
                }
                Client.serverActive = new HashTable(512);
                while (Client.in.pos < end) {
                    const componentId = Client.in.g4();
                    const start = Client.in.g2();
                    const last = Client.in.g2();
                    const active = Client.in.g4();
                    for (let subId = start; subId <= last; subId++) {
                        Client.serverActive.put((BigInt(componentId) << 32n) + BigInt(subId), new IntNode(active));
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 21) {
                Client.rebuildPacket(true);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 11) {
                // 464 small varp (op 245): [u16 BE shortA varpId][i8 value] — rev-500 read value
                // FIRST (negated) + LE shortA id, so real varps never updated and garbage landed in
                // random slots (the random-prayer-glows / uniform-spell-tint bug).
                const varpId: number = Client.in.g2_alt2();
                const value: number = Client.in.g1b();

                VarCache.varServ[varpId] = value;
                if (VarCache.var[varpId] !== value) {
                    VarCache.var[varpId] = value;
                    Client.clientVar(varpId);
                }
                Client.varTransmit[Client.varTransmitNum++ & 0x1f] = varpId;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 72) {
                const varpId: number = Client.in.g2_alt2();
                const value: number = Client.in.g4_alt1();

                VarCache.varServ[varpId] = value;
                if (VarCache.var[varpId] !== value) {
                    VarCache.var[varpId] = value;
                    Client.clientVar(varpId);
                }
                Client.varTransmit[Client.varTransmitNum++ & 0x1f] = varpId;

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 24) {
                for (let i: number = 0; i < VarCache.var.length; i++) {
                    if (VarCache.var[i] !== VarCache.varServ[i]) {
                        VarCache.var[i] = VarCache.varServ[i];
                        Client.clientVar(i);
                        Client.varTransmit[Client.varTransmitNum++ & 0x1f] = i;
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 70) {
                for (let i: number = 0; i < VarpType.numDefinitions; i++) {
                    const varp: VarpType | undefined = VarpType.list(i);
                    if (varp && varp.clientcode === 0) {
                        VarCache.varServ[i] = 0;
                        VarCache.var[i] = 0;
                    }
                }

                Client.legacyUpdated();
                Client.varTransmitNum += 32;
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 113) {
                let soundId: number = Client.in.g2();
                const loops: number = Client.in.g1();
                const delay: number = Client.in.g2();
                if (soundId === 65535) {
                    soundId = -1;
                }
                Client.playSynth(loops, delay, soundId);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 10) {
                let songId: number = Client.in.g2_alt1();
                if (songId == 65535) {
                    songId = -1;
                }

                Client.playSongs(songId);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 89) {
                let jingleId: number = Client.in.g2_alt3();
                if (jingleId === 65535) {
                    jingleId = -1;
                }
                const delay: number = Client.in.method340();
                Client.playJingle(jingleId, delay);

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 110) {
                // reflection check (java)
                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 163) {
                Client.zoneUpdateX = Client.in.g1();
                Client.zoneUpdateZ = Client.in.g1_alt1();

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 88) {
                Client.zoneUpdateX = Client.in.g1_alt1();
                Client.zoneUpdateZ = Client.in.g1_alt2();

                for (let x: number = Client.zoneUpdateX; x < Client.zoneUpdateX + 8; x++) {
                    for (let z: number = Client.zoneUpdateZ; z < Client.zoneUpdateZ + 8; z++) {
                        if (Client.groundObj[Client.minusedlevel][x][z]) {
                            Client.groundObj[Client.minusedlevel][x][z] = null;
                            Client.showObject(x, z);
                        }
                    }
                }

                for (let loc = Client.locChanges.head(); loc !== null; loc = Client.locChanges.next()) {
                    if (loc.x >= Client.zoneUpdateX && loc.x < Client.zoneUpdateX + 8 && loc.z >= Client.zoneUpdateZ && loc.z < Client.zoneUpdateZ + 8 && loc.level === Client.minusedlevel) {
                        loc.endTime = 0;
                    }
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 134) {
                Client.zoneUpdateZ = Client.in.g1_alt1();
                Client.zoneUpdateX = Client.in.g1();

                while (Client.in.pos < Client.psize) {
                    Client.ptype = Client.in.g1();
                    Client.zonePacket();
                }

                Client.ptype = -1;
                return true;
            }

            if (Client.ptype === 230) {
                const info: number = Client.in.g1_alt2();
                const shape: number = info >> 2;
                const rotate: number = info & 0x3;
                const layer: number = Client.LOC_SHAPE_TO_LAYER[shape];
                let seq: number = Client.in.g2();
                if (seq === 65535) {
                    seq = -1;
                }
                const packed: number = Client.in.g4_alt2();
                const level: number = (packed >> 28) & 0x3;
                const x: number = ((packed >> 14) & 0x3fff) - Client.mapBuildBaseX;
                const z: number = (packed & 0x3fff) - Client.mapBuildBaseZ;
                Client.animateLocation(shape, x, layer, rotate, level, z, seq);

                Client.ptype = -1;
                return true;
            }

            if (
                Client.ptype === 232 ||
                Client.ptype === 61 ||
                Client.ptype === 135 ||
                Client.ptype === 173 ||
                Client.ptype === 123 ||
                Client.ptype === 150 ||
                Client.ptype === 198 ||
                Client.ptype === 99 ||
                Client.ptype === 171 ||
                Client.ptype === 75 ||
                Client.ptype === 44 ||
                Client.ptype === 52
            ) {
                Client.zonePacket();

                Client.ptype = -1;
                return true;
            }

            // Unmapped/unhandled 464 opcode: its body was already fully read (readBytes above), so
            // just skip it and stay in sync instead of logging out. (Was: T1 logout, which dropped
            // the connection on the first 464 packet with no rev-500 handler.)
            Client.ptype = -1;
            return true;
        } catch (e) {
            if (e instanceof WebSocket && e.readyState === 3) {
                // IO error
                Client.lostCon();
                return false;
            }
            // Body-parse error in a 464 handler whose payload isn't reordered yet: the packet body
            // was already fully consumed from the stream (readBytes above), so the stream stays in
            // sync. Skip this packet and keep the connection alive instead of crashing while the
            // S5/S6 body reorders land. (Dev build keeps console; prod strips it.)
            if (!Client.dbgSeenTcp.has(Client.ptype)) {
                Client.dbgSeenTcp.add(Client.ptype);
                console.warn('[tcpIn] parse error on packet', Client.ptype, '(skipped, dedup):', e);
            }
            Client.ptype = -1;
            return true;
        }

        return true;
    }

    // jag::oldscape::Client::ZonePacket
    static zonePacket(): void {
        if (Client.ptype === 123) {
            const var0: number = Client.in.g1();
            const var1: number = Client.zoneUpdateZ * 2 + (var0 & 0xf);
            const var2: number = ((var0 >> 4) & 0xf) + Client.zoneUpdateX * 2;
            const var3: number = Client.in.g1b() + var2;
            const var4: number = var1 + Client.in.g1b();
            const var5: number = Client.in.g2b();
            const var6: number = Client.in.g2();
            const var7: number = Client.in.g1() * 4;
            const var8: number = Client.in.g1() * 4;
            const var9: number = Client.in.g2();
            const var10: number = Client.in.g2();
            const var11: number = Client.in.g1();
            const var12: number = Client.in.g1();
            if (var2 >= 0 && var1 >= 0 && var2 < 208 && var1 < 208 && var3 >= 0 && var4 >= 0 && var3 < 208 && var4 < 208 && var6 !== 65535) {
                const var13: number = var1 * 64;
                const var14: number = var2 * 64;
                const var15: number = var4 * 64;
                const var16: ClientProj = new ClientProj(var6, Client.minusedlevel, var14, var13, Client.getAvH(var14, var13, Client.minusedlevel) - var7, var9 - -Client.loopCycle, Client.loopCycle + var10, var11, var12, var5, var8);
                const var17: number = var3 * 64;
                var16.setTarget(var17, var9 + Client.loopCycle, Client.getAvH(var17, var15, Client.minusedlevel) + -var8, var15);
                Client.projectiles.push(new ClientProjNode(var16));
            }
        } else if (Client.ptype === 135) {
            const var18: number = Client.in.g1_alt1();
            const var19: number = (var18 & 0x7) + Client.zoneUpdateZ;
            const var20: number = Client.zoneUpdateX + ((var18 >> 4) & 0x7);
            const var21: number = Client.in.g2_alt3();
            const var22: number = Client.in.g2_alt2();
            const var23: number = Client.in.g2_alt2();
            if (var20 >= 0 && var19 >= 0 && var20 < 104 && var19 < 104 && var22 !== Client.selfSlot) {
                const var24: ClientObj = new ClientObj();
                var24.count = var23;
                var24.id = var21;
                if (Client.groundObj[Client.minusedlevel][var20][var19] === null) {
                    Client.groundObj[Client.minusedlevel][var20][var19] = new LinkList();
                }
                Client.groundObj[Client.minusedlevel][var20][var19]!.push(new ClientObjNode(var24));
                Client.showObject(var20, var19);
            }
        } else if (Client.ptype === 173) {
            const var25: number = Client.in.g1();
            const var26: number = Client.zoneUpdateZ + (var25 & 0x7);
            const var27: number = ((var25 >> 4) & 0x7) + Client.zoneUpdateX;
            const var28: number = Client.in.g2();
            const var29: number = Client.in.g1();
            const var30: number = Client.in.g2();
            if (var27 >= 0 && var26 >= 0 && var27 < 104 && var26 < 104) {
                const var31: number = var27 * 128 + 64;
                const var32: number = var26 * 128 + 64;
                const var33: MapSpotAnim = new MapSpotAnim(var28, Client.minusedlevel, var31, var32, Client.getAvH(var31, var32, Client.minusedlevel) - var29, var30, Client.loopCycle);
                Client.spotanims.push(new MapSpotAnimNode(var33));
            }
        } else if (Client.ptype === 232) {
            const var34: number = Client.in.g1();
            const var35: number = (var34 & 0x7) + Client.zoneUpdateZ;
            const var36: number = ((var34 >> 4) & 0x7) + Client.zoneUpdateX;
            const var37: number = Client.in.g2();
            const var38: number = Client.in.g2();
            const var39: number = Client.in.g2();
            if (var36 >= 0 && var35 >= 0 && var36 < 104 && var35 < 104) {
                const var40: LinkList<ClientObjNode> | null = Client.groundObj[Client.minusedlevel][var36][var35];
                if (var40 !== null) {
                    for (let var41: ClientObjNode | null = var40.head(); var41 !== null; var41 = var40.next()) {
                        const var42: ClientObj = var41.obj;
                        if ((var37 & 0x7fff) === var42.id && var42.count === var38) {
                            var42.count = var39;
                            break;
                        }
                    }
                    Client.showObject(var36, var35);
                }
            }
        } else if (Client.ptype === 44) {
            const var43: number = Client.in.g1();
            const var44: number = var43 >> 2;
            const var45: number = var43 & 0x3;
            const var46: number = Client.LOC_SHAPE_TO_LAYER[var44];
            const var47: number = Client.in.g2_alt3();
            const var48: number = Client.in.g1_alt1();
            const var49: number = Client.zoneUpdateX + ((var48 >> 4) & 0x7);
            const var50: number = Client.zoneUpdateZ + (var48 & 0x7);
            if (var49 >= 0 && var50 >= 0 && var49 < 104 && var50 < 104) {
                Client.locChangeCreate(0, var50, var46, var45, -1, var44, Client.minusedlevel, var49, var47);
            }
        } else if (Client.ptype === 171) {
            const var51: number = Client.in.g1_alt1();
            const var52: number = var51 & 0x3;
            const var53: number = var51 >> 2;
            const var54: number = Client.LOC_SHAPE_TO_LAYER[var53];
            let var55: number = Client.in.g2_alt1();
            if (var55 === 65535) {
                var55 = -1;
            }
            const var56: number = Client.in.g1_alt3();
            const var57: number = ((var56 >> 4) & 0x7) + Client.zoneUpdateX;
            const var58: number = Client.zoneUpdateZ + (var56 & 0x7);
            Client.animateLocation(var53, var57, var54, var52, Client.minusedlevel, var58, var55);
        } else {
            if (Client.ptype === 61) {
                const var59: number = Client.in.g2();
                const var60: number = Client.in.g1_alt2();
                const var61: number = var60 >> 2;
                const var62: number = var60 & 0x3;
                const var63: number = Client.LOC_SHAPE_TO_LAYER[var61];
                const var64: number = Client.in.g2();
                let var65: number = Client.in.g1b_alt1();
                let var66: number = Client.in.g1b_alt2();
                let var67: number = Client.in.g1b();
                let var68: number = Client.in.g1b_alt2();
                const var69: number = Client.in.g2();
                const var70: number = Client.in.g1();
                const var71: number = Client.zoneUpdateZ + (var70 & 0x7);
                const var72: number = ((var70 >> 4) & 0x7) + Client.zoneUpdateX;
                const var73: number = Client.in.g2_alt2();
                let var74: ClientPlayer | null;
                if (Client.selfSlot === var59) {
                    var74 = Client.localPlayer;
                } else {
                    var74 = Client.players[var59];
                }
                if (var74 !== null) {
                    const var75: LocType = LocType.list(var64);
                    let var76: number;
                    let var77: number;
                    if (var62 === 1 || var62 === 3) {
                        var76 = var75.width;
                        var77 = var75.length;
                    } else {
                        var77 = var75.width;
                        var76 = var75.length;
                    }
                    const var78: number = (var77 >> 1) + var72;
                    const var79: number = var72 + ((var77 + 1) >> 1);
                    const var80: number = (var76 >> 1) + var71;
                    const var81: number = ((var76 + 1) >> 1) + var71;
                    const var82: Int32Array[] = ClientBuild.groundh![Client.minusedlevel];
                    const var83: number = (var77 << 6) + (var72 << 7);
                    const var84: number = (var82[var79][var81] + var82[var79][var80] + var82[var78][var80] + var82[var78][var81]) >> 2;
                    const var85: number = (var76 << 6) + (var71 << 7);
                    let var86: Int32Array[] | null = null;
                    if (Client.minusedlevel < 3) {
                        var86 = ClientBuild.groundh![Client.minusedlevel + 1];
                    }
                    const var87 = var75.getModel(var61, var86, var82, var83, false, var85, var62, var84);
                    if (var87 !== null) {
                        Client.locChangeCreate(var69 + 1, var71, var63, 0, var73 + 1, 0, Client.minusedlevel, var72, -1);
                        var74.locOffsetY = var84;
                        var74.locStartCycle = Client.loopCycle + var69;
                        var74.locOffsetZ = var76 * 64 + var71 * 128;
                        var74.locModel = var87.model as ModelLit;
                        var74.locOffsetX = var72 * 128 + var77 * 64;
                        if (var66 > var67) {
                            const var88: number = var66;
                            var66 = var67;
                            var67 = var88;
                        }
                        var74.minTileX = var66 + var72;
                        var74.maxTileX = var67 + var72;
                        if (var65 < var68) {
                            const var89: number = var68;
                            var68 = var65;
                            var65 = var89;
                        }
                        var74.minTileZ = var71 + var68;
                        var74.maxTileZ = var71 + var65;
                        var74.locEndCycle = Client.loopCycle + var73;
                    }
                }
            }
            if (Client.ptype === 99) {
                const var90: number = Client.in.g1();
                const var91: number = (var90 & 0x7) + Client.zoneUpdateZ;
                const var92: number = ((var90 >> 4) & 0x7) + Client.zoneUpdateX;
                const var93: number = Client.in.g2_alt2();
                const var94: number = Client.in.g2_alt3();
                if (var92 >= 0 && var91 >= 0 && var92 < 104 && var91 < 104) {
                    const var95: ClientObj = new ClientObj();
                    var95.count = var94;
                    var95.id = var93;
                    if (Client.groundObj[Client.minusedlevel][var92][var91] === null) {
                        Client.groundObj[Client.minusedlevel][var92][var91] = new LinkList();
                    }
                    Client.groundObj[Client.minusedlevel][var92][var91]!.push(new ClientObjNode(var95));
                    Client.showObject(var92, var91);
                }
            } else if (Client.ptype === 150) {
                const var96: number = Client.in.g1();
                const var97: number = Client.zoneUpdateX + ((var96 >> 4) & 0x7);
                const var98: number = (var96 & 0x7) + Client.zoneUpdateZ;
                const var99: number = var97 + Client.in.g1b();
                const var100: number = Client.in.g1b() + var98;
                const var101: number = Client.in.g2b();
                const var102: number = Client.in.g2();
                const var103: number = Client.in.g1() * 4;
                const var104: number = Client.in.g1() * 4;
                const var105: number = Client.in.g2();
                const var106: number = Client.in.g2();
                const var107: number = Client.in.g1();
                const var108: number = Client.in.g1();
                if (var97 >= 0 && var98 >= 0 && var97 < 104 && var98 < 104 && var99 >= 0 && var100 >= 0 && var99 < 104 && var100 < 104 && var102 !== 65535) {
                    const var109: number = var97 * 128 + 64;
                    const var110: number = var100 * 128 + 64;
                    const var111: number = var99 * 128 + 64;
                    const var112: number = var98 * 128 + 64;
                    const var113: ClientProj = new ClientProj(
                        var102,
                        Client.minusedlevel,
                        var109,
                        var112,
                        Client.getAvH(var109, var112, Client.minusedlevel) - var103,
                        Client.loopCycle + var105,
                        var106 + Client.loopCycle,
                        var107,
                        var108,
                        var101,
                        var104
                    );
                    var113.setTarget(var111, var105 + Client.loopCycle, Client.getAvH(var111, var110, Client.minusedlevel) + -var104, var110);
                    Client.projectiles.push(new ClientProjNode(var113));
                }
            } else if (Client.ptype === 198) {
                const var114: number = Client.in.g1_alt1();
                const var115: number = Client.zoneUpdateX + ((var114 >> 4) & 0x7);
                const var116: number = (var114 & 0x7) + Client.zoneUpdateZ;
                const var117: number = Client.in.g2_alt3();
                if (var115 >= 0 && var116 >= 0 && var115 < 104 && var116 < 104) {
                    const var118: LinkList<ClientObjNode> | null = Client.groundObj[Client.minusedlevel][var115][var116];
                    if (var118 !== null) {
                        for (let var119: ClientObjNode | null = var118.head(); var119 !== null; var119 = var118.next()) {
                            if ((var117 & 0x7fff) === var119.obj.id) {
                                var119.unlink();
                                break;
                            }
                        }
                        if (var118.head() === null) {
                            Client.groundObj[Client.minusedlevel][var115][var116] = null;
                        }
                        Client.showObject(var115, var116);
                    }
                }
            } else if (Client.ptype === 75) {
                const var120: number = Client.in.g1();
                const var121: number = var120 >> 2;
                const var122: number = Client.LOC_SHAPE_TO_LAYER[var121];
                const var123: number = var120 & 0x3;
                const var124: number = Client.in.g1_alt2();
                const var125: number = Client.zoneUpdateZ + (var124 & 0x7);
                const var126: number = Client.zoneUpdateX + ((var124 >> 4) & 0x7);
                if (var126 >= 0 && var125 >= 0 && var126 < 104 && var125 < 104) {
                    Client.locChangeCreate(0, var125, var122, var123, -1, var121, Client.minusedlevel, var126, -1);
                }
            } else if (Client.ptype === 52) {
                const var127: number = Client.in.g1();
                const var128: number = Client.zoneUpdateZ + (var127 & 0x7);
                const var129: number = Client.zoneUpdateX + ((var127 >> 4) & 0x7);
                let var130: number = Client.in.g2();
                const var131: number = Client.in.g1();
                if (var130 === 65535) {
                    var130 = -1;
                }
                const var132: number = var131 & 0x7;
                const var133: number = Client.in.g1();
                const var134: number = (var131 >> 4) & 0xf;
                if (var129 >= 0 && var128 >= 0 && var129 < 104 && var128 < 104) {
                    const var135: number = var134 + 1;
                    if (
                        Client.localPlayer!.routeX[0] >= var129 - var135 &&
                        var129 + var135 >= Client.localPlayer!.routeX[0] &&
                        var128 - var135 <= Client.localPlayer!.routeZ[0] &&
                        Client.localPlayer!.routeZ[0] <= var128 + var135 &&
                        Client.ambientVolume !== 0 &&
                        var132 > 0 &&
                        Client.waveCount < 50 &&
                        var130 !== -1
                    ) {
                        Client.waveSoundIds[Client.waveCount] = var130;
                        Client.waveLoops[Client.waveCount] = var132;
                        Client.waveDelay[Client.waveCount] = var133;
                        Client.waveSounds[Client.waveCount] = null;
                        Client.waveAmbient[Client.waveCount] = (var129 << 16) + (var128 << 8) + var134;
                        Client.waveCount++;
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::LocChangeCreate
    static locChangeCreate(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number): void {
        let var9: LocChange | null = null;
        for (let var10 = Client.locChanges.head(); var10 !== null; var10 = Client.locChanges.next()) {
            if (arg6 === var10.level && arg7 === var10.x && var10.z === arg1 && var10.layer === arg2) {
                var9 = var10;
                break;
            }
        }

        if (var9 === null) {
            var9 = new LocChange();
            var9.z = arg1;
            var9.layer = arg2;
            var9.x = arg7;
            var9.level = arg6;
            Client.locChangeSetOld(var9);
            Client.locChanges.push(var9);
        }

        var9.newShape = arg5;
        var9.newAngle = arg3;
        var9.endTime = arg4;
        var9.newType = arg8;
        var9.startTime = arg0;
    }

    // jag::oldscape::Client::LocChangePostBuildCorrect
    static locChangePostBuildCorrect(): void {
        for (let var0 = Client.locChanges.head(); var0 !== null; var0 = Client.locChanges.next()) {
            if (var0.endTime === -1) {
                var0.startTime = 0;
                Client.locChangeSetOld(var0);
            } else {
                var0.unlink();
            }
        }
    }

    // jag::oldscape::Client::LocChangeSetOld
    static locChangeSetOld(arg0: LocChange): void {
        let var1: SceneTag = 0n;
        if (arg0.layer === 0) {
            var1 = World.wallType(arg0.level, arg0.x, arg0.z);
        }
        let var3: number = 0;
        let var4: number = 0;
        let var5: number = -1;
        if (arg0.layer === 1) {
            var1 = World.decorType(arg0.level, arg0.x, arg0.z);
        }
        if (arg0.layer === 2) {
            var1 = World.sceneType(arg0.level, arg0.x, arg0.z);
        }
        if (arg0.layer === 3) {
            var1 = World.gdType(arg0.level, arg0.x, arg0.z);
        }
        if (BigInt(var1) !== 0n) {
            var4 = (Number(BigInt.asIntN(32, BigInt(var1))) >> 20) & 0x3;
            var5 = Number((BigInt(var1) >> 32n) & 0x7fffffffn);
            var3 = (Number(BigInt.asIntN(32, BigInt(var1))) >> 14) & 0x1f;
        }
        arg0.oldAngle = var4;
        arg0.oldType = var5;
        arg0.oldShape = var3;
    }

    // jag::oldscape::Client::LocChangeDoQueue
    static locChangeDoQueue(): void {
        for (let var0 = Client.locChanges.head(); var0 !== null; var0 = Client.locChanges.next()) {
            if (var0.endTime > 0) {
                var0.endTime--;
            }

            if (var0.endTime !== 0) {
                if (var0.startTime > 0) {
                    var0.startTime--;
                }

                if (var0.startTime === 0 && var0.x >= 1 && var0.z >= 1 && var0.x <= 102 && var0.z <= 102 && (var0.newType < 0 || ClientBuild.changeLocAvailable(var0.newShape, var0.newType))) {
                    ClientBuild.changeLocUnchecked(var0.level, var0.layer, var0.z, var0.newShape, var0.newType, var0.newAngle, var0.x);
                    var0.startTime = -1;

                    if (var0.newType === var0.oldType && var0.oldType === -1) {
                        var0.unlink();
                    } else if (var0.newType === var0.oldType && var0.oldAngle === var0.newAngle && var0.oldShape === var0.newShape) {
                        var0.unlink();
                    }
                }
            } else if (var0.oldType < 0 || ClientBuild.changeLocAvailable(var0.oldShape, var0.oldType)) {
                ClientBuild.changeLocUnchecked(var0.level, var0.layer, var0.z, var0.oldShape, var0.oldType, var0.oldAngle, var0.x);
                var0.unlink();
            }
        }
    }

    // jag::oldscape::Client::LocChangeUnchecked
    static locChangeUnchecked(arg0: CollisionMap | null, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        let var6: SceneTag = 0n;
        if (arg3 === 0) {
            var6 = World.wallType(arg4, arg1, arg5);
        }
        if (arg3 === 1) {
            var6 = World.decorType(arg4, arg1, arg5);
        }
        if (arg3 === 2) {
            var6 = World.sceneType(arg4, arg1, arg5);
        }
        if (arg3 === 3) {
            var6 = World.gdType(arg4, arg1, arg5);
        }
        if (0n !== BigInt(var6)) {
            const var8: number = (Number(BigInt.asIntN(32, BigInt(var6))) >> 14) & 0x1f;
            const var9: number = (Number(BigInt.asIntN(32, BigInt(var6))) >> 20) & 0x3;
            const var10: number = Number((BigInt(var6) >> 32n) & 0x7fffffffn);
            const var11: LocType = LocType.list(var10);
            if (arg3 === 0) {
                World.delWall(arg4, arg1, arg5);
                if (var11.blockwalk !== 0) {
                    arg0!.delWall(var11.blockrange, var8, var9, arg5, arg1);
                }
            }
            if (arg3 === 1) {
                World.delDecor(arg4, arg1, arg5);
            }
            if (arg3 === 2) {
                World.delLoc(arg4, arg1, arg5);
                if (var11.blockwalk !== 0 && var11.width + arg1 < 104 && var11.width + arg5 < 104 && var11.length + arg1 < 104 && arg5 + var11.length < 104) {
                    arg0!.delLoc(arg1, var11.blockrange, var9, arg5, var11.length, var11.width);
                }
            }
            if (arg3 === 3) {
                World.delGroundDecor(arg4, arg1, arg5);
                if (var11.blockwalk === 1) {
                    arg0!.unblockGroundDecor(arg1, arg5);
                }
            }
        }
    }

    // jag::oldscape::Client::ShowObject
    static showObject(arg0: number, arg1: number): void {
        const var2 = Client.groundObj[Client.minusedlevel][arg0][arg1];
        if (var2 === null) {
            World.delObj(Client.minusedlevel, arg0, arg1);
            return;
        }

        let var3: number = -99999999;
        let var4: ClientObjNode | null = null;

        for (let var5 = var2.head(); var5 !== null; var5 = var2.next()) {
            const var6: ObjType = ObjType.list(var5.obj.id);
            let var7: number = var6.cost;

            if (var6.stackable === 1) {
                var7 *= var5.obj.count + 1;
            }

            if (var7 > var3) {
                var4 = var5;
                var3 = var7;
            }
        }

        if (var4 === null) {
            World.delObj(Client.minusedlevel, arg0, arg1);
            return;
        }

        let var8: ClientObj | null = null;
        var2.pushFront(var4);
        let var9: ClientObj | null = null;

        for (let var10 = var2.head(); var10 !== null; var10 = var2.next()) {
            const var11: ClientObj = var10.obj;
            if (var4.obj.id !== var11.id) {
                if (var8 === null) {
                    var8 = var11;
                }
                if (var11.id !== var8.id && var9 === null) {
                    var9 = var11;
                }
            }
        }

        const var12: number = arg0 + (arg1 << 7) + 1610612736;
        World.setObj(Client.minusedlevel, arg0, arg1, Client.getAvH(arg0 * 128 + 64, arg1 * 128 - -64, Client.minusedlevel), var4.obj, var12, var8, var9);
    }

    static getPlayerPos(): void {
        Client.entityRemovalCount = 0;
        Client.entityUpdateCount = 0;
        Client.getPlayerPosLocal();
        Client.getPlayerPosOldVis();
        Client.getPlayerPosNewVis();
        Client.getPlayerPosExtended();
        for (let var0: number = 0; var0 < Client.entityRemovalCount; var0++) {
            const var1: number = Client.entityRemovalIds[var0];
            if (Client.loopCycle !== Client.players[var1]!.cycle) {
                Client.players[var1] = null;
            }
        }
        if (Client.in.pos !== Client.psize) {
            throw new Error('gpp1 pos:' + Client.in.pos + ' psize:' + Client.psize);
        }
        for (let var2: number = 0; var2 < Client.playerCount; var2++) {
            if (Client.players[Client.playerIds[var2]] === null) {
                throw new Error('gpp2 pos:' + var2 + ' size:' + Client.playerCount);
            }
        }
    }

    static getPlayerPosLocal(): void {
        Client.in.gBitStart();
        const var0: number = Client.in.gBit(1);
        if (var0 === 0) {
            return;
        }
        const var1: number = Client.in.gBit(2);
        if (var1 === 0) {
            Client.entityUpdateIds[Client.entityUpdateCount++] = 2047;
        } else if (var1 === 1) {
            const var2: number = Client.in.gBit(3);
            Client.localPlayer!.moveCode(false, var2);
            const var3: number = Client.in.gBit(1);
            if (var3 === 1) {
                Client.entityUpdateIds[Client.entityUpdateCount++] = 2047;
            }
        } else if (var1 === 2) {
            const var4: number = Client.in.gBit(3);
            Client.localPlayer!.moveCode(true, var4);
            const var5: number = Client.in.gBit(3);
            Client.localPlayer!.moveCode(true, var5);
            const var6: number = Client.in.gBit(1);
            if (var6 === 1) {
                Client.entityUpdateIds[Client.entityUpdateCount++] = 2047;
            }
        } else if (var1 === 3) {
            // 464 teleport bit order: level(2), localX(7), jump(1), localY(7), needsMask(1).
            // (rev-500 was jump(1), level(2), mask(1), x(7), y(7) — different order.)
            Client.minusedlevel = Client.in.gBit(2);
            const var9: number = Client.in.gBit(7);
            const var7: number = Client.in.gBit(1);
            const var10: number = Client.in.gBit(7);
            const var8: number = Client.in.gBit(1);
            if (var8 === 1) {
                Client.entityUpdateIds[Client.entityUpdateCount++] = 2047;
            }
            Client.localPlayer!.teleport(var7 === 1, var9, var10);
        }
    }

    static getPlayerPosOldVis(): void {
        const var0: number = Client.in.gBit(8);
        if (var0 < Client.playerCount) {
            for (let var1: number = var0; var1 < Client.playerCount; var1++) {
                Client.entityRemovalIds[Client.entityRemovalCount++] = Client.playerIds[var1];
            }
        }
        if (var0 > Client.playerCount) {
            throw new Error('gppov1');
        }
        Client.playerCount = 0;
        for (let var2: number = 0; var2 < var0; var2++) {
            const var3: number = Client.playerIds[var2];
            const var4: ClientPlayer = Client.players[var3]!;
            const var5: number = Client.in.gBit(1);
            if (var5 === 0) {
                Client.playerIds[Client.playerCount++] = var3;
                var4.cycle = Client.loopCycle;
            } else {
                const var6: number = Client.in.gBit(2);
                if (var6 === 0) {
                    Client.playerIds[Client.playerCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                } else if (var6 === 1) {
                    Client.playerIds[Client.playerCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    const var7: number = Client.in.gBit(3);
                    var4.moveCode(false, var7);
                    const var8: number = Client.in.gBit(1);
                    if (var8 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                    }
                } else if (var6 === 2) {
                    Client.playerIds[Client.playerCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    const var9: number = Client.in.gBit(3);
                    var4.moveCode(true, var9);
                    const var10: number = Client.in.gBit(3);
                    var4.moveCode(true, var10);
                    const var11: number = Client.in.gBit(1);
                    if (var11 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                    }
                } else if (var6 === 3) {
                    Client.entityRemovalIds[Client.entityRemovalCount++] = var3;
                }
            }
        }
    }

    static getPlayerPosNewVis(): void {
        while (true) {
            if (Client.in.bitsLeft(Client.psize) >= 11) {
                const var0: number = Client.in.gBit(11);
                if (var0 !== 2047) {
                    let var1: boolean = false;
                    if (Client.players[var0] === null) {
                        var1 = true;
                        Client.players[var0] = new ClientPlayer();
                        if (Client.playerAppearanceBuffer[var0] !== null) {
                            Client.players[var0]!.setAppearance(Client.playerAppearanceBuffer[var0]!);
                        }
                    }

                    Client.playerIds[Client.playerCount++] = var0;
                    const var2: ClientPlayer = Client.players[var0]!;
                    var2.cycle = Client.loopCycle;
                    // 464 new-add bit order: index(11) [read above], dy(5), faceDir(3),
                    // jump(1), needsMask(1), dx(5). (rev-500 was faceDir, mask, then coords.)
                    let var5: number = Client.in.gBit(5); // dy (signed)
                    if (var5 > 15) {
                        var5 -= 32;
                    }
                    const var3: number = Client.ANGLE_TO_DIR[Client.in.gBit(3)];
                    if (var1) {
                        var2.dstYaw = var2.yaw = var3;
                    }
                    const var7: number = Client.in.gBit(1); // jump
                    const var4: number = Client.in.gBit(1); // needsMask
                    if (var4 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var0;
                    }
                    let var6: number = Client.in.gBit(5); // dx (signed)
                    if (var6 > 15) {
                        var6 -= 32;
                    }
                    var2.teleport(var7 === 1, Client.localPlayer!.routeX[0] + var6, Client.localPlayer!.routeZ[0] + var5);
                    continue;
                }
            }
            Client.in.gBitEnd();
            return;
        }
    }

    static getPlayerPosExtended(): void;
    static getPlayerPosExtended(arg0: number, arg1: ClientPlayer, arg2: number): void;
    static getPlayerPosExtended(arg0?: number, arg1?: ClientPlayer, arg2?: number): void {
        if (arg0 === undefined || arg1 === undefined || arg2 === undefined) {
            for (let var0: number = 0; var0 < Client.entityUpdateCount; var0++) {
                const var1: number = Client.entityUpdateIds[var0];
                const var2: ClientPlayer = Client.players[var1]!;
                let var3: number = Client.in.g1();
                if ((var3 & 0x10) !== 0) {
                    // 464: 0x10 is the extension signal — a high mask byte (0x100/0x200/0x400) follows
                    var3 += Client.in.g1() << 8;
                }
                Client.getPlayerPosExtended(var3, var2, var1);
            }
            return;
        }
        // 464 player update-mask order (client Class73.method1166):
        //   HIT 0x100, GRAPHICS 0x200, FACE_ENTITY 0x008, FACE_COORD 0x004, FORCE_MOVE 0x400,
        //   FORCED_CHAT 0x080, ANIMATION 0x020, CHAT 0x001, HIT_2 0x002, APPEARANCE 0x040.
        if ((arg0 & 0x100) !== 0) {
            const var9: number = Client.in.g1_alt3(); // damage, byteS
            const var10: number = Client.in.g1_alt3(); // type, byteS
            arg1.field4109 = Client.in.g1_alt1(); // curHP, byteA
            arg1.maxHealth = Client.in.g1_alt1(); // maxHP, byteA
            arg1.addHitmark(Client.loopCycle, var10, var9);
            arg1.combatCycle = Client.loopCycle + 300;
        }

        if ((arg0 & 0x200) !== 0) {
            arg1.spotanimId = Client.in.g2();
            const var3: number = Client.in.g4_alt3(); // int2: (height<<16)|delay
            if (arg1.spotanimId === 65535) {
                arg1.spotanimId = -1;
            }
            arg1.spotanimHeight = var3 >> 16;
            arg1.spotanimLastCycle = (var3 & 0xffff) + Client.loopCycle;
            arg1.spotanimFrame = 0;
            arg1.spotanimCycle = 0;
            if (Client.loopCycle < arg1.spotanimLastCycle) {
                arg1.spotanimFrame = -1;
            }
        }

        if ((arg0 & 0x8) !== 0) {
            // FACE_ENTITY (leshort; players sent as index+32768, 0xffff clears)
            arg1.targetId = Client.in.g2_alt1();
            if (arg1.targetId === 65535) {
                arg1.targetId = -1;
            }
        }

        if ((arg0 & 0x4) !== 0) {
            // FACE_COORD (leshortA, wire = coord*2 + 1)
            arg1.targetTileX = Client.in.g2_alt3();
            arg1.targetTileZ = Client.in.g2_alt3();
        }

        if ((arg0 & 0x400) !== 0) {
            arg1.exactStartX = Client.in.g1_alt3(); // byteS
            arg1.exactStartZ = Client.in.g1_alt3(); // byteS
            arg1.exactEndX = Client.in.g1_alt3(); // byteS
            arg1.exactEndZ = Client.in.g1_alt1(); // byteA
            arg1.exactMoveStart = Client.in.g2_alt2() + Client.loopCycle; // shortA
            arg1.exactMoveEnd = Client.in.g2() + Client.loopCycle; // short BE
            arg1.exactMoveFacing = Client.in.g1_alt2(); // byteC
            arg1.preanimRouteLength = 0;
            arg1.routeLength = 1;
        }

        if ((arg0 & 0x80) !== 0) {
            // FORCED_CHAT
            arg1.chat = JagString.fromLatin1String(Client.in.gjstr());

            if (arg1.chat.charAt(0) === 126) {
                arg1.chat = arg1.chat.substring(1);
                Client.addChat(arg1.chat.toString(), 2, arg1.name);
            } else if (arg1 === Client.localPlayer) {
                Client.addChat(arg1.chat.toString(), 2, arg1.name);
            }

            arg1.chatEffect = 0;
            arg1.chatColour = 0;
            arg1.chatTimer = 150;
        }

        if ((arg0 & 0x20) !== 0) {
            // ANIMATION (leshort seq, byteC delay)
            let var4: number = Client.in.g2_alt1();
            if (var4 === 65535) {
                var4 = -1;
            }
            const var5: number = Client.in.g1_alt2();
            Client.triggerPlayerAnim(var4, var5, arg1);
        }

        if ((arg0 & 0x1) !== 0) {
            let var13: number = Client.in.g2_alt3(); // leshortA: (color<<8)|effects
            const var14: boolean = (var13 & 0x8000) !== 0;
            const var15: number = Client.in.g1_alt1(); // byteA rights
            const var16: number = Client.in.g1();
            const var17: number = Client.in.pos;

            if (arg1.name !== null && arg1.model !== null) {
                const var18: bigint = JagString.fromLatin1String(arg1.name).toUserhash();
                let var20: boolean = false;

                if (var15 <= 1) {
                    if (!var14 && (Client.underage === 1 || Client.mapQuickchat === 1)) {
                        var20 = true;
                    } else {
                        for (let var21: number = 0; var21 < Client.privateMessageCount; var21++) {
                            if (Client.messageIds[var21] === var18) {
                                var20 = true;
                                break;
                            }
                        }
                    }
                }

                if (!var20 && Client.chatDisabled === 0) {
                    Client.tempP.pos = 0;
                    let var22: number = -1;
                    Client.in.gdata_alt1(Client.tempP.data, var16);
                    Client.tempP.pos = 0;

                    let var23: string;
                    if (var14) {
                        const var24: QuickChatPhrase = QuickChatPhrase.create(Client.tempP);
                        var22 = var24.id;
                        var13 &= 0x7fff;
                        var23 = var24.type!.getText(Client.tempP);
                    } else {
                        var23 = PixFont.escape(JagString.fromLatin1String(WordPack.unpack2(Client.tempP)).toSentenceCase().toString());
                    }
                    arg1.chat = JagString.fromLatin1String(var23).trim();
                    arg1.chatTimer = 150;
                    arg1.chatColour = var13 >> 8;
                    arg1.chatEffect = var13 & 0xff;
                    console.log('[chatdbg] mask chat "' + var23 + '" set for ' + arg1.name + ' (self=' + (arg1 === Client.localPlayer) + ')');

                    if (var15 === 2) {
                        Client.addChat(var23, var22, '<img=1>' + arg1.name, var14 ? 17 : 1, null);
                    } else if (var15 === 1) {
                        Client.addChat(var23, var22, '<img=0>' + arg1.name, var14 ? 17 : 1, null);
                    } else {
                        Client.addChat(var23, var22, arg1.name, var14 ? 17 : 2, null);
                    }
                }
            }

            Client.in.pos = var16 + var17;
        }

        if ((arg0 & 0x2) !== 0) {
            // HIT_2 (second hitsplat) — Java stores HP + refreshes the bar timer too
            const var11: number = Client.in.g1_alt1(); // damage, byteA
            const var12: number = Client.in.g1_alt3(); // type, byteS
            arg1.field4109 = Client.in.g1_alt3(); // curHP, byteS
            arg1.maxHealth = Client.in.g1_alt3(); // maxHP, byteS
            arg1.addHitmark(Client.loopCycle, var12, var11);
            arg1.combatCycle = Client.loopCycle + 300;
        }

        if ((arg0 & 0x40) !== 0) {
            // APPEARANCE (byteA size, then size bytes)
            const var6: number = Client.in.g1_alt1();
            const var7: Uint8Array = new Uint8Array(var6);
            const var8: Packet = new Packet(var7);
            Client.in.gdata(var6, var7);

            Client.playerAppearanceBuffer[arg2] = var8;
            arg1.setAppearance(var8);
        }
    }

    // jag::oldscape::Client::GetNPCPos
    static getNpcPos(): void {
        Client.entityRemovalCount = 0;
        Client.entityUpdateCount = 0;
        Client.getNpcPosOldVis();
        Client.getNpcPosNewVis();
        Client.getNpcPosExtended();
        for (let var0: number = 0; var0 < Client.entityRemovalCount; var0++) {
            const var1: number = Client.entityRemovalIds[var0];
            if (Client.npc[var1]!.cycle !== Client.loopCycle) {
                Client.npc[var1]!.type = null;
                Client.npc[var1] = null;
            }
        }
        if (Client.psize !== Client.in.pos) {
            throw new Error('gnp1 pos:' + Client.in.pos + ' psize:' + Client.psize);
        }
        for (let var2: number = 0; var2 < Client.npcCount; var2++) {
            if (Client.npc[Client.npcIds[var2]] === null) {
                throw new Error('gnp2 pos:' + var2 + ' size:' + Client.npcCount);
            }
        }
    }

    // jag::oldscape::Client::GetNPCPosOldVis
    static getNpcPosOldVis(): void {
        Client.in.gBitStart();
        const var0: number = Client.in.gBit(8);
        if (Client.npcCount > var0) {
            for (let var1: number = var0; var1 < Client.npcCount; var1++) {
                Client.entityRemovalIds[Client.entityRemovalCount++] = Client.npcIds[var1];
            }
        }
        if (var0 > Client.npcCount) {
            throw new Error('gnpov1');
        }
        Client.npcCount = 0;
        for (let var2: number = 0; var2 < var0; var2++) {
            const var3: number = Client.npcIds[var2];
            const var4: ClientNpc = Client.npc[var3]!;
            const var5: number = Client.in.gBit(1);
            if (var5 === 0) {
                Client.npcIds[Client.npcCount++] = var3;
                var4.cycle = Client.loopCycle;
            } else {
                const var6: number = Client.in.gBit(2);
                if (var6 === 0) {
                    Client.npcIds[Client.npcCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                } else if (var6 === 1) {
                    Client.npcIds[Client.npcCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    const var7: number = Client.in.gBit(3);
                    var4.moveCode(false, var7);
                    const var8: number = Client.in.gBit(1);
                    if (var8 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                    }
                } else if (var6 === 2) {
                    Client.npcIds[Client.npcCount++] = var3;
                    var4.cycle = Client.loopCycle;
                    const var9: number = Client.in.gBit(3);
                    var4.moveCode(true, var9);
                    const var10: number = Client.in.gBit(3);
                    var4.moveCode(true, var10);
                    const var11: number = Client.in.gBit(1);
                    if (var11 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var3;
                    }
                } else if (var6 === 3) {
                    Client.entityRemovalIds[Client.entityRemovalCount++] = var3;
                }
            }
        }
    }

    // jag::oldscape::Client::GetNPCPosNewVis
    static getNpcPosNewVis(): void {
        while (true) {
            if (Client.in.bitsLeft(Client.psize) >= 27) {
                const var0: number = Client.in.gBit(15);
                if (var0 !== 32767) {
                    let var1: boolean = false;
                    if (Client.npc[var0] === null) {
                        var1 = true;
                        Client.npc[var0] = new ClientNpc();
                    }
                    const var2: ClientNpc = Client.npc[var0]!;
                    Client.npcIds[Client.npcCount++] = var0;
                    var2.cycle = Client.loopCycle;
                    // 464 new-NPC order: index(15) [above], dy(5), typeId(14),
                    //   forceMask(1), jump(1), faceDir(3), dx(5).
                    let var4: number = Client.in.gBit(5); // dy (signed)
                    if (var4 > 15) {
                        var4 -= 32;
                    }
                    var2.type = NpcType.list(Client.in.gBit(14));
                    const var5: number = Client.in.gBit(1); // forceMask
                    if (var5 === 1) {
                        Client.entityUpdateIds[Client.entityUpdateCount++] = var0;
                    }
                    const var3: number = Client.in.gBit(1); // jump/teleport
                    const var6: number = Client.ANGLE_TO_DIR[Client.in.gBit(3)]; // faceDir
                    if (var1) {
                        var2.dstYaw = var2.yaw = var6;
                    }
                    let var7: number = Client.in.gBit(5); // dx (signed)
                    if (var7 > 15) {
                        var7 -= 32;
                    }
                    var2.size = var2.type.size;
                    var2.walkanim_l = var2.type.walkanim_r;
                    var2.readyanim = var2.type.readyanim;
                    var2.walkanim_r = var2.type.walkanim_l;
                    var2.turnleftanim = var2.type.turnleftanim;
                    var2.turnspeed = var2.type.turnspeed;
                    if (var2.turnspeed === 0) {
                        var2.yaw = 0;
                    }
                    var2.walkanim_b = var2.type.walkanim_b;
                    var2.walkanim = var2.type.walkanim;
                    var2.turnrightanim = var2.type.turnrightanim;
                    var2.teleport(var3 === 1, Client.localPlayer!.routeX[0] + var7, Client.localPlayer!.routeZ[0] + var4);
                    continue;
                }
            }
            Client.in.gBitEnd();
            return;
        }
    }

    // jag::oldscape::Client::GetNPCPosExtended
    static getNpcPosExtended(): void {
        for (let var0: number = 0; var0 < Client.entityUpdateCount; var0++) {
            const var1: number = Client.entityUpdateIds[var0];
            const var2: ClientNpc = Client.npc[var1]!;

            const var3: number = Client.in.g1();

            // 464 npc update-mask order (client Class58.method1031):
            //   ANIM 0x40, FORCED_CHAT 0x80, SPOTANIM 0x08, FACE_COORD 0x01,
            //   HIT 0x10, FACE_ENTITY 0x04, HIT_2 0x20, TRANSFORM 0x02. Single flag byte, no extension.
            if ((var3 & 0x40) !== 0) {
                let var4: number = Client.in.g2_alt2(); // seqId, shortA
                if (var4 === 65535) {
                    var4 = -1;
                }
                const var5: number = Client.in.g1_alt1(); // delay, byteA
                Client.triggerNpcAnim(var4, var5, var2);
            }

            if ((var3 & 0x80) !== 0) {
                var2.chat = JagString.fromLatin1String(Client.in.gjstr());
                var2.chatTimer = 100;
            }

            if ((var3 & 0x8) !== 0) {
                var2.spotanimId = Client.in.g2_alt1(); // leshort
                const var6: number = Client.in.g4_alt2(); // method241: (height<<16)|delay
                if (var2.spotanimId === 65535) {
                    var2.spotanimId = -1;
                }
                var2.spotanimHeight = var6 >> 16;
                var2.spotanimFrame = 0;
                var2.spotanimCycle = 0;
                var2.spotanimLastCycle = (var6 & 0xffff) + Client.loopCycle;
                if (Client.loopCycle < var2.spotanimLastCycle) {
                    var2.spotanimFrame = -1;
                }
            }

            if ((var3 & 0x1) !== 0) {
                // FACE_COORD (wire = coord*2 + 1)
                var2.targetTileX = Client.in.g2_alt2(); // shortA
                var2.targetTileZ = Client.in.g2(); // short BE
            }

            if ((var3 & 0x10) !== 0) {
                const var7: number = Client.in.g1_alt3(); // splat, byteS
                const var8: number = Client.in.g1_alt1(); // type, byteA
                var2.field4109 = Client.in.g1_alt1(); // curHp, byteA
                var2.maxHealth = Client.in.g1_alt3(); // maxHp, byteS
                var2.addHitmark(Client.loopCycle, var8, var7);
                var2.combatCycle = Client.loopCycle + 300;
            }

            if ((var3 & 0x4) !== 0) {
                var2.targetId = Client.in.g2(); // short BE
                if (var2.targetId === 65535) {
                    var2.targetId = -1;
                }
            }

            if ((var3 & 0x20) !== 0) {
                const var9: number = Client.in.g1(); // splat, u8
                const var10: number = Client.in.g1_alt1(); // type, byteA
                var2.field4109 = Client.in.g1(); // curHp, u8
                var2.maxHealth = Client.in.g1(); // maxHp, u8
                var2.addHitmark(Client.loopCycle, var10, var9);
                var2.combatCycle = Client.loopCycle + 300;
            }

            if ((var3 & 0x2) !== 0) {
                // TRANSFORM (changetype) + optional custom-equipment overlay
                var2.type = NpcType.list(Client.in.g2()); // npcId, short BE
                var2.turnspeed = var2.type.turnspeed;
                var2.size = var2.type.size;
                var2.turnleftanim = var2.type.turnleftanim;
                var2.turnrightanim = var2.type.turnrightanim;
                var2.readyanim = var2.type.readyanim;
                var2.walkanim_r = var2.type.walkanim_l;
                var2.walkanim_b = var2.type.walkanim_b;
                var2.walkanim_l = var2.type.walkanim_r;
                var2.walkanim = var2.type.walkanim;

                const customFlag: number = Client.in.g1();
                if (customFlag === 2) {
                    // custom equipment overlay — read for stream alignment (base model still renders)
                    const packedCount: number = Client.in.g1();
                    const numItems: number = packedCount & 0x7f;
                    const hasBas: boolean = (packedCount & 0x80) !== 0;
                    Client.in.g1(); // hideMask
                    for (let i: number = 0; i < numItems; i++) {
                        Client.in.g1(); // slot
                        Client.in.g2(); // itemId
                    }
                    if (hasBas) {
                        for (let i: number = 0; i < 7; i++) {
                            Client.in.g2(); // BAS seq
                        }
                    }
                } else if (customFlag === 3) {
                    // full human appearance (server never emits this in this build; align only)
                    Client.in.g1(); // gender
                    for (let i: number = 0; i < 12; i++) {
                        Client.in.g2(); // equip slot short
                    }
                    for (let i: number = 0; i < 5; i++) {
                        Client.in.g1(); // colour
                    }
                    const hasBas: number = Client.in.g1();
                    if (hasBas === 1) {
                        for (let i: number = 0; i < 7; i++) {
                            Client.in.g2(); // BAS seq
                        }
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::DirtyArea
    static dirtyArea(arg0: number, arg1: number, arg2: number, arg3: number): void {
        for (let var4 = 0; var4 < Client.componentDrawCount; var4++) {
            if (arg3 < Client.componentDrawX[var4] + Client.componentDrawWidth[var4] && arg3 + arg1 > Client.componentDrawX[var4] && arg2 < Client.componentDrawY[var4] + Client.componentDrawHeight[var4] && Client.componentDrawY[var4] < arg0 + arg2) {
                Client.componentDirtyArea[var4] = true;
            }
        }
    }

    // MOBA typing gate (Java WasdCamera.isTyping + Class18.keyPressed): while NOT
    // typing, Q/E/R are ability slot keys and Enter opens the chatbox; '/' or ':'
    // open it and pass through (for /pm :clan). Enter (send) or Escape closes it.
    // Modal chatbox dialogs (name/amount input — a sub on window 548 child 79)
    // always type. Only active on the in-game pane (548) so login/title typing is
    // untouched.
    static mobaTyping: boolean = false;
    private static mobaSwallowCharA: number = -1;
    private static mobaSwallowCharB: number = -1;

    /** True = the key was consumed by the MOBA layer (drop it from the queue). */
    private static mobaFilterKey(code: number, ch: number): boolean {
        if (Client.toplevelinterface !== 548) {
            Client.mobaTyping = false;
            return false;
        }
        // a consumed Q/E/R keydown is followed by its keypress char — swallow it
        if (ch !== -1 && (ch === Client.mobaSwallowCharA || ch === Client.mobaSwallowCharB)) {
            Client.mobaSwallowCharA = -1;
            Client.mobaSwallowCharB = -1;
            return true;
        }
        if (code !== -1) {
            Client.mobaSwallowCharA = -1;
            Client.mobaSwallowCharB = -1;
        }
        if (Client.subinterfaces.find(BigInt((548 << 16) | 79)) !== null) {
            return false; // chatbox dialog up (name/amount input): everything types
        }
        if (Client.mobaTyping) {
            if (code === 84 || code === 0) {
                // Enter (the chat input sends) / Escape: leave typing, pass through
                Client.mobaTyping = false;
            }
            return false;
        }
        if (code === 0) {
            // Escape: always close the open interface + notify the server (opcode 71),
            // like the Java client's ESC branch (Class18). Consumed.
            Client.closeModal();
            return true;
        }
        if (ch === 47 || ch === 58 || ch === 59 || ch === 63) {
            // '/' ':' ';' '?' (the Java oracle gates on physical VK 47/59 in any shift
            // state): start typing, let the char reach the chat input
            Client.mobaTyping = true;
            return false;
        }
        if (code === 84) {
            // Enter: start typing (consumed — nothing pending to send)
            Client.mobaTyping = true;
            return true;
        }
        if (code === 83) {
            // SPACE = camera lock toggle (League): unlocked edge-pans, locked snaps
            // back to the champion. Consumed (with its ' ' char) outside typing.
            MobaCamera.toggleLock();
            Client.mobaSwallowCharA = 32; // ' '
            Client.mobaSwallowCharB = 32;
            return true;
        }
        if (Client.wasdMode) {
            // WASD camera keys: consume so they never type (keyHeld — which drives the
            // camera — is a separate buffer and is unaffected by eating the queue entry).
            if (code === 33) {
                Client.mobaSwallowCharA = 119; // 'w'
                Client.mobaSwallowCharB = 87; // 'W'
                return true;
            }
            if (code === 48) {
                Client.mobaSwallowCharA = 97; // 'a'
                Client.mobaSwallowCharB = 65; // 'A'
                return true;
            }
            if (code === 49) {
                Client.mobaSwallowCharA = 115; // 's'
                Client.mobaSwallowCharB = 83; // 'S'
                return true;
            }
            if (code === 50) {
                Client.mobaSwallowCharA = 100; // 'd'
                Client.mobaSwallowCharB = 68; // 'D'
                return true;
            }
        }
        if (code === 32) {
            SkillshotOverlay.slotPressed(SkillshotOverlay.SLOT_Q);
            Client.mobaSwallowCharA = 113; // 'q'
            Client.mobaSwallowCharB = 81; // 'Q'
            return true;
        }
        if (code === 34) {
            SkillshotOverlay.slotPressed(SkillshotOverlay.SLOT_W);
            Client.mobaSwallowCharA = 101; // 'e'
            Client.mobaSwallowCharB = 69; // 'E'
            return true;
        }
        if (code === 35) {
            SkillshotOverlay.slotPressed(SkillshotOverlay.SLOT_E);
            Client.mobaSwallowCharA = 114; // 'r'
            Client.mobaSwallowCharB = 82; // 'R'
            return true;
        }
        return false;
    }

    // jag::oldscape::minimenu::Minimenu::GameLoop
    mouseLoop(): void {
        if (Client.objDragCom !== null || Client.dragCom !== null) {
            return;
        }

        // Screen-size picker is MODAL: clicks go to it and never leak to the scene/menus.
        if (ScreenSizeDialog.open) {
            if (ClientMouseListener.mouseClickButton !== 0) {
                ScreenSizeDialog.handleClick(ClientMouseListener.mouseClickX, ClientMouseListener.mouseClickY);
                ClientMouseListener.mouseClickButton = 0;
            }
            return;
        }

        let button: number = ClientMouseListener.mouseClickButton;

        if (Client.isMenuOpen) {
            if (button === 1) {
                const menuX: number = Client.menuX;
                const menuY: number = Client.menuY;
                const menuWidth: number = Client.menuWidth;

                const clickX: number = ClientMouseListener.mouseClickX;
                const clickY: number = ClientMouseListener.mouseClickY;

                let option: number = -1;
                for (let i: number = 0; i < Client.menuNumEntries; i++) {
                    const optionY: number = menuY + (Client.menuNumEntries - 1 - i) * 15 + 31;
                    if (clickX > menuX && clickX < menuX + menuWidth && clickY > optionY - 13 && clickY < optionY + 3) {
                        option = i;
                    }
                }

                if (option !== -1) {
                    Client.doAction(option);
                }

                Client.isMenuOpen = false;
                Client.dirtyArea(Client.menuHeight, Client.menuWidth, Client.menuY, Client.menuX);
            } else {
                const x: number = ClientMouseListener.mouseX;
                const y: number = ClientMouseListener.mouseY;

                if (x < Client.menuX - 10 || x > Client.menuX + Client.menuWidth + 10 || y < Client.menuY - 10 || y > Client.menuY + Client.menuHeight + 10) {
                    Client.isMenuOpen = false;
                    Client.dirtyArea(Client.menuHeight, Client.menuWidth, Client.menuY, Client.menuX);
                }
            }
        } else {
            if (button === 1 && Client.menuNumEntries > 0) {
                const action: number = Client.menuAction[Client.menuNumEntries - 1];

                if (action == 6 || action == 8 || action == 49 || action == 44 || action == 13 || action == 28 || action == 9 || action == 2 || action == 21 || action == 18 || action == 12 || action === 1001) {
                    const slot: number = Client.menuParamB[Client.menuNumEntries - 1];
                    const comId: number = Client.menuParamC[Client.menuNumEntries - 1];
                    const com: IfType | null = IfType.get(comId)!;

                    if (ServerActive.isObjSwapEnabled(Client.getActive(com)) || ServerActive.isObjReplaceEnabled(Client.getActive(com))) {
                        Client.objDragCycles = 0;
                        Client.objGrabThreshold = false;
                        if (Client.objDragCom !== null) {
                            Client.componentUpdated(Client.objDragCom);
                        }
                        Client.objDragCom = com;
                        Client.objDragSlot = slot;
                        Client.objGrabX = ClientMouseListener.mouseClickX;
                        Client.objGrabY = ClientMouseListener.mouseClickY;

                        Client.componentUpdated(Client.objDragCom);
                        return;
                    }
                }
            }

            // MOBA League controls (Java GraphicsBuffer.method682): when the TOP row is a
            // SCENE row (walk-here / entity op over the world), LEFT-click is skillshot-only
            // (armed -> fire at the hovered tile/unit, unarmed -> nothing — no walk, no
            // attack) and RIGHT-click cancels any arm then performs the action IMMEDIATELY
            // (League right-click move/attack; no context menu over the world). Overlay and
            // interface rows keep classic clicks — the range markers exclude them.
            const mlTop: number = Client.menuNumEntries - 1;
            if (button !== 0 && Client.sceneRowEnd > 0 && mlTop >= Client.sceneRowStart && mlTop < Client.sceneRowEnd) {
                if (button === 1) {
                    if (SkillshotOverlay.armedAbility !== 0) {
                        if (SkillshotOverlay.isUnitTarget(SkillshotOverlay.armedAbility)) {
                            SkillshotOverlay.fireUnitTarget();
                        } else if (World.hoverGroundX !== -1 && World.hoverGroundZ !== -1) {
                            SkillshotOverlay.fireAtTile(World.hoverGroundX, World.hoverGroundZ);
                        }
                    }
                } else {
                    SkillshotOverlay.armedAbility = 0;
                    // Responsiveness: if this is the walk row and the ground tile is
                    // already hover-picked THIS frame, move NOW instead of arming the
                    // click pick (which costs a full render round-trip).
                    if (Client.menuAction[mlTop] === 10 && World.hoverGroundX !== -1) {
                        const mlPlayer = Client.localPlayer!;
                        let mlSuccess: boolean;
                        if (mlPlayer.fineStreamed) {
                            mlSuccess = FineStream.sendFineClick(World.hoverGroundX, World.hoverGroundZ);
                        } else {
                            mlSuccess = Client.tryMove(0, 0, World.hoverGroundZ, World.hoverGroundX, mlPlayer.routeX[0], 0, 0, 0, true, 0, mlPlayer.routeZ[0]);
                        }
                        if (mlSuccess) {
                            Client.crossX = ClientMouseListener.mouseClickX;
                            Client.crossCycle = 0;
                            Client.crossY = ClientMouseListener.mouseClickY;
                            Client.crossMode = 1;
                        }
                    } else {
                        Client.doAction(mlTop);
                    }
                }
                return;
            }

            if (button === 1 && ((Client.oneMouseButton === 1 && Client.menuNumEntries > 2) || Client.isAddFriendOption(Client.menuNumEntries - 1))) {
                button = 2;
            }

            if (button === 1 && Client.menuNumEntries > 0) {
                Client.doAction(Client.menuNumEntries - 1);
            } else if (button == 2 && Client.menuNumEntries > 0) {
                this.openMenu();
            }
        }
    }

    // jag::oldscape::minimenu::Minimenu::Sort
    static sortMinimenu(): void {
        let var0: boolean = false;
        while (!var0) {
            var0 = true;

            for (let var1: number = 0; var1 < Client.menuNumEntries - 1; var1++) {
                if (Client.menuAction[var1] < 1000 && Client.menuAction[var1 + 1] > 1000) {
                    var0 = false;

                    const var2: string | null = Client.menuSubject[var1];
                    Client.menuSubject[var1] = Client.menuSubject[var1 + 1];
                    Client.menuSubject[var1 + 1] = var2;

                    const var3: string | null = Client.menuVerb[var1];
                    Client.menuVerb[var1] = Client.menuVerb[var1 + 1];
                    Client.menuVerb[var1 + 1] = var3;

                    const var4: number = Client.menuParamB[var1];
                    Client.menuParamB[var1] = Client.menuParamB[var1 + 1];
                    Client.menuParamB[var1 + 1] = var4;

                    const var5: number = Client.menuParamC[var1];
                    Client.menuParamC[var1] = Client.menuParamC[var1 + 1];
                    Client.menuParamC[var1 + 1] = var5;

                    const var6: number = Client.menuAction[var1];
                    Client.menuAction[var1] = Client.menuAction[var1 + 1];
                    Client.menuAction[var1 + 1] = var6;

                    const var7: SceneTag = Client.menuParamA[var1];
                    Client.menuParamA[var1] = Client.menuParamA[var1 + 1];
                    Client.menuParamA[var1 + 1] = var7;
                }
            }
        }
    }

    drawMinimenu(): void {
        const x: number = Client.menuX;
        const y: number = Client.menuY;
        const w: number = Client.menuWidth;
        const h: number = Client.menuHeight;
        const background: number = 0x5d5447;

        Pix2D.fillRect(x, y, w, h, background);
        Pix2D.fillRect(x + 1, y + 1, w - 2, 16, 0x0);
        Pix2D.drawRect(x + 1, y + 18, w - 2, h - 19, 0x0);

        Client.b12!.drawString(Text.chooseoption, x + 3, y + 14, background, -1);

        const mouseX: number = ClientMouseListener.mouseX;
        const mouseY: number = ClientMouseListener.mouseY;

        for (let i: number = 0; i < Client.menuNumEntries; i++) {
            const optionY: number = y + (Client.menuNumEntries - 1 - i) * 15 + 31;

            let rgb: number = 0xffffff;
            if (mouseX > x && mouseX < x + w && mouseY > optionY - 13 && mouseY < optionY + 3) {
                rgb = 0xffff00;
            }

            Client.b12!.drawString(Client.getLine(i), x + 3, optionY, rgb, 0);
        }
        Client.blitArea(Client.menuX, Client.menuHeight, Client.menuWidth, Client.menuY);
    }

    // jag::oldscape::minimenu::Minimenu::DrawFeedback
    static drawFeedback(arg0: number, arg1: number): void {
        if (Client.menuNumEntries < 2 && Client.useMode === 0 && !Client.targetMode) {
            return;
        }

        let var2: string;
        if (Client.useMode === 1 && Client.menuNumEntries < 2) {
            var2 = Text.use + Text.miniseperator + Client.objSelectedName + ' ->';
        } else if (Client.targetMode && Client.menuNumEntries < 2) {
            var2 = Client.targetVerb! + Text.miniseperator + Client.targetOp! + ' ->';
        } else {
            var2 = Client.getLine(Client.menuNumEntries - 1);
        }

        if (Client.menuNumEntries > 2) {
            var2 = var2 + '<col=ffffff> / ' + (Client.menuNumEntries - 2) + Text.moreoptions;
        }

        const var3: number = Client.b12!.drawStringAntiMacro(var2, arg1 + 4, arg0 + 15, Client.feedbackRand, Client.feedbackSeed);
        Client.dirtyArea(15, var3 + Client.b12!.stringWid(var2), arg0, arg1 + 4);
    }

    // jag::oldscape::minimenu::Minimenu::Open
    openMenu(): void {
        let width: number = Client.b12!.stringWid(Text.chooseoption);
        let maxWidth: number;
        for (let i: number = 0; i < Client.menuNumEntries; i++) {
            maxWidth = Client.b12!.stringWid(Client.getLine(i));
            if (maxWidth > width) {
                width = maxWidth;
            }
        }
        width += 8;

        const height: number = Client.menuNumEntries * 15 + 21;

        Client.menuWidth = width;
        Client.isMenuOpen = true;
        Client.menuHeight = Client.menuNumEntries * 15 + 22;

        let y: number = ClientMouseListener.mouseClickY;
        if (height + y > GameShell.sHei) {
            y = GameShell.sHei - height;
        }
        if (y < 0) {
            y = 0;
        }

        let x: number = ClientMouseListener.mouseClickX - ((width / 2) | 0);
        if (width + x > GameShell.sWid) {
            x = GameShell.sWid - width;
        }
        Client.menuY = y;
        if (x < 0) {
            x = 0;
        }
        Client.menuX = x;
    }

    static isAddFriendOption(arg0: number): boolean {
        if (arg0 < 0) {
            return false;
        }
        let var1 = Client.menuAction[arg0];
        if (var1 >= 2000) {
            var1 -= 2000;
        }
        return var1 === 1003;
    }

    // jag::oldscape::Client::DoAction
    static doAction(arg0: number): void {
        if (arg0 < 0) {
            return;
        }
        const var1: number = Client.menuParamB[arg0];
        const var2: number = Client.menuParamC[arg0];
        let var3: number = Client.menuAction[arg0];
        const var4: SceneTag = Client.menuParamA[arg0];
        if (var3 >= 2000) {
            var3 -= 2000;
        }
        const var6: number = Number(BigInt.asIntN(32, BigInt(Client.menuParamA[arg0])));
        // MOBA overlay actions (1700-1999 range, Java StreamBuffer.method221 hooks).
        if (XpDropOverlay.dispatchMenuAction(var3) || AbilityBarOverlay.dispatchMenuAction(var3) || HudPanelOverlay.dispatchMenuAction(var3)) {
            return;
        }
        if (var3 === 31) {
            const var7: ClientPlayer | null = Client.players[var6];
            if (var7 !== null) {
                Client.tryMove(1, 0, var7.routeZ[0], var7.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossMode = 2;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossCycle = 0;
                Client.crossY = ClientMouseListener.mouseClickY;
                // 464 op 110 (server op-player-u): u16LE playerIndex, u16LE itemWidgetId,
                // u16BE containerId, u16BE itemId, u16BE itemSlot
                Client.out.p1Enc(ClientProt.OPPLAYERU);
                Client.out.p2_alt1(var6);
                Client.out.p2_alt1(Client.objSelectedComId >>> 16);
                Client.out.p2(Client.objSelectedComId & 0xffff);
                Client.out.p2(Client.objComId);
                Client.out.p2(Client.objSelectedSlot);
            }
        }
        if (var3 === 1006) {
            Client.crossCycle = 0;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossMode = 2;
            Client.out.p1Enc(ClientProt.OPOBJ6);
            Client.out.p2(var6); // 464 obj-examine 205: u16 BE (Java method207)
        }
        if (var3 === 7) {
            Client.interactWithLoc(var2, var4, var1);
            Client.out.p1Enc(ClientProt.OPLOC1);
            // 464 op 44: u16LE id, u16 x BE, u16LE y
            Client.out.p2_alt1(Number((BigInt(var4) >> 32n) & 0x7fffffffn));
            Client.out.p2(var1 + Client.mapBuildBaseX);
            Client.out.p2_alt1(Client.mapBuildBaseZ + var2);
        }
        if (var3 === 15) {
            const var8: IfType | null = IfType.get(var1, var2);
            if (var8 !== null) {
                Client.endTargetMode();
                Client.enterTargetMode(var2, ServerActive.targetMask(Client.getActive(var8)), var1);
                Client.useMode = 0;
                Client.targetVerb = Client.getTargetVerb(var8);
                if (Client.targetVerb === null) {
                    Client.targetVerb = 'Null';
                }
                if (var8.v3) {
                    Client.targetOp = var8.baseOpName! + '<col=ffffff>';
                } else {
                    Client.targetOp = '<col=00ff00>' + var8.targetBase! + '<col=ffffff>';
                }
            }
            return;
        }
        if (var3 === 30) {
            const var9: ClientPlayer | null = Client.players[var6];
            if (var9 !== null) {
                Client.tryMove(1, 0, var9.routeZ[0], var9.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.out.p1Enc(ClientProt.OPPLAYER1);
                Client.out.p2(var6); // 464 op 84 (attack): u16 BE
            }
        }
        if (var3 === 40) {
            // DO NOT SEND: 464 has no spell-on-component packet (rev-500 body is 12B; opcode 153
            // is size 4 server-side — sending it would poison the stream).
        }
        if (var3 === 34) {
            const var10: ClientNpc | null = Client.npc[var6];
            if (var10 !== null) {
                Client.tryMove(1, 0, var10.routeZ[0], var10.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.out.p1Enc(ClientProt.OPNPC3);
                Client.out.p2_alt3(var6); // 464 op 19: LEShortA
            }
        }
        if (var3 === 58) {
            const var11: ClientPlayer | null = Client.players[var6];
            if (var11 !== null) {
                Client.tryMove(1, 0, var11.routeZ[0], var11.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPPLAYER2);
                Client.out.p2(var6);
            }
        }
        if (var3 === 4) {
            const var12: ClientNpc | null = Client.npc[var6];
            if (var12 !== null) {
                Client.tryMove(1, 0, var12.routeZ[0], var12.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPNPC5);
                Client.out.p2_alt1(var6); // 464 op 43: u16LE
            }
        }
        if (var3 === 39) {
            Client.out.p1Enc(ClientProt.OPHELDT);
            // 464 op 163 (14B): LEShortA itemId, u16LE slot, u16 sentinel 0x7FFF, intME_B invIface,
            // u32LE spell (var6=itemId, var1=slot)
            Client.out.p2_alt3(var6);
            Client.out.p2_alt1(var1);
            Client.out.p2(0x7fff);
            Client.out.p1(var2 >> 16);
            Client.out.p1(var2 >> 24);
            Client.out.p1(var2);
            Client.out.p1(var2 >> 8);
            Client.out.p4_alt1(Client.targetSub);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 36) {
            Client.out.p1Enc(ClientProt.IF_BUTTON);
            Client.out.p4(var2);
            const var13: IfType = IfType.get(var2)!;
            if (var13.scripts !== null && var13.scripts[0]![0] === 5) {
                const var14: number = var13.scripts[0]![1];
                VarCache.var[var14] = 1 - VarCache.var[var14];
                Client.clientVar(var14);
            }
        }
        if (var3 === 1001) {
            const var15: IfType | null = IfType.get(var2);
            if (var15 === null || var15.linkObjNumber![var1] < 100000) {
                Client.out.p1Enc(ClientProt.OPOBJ6);
                Client.out.p2(var6); // 464 obj-examine 205: u16 BE (Java method207)
            } else {
                Client.addChat(var15.linkObjNumber![var1] + ' x ' + ObjType.list(var6).name, 0, '');
            }
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 1) {
            const var16: ClientPlayer | null = Client.players[var6];
            if (var16 !== null) {
                Client.tryMove(1, 0, var16.routeZ[0], var16.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossCycle = 0;
                Client.out.p1Enc(ClientProt.OPPLAYER7);
                Client.out.p2(var6); // 464 op 180: u16 BE
            }
        }
        if (var3 === 21) {
            Client.out.p1Enc(ClientProt.OPHELD4);
            // 464 op 86: u16LE slot, u16 itemId BE, intME_B iface (var1=slot, var6=itemId)
            Client.out.p2_alt1(var1);
            Client.out.p2(var6);
            Client.out.p1(var2 >> 16);
            Client.out.p1(var2 >> 24);
            Client.out.p1(var2);
            Client.out.p1(var2 >> 8);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 2) {
            Client.out.p1Enc(ClientProt.OPHELD3);
            // 464 op 159: u32LE iface, u16LE slot, u16LE itemId (var1=slot, var6=itemId)
            Client.out.p4_alt1(var2);
            Client.out.p2_alt1(var1);
            Client.out.p2_alt1(var6);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 35) {
            Client.interactWithLoc(var2, var4, var1);
            Client.out.p1Enc(ClientProt.OPLOC2);
            // 464 op 119: u16 x BE, LEShortA id, LEShortA y
            Client.out.p2(Client.mapBuildBaseX + var1);
            Client.out.p2_alt3(Number((BigInt(var4) >> 32n) & 0x7fffffffn));
            Client.out.p2_alt3(var2 + Client.mapBuildBaseZ);
        }
        if (var3 === 51) {
            Client.interactWithLoc(var2, var4, var1);
            Client.out.p1Enc(ClientProt.OPLOC3);
            // 464 op 120: u16 y BE, shortA id, shortA x
            Client.out.p2(var2 + Client.mapBuildBaseZ);
            const locId3: number = Number((BigInt(var4) >> 32n) & 0x7fffffffn);
            Client.out.p1(locId3 >> 8);
            Client.out.p1(locId3 + 128);
            Client.out.p1((var1 + Client.mapBuildBaseX) >> 8);
            Client.out.p1(var1 + Client.mapBuildBaseX + 128);
        }
        if (var3 === 29) {
            const var17: ClientPlayer | null = Client.players[var6];
            if (var17 !== null) {
                Client.tryMove(1, 0, var17.routeZ[0], var17.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPPLAYER3);
                Client.out.p2_alt1(var6); // 464 op 185 (follow): u16LE
            }
        }
        if (var3 === 48) {
            const var18: ClientNpc | null = Client.npc[var6];
            if (var18 !== null) {
                Client.tryMove(1, 0, var18.routeZ[0], var18.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossCycle = 0;
                Client.crossMode = 2;
                Client.out.p1Enc(ClientProt.OPNPCU);
                // 464 op 187 (10B): u32 iface BE, shortA npcIndex, u16 itemId BE, u16 itemSlot BE
                Client.out.p4(Client.objSelectedComId);
                Client.out.p1(var6 >> 8);
                Client.out.p1(var6 + 128);
                Client.out.p2(Client.objComId);
                Client.out.p2(Client.objSelectedSlot);
            }
        }
        if (var3 === 44) {
            // if3 inv option 4 → 464 OPHELD4 (86): u16LE slot, u16 itemId BE, intME_B iface
            Client.out.p1Enc(ClientProt.OPHELD4);
            Client.out.p2_alt1(var1);
            Client.out.p2(var6);
            Client.out.p1(var2 >> 16);
            Client.out.p1(var2 >> 24);
            Client.out.p1(var2);
            Client.out.p1(var2 >> 8);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 14) {
            Client.closeModal();
        }
        if (var3 === 17) {
            const var19: ClientNpc | null = Client.npc[var6];
            if (var19 !== null) {
                Client.tryMove(1, 0, var19.routeZ[0], var19.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossMode = 2;
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPNPC1);
                Client.out.p1(var6 >> 8); // npcIndex shortA
                Client.out.p1(var6 + 128);
            }
        }
        if (var3 === 57) {
            const var20: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var20) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossMode = 2;
            Client.crossCycle = 0;
            Client.out.p1Enc(ClientProt.OPOBJ4);
            // 464 op 216 (take): u16 objId BE, shortA y, LEShortA x
            Client.out.p2(var6);
            Client.out.p1((Client.mapBuildBaseZ + var2) >> 8);
            Client.out.p1(Client.mapBuildBaseZ + var2 + 128);
            Client.out.p2_alt3(var1 + Client.mapBuildBaseX);
        }
        if (var3 === 12) {
            Client.endTargetMode();
            const var22: IfType | null = IfType.get(var2);
            Client.useMode = 1;
            Client.objSelectedSlot = var1;
            Client.objSelectedComId = var2;
            Client.objComId = var6;
            Client.componentUpdated(var22);
            Client.objSelectedName = '<col=ff9040>' + ObjType.list(var6).name + '<col=ffffff>';
            if (Client.objSelectedName === null) {
                Client.objSelectedName = 'null';
            }
            return;
        }
        if (var3 === 23) {
            const var23: ClientPlayer | null = Client.players[var6];
            if (var23 !== null) {
                Client.tryMove(1, 0, var23.routeZ[0], var23.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.out.p1Enc(ClientProt.OPPLAYERT);
                // 464 op 123 (8B): u16LE childButton, LEShortA playerIndex, u32LE spellComponent
                Client.out.p2_alt1(Client.targetCom);
                Client.out.p2_alt3(var6);
                Client.out.p4_alt1(Client.targetSub);
            }
        }
        if (var3 === 6) {
            // if3 inv option 1 → 464 OPHELD1 (101): this server routes item options through the
            // op-held packets; if-button-option only fires interface scripts (no item logic).
            Client.out.p1Enc(ClientProt.OPHELD1);
            Client.out.p1(var2 >> 8);
            Client.out.p1(var2);
            Client.out.p1(var2 >> 24);
            Client.out.p1(var2 >> 16);
            Client.out.p2_alt1(var1);
            Client.out.p2_alt1(var6);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 10) {
            if (SkillshotOverlay.armedAbility !== 0 && SkillshotOverlay.isUnitTarget(SkillshotOverlay.armedAbility)) {
                // Armed UNIT-TARGET cast: the click fires at the hovered unit (no
                // ground tile involved); no hovered unit keeps the arm up. Never walks.
                SkillshotOverlay.fireUnitTarget();
            } else {
                World.updateMousePicking(Client.minusedlevel, var1, var2);
            }
        }
        if (var3 === 1004) {
            Client.interactWithLoc(var2, var4, var1);
            Client.out.p1Enc(ClientProt.OPLOC5);
            // 464 op 250: shortA y, u16 id BE, u16 x BE
            Client.out.p1((var2 + Client.mapBuildBaseZ) >> 8);
            Client.out.p1(var2 + Client.mapBuildBaseZ + 128);
            Client.out.p2(Number((BigInt(var4) >> 32n) & 0x7fffffffn));
            Client.out.p2(var1 + Client.mapBuildBaseX);
        }
        if (var3 === 43 || var3 === 1003) {
            Client.ifButtonX(var6, Client.menuSubject[arg0]!, var1, var2);
        }
        if (var3 === 3) {
            const var24: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var24) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossMode = 2;
            Client.crossCycle = 0;
            Client.out.p1Enc(ClientProt.OPOBJ5);
            // 464 op 216 (take): u16 objId BE, shortA y, LEShortA x
            Client.out.p2(var6);
            Client.out.p1((var2 + Client.mapBuildBaseZ) >> 8);
            Client.out.p1(var2 + Client.mapBuildBaseZ + 128);
            Client.out.p2_alt3(Client.mapBuildBaseX + var1);
        }
        if (var3 === 8) {
            // if3 inv option 2 (Wear/Wield) → 464 OPHELD2 (88): u32LE iface, u16LE itemId, LEShortA slot
            Client.out.p1Enc(ClientProt.OPHELD2);
            Client.out.p4_alt1(var2);
            Client.out.p2_alt1(var6);
            Client.out.p2_alt3(var1);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 13) {
            // if3 inv option 5 (Drop) → 464 OPHELD5 (220): shortA itemId, u16LE slot, u32 iface BE
            Client.out.p1Enc(ClientProt.OPHELD5);
            Client.out.p1(var6 >> 8);
            Client.out.p1(var6 + 128);
            Client.out.p2_alt1(var1);
            Client.out.p4(var2);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 41) {
            const var26: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var26) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossCycle = 0;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossMode = 2;
            Client.out.p1Enc(ClientProt.OPOBJ3);
            // 464 op 216 (take): u16 objId BE, shortA y, LEShortA x
            Client.out.p2(var6);
            Client.out.p1((var2 + Client.mapBuildBaseZ) >> 8);
            Client.out.p1(var2 + Client.mapBuildBaseZ + 128);
            Client.out.p2_alt3(var1 + Client.mapBuildBaseX);
        }
        if (var3 === 1002) {
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossCycle = 0;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossMode = 2;
            const var28: ClientNpc | null = Client.npc[var6];
            if (var28 !== null) {
                let var29: NpcType | null = var28.type!;
                if (var29.multinpc !== null) {
                    var29 = var29.getMultiNpc();
                }
                if (var29 !== null) {
                    Client.out.p1Enc(ClientProt.OPNPC6);
                    Client.out.p2_alt3(var29.id); // 464 npc-examine 176: LEShortA npc type id
                }
            }
        }
        if (var3 === 49) {
            // if3 inv option 3 → 464 OPHELD3 (159): u32LE iface, u16LE slot, u16LE itemId
            Client.out.p1Enc(ClientProt.OPHELD3);
            Client.out.p4_alt1(var2);
            Client.out.p2_alt1(var1);
            Client.out.p2_alt1(var6);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 26 && Client.interactWithLoc(var2, var4, var1)) {
            Client.out.p1Enc(ClientProt.OPLOCU);
            // 464 op 103 (14B): shortA locY, u16 itemSlot BE, LEShortA locX, intME_B iface,
            //   shortA itemId, u16LE locId
            Client.out.p1((Client.mapBuildBaseZ + var2) >> 8);
            Client.out.p1(Client.mapBuildBaseZ + var2 + 128);
            Client.out.p2(Client.objSelectedSlot);
            Client.out.p2_alt3(var1 + Client.mapBuildBaseX);
            Client.out.p1(Client.objSelectedComId >> 16);
            Client.out.p1(Client.objSelectedComId >> 24);
            Client.out.p1(Client.objSelectedComId);
            Client.out.p1(Client.objSelectedComId >> 8);
            Client.out.p1(Client.objComId >> 8);
            Client.out.p1(Client.objComId + 128);
            Client.out.p2_alt1(Number((BigInt(var4) >> 32n) & 0x7fffffffn));
        }
        if (var3 === 45) {
            const var30: ClientPlayer | null = Client.players[var6];
            if (var30 !== null) {
                Client.tryMove(1, 0, var30.routeZ[0], var30.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossMode = 2;
                Client.out.p1Enc(ClientProt.OPPLAYER4);
                Client.out.p2(var6); // 464 op 180: u16 BE
            }
        }
        if (var3 === 25) {
            const var31: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var31) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossMode = 2;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossCycle = 0;
            Client.out.p1Enc(ClientProt.OPOBJT);
            // 464 op 152 (14B): u32 spell BE, shortA x, LEShortA sp1(0), LEShortA itemId, shortA sp2(0), u16 y BE
            Client.out.p4(Client.targetSub);
            Client.out.p1((var1 + Client.mapBuildBaseX) >> 8);
            Client.out.p1(var1 + Client.mapBuildBaseX + 128);
            Client.out.p2_alt3(0);
            Client.out.p2_alt3(var6);
            Client.out.p1(0);
            Client.out.p1(128);
            Client.out.p2(var2 + Client.mapBuildBaseZ);
        }
        if (var3 === 22) {
            const var33: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var33) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossMode = 2;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossCycle = 0;
            Client.out.p1Enc(ClientProt.OPOBJ2);
            // 464 op 216 (take): u16 objId BE, shortA y, LEShortA x
            Client.out.p2(var6);
            Client.out.p1((Client.mapBuildBaseZ + var2) >> 8);
            Client.out.p1(Client.mapBuildBaseZ + var2 + 128);
            Client.out.p2_alt3(var1 + Client.mapBuildBaseX);
        }
        if (var3 === 38) {
            const var35: ClientNpc | null = Client.npc[var6];
            if (var35 !== null) {
                Client.tryMove(1, 0, var35.routeZ[0], var35.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossMode = 2;
                Client.crossCycle = 0;
                Client.out.p1Enc(ClientProt.OPNPC2);
                Client.out.p2_alt1(var6);
            }
        }
        if (var3 === 24 && Client.interactWithLoc(var2, var4, var1)) {
            Client.out.p1Enc(ClientProt.OPLOCT);
            // 464 op 207 (12B): LEShortA locY, LEShortA locX, u32LE spell, u16 locId BE, u16 sentinel
            Client.out.p2_alt3(Client.mapBuildBaseZ + var2);
            Client.out.p2_alt3(var1 + Client.mapBuildBaseX);
            Client.out.p4_alt1(Client.targetSub);
            Client.out.p2(Number((BigInt(var4) >> 32n) & 0x7fffffffn));
            Client.out.p2(0xffff);
        }
        if (var3 === 28) {
            Client.out.p1Enc(ClientProt.OPHELD1);
            // 464 op 101: intME_A iface, u16LE slot, u16LE itemId (var1=slot, var6=itemId)
            Client.out.p1(var2 >> 8);
            Client.out.p1(var2);
            Client.out.p1(var2 >> 24);
            Client.out.p1(var2 >> 16);
            Client.out.p2_alt1(var1);
            Client.out.p2_alt1(var6);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 20) {
            Client.out.p1Enc(ClientProt.IF_BUTTON);
            Client.out.p4(var2);
            const var36: IfType = IfType.get(var2)!;
            if (var36.scripts !== null && var36.scripts[0]![0] === 5) {
                const var37: number = var36.scripts[0]![1];
                if (var36.scriptOperand![0] !== VarCache.var[var37]) {
                    VarCache.var[var37] = var36.scriptOperand![0];
                    Client.clientVar(var37);
                }
            }
        }
        if (var3 === 18) {
            Client.out.p1Enc(ClientProt.OPHELD5);
            // 464 op 220: shortA itemId, u16LE slot, u32 iface BE (var6=itemId, var1=slot)
            Client.out.p1(var6 >> 8);
            Client.out.p1(var6 + 128);
            Client.out.p2_alt1(var1);
            Client.out.p4(var2);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 47 && Client.resumePauseCom === null) {
            Client.resumePauseButton(var1, var2);
            Client.resumePauseCom = IfType.get(var1, var2);
            Client.componentUpdated(Client.resumePauseCom);
        }
        if (var3 === 32) {
            const var38: ClientNpc | null = Client.npc[var6];
            if (var38 !== null) {
                Client.tryMove(1, 0, var38.routeZ[0], var38.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossMode = 2;
                Client.crossCycle = 0;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPNPC4);
                // 464 op 51: shortA
                Client.out.p1(var6 >> 8);
                Client.out.p1(var6 + 128);
            }
        }
        if (var3 === 33) {
            Client.interactWithLoc(var2, var4, var1);
            Client.out.p1Enc(ClientProt.OPLOC4);
            // 464 op 127: shortA id, shortA y, u16LE x
            const locId4: number = Number((BigInt(var4) >> 32n) & 0x7fffffffn);
            Client.out.p1(locId4 >> 8);
            Client.out.p1(locId4 + 128);
            Client.out.p1((var2 + Client.mapBuildBaseZ) >> 8);
            Client.out.p1(var2 + Client.mapBuildBaseZ + 128);
            Client.out.p2_alt1(Client.mapBuildBaseX + var1);
        }
        if (var3 === 11) {
            const var39: IfType = IfType.get(var2)!;
            let var40: boolean = true;
            if (var39.clientCode > 0) {
                var40 = Client.clientButton(var39);
            }
            if (var40) {
                Client.out.p1Enc(ClientProt.IF_BUTTON);
                Client.out.p4(var2);
            }
        }
        if (var3 === 9) {
            Client.out.p1Enc(ClientProt.OPHELD2);
            // 464 op 88: u32LE iface, u16LE itemId, LEShortA slot (var6=itemId, var1=slot!)
            Client.out.p4_alt1(var2);
            Client.out.p2_alt1(var6);
            Client.out.p2_alt3(var1);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 5) {
            const var41: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var41) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossCycle = 0;
            Client.crossMode = 2;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.out.p1Enc(ClientProt.OPOBJ1);
            // 464 op 216 (take): u16 objId BE, shortA y, LEShortA x
            Client.out.p2(var6);
            Client.out.p1((var2 + Client.mapBuildBaseZ) >> 8);
            Client.out.p1(var2 + Client.mapBuildBaseZ + 128);
            Client.out.p2_alt3(Client.mapBuildBaseX + var1);
        }
        if (var3 === 42) {
            Client.out.p1Enc(ClientProt.OPHELDU);
            // 464 op 166 (16B): u16LE usedSlot, u16 usedWithSlot BE, LEShortA usedWithId,
            //   intME_B usedIface, u32LE withIface, shortA usedId (var1=slot, var6=itemId)
            Client.out.p2_alt1(Client.objSelectedSlot);
            Client.out.p2(var1);
            Client.out.p2_alt3(var6);
            Client.out.p1(Client.objSelectedComId >> 16);
            Client.out.p1(Client.objSelectedComId >> 24);
            Client.out.p1(Client.objSelectedComId);
            Client.out.p1(Client.objSelectedComId >> 8);
            Client.out.p4_alt1(var2);
            Client.out.p1(Client.objComId >> 8);
            Client.out.p1(Client.objComId + 128);
            Client.selectedCycle = 0;
            Client.selectedCom = IfType.get(var2);
            Client.selectedItem = var1;
        }
        if (var3 === 37) {
            const var43: ClientPlayer | null = Client.players[var6];
            if (var43 !== null) {
                Client.tryMove(1, 0, var43.routeZ[0], var43.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossMode = 2;
                Client.out.p1Enc(ClientProt.OPPLAYER5);
                Client.out.p2(var6);
            }
        }
        if (var3 === 16) {
            const var44: ClientPlayer | null = Client.players[var6];
            if (var44 !== null) {
                Client.tryMove(1, 0, var44.routeZ[0], var44.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossMode = 2;
                Client.out.p1Enc(ClientProt.OPPLAYER6);
                Client.out.p2(var6); // 464 op 180: u16 BE
            }
        }
        if (var3 === 1005) {
            Client.crossMode = 2;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossCycle = 0;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.out.p1Enc(ClientProt.OPLOC6);
            Client.out.p2_alt2(var6); // 464 loc-examine 97: u16 BE shortA (Java method218)
        }
        if (var3 === 50) {
            const var45: ClientPlayer | null = Client.players[var6];
            if (var45 !== null) {
                Client.tryMove(1, 0, var45.routeZ[0], var45.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossMode = 2;
                Client.crossCycle = 0;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.out.p1Enc(ClientProt.OPPLAYER8);
                Client.out.p2(var6); // 464 op 180: u16 BE
            }
        }
        if (var3 === 19) {
            const var46: ClientNpc | null = Client.npc[var6];
            if (var46 !== null) {
                Client.tryMove(1, 0, var46.routeZ[0], var46.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                Client.crossCycle = 0;
                Client.crossX = ClientMouseListener.mouseClickX;
                Client.crossMode = 2;
                Client.crossY = ClientMouseListener.mouseClickY;
                Client.out.p1Enc(ClientProt.OPNPCT);
                // 464 op 69 (8B): u16 spellSlot BE (sentinel), u32 spellId BE, u16 npcIndex BE
                Client.out.p2(0xffff);
                Client.out.p4(Client.targetSub);
                Client.out.p2(var6);
            }
        }
        if (var3 === 46) {
            const var47: boolean = Client.tryMove(0, 0, var2, var1, Client.localPlayer!.routeX[0], 0, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            if (!var47) {
                Client.tryMove(1, 0, var2, var1, Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
            }
            Client.crossMode = 2;
            Client.crossCycle = 0;
            Client.crossY = ClientMouseListener.mouseClickY;
            Client.crossX = ClientMouseListener.mouseClickX;
            Client.out.p1Enc(ClientProt.OPOBJU);
            // 464 op 172 (14B): u16 x BE, u16 slot BE, u16 objType BE, u16 container BE,
            //   u16 widget BE, u16LE y, u16LE itemId
            Client.out.p2(Client.mapBuildBaseX + var1);
            Client.out.p2(Client.objSelectedSlot);
            Client.out.p2(var6);
            Client.out.p2(Client.objSelectedComId & 0xffff);
            Client.out.p2(Client.objSelectedComId >>> 16);
            Client.out.p2_alt1(Client.mapBuildBaseZ + var2);
            Client.out.p2_alt1(Client.objComId);
        }
        if (Client.useMode !== 0) {
            Client.useMode = 0;
            Client.componentUpdated(IfType.get(Client.objSelectedComId));
        }
        if (Client.targetMode) {
            Client.endTargetMode();
        }
        if (Client.selectedCom !== null && Client.selectedCycle === 0) {
            Client.componentUpdated(Client.selectedCom);
        }
    }

    // jag::oldscape::Client::OpPlayer
    static opPlayer(arg0: string, arg1: number): void {
        const var2 = JagString.fromLatin1String(arg0).toCleanUsername().toScreenName().toString();
        let var3 = false;
        for (let var4 = 0; var4 < Client.playerCount; var4++) {
            const var5 = Client.players[Client.playerIds[var4]];
            if (var5 !== null && var5.name !== null && var5.name.toLowerCase() === var2.toLowerCase()) {
                Client.tryMove(1, 0, var5.routeZ[0], var5.routeX[0], Client.localPlayer!.routeX[0], 1, 0, 2, false, 0, Client.localPlayer!.routeZ[0]);
                var3 = true;
                // server decodes 84 (attack) and 180 (generic option) as plain u16 BE
                if (arg1 === 1) {
                    Client.out.p1Enc(ClientProt.OPPLAYER1);
                    Client.out.p2(Client.playerIds[var4]);
                } else if (arg1 === 4) {
                    Client.out.p1Enc(ClientProt.OPPLAYER4);
                    Client.out.p2(Client.playerIds[var4]);
                } else if (arg1 === 6) {
                    Client.out.p1Enc(ClientProt.OPPLAYER6);
                    Client.out.p2(Client.playerIds[var4]);
                } else if (arg1 === 7) {
                    Client.out.p1Enc(ClientProt.OPPLAYER7);
                    Client.out.p2(Client.playerIds[var4]);
                }
                break;
            }
        }
        if (!var3) {
            Client.addChat(Text.unabletofind + var2, 0, '');
        }
    }

    // jag::oldscape::minimenu::Minimenu::EndTargetMode
    static endTargetMode(): void {
        if (!Client.targetMode) {
            return;
        }
        const var0 = IfType.get(Client.targetCom, Client.targetSub);
        if (var0 !== null && var0.ontargetleave !== null) {
            const var1 = new HookReq();
            var1.component = var0;
            var1.onop = var0.ontargetleave;
            ScriptRunner.executeScript(var1);
        }
        Client.targetMode = false;
        Client.componentUpdated(var0);
    }

    // jag::oldscape::Client::IfButtonX
    static ifButtonX(arg0: number, arg1: string, arg2: number, arg3: number): void {
        const var4: IfType | null = IfType.get(arg2, arg3);
        if (var4 === null) {
            return;
        }
        if (var4.onop !== null) {
            const var5: HookReq = new HookReq();
            var5.opindex = arg0;
            var5.component = var4;
            var5.onop = var4.onop;
            var5.opbase = arg1;
            ScriptRunner.executeScript(var5);
        }
        let var6: boolean = true;
        if (var4.clientCode > 0) {
            var6 = Client.clientButton(var4);
        }
        if (!var6 || !ServerActive.hasOp(arg0 - 1, Client.getActive(var4))) {
            return;
        }
        if (arg0 === 1) {
            Client.out.p1Enc(ClientProt.IF_BUTTON1);
            Client.out.p4(arg3);
            Client.out.p2(arg2);
        }
        if (arg0 === 2) {
            Client.out.p1Enc(ClientProt.IF_BUTTON2);
            Client.out.p4(arg3);
            Client.out.p2(arg2);
        }
        if (arg0 === 3) {
            Client.out.p1Enc(ClientProt.IF_BUTTON3);
            Client.out.p4(arg3);
            Client.out.p2(arg2);
        }
        if (arg0 === 4) {
            Client.out.p1Enc(ClientProt.IF_BUTTON4);
            Client.out.p4(arg3);
            Client.out.p2(arg2);
        }
        if (arg0 === 5) {
            Client.out.p1Enc(ClientProt.IF_BUTTON5);
            Client.out.p4(arg3);
            Client.out.p2(arg2);
        }
        // options 6-10: Java opcodes 210/148/104/9/28 are not in the server's size table
        // (-3 = swallow buffer) — sending them would poison the server stream. DO NOT SEND.
    }

    static addMenuOption(arg0: number, arg1: string, arg2: number, arg3: number | bigint, arg4: string, arg5: number): void {
        if (Client.isMenuOpen || Client.menuNumEntries >= 500) {
            return;
        }

        Client.menuVerb[Client.menuNumEntries] = arg1;
        Client.menuSubject[Client.menuNumEntries] = arg4;
        Client.menuAction[Client.menuNumEntries] = arg2;
        Client.menuParamA[Client.menuNumEntries] = arg3;
        Client.menuParamB[Client.menuNumEntries] = arg0;
        Client.menuParamC[Client.menuNumEntries] = arg5;
        Client.menuNumEntries++;
    }

    // jag::oldscape::minimenu::Minimenu::GetLine
    static getLine(arg0: number): string {
        return Client.menuSubject[arg0]!.length <= 0 ? Client.menuVerb[arg0]! : JagString.join([JagString.wrap(Client.menuVerb[arg0]!), JagString.wrap(Text.miniseperator), JagString.wrap(Client.menuSubject[arg0]!)]).toString();
    }

    static minimenuBuildSceneActions(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        // MOBA: mark the SCENE-row range for the League click scheme (mouseLoop) —
        // rows in [sceneRowStart, sceneRowEnd) are world rows (walk-here/entity ops).
        Client.sceneRowStart = Client.menuNumEntries;
        // MOBA: the ground tile behind the ability bar / HUD grid must not offer
        // "Walk here" — their own menu rows are the action (Java's GroundDecoration guard).
        if (Client.useMode === 0 && !Client.targetMode && !AbilityBarOverlay.mouseOverBar(arg5, arg0) && !HudPanelOverlay.mouseOverGrid(arg5, arg0)) {
            const var6: number = Client.scenePickMinX;
            const var7: number = Client.scenePickMaxX;
            const var8: number = Client.scenePickMinY;
            const var9: number = Client.scenePickMaxY;
            if (arg2 === 0) {
                throw new Error();
            }
            const var10: number = (var8 + ((((var9 - var8) * (arg0 - arg4)) / arg2) | 0)) | 0;
            if (arg3 === 0) {
                throw new Error();
            }
            const var11: number = (var6 + ((((var7 - var6) * (arg5 - arg1)) / arg3) | 0)) | 0;
            Client.addMenuOption(var11, Client.moveAction, 10, 0, '', var10);
        }

        let var12: SceneTag = -1;
        for (let var14: number = 0; var14 < SoftwareModelLit.pickedCount; var14++) {
            const var15: SceneTag = SoftwareModelLit.pickedEntityTypecode[var14];
            const var17: number = Number(BigInt.asIntN(32, BigInt(var15))) & 0x7f;
            const var18: number = (Number(BigInt.asIntN(32, BigInt(var15))) >> 7) & 0x7f;
            const var19: number = (Number(BigInt.asIntN(32, BigInt(var15))) >> 29) & 0x3;
            const var20: number = Number((BigInt(var15) >> 32n) & 0x7fffffffn);
            if (var15 !== var12) {
                var12 = var15;
                if (var19 === 2 && World.method1386(Client.minusedlevel, var17, var18, var15)) {
                    let var21: LocType | null = LocType.list(var20);
                    if (var21.multiloc !== null) {
                        var21 = var21.getMultiLoc();
                    }
                    if (var21 === null) {
                        continue;
                    }
                    if (Client.useMode === 1) {
                        Client.addMenuOption(var17, Text.use, 26, var15, Client.objSelectedName! + ' -> <col=00ffff>' + var21.name, var18);
                    } else if (!Client.targetMode) {
                        let var22 = var21.op;
                        if (Client.showOpIndex) {
                            var22 = Client.prependOpIndex(var22);
                        }
                        if (var22 !== null) {
                            for (let var23: number = 4; var23 >= 0; var23--) {
                                if (var22[var23] !== null) {
                                    let var24: number = 0;
                                    if (var23 === 0) {
                                        var24 = 7;
                                    }
                                    if (var23 === 1) {
                                        var24 = 35;
                                    }
                                    if (var23 === 2) {
                                        var24 = 51;
                                    }
                                    if (var23 === 3) {
                                        var24 = 33;
                                    }
                                    if (var23 === 4) {
                                        var24 = 1004;
                                    }
                                    Client.addMenuOption(var17, var22[var23]!, var24, var15, '<col=00ffff>' + var21.name, var18);
                                }
                            }
                        }
                        Client.addMenuOption(var17, Text.examine, 1005, var21.id, '<col=00ffff>' + var21.name, var18);
                    } else if ((Client.targetMask & 0x4) === 4) {
                        Client.addMenuOption(var17, Client.targetVerb!, 24, var15, Client.targetOp! + ' -> <col=00ffff>' + var21.name, var18);
                    }
                }
                if (var19 === 1) {
                    const var25: ClientNpc = Client.npc[var20]!;
                    if (var25.type!.size === 1 && (var25.x & 0x7f) === 64 && (var25.z & 0x7f) === 64) {
                        for (let var26: number = 0; var26 < Client.npcCount; var26++) {
                            const var27: ClientNpc | null = Client.npc[Client.npcIds[var26]];
                            if (var27 !== null && var25 !== var27 && var27.type!.size === 1 && var25.x === var27.x && var25.z === var27.z) {
                                Client.addNpcOptions(var27.type!, Client.npcIds[var26], var18, var17);
                            }
                        }
                        for (let var28: number = 0; var28 < Client.playerCount; var28++) {
                            const var29: ClientPlayer | null = Client.players[Client.playerIds[var28]];
                            if (var29 !== null && var25.x === var29.x && var29.z === var25.z) {
                                Client.addPlayerOptions(Client.playerIds[var28], var17, var18, var29);
                            }
                        }
                    }
                    Client.addNpcOptions(var25.type!, var20, var18, var17);
                }
                if (var19 === 0) {
                    const var30: ClientPlayer = Client.players[var20]!;
                    if ((var30.x & 0x7f) === 64 && (var30.z & 0x7f) === 64) {
                        for (let var31: number = 0; var31 < Client.npcCount; var31++) {
                            const var32: ClientNpc | null = Client.npc[Client.npcIds[var31]];
                            if (var32 !== null && var32.type!.size === 1 && var32.x === var30.x && var32.z === var30.z) {
                                Client.addNpcOptions(var32.type!, Client.npcIds[var31], var18, var17);
                            }
                        }
                        for (let var33: number = 0; var33 < Client.playerCount; var33++) {
                            const var34: ClientPlayer | null = Client.players[Client.playerIds[var33]];
                            if (var34 !== null && var34 !== var30 && var34.x === var30.x && var34.z === var30.z) {
                                Client.addPlayerOptions(Client.playerIds[var33], var17, var18, var34);
                            }
                        }
                    }
                    Client.addPlayerOptions(var20, var17, var18, var30);
                }
                if (var19 === 3) {
                    const var35 = Client.groundObj[Client.minusedlevel][var17][var18];
                    if (var35 !== null) {
                        for (let var36: ClientObjNode | null = var35.tail(); var36 !== null; var36 = var35.prev()) {
                            const var37: number = var36.obj.id;
                            const var38: ObjType = ObjType.list(var37);
                            if (Client.useMode === 1) {
                                Client.addMenuOption(var17, Text.use, 46, var37, Client.objSelectedName! + ' -> <col=ff9040>' + var38.name, var18);
                            } else if (!Client.targetMode) {
                                let var39 = var38.op;
                                if (Client.showOpIndex) {
                                    var39 = Client.prependOpIndex(var39);
                                }
                                for (let var40: number = 4; var40 >= 0; var40--) {
                                    if (var39 !== null && var39[var40] !== null) {
                                        let var41: number = 0;
                                        if (var40 === 0) {
                                            var41 = 5;
                                        }
                                        if (var40 === 1) {
                                            var41 = 22;
                                        }
                                        if (var40 === 2) {
                                            var41 = 41;
                                        }
                                        if (var40 === 3) {
                                            var41 = 57;
                                        }
                                        if (var40 === 4) {
                                            var41 = 3;
                                        }
                                        Client.addMenuOption(var17, var39[var40]!, var41, var37, '<col=ff9040>' + var38.name, var18);
                                    } else if (var40 === 2) {
                                        Client.addMenuOption(var17, Text.take, 41, var37, '<col=ff9040>' + var38.name, var18);
                                    }
                                }
                                Client.addMenuOption(var17, Text.examine, 1006, var37, '<col=ff9040>' + var38.name, var18);
                            } else if ((Client.targetMask & 0x1) === 1) {
                                Client.addMenuOption(var17, Client.targetVerb!, 25, var37, Client.targetOp! + ' -> <col=ff9040>' + var38.name, var18);
                            }
                        }
                    }
                }
            }
        }
    }

    // jag::oldscape::minimenu::Minimenu::AddNpcOptions
    static addNpcOptions(arg0: NpcType, arg1: number, arg2: number, arg3: number): void {
        if (Client.menuNumEntries >= 400) {
            return;
        }
        if (arg0.multinpc !== null) {
            arg0 = arg0.getMultiNpc()!;
        }
        if (arg0 === null || !arg0.active) {
            return;
        }
        let var4: string | null = arg0.name;
        if (arg0.vislevel !== 0) {
            var4 = var4 + Client.combatColourCode(arg0.vislevel, Client.localPlayer!.combatLevel) + ' (' + Text.level + arg0.vislevel + ')';
        }
        if (Client.useMode === 1) {
            Client.addMenuOption(arg3, Text.use, 48, arg1, Client.objSelectedName! + ' -> <col=ffff00>' + var4, arg2);
        } else if (!Client.targetMode) {
            let var5 = arg0.op;
            if (Client.showOpIndex) {
                var5 = Client.prependOpIndex(var5);
            }
            if (var5 !== null) {
                for (let var6: number = 4; var6 >= 0; var6--) {
                    if (var5[var6] !== null && (Client.modegame !== 0 || var5[var6]!.toLowerCase() !== Text.attack.toLowerCase())) {
                        let var7: number = 0;
                        if (var6 === 0) {
                            var7 = 17;
                        }
                        if (var6 === 1) {
                            var7 = 38;
                        }
                        if (var6 === 2) {
                            var7 = 34;
                        }
                        if (var6 === 3) {
                            var7 = 32;
                        }
                        if (var6 === 4) {
                            var7 = 4;
                        }
                        Client.addMenuOption(arg3, var5[var6]!, var7, arg1, '<col=ffff00>' + var4, arg2);
                    }
                }
            }
            if (Client.modegame === 0 && var5 !== null) {
                for (let var8: number = 4; var8 >= 0; var8--) {
                    if (var5[var8] !== null && var5[var8]!.toLowerCase() === Text.attack.toLowerCase()) {
                        let var9: number = 0;
                        if (arg0.vislevel > Client.localPlayer!.combatLevel) {
                            var9 = 2000;
                        }
                        let var10: number = 0;
                        if (var8 === 0) {
                            var10 = 17;
                        }
                        if (var8 === 1) {
                            var10 = 38;
                        }
                        if (var8 === 2) {
                            var10 = 34;
                        }
                        if (var8 === 3) {
                            var10 = 32;
                        }
                        if (var8 === 4) {
                            var10 = 4;
                        }
                        if (var10 !== 0) {
                            var10 += var9;
                        }
                        Client.addMenuOption(arg3, var5[var8]!, var10, arg1, '<col=ffff00>' + var4, arg2);
                    }
                }
            }
            Client.addMenuOption(arg3, Text.examine, 1002, arg1, '<col=ffff00>' + var4, arg2);
        } else if ((Client.targetMask & 0x2) === 2) {
            Client.addMenuOption(arg3, Client.targetVerb!, 19, arg1, Client.targetOp! + ' -> <col=ffff00>' + var4, arg2);
        }
    }

    // jag::oldscape::minimenu::Minimenu::AddPlayerOptions
    static addPlayerOptions(arg0: number, arg1: number, arg2: number, arg3: ClientPlayer): void {
        if (arg3 === Client.localPlayer || Client.menuNumEntries >= 400) {
            return;
        }

        let var4: string;
        if (arg3.skillLevel === 0) {
            var4 = arg3.name + Client.combatColourCode(arg3.combatLevel, Client.localPlayer!.combatLevel) + ' (' + Text.level + arg3.combatLevel + ')';
        } else {
            var4 = arg3.name + ' (' + Text.skill + arg3.skillLevel + ')';
        }

        if (Client.useMode === 1) {
            Client.addMenuOption(arg1, Text.use, 31, arg0, Client.objSelectedName! + ' -> <col=ffffff>' + var4, arg2);
        } else if (!Client.targetMode) {
            for (let var5 = 7; var5 >= 0; var5--) {
                if (Client.playerOp[var5] !== null) {
                    let var6 = 0;
                    if (Client.modegame === 0 && Client.playerOp[var5]!.toLowerCase() === Text.attack.toLowerCase()) {
                        if (arg3.combatLevel > Client.localPlayer!.combatLevel) {
                            var6 = 2000;
                        }
                        if (Client.localPlayer!.team !== 0 && arg3.team !== 0) {
                            if (arg3.team === Client.localPlayer!.team) {
                                var6 = 2000;
                            } else {
                                var6 = 0;
                            }
                        }
                    } else if (Client.playerOpPriority[var5]) {
                        var6 = 2000;
                    }
                    const var7 = Client.MENUACTION_PLAYER[var5];
                    const var8 = var7 + var6;
                    Client.addMenuOption(arg1, Client.playerOp[var5]!, var8, arg0, '<col=ffffff>' + var4, arg2);
                }
            }
        } else if ((Client.targetMask & 0x8) === 8) {
            Client.addMenuOption(arg1, Client.targetVerb!, 23, arg0, Client.targetOp! + ' -> <col=ffffff>' + var4, arg2);
        }

        for (let var9 = 0; var9 < Client.menuNumEntries; var9++) {
            if (Client.menuAction[var9] === 10) {
                Client.menuSubject[var9] = '<col=ffffff>' + var4;
                return;
            }
        }
    }

    // jag::oldscape::minimenu::Minimenu::AddComponent
    static addComponentOptions(arg0: number, arg1: number, arg2: IfType): void {
        if (arg2.buttonType === 1) {
            Client.addMenuOption(0, arg2.buttonText!, 11, 0, '', arg2.parentId);
        }
        if (arg2.buttonType === 2 && !Client.targetMode) {
            const var3: string | null = Client.getTargetVerb(arg2);
            if (var3 !== null) {
                Client.addMenuOption(-1, var3, 15, 0, '<col=00ff00>' + arg2.targetBase!, arg2.parentId);
            }
        }
        if (arg2.buttonType === 3) {
            Client.addMenuOption(0, Text.close, 14, 0, '', arg2.parentId);
        }
        if (arg2.buttonType === 4) {
            Client.addMenuOption(0, arg2.buttonText!, 36, 0, '', arg2.parentId);
        }
        if (arg2.buttonType === 5) {
            Client.addMenuOption(0, arg2.buttonText!, 20, 0, '', arg2.parentId);
        }
        if (arg2.buttonType === 6 && Client.resumePauseCom === null) {
            Client.addMenuOption(-1, arg2.buttonText!, 47, 0, '', arg2.parentId);
        }
        if (arg2.type === 2) {
            let var4: number = 0;
            for (let var5: number = 0; var5 < arg2.height; var5++) {
                for (let var6: number = 0; var6 < arg2.width; var6++) {
                    let var7: number = (arg2.marginY + 32) * var5;
                    let var8: number = (arg2.marginX + 32) * var6;
                    if (var4 < 20) {
                        var7 += arg2.invBackgroundY![var4];
                        var8 += arg2.invBackgroundX![var4];
                    }
                    if (arg1 >= var8 && arg0 >= var7 && var8 + 32 > arg1 && var7 + 32 > arg0) {
                        Client.hoveredSlotCom = arg2;
                        Client.hoveredSlot = var4;
                        if (arg2.linkObjType![var4] > 0) {
                            const var9: ObjType = ObjType.list(arg2.linkObjType![var4] - 1);
                            if (Client.useMode === 1 && ServerActive.isObjOpsEnabled(Client.getActive(arg2))) {
                                if (Client.objSelectedComId !== arg2.parentId || var4 !== Client.objSelectedSlot) {
                                    Client.addMenuOption(var4, Text.use, 42, var9.id, Client.objSelectedName! + ' -> <col=ff9040>' + var9.name, arg2.parentId);
                                }
                            } else if (!Client.targetMode || !ServerActive.isObjOpsEnabled(Client.getActive(arg2))) {
                                let var10 = var9.iop;
                                if (Client.showOpIndex) {
                                    var10 = Client.prependOpIndex(var10);
                                }
                                if (ServerActive.isObjOpsEnabled(Client.getActive(arg2))) {
                                    for (let var11: number = 4; var11 >= 3; var11--) {
                                        if (var10 !== null && var10[var11] !== null) {
                                            let var12: number;
                                            if (var11 === 3) {
                                                var12 = 21;
                                            } else {
                                                var12 = 18;
                                            }
                                            Client.addMenuOption(var4, var10[var11]!, var12, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                                        } else if (var11 === 4) {
                                            Client.addMenuOption(var4, Text.drop, 18, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                                        }
                                    }
                                }
                                if (ServerActive.isObjUseEnabled(Client.getActive(arg2))) {
                                    Client.addMenuOption(var4, Text.use, 12, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                                }
                                if (ServerActive.isObjOpsEnabled(Client.getActive(arg2)) && var10 !== null) {
                                    for (let var13: number = 2; var13 >= 0; var13--) {
                                        if (var10[var13] !== null) {
                                            let var14: number = 0;
                                            if (var13 === 0) {
                                                var14 = 28;
                                            }
                                            if (var13 === 1) {
                                                var14 = 9;
                                            }
                                            if (var13 === 2) {
                                                var14 = 2;
                                            }
                                            Client.addMenuOption(var4, var10[var13]!, var14, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                                        }
                                    }
                                }
                                let var15 = arg2.iop;
                                if (Client.showOpIndex) {
                                    var15 = Client.prependOpIndex(var15);
                                }
                                if (var15 !== null) {
                                    for (let var16: number = 4; var16 >= 0; var16--) {
                                        if (var15[var16] !== null) {
                                            let var17: number = 0;
                                            if (var16 === 0) {
                                                var17 = 6;
                                            }
                                            if (var16 === 1) {
                                                var17 = 8;
                                            }
                                            if (var16 === 2) {
                                                var17 = 49;
                                            }
                                            if (var16 === 3) {
                                                var17 = 44;
                                            }
                                            if (var16 === 4) {
                                                var17 = 13;
                                            }
                                            Client.addMenuOption(var4, var15[var16]!, var17, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                                        }
                                    }
                                }
                                Client.addMenuOption(var4, Text.examine, 1001, var9.id, '<col=ff9040>' + var9.name, arg2.parentId);
                            } else if ((Client.targetMask & 0x10) === 16) {
                                Client.addMenuOption(var4, Client.targetVerb!, 39, var9.id, Client.targetOp! + ' -> <col=ff9040>' + var9.name, arg2.parentId);
                            }
                        }
                    }
                    var4++;
                }
            }
        }
        if (arg2.v3) {
            if (!Client.targetMode) {
                for (let var18: number = 9; var18 >= 5; var18--) {
                    const var19: string | null = Client.getIfTypeOpName(arg2, var18);
                    if (var19 !== null) {
                        Client.addMenuOption(arg2.subId, var19, 1003, var18 + 1, arg2.baseOpName!, arg2.parentId);
                    }
                }
                const var20: string | null = Client.getTargetVerb(arg2);
                if (var20 !== null) {
                    Client.addMenuOption(arg2.subId, var20, 15, 0, arg2.baseOpName!, arg2.parentId);
                }
                for (let var21: number = 4; var21 >= 0; var21--) {
                    const var22: string | null = Client.getIfTypeOpName(arg2, var21);
                    if (var22 !== null) {
                        Client.addMenuOption(arg2.subId, var22, 43, var21 + 1, arg2.baseOpName!, arg2.parentId);
                    }
                }
                if (ServerActive.pauseButton(Client.getActive(arg2))) {
                    Client.addMenuOption(arg2.subId, Text.continu, 47, 0, '', arg2.parentId);
                }
            } else if (ServerActive.isUseTarget(Client.getActive(arg2)) && (Client.targetMask & 0x20) === 32) {
                Client.addMenuOption(arg2.subId, Client.targetVerb!, 40, 0, Client.targetOp! + ' -> ' + arg2.baseOpName!, arg2.parentId);
            }
        }
    }

    // jag::oldscape::Client::DrawInterface
    drawInterface(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number): boolean {
        const id: number = arg1;
        if (!IfType.openInterface(id)) {
            if (arg3 === -1) {
                Client.componentDirtyArea.fill(true);
            } else {
                Client.componentDirtyArea[arg3] = true;
            }
            return false;
        }
        if (arg2 === 0 && arg4 === 0 && arg5 === 0 && arg6 === 0) {
            Client.computeInterfaceLayout(arg7, id, arg0, false);
        }
        Client.componentDrawTime = Client.loopCycle;
        if (arg3 === 0) {
            Client.componentDrawCount = 0;
        }

        Client.dragChildren = null;
        let ready: boolean = this.drawLayer(IfType.list[id], arg5, arg2, arg3, arg0, arg6, arg4, -1, arg7);
        if (Client.dragChildren !== null) {
            ready = this.drawLayer(Client.dragChildren, arg5, arg2, arg3, arg0, Client.dragChildX, Client.dragChildY, -1412584499, arg7) && ready;
            Client.dragChildren = null;
        }
        return ready;
    }

    // jag::oldscape::Client::DrawLayer
    drawLayer(components: IfType[], clipLeft: number, clipTop: number, drawSlotArg: number, clipBottom: number, x: number, y: number, layerId: number, clipRight: number): boolean {
        Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
        Pix3D.setRenderClipping();
        let ready: boolean = true;

        for (let childIndex: number = 0; childIndex < components.length; childIndex++) {
            const child = components[childIndex];
            if (!child || (child.layerId !== layerId && !(layerId === -1412584499 && child === Client.dragCom))) {
                continue;
            }
            if (child.renderWidth === 0 && child.width !== 0) {
                child.renderWidth = child.width;
            }
            if (child.renderHeight === 0 && child.height !== 0) {
                child.renderHeight = child.height;
            }
            if (child.v3 && Client.hide(child)) {
                continue;
            }

            if (child.clientCode > 0) {
                Client.clientComponent(child);
            }

            let childX: number = x + child.renderX;
            let childY: number = y + child.renderY;
            let drawSlot: number = drawSlotArg;
            if (drawSlotArg === -1) {
                Client.componentDrawX[Client.componentDrawCount] = childX;
                Client.componentDrawY[Client.componentDrawCount] = childY;
                Client.componentDrawWidth[Client.componentDrawCount] = child.renderWidth;
                Client.componentDrawHeight[Client.componentDrawCount] = child.renderHeight;
                drawSlot = Client.componentDrawCount++;
            }
            child.drawTime = Client.loopCycle;
            child.drawCount = drawSlot;

            let trans: number = child.trans;
            if (Client.qaOpTest && (Client.getActive(child) !== 0 || child.type === 0) && trans > 127) {
                trans = 127;
            }
            if (Client.dragCom === child) {
                if (layerId !== -1412584499 && !child.draggablebehavior) {
                    Client.dragChildY = y;
                    Client.dragChildren = components;
                    Client.dragChildX = x;
                    continue;
                }
                if (!child.draggablebehavior) {
                    trans = 128;
                }
                if (Client.dragAlive && Client.dragging) {
                    let dragX: number = ClientMouseListener.mouseX - Client.dragPickupX;
                    if (Client.dragParentX > dragX) {
                        dragX = Client.dragParentX;
                    }
                    if (Client.dragLayer!.renderWidth + Client.dragParentX < child.renderWidth + dragX) {
                        dragX = Client.dragParentX + Client.dragLayer!.renderWidth - child.renderWidth;
                    }
                    childX = dragX;
                    let dragY: number = ClientMouseListener.mouseY - Client.dragPickupY;
                    if (Client.dragParentY > dragY) {
                        dragY = Client.dragParentY;
                    }
                    if (dragY + child.renderHeight > Client.dragParentY + Client.dragLayer!.renderHeight) {
                        dragY = Client.dragLayer!.renderHeight + Client.dragParentY - child.renderHeight;
                    }
                    childY = dragY;
                }
            }

            let childClipTop: number;
            let childClipRight: number;
            let childClipBottom: number;
            let childClipLeft: number;
            if (child.type === 2) {
                childClipTop = clipTop;
                childClipRight = clipRight;
                childClipBottom = clipBottom;
                childClipLeft = clipLeft;
            } else {
                childClipTop = childY <= clipTop ? clipTop : childY;
                childClipLeft = clipLeft >= childX ? clipLeft : childX;
                let childRight = child.renderWidth + childX;
                let childBottom = childY + child.renderHeight;
                if (child.type === 9) {
                    childRight++;
                    childBottom++;
                }
                childClipBottom = childBottom >= clipBottom ? clipBottom : childBottom;
                childClipRight = clipRight <= childRight ? clipRight : childRight;
            }
            if (child.v3 && (childClipLeft >= childClipRight || childClipTop >= childClipBottom)) {
                continue;
            }
            if (child.parentId === (548 << 16) + 82) {
                // MOBA HUD: bevelled cell marks under the six inventory slots (the
                // stock com_83 panel art is parked in non-FIXED mode).
                HudPanelOverlay.renderBacking();
            }
            if (child.clientCode === 1337) {
                Client.menuMouseY = childX;
                Client.menuMouseX = childY;
                // capture the 3D viewport rect for the mousewheel-zoom hit test (QoL)
                Client.viewportX = childX;
                Client.viewportY = childY;
                Client.viewportW = child.renderWidth;
                Client.viewportH = child.renderHeight;
                this.gameDrawMain(child.renderWidth, childX, child.renderHeight, childY);
                Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                continue;
            }
            if (child.clientCode === 1338) {
                // 464: this single hook draws frame + map circle + compass (Java method679);
                // the 465 ct-1338 layer has no graphic so the rev-500 mask gate never fires.
                try {
                    if (Client.loopCycle % 500 === 0 && (Client.mapback === null || Client.field2010 === null)) {
                        console.log('[dbg] minimap skip: mapback=' + (Client.mapback !== null) + ' field2010=' + (Client.field2010 !== null));
                    }
                    // mapback is loaded during boot (name tables are gone by now)
                    if (Client.mapback !== null && Client.field2010 !== null) {
                        Pix2D.setClipping(childX, childY, childX + Client.mapbackCw, childY + Client.mapbackCh);
                        Client.mapback.scanlinePlotSprite(childX, childY, Client.mapbackFullOffsets!, Client.mapbackFullLengths!);
                        this.minimapDraw(Client.mapMaskCom!, child.drawCount, childX + 25, childY + 5);
                        Pix2D.setClipping(childX, childY, childX + 33, childY + 33);
                        Client.drawCompass(child.drawCount, childX, childY, Client.compassMaskCom!);
                    }
                } catch (e) {
                    if (Client.loopCycle % 100 === 0) {
                        console.log('[dbg] minimap draw error: ' + (e as Error).message + ' @ ' + (((e as Error).stack ?? '').split('\n')[1] ?? '').trim());
                    }
                }
                Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                continue;
            }
            if (child.clientCode === 1339) {
                if (child.calculateGraphicMask()) {
                    Client.drawCompass(child.drawCount, childX, childY, child);
                    Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                }
                continue;
            }
            if (child.clientCode === 1400) {
                // WorldMap.draw(child.renderWidth, child.renderHeight, childX, childY);
                // Client.componentDirtyArea[drawSlot] = true;
                // Client.componentBlitArea[drawSlot] = true;
                // Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                continue;
            }
            if (child.clientCode === 1401) {
                // WorldMap.drawOverview(childY, childX, child.renderWidth, child.renderHeight);
                // Client.componentDirtyArea[drawSlot] = true;
                // Client.componentBlitArea[drawSlot] = true;
                // Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                continue;
            }

            const mouseX = ClientMouseListener.mouseX;
            if (child.type === 0 && child.noClickThrough && childClipLeft <= mouseX && ClientMouseListener.mouseY >= childClipTop && childClipRight > mouseX && ClientMouseListener.mouseY < childClipBottom && !Client.isMenuOpen && !Client.qaOpTest) {
                Client.menuNumEntries = 1;
                Client.menuVerb[0] = Text.cancel;
                Client.menuSubject[0] = '';
                Client.menuAction[0] = 1007;
                Client.sceneRowEnd = 0; // scene rows wiped — invalidate the League-click range
            }
            const mouseY = ClientMouseListener.mouseY;
            if (!Client.isMenuOpen && mouseX >= childClipLeft && mouseY >= childClipTop && mouseX < childClipRight && childClipBottom > mouseY) {
                Client.addComponentOptions(mouseY - childY, mouseX - childX, child);
            }

            if (child.type === 0) {
                if (!child.v3 && Client.hide(child) && child !== Client.overCom) {
                    continue;
                }

                if (!child.v3) {
                    if (child.scrollPosY > child.scrollHeight - child.renderHeight) {
                        child.scrollPosY = child.scrollHeight - child.renderHeight;
                    }

                    if (child.scrollPosY < 0) {
                        child.scrollPosY = 0;
                    }
                }

                ready = this.drawLayer(components, childClipLeft, childClipTop, drawSlot, childClipBottom, childX - child.scrollPosX, childY - child.scrollPosY, child.parentId, childClipRight) && ready;
                const subcomponents = (child as IfType & { subcomponents?: IfType[] | null }).subcomponents;
                if (subcomponents) {
                    ready = this.drawLayer(subcomponents, childClipLeft, childClipTop, drawSlot, childClipBottom, childX - child.scrollPosX, childY - child.scrollPosY, child.parentId, childClipRight) && ready;
                }
                const sub = Client.subinterfaces.find(BigInt(child.parentId));
                if (sub !== null) {
                    if (
                        sub.type === 0 &&
                        childClipLeft <= ClientMouseListener.mouseX &&
                        childClipTop <= ClientMouseListener.mouseY &&
                        ClientMouseListener.mouseX < childClipRight &&
                        ClientMouseListener.mouseY < childClipBottom &&
                        !Client.isMenuOpen &&
                        !Client.qaOpTest
                    ) {
                        Client.menuNumEntries = 1;
                        Client.menuVerb[0] = Text.cancel;
                        Client.menuSubject[0] = '';
                        Client.menuAction[0] = 1007;
                        Client.sceneRowEnd = 0; // scene rows wiped — invalidate the League-click range
                    }
                    ready = this.drawInterface(childClipBottom, sub.id, childClipTop, drawSlot, childY, childClipLeft, childX, childClipRight) && ready;
                }
                Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                Pix3D.setRenderClipping();
            }
            if (Client.componentRedraw[drawSlot] || Client.componentRectDebug > 1) {
                if (child.type === 0 && !child.v3 && child.renderHeight < child.scrollHeight) {
                    Client.drawScrollbar(child.scrollPosY, child.renderHeight, childY, child.scrollHeight, childX + child.renderWidth);
                }
                if (child.type !== 1) {
                    if (child.type === 2) {
                        let slot: number = 0;

                        for (let row: number = 0; row < child.height; row++) {
                            for (let col: number = 0; col < child.width; col++) {
                                let slotX: number = childX + col * (child.marginX + 32);
                                let slotY: number = childY + row * (child.marginY + 32);

                                if (slot < 20) {
                                    slotX += child.invBackgroundX![slot];
                                    slotY += child.invBackgroundY![slot];
                                }

                                if (child.linkObjType![slot] > 0) {
                                    let dx: number = 0;
                                    let dy: number = 0;
                                    const id: number = child.linkObjType![slot] - 1;

                                    if ((slotX > Pix2D.clipMinX - 32 && slotX < Pix2D.clipMaxX && slotY > Pix2D.clipMinY - 32 && slotY < Pix2D.clipMaxY) || (Client.objDragCom === child && Client.objDragSlot === slot)) {
                                        let outline = 1;
                                        let shadow = 3153952;
                                        if (Client.useMode == 1 && Client.objSelectedSlot == slot && Client.objSelectedComId == child.parentId) {
                                            outline = 2;
                                            shadow = 0;
                                        }

                                        const icon: Pix32 | null = ObjType.getSprite(outline, id, child.linkObjNumber![slot], child.showCount, shadow);
                                        if (Pix3D.textureFallback) {
                                            Client.componentDirtyArea[drawSlot] = true;
                                        }
                                        if (icon) {
                                            if (Client.objDragCom === child && Client.objDragSlot === slot) {
                                                dx = ClientMouseListener.mouseX - Client.objGrabX;
                                                dy = ClientMouseListener.mouseY - Client.objGrabY;

                                                if (dx < 5 && dx > -5) {
                                                    dx = 0;
                                                }

                                                if (dy < 5 && dy > -5) {
                                                    dy = 0;
                                                }

                                                if (Client.objDragCycles < 5) {
                                                    dx = 0;
                                                    dy = 0;
                                                }

                                                icon.transPlotSprite(slotX + dx, slotY + dy, 128);

                                                if (layerId !== -1) {
                                                    const parentLayer = components[layerId & 0xffff];
                                                    if (parentLayer && slotY + dy < Pix2D.clipMinY && parentLayer.scrollPosY > 0) {
                                                        let autoscroll = (((Pix2D.clipMinY - slotY - dy) * Client.worldUpdateNum) / 3) | 0;
                                                        if (autoscroll > Client.worldUpdateNum * 10) {
                                                            autoscroll = Client.worldUpdateNum * 10;
                                                        }

                                                        if (autoscroll > parentLayer.scrollPosY) {
                                                            autoscroll = parentLayer.scrollPosY;
                                                        }

                                                        parentLayer.scrollPosY -= autoscroll;
                                                        Client.objGrabY += autoscroll;
                                                        Client.componentUpdated(parentLayer);
                                                    }

                                                    if (parentLayer && slotY + dy + 32 > Pix2D.clipMaxY && parentLayer.scrollPosY < parentLayer.scrollHeight - parentLayer.renderHeight) {
                                                        let autoscroll = (((slotY + dy + 32 - Pix2D.clipMaxY) * Client.worldUpdateNum) / 3) | 0;
                                                        if (autoscroll > Client.worldUpdateNum * 10) {
                                                            autoscroll = Client.worldUpdateNum * 10;
                                                        }

                                                        if (autoscroll > parentLayer.scrollHeight - parentLayer.renderHeight - parentLayer.scrollPosY) {
                                                            autoscroll = parentLayer.scrollHeight - parentLayer.renderHeight - parentLayer.scrollPosY;
                                                        }

                                                        parentLayer.scrollPosY += autoscroll;
                                                        Client.objGrabY -= autoscroll;
                                                        Client.componentUpdated(parentLayer);
                                                    }
                                                }
                                            } else if (Client.selectedCom === child && Client.selectedItem === slot) {
                                                icon.transPlotSprite(slotX, slotY, 128);
                                            } else {
                                                icon.plotSprite(slotX, slotY);
                                            }
                                        } else {
                                            ready = false;
                                            Client.componentUpdated(child);
                                        }
                                    }
                                } else if (child.invBackground && slot < 20) {
                                    const image: Pix32 | null = child.getInvBackground(slot);
                                    if (image) {
                                        image.plotSprite(slotX, slotY);
                                    } else if (IfType.loadingAsset) {
                                        ready = false;
                                        Client.componentUpdated(child);
                                    }
                                }

                                slot++;
                            }
                        }
                    } else if (child.type === 3) {
                        let colour: number = 0;
                        if (Client.getIfActive(child)) {
                            colour = child.colour2;

                            if (Client.overCom === child && child.colour2Over !== 0) {
                                colour = child.colour2Over;
                            }
                        } else {
                            colour = child.colour;

                            if (Client.overCom === child && child.colourOver !== 0) {
                                colour = child.colourOver;
                            }
                        }

                        if (trans === 0) {
                            if (child.fill) {
                                Pix2D.fillRect(childX, childY, child.renderWidth, child.renderHeight, colour);
                            } else {
                                Pix2D.drawRect(childX, childY, child.renderWidth, child.renderHeight, colour);
                            }
                        } else if (child.fill) {
                            Pix2D.fillRectTrans(childX, childY, child.renderWidth, child.renderHeight, colour, 256 - (trans & 0xff));
                        } else {
                            Pix2D.drawRectTrans(childX, childY, child.renderWidth, child.renderHeight, colour, 256 - (trans & 0xff));
                        }
                    } else if (child.type === 4) {
                        const font: PixFont | null = child.getFont(Client.modIcons);
                        let text: string = child.text!;

                        let colour: number = 0;
                        if (Client.getIfActive(child)) {
                            colour = child.colour2;

                            if (Client.overCom === child && child.colour2Over !== 0) {
                                colour = child.colour2Over;
                            }

                            if (child.text2!.length > 0) {
                                text = child.text2!;
                            }
                        } else {
                            colour = child.colour;

                            if (Client.overCom === child && child.colourOver !== 0) {
                                colour = child.colourOver;
                            }
                        }

                        if (child.v3 && child.invobject !== -1) {
                            const obj: ObjType = ObjType.list(child.invobject);
                            text = obj.name || 'null';
                            if ((obj.stackable === 1 || child.invcount !== 1) && child.invcount !== -1) {
                                text = '<col=ff9040>' + text + '</col> x' + Client.niceNumber(child.invcount);
                            }
                        }

                        if (Client.resumePauseCom === child) {
                            text = Text.pleasewait;
                            colour = child.colour;
                        }

                        if (!font) {
                            if (IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                            continue;
                        }

                        if (!child.v3) {
                            text = Client.substituteVars(text, child);
                        }
                        font.drawStringMultiline(text, childX, childY, child.renderWidth, child.renderHeight, colour, child.shadow ? 0 : -1, child.hAlign, child.vAlign, child.lineHeight);
                    } else if (child.type === 5) {
                        if (child.v3) {
                            const image: Pix32 | null = child.invobject === -1 ? child.getGraphic(false) : ObjType.getSprite(child.outline, child.invobject, child.invcount, child.showCount, child.shadowColour);
                            if (image) {
                                const imageWidth: number = image.owi;
                                const imageHeight: number = image.ohi;
                                if (child.tiling) {
                                    const tileWidth: number = ((imageWidth + child.renderWidth - 1) / imageWidth) | 0;
                                    const tileHeight: number = ((child.renderHeight + imageHeight - 1) / imageHeight) | 0;
                                    Pix2D.setSubClipping(childX, childY, child.renderWidth + childX, child.renderHeight + childY);
                                    for (let tileX: number = 0; tileX < tileWidth; tileX++) {
                                        for (let tileY: number = 0; tileY < tileHeight; tileY++) {
                                            if (child.rotate !== 0) {
                                                image.pixelPerfectRotateScalePlotSprite(((imageHeight / 2) | 0) + tileY * imageHeight + childY, childX + imageWidth * tileX + ((imageWidth / 2) | 0), 4096, child.rotate);
                                            } else if (trans === 0) {
                                                image.plotSprite(childX + tileX * imageWidth, childY + tileY * imageHeight);
                                            } else {
                                                image.transPlotSprite(tileX * imageWidth + childX, tileY * imageHeight + childY, 256 - (trans & 0xff));
                                            }
                                        }
                                    }
                                    Pix2D.setClipping(clipLeft, clipTop, clipRight, clipBottom);
                                } else {
                                    const scale: number = ((child.renderWidth * 4096) / imageWidth) | 0;
                                    if (child.rotate !== 0) {
                                        image.pixelPerfectRotateScalePlotSprite(childY + ((child.renderHeight / 2) | 0), childX + ((child.renderWidth / 2) | 0), scale, child.rotate);
                                    } else if (trans !== 0) {
                                        image.transScalePlotSprite(childX, childY, child.renderWidth, child.renderHeight, 256 - (trans & 0xff));
                                    } else if (child.renderWidth === imageWidth && child.renderHeight === imageHeight) {
                                        image.plotSprite(childX, childY);
                                    } else {
                                        image.scalePlotSprite(childX, childY, child.renderWidth, child.renderHeight);
                                    }
                                }
                            } else if (IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                        } else {
                            const image: Pix32 | null = child.getGraphic(Client.getIfActive(child));
                            if (image) {
                                image.plotSprite(childX, childY);
                            } else if (IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                        }
                    } else if (child.type === 6) {
                        const tmpX: number = Pix3D.originX;
                        const tmpY: number = Pix3D.originY;

                        const active: boolean = Client.getIfActive(child);

                        let seqId: number;
                        if (active) {
                            seqId = child.modelAnim2;
                        } else {
                            seqId = child.modelAnim;
                        }

                        let model: ModelUnlit | ModelLit | null = null;
                        let modelYOffset: number = 0;
                        if (child.invobject !== -1) {
                            const obj: ObjType = ObjType.list(child.invobject);
                            const stackObj: ObjType = obj.getStackSizeAlt(child.invcount);
                            model = stackObj.getModelLit(1, 0, null);
                            if (model === null) {
                                ready = false;
                                Client.componentUpdated(child);
                            } else if (model instanceof ModelLit) {
                                modelYOffset = -((model.method88() / 2) | 0);
                            }
                        } else if (child.model1Type === 5) {
                            if (child.model1Id === -1) {
                                model = Client.idkDesign.getTempModel(null, -1, -1, null);
                            } else {
                                let playerIndex: number = child.model1Id & 0x7ff;
                                if (Client.selfSlot === playerIndex) {
                                    playerIndex = 2047;
                                }
                                const player: ClientPlayer | null = Client.players[playerIndex];
                                const seq: SeqType | null = seqId === -1 ? null : SeqType.list(seqId);
                                if (player !== null && Number(BigInt.asIntN(32, JagString.fromLatin1String(player.name!).toUserhash())) << 11 === (child.model1Id & 0xfffff800)) {
                                    model = player.model!.getTempModel(null, child.animFrame, 0, seq);
                                }
                            }
                        } else if (seqId === -1) {
                            model = child.getTempModel(null, Client.localPlayer!.model, -1, active);
                            if (model === null && IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                        } else {
                            const seq: SeqType = SeqType.list(seqId);
                            model = child.getTempModel(seq, Client.localPlayer!.model, child.animFrame, active);
                            if (model === null && IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                        }

                        if (model) {
                            const scaleY: number = child.modelBaseHeight <= 0 ? 256 : ((child.renderHeight << 8) / child.modelBaseHeight) | 0;
                            const scaleX: number = child.modelBaseWidth <= 0 ? 256 : ((child.renderWidth << 8) / child.modelBaseWidth) | 0;
                            const originX: number = ((child.renderWidth / 2) | 0) + childX + ((scaleX * child.modelXOf) >> 8);
                            const originY: number = ((scaleY * child.modelYOf) >> 8) + ((child.renderHeight / 2) | 0) + childY;
                            Pix3D.setOrigin(originX, originY);
                            const eyeZ: number = (child.modelZoom * Pix3D.cosTable[child.modelXAn]) >> 16;
                            const eyeY: number = (Pix3D.sinTable[child.modelXAn] * child.modelZoom) >> 16;
                            if (model instanceof ModelLit) {
                                if (!child.v3) {
                                    model.method193(child.modelYAn, 0, child.modelXAn, 0, eyeY, eyeZ);
                                } else if (child.orthog && model instanceof SoftwareModelLit) {
                                    model.objRender(child.modelYAn, child.modelZAn, child.modelXAn, child.field3365, modelYOffset + eyeY + child.field3498, eyeZ + child.field3498, child.modelZoom);
                                } else {
                                    model.method193(child.modelYAn, child.modelZAn, child.modelXAn, child.field3365, child.field3498 + eyeY + modelYOffset, child.field3498 + eyeZ);
                                }
                            }
                            Pix3D.resetOrigin();
                        }

                        Pix3D.originX = tmpX;
                        Pix3D.originY = tmpY;
                        Pix3D.setRenderClipping();
                    } else if (child.type === 7) {
                        const font: PixFont | null = child.getFont(Client.modIcons);
                        if (!font) {
                            if (IfType.loadingAsset) {
                                ready = false;
                                Client.componentUpdated(child);
                            }
                            continue;
                        }

                        let slot: number = 0;
                        for (let row: number = 0; row < child.height; row++) {
                            for (let col: number = 0; col < child.width; col++) {
                                if (child.linkObjType![slot] > 0) {
                                    const obj: ObjType = ObjType.list(child.linkObjType![slot] - 1);
                                    let text: string;
                                    if (obj.stackable !== 1 && child.linkObjNumber![slot] === 1) {
                                        text = '<col=ff9040>' + obj.name + '</col>';
                                    } else {
                                        text = '<col=ff9040>' + obj.name + '</col> x' + Client.niceNumber(child.linkObjNumber![slot]);
                                    }

                                    const textX: number = childX + col * (child.marginX + 115);
                                    const textY: number = childY + row * (child.marginY + 12);

                                    if (child.hAlign === 0) {
                                        font.drawString(text, textX, textY, child.colour, child.shadow ? 0 : -1);
                                    } else if (child.hAlign === 1) {
                                        font.centreString(text, textX + 57, textY, child.colour, child.shadow ? 0 : -1);
                                    } else {
                                        font.rightString(text, textX + 114, textY, child.colour, child.shadow ? 0 : -1);
                                    }
                                }

                                slot++;
                            }
                        }
                    } else if (child.type === 8) {
                        if (Client.tooltipCom === child && Client.tooltipNum === Client.tooltipRedraw) {
                            let tooltipWidth: number = 0;
                            let tooltipHeight: number = 0;
                            const font: PixFont = Client.p12!;
                            let remaining: string = Client.substituteVars(child.text!, child);

                            while (remaining.length > 0) {
                                const br: number = remaining.indexOf('<br>');
                                let line: string;
                                if (br === -1) {
                                    line = remaining;
                                    remaining = '';
                                } else {
                                    line = remaining.substring(0, br);
                                    remaining = remaining.substring(br + 4);
                                }
                                const width: number = font.stringWid(line);
                                tooltipHeight += font.ascent + 1;
                                if (tooltipWidth < width) {
                                    tooltipWidth = width;
                                }
                            }

                            tooltipHeight += 7;
                            let tooltipY: number = childY + child.renderHeight + 5;
                            if (tooltipY + tooltipHeight > clipBottom) {
                                tooltipY = clipBottom - tooltipHeight;
                            }
                            tooltipWidth += 6;
                            let tooltipX: number = childX + child.renderWidth - tooltipWidth - 5;
                            if (tooltipX < childX + 5) {
                                tooltipX = childX + 5;
                            }
                            if (tooltipX + tooltipWidth > clipRight) {
                                tooltipX = clipRight - tooltipWidth;
                            }

                            Pix2D.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 0xffffa0);
                            Pix2D.drawRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 0x0);

                            remaining = Client.substituteVars(child.text!, child);
                            let textY: number = tooltipY + font.ascent + 2;
                            while (remaining.length > 0) {
                                const br: number = remaining.indexOf('<br>');
                                let line: string;
                                if (br === -1) {
                                    line = remaining;
                                    remaining = '';
                                } else {
                                    line = remaining.substring(0, br);
                                    remaining = remaining.substring(br + 4);
                                }
                                font.drawString(line, tooltipX + 3, textY, 0x0, -1);
                                textY += font.ascent + 1;
                            }
                        }
                    } else if (child.type === 9) {
                        let y0: number;
                        let y1: number;
                        const x1: number = childX + child.renderWidth;
                        if (child.lineDirection) {
                            y0 = childY + child.renderHeight;
                            y1 = childY;
                        } else {
                            y0 = childY;
                            y1 = childY + child.renderHeight;
                        }
                        if (child.lineWidth === 1) {
                            Pix2D.line(childX, y0, x1, y1, child.colour);
                        } else {
                            Pix2D.method485(childX, y0, x1, y1, child.colour, child.lineWidth);
                        }
                    }
                }
            }
        }

        return ready;
    }

    // jag::oldscape::Client::SubstituteVars
    static substituteVars(arg0: string, arg1: IfType): string {
        if (arg0.indexOf('%') === -1) {
            return arg0;
        }

        do {
            const var2 = arg0.indexOf('%1');
            if (var2 === -1) {
                break;
            }

            arg0 = arg0.substring(0, var2) + Client.inf(Client.getIfVar(0, arg1)) + arg0.substring(var2 + 2);
        } while (true);

        do {
            const var3 = arg0.indexOf('%2');
            if (var3 === -1) {
                break;
            }

            arg0 = arg0.substring(0, var3) + Client.inf(Client.getIfVar(1, arg1)) + arg0.substring(var3 + 2);
        } while (true);

        do {
            const var4 = arg0.indexOf('%3');
            if (var4 === -1) {
                break;
            }

            arg0 = arg0.substring(0, var4) + Client.inf(Client.getIfVar(2, arg1)) + arg0.substring(var4 + 2);
        } while (true);

        do {
            const var5 = arg0.indexOf('%4');
            if (var5 === -1) {
                break;
            }

            arg0 = arg0.substring(0, var5) + Client.inf(Client.getIfVar(3, arg1)) + arg0.substring(var5 + 2);
        } while (true);

        do {
            const var6 = arg0.indexOf('%5');
            if (var6 === -1) {
                break;
            }

            arg0 = arg0.substring(0, var6) + Client.inf(Client.getIfVar(4, arg1)) + arg0.substring(var6 + 2);
        } while (true);

        do {
            const var7 = arg0.indexOf('%dns');
            if (var7 === -1) {
                break;
            }

            let var8 = '';
            if (Client.lastAddress !== null) {
                var8 = JagString.formatIPv4(Client.lastAddress.intArg).toString();
                try {
                    if (typeof Client.lastAddress.result === 'string') {
                        var8 = Client.lastAddress.result;
                    }
                } catch (var10) {}
            }

            arg0 = arg0.substring(0, var7) + var8 + arg0.substring(var7 + 4);
        } while (true);

        return arg0;
    }

    // jag::oldscape::Client::NiceNumber
    static niceNumber(arg0: number): string {
        let var1: string = JagString.parseInt(arg0).toString();
        for (let var2: number = var1.length - 3; var2 > 0; var2 -= 3) {
            var1 = var1.substring(0, var2) + ',' + var1.substring(var2);
        }
        if (var1.length > 9) {
            return ' <col=00ff80>' + var1.substring(0, var1.length - 8) + Text.million + ' (' + var1 + ')</col>';
        } else if (var1.length > 6) {
            return ' <col=ffffff>' + var1.substring(0, var1.length - 4) + Text.thousand + ' (' + var1 + ')</col>';
        } else {
            return ' <col=ffff00>' + var1 + '</col>';
        }
    }

    // jag::oldscape::Client::Inf
    static inf(arg0: number): string {
        return arg0 < 999999999 ? JagString.parseInt(arg0).toString() : '*';
    }

    // jag::oldscape::Client::DoScrollbar
    static doScrollbar(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: IfType, arg6: number): void {
        if (Client.scrollGrabbed) {
            Client.scrollInputPadding = 32;
        } else {
            Client.scrollInputPadding = 0;
        }

        Client.scrollGrabbed = false;

        if (ClientMouseListener.mouseButton !== 0) {
            if (arg2 >= arg0 && arg2 < arg0 + 16 && arg6 <= arg4 && arg4 < arg6 + 16) {
                arg5.scrollPosY -= 4;
                Client.componentUpdated(arg5);
            } else if (arg0 <= arg2 && arg2 < arg0 + 16 && arg4 >= arg6 + arg3 - 16 && arg6 + arg3 > arg4) {
                arg5.scrollPosY += 4;
                Client.componentUpdated(arg5);
            } else if (arg2 >= arg0 - Client.scrollInputPadding && arg2 < Client.scrollInputPadding + arg0 + 16 && arg6 + 16 <= arg4 && arg4 < arg6 + arg3 - 16) {
                if (arg1 === 0) {
                    return;
                }
                let var7: number = (Math.imul(arg3, arg3 - 32) / arg1) | 0;
                if (var7 < 8) {
                    var7 = 8;
                }
                const var8: number = arg3 - var7 - 32;
                const var9: number = arg4 - ((var7 / 2) | 0) - arg6 - 16;
                if (var8 === 0) {
                    return;
                }
                arg5.scrollPosY = (Math.imul(var9, arg1 - arg3) / var8) | 0;
                Client.componentUpdated(arg5);
                Client.scrollGrabbed = true;
            }
        }
        if (Client.mouseWheelRotation !== 0) {
            const var10: number = arg5.renderWidth;
            if (arg2 >= arg0 - var10 && arg6 <= arg4 && arg2 < arg0 + 16 && arg4 <= arg6 + arg3) {
                arg5.scrollPosY += Client.mouseWheelRotation * 45;
                Client.componentUpdated(arg5);
            }
        }
    }

    // jag::oldscape::Client::DrawScrollbar
    static drawScrollbar(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number): void {
        if (arg3 <= 0 || arg3 <= arg1) {
            return;
        }
        let var5: number = (Math.imul(arg1 - 32, arg1) / arg3) | 0;
        if (var5 < 8) {
            var5 = 8;
        }
        Client.scrollbar![0]!.plotSprite(arg4, arg2);
        const var6: number = (Math.imul(arg0, arg1 - var5 - 32) / (arg3 - arg1)) | 0;
        Client.scrollbar![1]!.plotSprite(arg4, arg1 + arg2 - 16);
        Pix2D.fillRect(arg4, arg2 + 16, 16, arg1 - 32, Client.SCROLLBAR_TRACK);
        Pix2D.fillRect(arg4, var6 + arg2 + 16, 16, var5, Client.SCROLLBAR_GRIP_FOREGROUND);

        Pix2D.vline(arg4, var6 + arg2 + 16, var5, Client.SCROLLBAR_GRIP_HIGHLIGHT);
        Pix2D.vline(arg4 + 1, var6 + 16 + arg2, var5, Client.SCROLLBAR_GRIP_HIGHLIGHT);

        Pix2D.hline(arg4, arg2 + var6 + 16, 16, Client.SCROLLBAR_GRIP_HIGHLIGHT);
        Pix2D.hline(arg4, var6 + arg2 + 17, 16, Client.SCROLLBAR_GRIP_HIGHLIGHT);

        Pix2D.vline(arg4 + 15, arg2 + 16 + var6, var5, Client.SCROLLBAR_GRIP_LOWLIGHT);
        Pix2D.vline(arg4 + 14, arg2 - -var6 + 17, var5 - 1, Client.SCROLLBAR_GRIP_LOWLIGHT);

        Pix2D.hline(arg4, var6 + arg2 + var5 + 15, 16, Client.SCROLLBAR_GRIP_LOWLIGHT);
        Pix2D.hline(arg4 + 1, var6 + 14 + arg2 + var5, 15, Client.SCROLLBAR_GRIP_LOWLIGHT);
    }

    // jag::oldscape::Client::GetIfActive
    static getIfActive(arg0: IfType): boolean {
        if (arg0.scriptComparator === null) {
            return false;
        }

        for (let var1: number = 0; var1 < arg0.scriptComparator.length; var1++) {
            const var2: number = Client.getIfVar(var1, arg0);
            const var3: number = arg0.scriptOperand![var1];

            if (arg0.scriptComparator[var1] === 2) {
                if (var3 <= var2) {
                    return false;
                }
            } else if (arg0.scriptComparator[var1] === 3) {
                if (var2 <= var3) {
                    return false;
                }
            } else if (arg0.scriptComparator[var1] === 4) {
                if (var2 === var3) {
                    return false;
                }
            } else if (var2 !== var3) {
                return false;
            }
        }

        return true;
    }

    // jag::oldscape::Client::GetIfVar
    static getIfVar(arg0: number, arg1: IfType): number {
        if (arg1.scripts === null || arg0 >= arg1.scripts.length) {
            return -2;
        }

        try {
            const var2: Int32Array = arg1.scripts[arg0]!;
            let var3: number = 0;
            let var4: number = 0;
            let var5: number = 0;
            while (true) {
                const var6: number = var2[var4++];
                let var7: number = 0;
                let var8: number = 0;
                if (var6 === 0) {
                    return var3;
                }
                if (var6 === 1) {
                    var8 = Client.statEffectiveLevel[var2[var4++]];
                }
                if (var6 === 2) {
                    var8 = Client.statBaseLevel[var2[var4++]];
                }
                if (var6 === 3) {
                    var8 = Client.statXP[var2[var4++]];
                }
                if (var6 === 4) {
                    const var9: number = var2[var4++] << 16;
                    const var10: number = var9 + var2[var4++];
                    const var11: IfType = IfType.get(var10)!;
                    const var12: number = var2[var4++];
                    if (var12 !== -1 && (!ObjType.list(var12).members || Client.memServer)) {
                        for (let var13: number = 0; var13 < var11.linkObjType!.length; var13++) {
                            if (var11.linkObjType![var13] === var12 + 1) {
                                var8 += var11.linkObjNumber![var13];
                            }
                        }
                    }
                }
                if (var6 === 5) {
                    var8 = VarCache.var[var2[var4++]];
                }
                if (var6 === 6) {
                    var8 = Skills.skillxp[Client.statBaseLevel[var2[var4++]] - 1];
                }
                if (var6 === 7) {
                    var8 = ((VarCache.var[var2[var4++]] * 100) / 46875) | 0;
                }
                if (var6 === 8) {
                    var8 = Client.localPlayer!.combatLevel;
                }
                if (var6 === 9) {
                    for (let var14: number = 0; var14 < 25; var14++) {
                        if (Skills.used[var14]) {
                            var8 += Client.statBaseLevel[var14];
                        }
                    }
                }
                if (var6 === 10) {
                    const var15: number = var2[var4++] << 16;
                    const var16: number = var15 + var2[var4++];
                    const var17: IfType = IfType.get(var16)!;
                    const var18: number = var2[var4++];
                    if (var18 !== -1 && (!ObjType.list(var18).members || Client.memServer)) {
                        for (let var19: number = 0; var19 < var17.linkObjType!.length; var19++) {
                            if (var18 + 1 === var17.linkObjType![var19]) {
                                var8 = 999999999;
                                break;
                            }
                        }
                    }
                }
                if (var6 === 11) {
                    var8 = Client.runenergy;
                }
                if (var6 === 15) {
                    var7 = 1;
                }
                if (var6 === 12) {
                    var8 = Client.runweight;
                }
                if (var6 === 13) {
                    const var20: number = VarCache.var[var2[var4++]];
                    const var21: number = var2[var4++];
                    var8 = ((0x1 << var21) & var20) === 0 ? 0 : 1;
                }
                if (var6 === 16) {
                    var7 = 2;
                }
                if (var6 === 14) {
                    const var22: number = var2[var4++];
                    var8 = VarCache.getVarbit(var22);
                }
                if (var6 === 17) {
                    var7 = 3;
                }
                if (var6 === 18) {
                    var8 = (Client.localPlayer!.x >> 7) + Client.mapBuildBaseX;
                }
                if (var6 === 19) {
                    var8 = (Client.localPlayer!.z >> 7) + Client.mapBuildBaseZ;
                }
                if (var6 === 20) {
                    var8 = var2[var4++];
                }
                if (var7 === 0) {
                    if (var5 === 0) {
                        var3 += var8;
                    }
                    if (var5 === 1) {
                        var3 -= var8;
                    }
                    if (var5 === 2 && var8 !== 0) {
                        var3 = (var3 / var8) | 0;
                    }
                    if (var5 === 3) {
                        var3 *= var8;
                    }
                    var5 = 0;
                } else {
                    var5 = var7;
                }
            }
        } catch (var23) {
            return -1;
        }
    }

    // jag::oldscape::Client::LoopInterface
    static loopInterface(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number): void {
        if (IfType.openInterface(arg5)) {
            Client.loopLayer(arg2, arg4, arg6, -1, arg1, IfType.list[arg5], arg3, arg0);
        }
    }

    // jag::oldscape::Client::LoopLayer
    static loopLayer(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: IfType[], arg6: number, arg7: number): void {
        for (let var8: number = 0; var8 < arg5.length; var8++) {
            const var9: IfType | null = arg5[var8];
            if (var9 !== null && (!var9.v3 || var9.type === 0 || var9.hashook || Client.getActive(var9) !== 0 || Client.dragLayer === var9 || var9.clientCode === 1338) && arg3 === var9.layerId && (!var9.v3 || !Client.hide(var9))) {
                const var10: number = arg2 + var9.renderX;
                const var11: number = arg7 + var9.renderY;
                let var12: number;
                let var15: number;
                let var16: number;
                let var17: number;
                if (var9.type === 2) {
                    var16 = arg4;
                    var17 = arg1;
                    var12 = arg0;
                    var15 = arg6;
                } else {
                    var12 = arg0 >= var11 ? arg0 : var11;
                    let var13: number = var11 + var9.renderHeight;
                    let var14: number = var9.renderWidth + var10;
                    var15 = arg6 >= var10 ? arg6 : var10;
                    if (var9.type === 9) {
                        var13++;
                        var14++;
                    }
                    var16 = arg4 <= var13 ? arg4 : var13;
                    var17 = var14 < arg1 ? var14 : arg1;
                }
                if (Client.dragCom === var9) {
                    Client.dragCurrentX = var10;
                    Client.dragParentFound = true;
                    Client.dragCurrentY = var11;
                }
                if (!var9.v3 || (var15 < var17 && var12 < var16)) {
                    if (var9.type === 0) {
                        if (!var9.v3 && Client.hide(var9) && Client.overCom !== var9) {
                            continue;
                        }
                        if (var9.noClickThrough && var15 <= ClientMouseListener.mouseX && ClientMouseListener.mouseY >= var12 && var17 > ClientMouseListener.mouseX && ClientMouseListener.mouseY < var16) {
                            for (let var18 = Client.hookRequests.head(); var18 !== null; var18 = Client.hookRequests.next()) {
                                if (var18.field686) {
                                    var18.unlink();
                                }
                            }
                            for (let var19 = Client.hookRequestsMouseStop.head(); var19 !== null; var19 = Client.hookRequestsMouseStop.next()) {
                                if (var19.field686) {
                                    var19.unlink();
                                }
                            }
                            if (Client.dragTime === 0) {
                                Client.dragCom = null;
                                Client.dragLayer = null;
                            }
                            Client.field3532 = false;
                        }
                    }
                    if (var9.v3) {
                        let var20: boolean = false;
                        let var21: boolean = false;
                        let var22: boolean;
                        if (ClientMouseListener.mouseX >= var15 && var12 <= ClientMouseListener.mouseY && var17 > ClientMouseListener.mouseX && var16 > ClientMouseListener.mouseY) {
                            var22 = true;
                        } else {
                            var22 = false;
                        }
                        if (ClientMouseListener.mouseClickButton === 1 && var15 <= ClientMouseListener.mouseClickX && ClientMouseListener.mouseClickY >= var12 && ClientMouseListener.mouseClickX < var17 && var16 > ClientMouseListener.mouseClickY) {
                            var21 = true;
                        }
                        if (ClientMouseListener.mouseButton === 1 && var22) {
                            var20 = true;
                        }
                        if (Client.keypresses > 0 && var9.hotkeys !== null) {
                            for (let var23: number = 0; var23 < var9.hotkeys.length; var23++) {
                                for (let var24: number = 0; var24 < Client.keypresses; var24++) {
                                    const var25: number = var9.hotkeys[var23] & 0xff;
                                    if (Client.keypressKeycodes[var24] === var25) {
                                        Client.ifButtonX(var23 + 1, '', -1, var9.parentId);
                                    }
                                }
                            }
                        }
                        if (var21) {
                            Client.dragTryPickup(ClientMouseListener.mouseClickX - var10, ClientMouseListener.mouseClickY + -var11, var9);
                        }
                        if (Client.dragCom !== null && var9 !== Client.dragCom && var22 && ServerActive.isDragTarget(Client.getActive(var9))) {
                            Client.dropCom = var9;
                        }
                        if (var9 === Client.dragLayer) {
                            Client.dragging = true;
                            Client.dragParentY = var11;
                            Client.dragParentX = var10;
                        }
                        if (var9.hashook || var9.clientCode !== 0) {
                            if (var22 && Client.mouseWheelRotation !== 0 && var9.onscrollwheel !== null) {
                                const var26 = new HookReq();
                                var26.field686 = true;
                                var26.onop = var9.onscrollwheel;
                                var26.component = var9;
                                var26.mouseY = Client.mouseWheelRotation;
                                Client.hookRequests.push(var26);
                            }
                            if (Client.dragCom !== null || Client.objDragCom !== null || Client.isMenuOpen || (var9.clientCode !== 1400 && Client.field3532)) {
                                var22 = false;
                                var21 = false;
                                var20 = false;
                            }
                            if (var9.clientCode === 1337) {
                                Client.componentUpdated(var9);
                                continue;
                            }
                            if (var9.clientCode === 1338) {
                                if (var21 && Client.mapMaskCom !== null) {
                                    // rebase to the map circle at (+25,+5): its 146x151 rect centres
                                    // at (73,75) — Java Class40.method934's exact click origin
                                    Client.minimapLoop(ClientMouseListener.mouseClickX - var10 - 25, -var11 + ClientMouseListener.mouseClickY - 5, Client.mapMaskCom);
                                }
                                continue;
                            }
                            if (var9.clientCode === 1400) {
                                // WorldMap.mapCom = var9;
                                // if (var21) {
                                //     if (ClientKeyboardListener.keyHeld[82] && Client.staffmodlevel > 0) {
                                //         const var27: number = WorldMap.mapHeight + WorldMap.baseY - WorldMap.centreY - Math.trunc((-(var9.renderHeight / 2) + -var11 + ClientMouseListener.mouseClickY) * 2.0 / WorldMap.zoom);
                                //         const var28: number = WorldMap.centreX + Math.trunc((ClientMouseListener.mouseClickX - var9.renderWidth / 2 - var10) * 2.0 / WorldMap.zoom) + WorldMap.baseX;
                                //         const var29: string = '::tele 0,' + (var28 >> 6) + ',' + (var27 >> 6) + ',' + (var28 & 0x3f) + ',' + (var27 & 0x3f);
                                //         void var29;
                                //         Client.doCheat(var29);
                                //         Client.closeModal();
                                //         continue;
                                //     }
                                //     Client.dragPickupX = ClientMouseListener.mouseX;
                                //     Client.field1801 = WorldMap.centreY;
                                //     Client.dragPickupY = ClientMouseListener.mouseY;
                                //     Client.field3532 = true;
                                //     Client.field890 = WorldMap.centreX;
                                //     continue;
                                // }
                                // if (var20 && Client.field3532) {
                                //     WorldMap.setCentreX(Client.field890 + Math.trunc((Client.dragPickupX - ClientMouseListener.mouseX) * 2.0 / WorldMap.targetZoom));
                                //     WorldMap.setCentreY(Math.trunc((Client.dragPickupY - ClientMouseListener.mouseY) * 2.0 / WorldMap.targetZoom) + Client.field1801);
                                //     continue;
                                // }
                                // Client.field3532 = false;
                                continue;
                            }
                            if (var9.clientCode === 1401) {
                                if (var20) {
                                    // WorldMap.clickOverview(var9.renderWidth, ClientMouseListener.mouseY - var11, ClientMouseListener.mouseX - var10, var9.renderHeight);
                                }
                                continue;
                            }
                            if (!var9.clickTrigger && var21) {
                                var9.clickTrigger = true;
                                if (var9.onclick !== null) {
                                    const var30 = new HookReq();
                                    var30.mouseY = ClientMouseListener.mouseClickY - var11;
                                    var30.onop = var9.onclick;
                                    var30.component = var9;
                                    var30.field686 = true;
                                    var30.mouseX = ClientMouseListener.mouseClickX - var10;
                                    Client.hookRequests.push(var30);
                                }
                            }
                            if (var9.clickTrigger && var20 && var9.onclickrepeat !== null) {
                                const var31 = new HookReq();
                                var31.field686 = true;
                                var31.onop = var9.onclickrepeat;
                                var31.component = var9;
                                var31.mouseX = ClientMouseListener.mouseX - var10;
                                var31.mouseY = ClientMouseListener.mouseY - var11;
                                Client.hookRequests.push(var31);
                            }
                            if (var9.clickTrigger && !var20) {
                                var9.clickTrigger = false;
                                if (var9.onrelease !== null) {
                                    const var32 = new HookReq();
                                    var32.component = var9;
                                    var32.mouseY = ClientMouseListener.mouseY - var11;
                                    var32.onop = var9.onrelease;
                                    var32.mouseX = ClientMouseListener.mouseX - var10;
                                    var32.field686 = true;
                                    Client.hookRequestsMouseStop.push(var32);
                                }
                            }
                            if (var20 && var9.onhold !== null) {
                                const var33 = new HookReq();
                                var33.onop = var9.onhold;
                                var33.field686 = true;
                                var33.mouseY = ClientMouseListener.mouseY - var11;
                                var33.component = var9;
                                var33.mouseX = ClientMouseListener.mouseX - var10;
                                Client.hookRequests.push(var33);
                            }
                            if (!var9.mouseTrigger && var22) {
                                var9.mouseTrigger = true;
                                if (var9.onmouseover !== null) {
                                    const var34 = new HookReq();
                                    var34.mouseX = ClientMouseListener.mouseX - var10;
                                    var34.mouseY = ClientMouseListener.mouseY - var11;
                                    var34.field686 = true;
                                    var34.component = var9;
                                    var34.onop = var9.onmouseover;
                                    Client.hookRequests.push(var34);
                                }
                            }
                            if (var9.mouseTrigger && var22 && var9.onmouserepeat !== null) {
                                const var35 = new HookReq();
                                var35.component = var9;
                                var35.mouseY = ClientMouseListener.mouseY - var11;
                                var35.onop = var9.onmouserepeat;
                                var35.mouseX = ClientMouseListener.mouseX - var10;
                                var35.field686 = true;
                                Client.hookRequests.push(var35);
                            }
                            if (var9.mouseTrigger && !var22) {
                                var9.mouseTrigger = false;
                                if (var9.onmouseleave !== null) {
                                    const var36 = new HookReq();
                                    var36.onop = var9.onmouseleave;
                                    var36.component = var9;
                                    var36.field686 = true;
                                    var36.mouseX = ClientMouseListener.mouseX - var10;
                                    var36.mouseY = ClientMouseListener.mouseY - var11;
                                    Client.hookRequestsMouseStop.push(var36);
                                }
                            }
                            if (var9.ontimer !== null) {
                                const var37 = new HookReq();
                                var37.component = var9;
                                var37.onop = var9.ontimer;
                                Client.hookRequestsTimer.push(var37);
                            }
                            if (var9.onvartransmit !== null && Client.varTransmitNum > var9.varTransmitNum) {
                                if (var9.onvartransmitlist === null || Client.varTransmitNum - var9.varTransmitNum > 32) {
                                    const var42 = new HookReq();
                                    var42.component = var9;
                                    var42.onop = var9.onvartransmit;
                                    Client.hookRequests.push(var42);
                                } else {
                                    label439: for (let var38: number = var9.varTransmitNum; var38 < Client.varTransmitNum; var38++) {
                                        const var39: number = Client.varTransmit[var38 & 0x1f];
                                        for (let var40: number = 0; var40 < var9.onvartransmitlist.length; var40++) {
                                            if (var9.onvartransmitlist[var40] === var39) {
                                                const var41 = new HookReq();
                                                var41.onop = var9.onvartransmit;
                                                var41.component = var9;
                                                Client.hookRequests.push(var41);
                                                break label439;
                                            }
                                        }
                                    }
                                }
                                var9.varTransmitNum = Client.varTransmitNum;
                            }
                            if (var9.oninvtransmit !== null && Client.invTransmitNum > var9.invTransmitNum) {
                                if (var9.oninvtransmitlist === null || Client.invTransmitNum - var9.invTransmitNum > 32) {
                                    const var47 = new HookReq();
                                    var47.onop = var9.oninvtransmit;
                                    var47.component = var9;
                                    Client.hookRequests.push(var47);
                                } else {
                                    label415: for (let var43: number = var9.invTransmitNum; var43 < Client.invTransmitNum; var43++) {
                                        const var44: number = Client.invTransmit[var43 & 0x1f];
                                        for (let var45: number = 0; var45 < var9.oninvtransmitlist.length; var45++) {
                                            if (var44 === var9.oninvtransmitlist[var45]) {
                                                const var46 = new HookReq();
                                                var46.onop = var9.oninvtransmit;
                                                var46.component = var9;
                                                Client.hookRequests.push(var46);
                                                break label415;
                                            }
                                        }
                                    }
                                }
                                var9.invTransmitNum = Client.invTransmitNum;
                            }
                            if (var9.onstattransmit !== null && var9.statTransmitNum < Client.statTransmitNum) {
                                if (var9.onstattransmitlist === null || Client.statTransmitNum - var9.statTransmitNum > 32) {
                                    const var48 = new HookReq();
                                    var48.onop = var9.onstattransmit;
                                    var48.component = var9;
                                    Client.hookRequests.push(var48);
                                } else {
                                    label391: for (let var49: number = var9.statTransmitNum; var49 < Client.statTransmitNum; var49++) {
                                        const var50: number = Client.statTransmit[var49 & 0x1f];
                                        for (let var51: number = 0; var51 < var9.onstattransmitlist.length; var51++) {
                                            if (var9.onstattransmitlist[var51] === var50) {
                                                const var52 = new HookReq();
                                                var52.component = var9;
                                                var52.onop = var9.onstattransmit;
                                                Client.hookRequests.push(var52);
                                                break label391;
                                            }
                                        }
                                    }
                                }
                                var9.statTransmitNum = Client.statTransmitNum;
                            }
                            if (var9.transmitNum < Client.chatTransmitNum && var9.onchattransmit !== null) {
                                const var53 = new HookReq();
                                var53.component = var9;
                                var53.onop = var9.onchattransmit;
                                Client.hookRequests.push(var53);
                            }
                            if (var9.transmitNum < Client.friendTransmitNum && var9.onfriendtransmit !== null) {
                                const var54 = new HookReq();
                                var54.component = var9;
                                var54.onop = var9.onfriendtransmit;
                                Client.hookRequests.push(var54);
                            }
                            if (var9.transmitNum < Client.clanTransmitNum && var9.onclantransmit !== null) {
                                const var55 = new HookReq();
                                var55.component = var9;
                                var55.onop = var9.onclantransmit;
                                Client.hookRequests.push(var55);
                            }
                            if (Client.stockTransmitNum > var9.transmitNum && var9.onstocktransmit !== null) {
                                const var56 = new HookReq();
                                var56.component = var9;
                                var56.onop = var9.onstocktransmit;
                                Client.hookRequests.push(var56);
                            }
                            if (var9.transmitNum < Client.miscTransmitNum && var9.onmisctransmit !== null) {
                                const var57 = new HookReq();
                                var57.component = var9;
                                var57.onop = var9.onmisctransmit;
                                Client.hookRequests.push(var57);
                            }
                            var9.transmitNum = Client.transmitNum;
                            if (var9.onkey !== null) {
                                for (let var58: number = 0; var58 < Client.keypresses; var58++) {
                                    const var59 = new HookReq();
                                    var59.component = var9;
                                    var59.keyCode = Client.keypressKeycodes[var58];
                                    var59.keyChar = Client.keypressKeychars[var58];
                                    var59.onop = var9.onkey;
                                    Client.hookRequests.push(var59);
                                }
                            }
                        }
                    }
                    if (!var9.v3 && Client.dragCom === null && Client.objDragCom === null && !Client.isMenuOpen) {
                        if ((var9.overLayerId >= 0 || var9.colourOver !== 0) && var15 <= ClientMouseListener.mouseX && ClientMouseListener.mouseY >= var12 && ClientMouseListener.mouseX < var17 && var16 > ClientMouseListener.mouseY) {
                            if (var9.overLayerId < 0) {
                                Client.overCom = var9;
                            } else {
                                Client.overCom = arg5[var9.overLayerId];
                            }
                        }
                        if (var9.type === 8 && var15 <= ClientMouseListener.mouseX && var12 <= ClientMouseListener.mouseY && var17 > ClientMouseListener.mouseX && ClientMouseListener.mouseY < var16) {
                            Client.tooltipCom = var9;
                        }
                        if (var9.renderHeight < var9.scrollHeight) {
                            Client.doScrollbar(var10 + var9.renderWidth, var9.scrollHeight, ClientMouseListener.mouseX, var9.renderHeight, ClientMouseListener.mouseY, var9, var11);
                        }
                    }
                    if (var9.type === 0) {
                        Client.loopLayer(var12, var17, var10 - var9.scrollPosX, var9.parentId, var16, arg5, var15, var11 - var9.scrollPosY);
                        if (var9.subcomponents !== null) {
                            Client.loopLayer(var12, var17, var10 - var9.scrollPosX, var9.parentId, var16, var9.subcomponents, var15, var11 - var9.scrollPosY);
                        }
                        const var60 = Client.subinterfaces.find(BigInt(var9.parentId)) as SubInterface | null;
                        if (var60 !== null) {
                            Client.loopInterface(var11, var16, var12, var15, var17, var60.id, var10);
                        }
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::RunHookImmediate
    static runHookImmediate(arg0: number, arg1: number): void {
        if (IfType.openInterface(arg0)) {
            Client.runHookLayer(arg1, IfType.list[arg0]!);
        }
    }

    // jag::oldscape::Client::RunHookLayer
    static runHookLayer(arg0: number, arg1: IfType[]): void {
        for (let var2 = 0; var2 < arg1.length; var2++) {
            const var3 = arg1[var2];
            if (var3 !== null) {
                if (var3.type === 0) {
                    if (var3.subcomponents !== null) {
                        Client.runHookLayer(arg0, var3.subcomponents);
                    }
                    const var4 = Client.subinterfaces.find(BigInt(var3.parentId));
                    if (var4 !== null) {
                        Client.runHookImmediate(var4.id, arg0);
                    }
                }
                if (arg0 === 0 && var3.ondialogabort !== null) {
                    const var5 = new HookReq();
                    var5.component = var3;
                    var5.onop = var3.ondialogabort;
                    ScriptRunner.executeScript(var5);
                }
                if (arg0 === 1 && var3.onsubchange !== null) {
                    if (var3.subId >= 0) {
                        const var6 = IfType.get(var3.parentId);
                        if (var6 === null || var6.subcomponents === null || var3.subId >= var6.subcomponents.length || var3 !== var6.subcomponents[var3.subId]) {
                            continue;
                        }
                    }
                    const var7 = new HookReq();
                    var7.component = var3;
                    var7.onop = var3.onsubchange;
                    ScriptRunner.executeScript(var7);
                }
            }
        }
    }

    // jag::oldscape::Client::DragTryPickup
    static dragTryPickup(arg0: number, arg1: number, arg2: IfType | null): void {
        if (Client.dragCom !== null || Client.isMenuOpen || arg2 === null || Client.getDragLayer(arg2) === null) {
            return;
        }
        Client.dragCom = arg2;
        Client.dragLayer = Client.getDragLayer(arg2);
        Client.dragTime = 0;
        Client.dragPickupX = arg0;
        Client.dragAlive = false;
        Client.dragPickupY = arg1;
    }

    // jag::oldscape::Client::LoopIf3Drag
    loopIf3Drag(): void {
        const dragCom: IfType = Client.dragCom!;
        const dragLayer: IfType = Client.dragLayer!;
        Client.componentUpdated(dragCom);
        Client.dragTime++;
        if (Client.dragParentFound && Client.dragging) {
            let x: number = ClientMouseListener.mouseX - Client.dragPickupX;
            if (Client.dragParentX > x) {
                x = Client.dragParentX;
            }
            let y: number = ClientMouseListener.mouseY - Client.dragPickupY;
            if (Client.dragParentY > y) {
                y = Client.dragParentY;
            }
            if (y + dragCom.renderHeight > dragLayer.renderHeight + Client.dragParentY) {
                y = Client.dragParentY + dragLayer.renderHeight - dragCom.renderHeight;
            }
            const dy: number = y - Client.dragCurrentY;
            const deadzone: number = dragCom.dragdeadzone;
            if (dragCom.renderWidth + x > Client.dragParentX + dragLayer.renderWidth) {
                x = dragLayer.renderWidth + Client.dragParentX - dragCom.renderWidth;
            }
            const mouseY: number = y + dragLayer.scrollPosY - Client.dragParentY;
            const mouseX: number = dragLayer.scrollPosX + x - Client.dragParentX;
            const dx: number = x - Client.dragCurrentX;
            if (Client.dragTime > dragCom.dragdeadtime && (dx > deadzone || dx < -deadzone || dy > deadzone || dy < -deadzone)) {
                Client.dragAlive = true;
            }
            if (dragCom.ondrag !== null && Client.dragAlive) {
                const req = new HookReq();
                req.onop = dragCom.ondrag;
                req.mouseY = mouseY;
                req.mouseX = mouseX;
                req.component = dragCom;
                ScriptRunner.executeScript(req, 200000);
            }
            if (ClientMouseListener.mouseButton === 0) {
                if (Client.dragAlive) {
                    if (dragCom.ondragcomplete !== null) {
                        const req = new HookReq();
                        req.onop = dragCom.ondragcomplete;
                        req.component = dragCom;
                        req.mouseX = mouseX;
                        req.mouseY = mouseY;
                        req.drop = Client.dropCom;
                        ScriptRunner.executeScript(req, 200000);
                    }
                    // DO NOT SEND IF_BUTTOND (132): rev-500 12-byte body vs server size 6 —
                    // 6 excess bytes poison the stream. Drags go through INV_BUTTOND (121) instead.
                } else if ((Client.oneMouseButton === 1 || Client.isAddFriendOption(Client.menuNumEntries - 1)) && Client.menuNumEntries > 2) {
                    this.openMenu();
                } else if (Client.menuNumEntries > 0) {
                    Client.doAction(Client.menuNumEntries - 1);
                }
                Client.dragCom = null;
            }
        } else if (Client.dragTime > 1) {
            Client.dragCom = null;
        }
    }

    // jag::oldscape::Client::ComponentUpdated
    static componentUpdated(arg0: IfType | null): void {
        if (Client.componentDrawTime === arg0!.drawTime) {
            Client.componentDirtyArea[arg0!.drawCount] = true;
        } else {
            // drawTime bookkeeping doesn't match (component updated while covered / not drawn
            // this cycle) — precise marking would silently no-op and leave stale pixels until
            // a reopen (e.g. equipment-screen text after dropping a weapon). Full redraw is
            // just flag-marking; the actual repaint happens once next frame.
            Client.redrawAllComponents();
        }
    }

    static redrawAllComponents(): void {
        for (let var0 = 0; var0 < 100; var0++) {
            Client.componentDirtyArea[var0] = true;
        }
    }

    // jag::oldscape::Client::LegacyUpdated
    static legacyUpdated(): void {
        for (let var0 = Client.subinterfaces.search() as SubInterface | null; var0 !== null; var0 = Client.subinterfaces.findnext() as SubInterface | null) {
            const var1 = var0.id;
            if (IfType.openInterface(var1)) {
                let var2 = true;
                const var3 = IfType.list[var1]!;
                for (let var4 = 0; var4 < var3.length; var4++) {
                    if (var3[var4] !== null) {
                        var2 = var3[var4]!.v3;
                        break;
                    }
                }
                if (!var2) {
                    const var5 = Number(var0.key);
                    const var6 = IfType.get(var5);
                    if (var6 !== null) {
                        Client.componentUpdated(var6);
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::GetDragLayer
    static getDragLayer(arg0: IfType): IfType | null {
        let var1 = Client.serverDraggable(arg0);
        if (var1 === null) {
            var1 = arg0.draggable;
        }
        return var1;
    }

    static prependOpIndex(arg0: Array<string | null> | null): string[] {
        const var1 = new Array<string>(5);
        for (let var2 = 0; var2 < 5; var2++) {
            var1[var2] = JagString.join([JagString.parseInt(var2), JagString.wrap(': ')]).toString();
            if (arg0 !== null && arg0[var2] !== null) {
                var1[var2] = JagString.join([JagString.wrap(var1[var2]), JagString.wrap(arg0[var2]!)]).toString();
            }
        }
        return var1;
    }

    // jag::oldscape::Client::IfAnimReset
    static ifAnimReset(arg0: number): void {
        if (!IfType.openInterface(arg0)) {
            return;
        }

        const var1 = IfType.list[arg0]!;
        for (let var2 = 0; var2 < var1.length; var2++) {
            const var3 = var1[var2];
            if (var3 !== null) {
                var3.animCycle = 0;
                var3.animFrame = 0;
            }
        }
    }

    // jag::oldscape::Client::AnimateInterface
    static animateInterface(arg0: number): void {
        if (IfType.openInterface(arg0)) {
            Client.animateLayer(-1, IfType.list[arg0]!);
        }
    }

    // jag::oldscape::Client::AnimateLayer
    static animateLayer(arg0: number, arg1: IfType[]): void {
        for (let var2: number = 0; var2 < arg1.length; var2++) {
            const var3: IfType | null = arg1[var2];
            if (var3 !== null && arg0 === var3.layerId && (!var3.v3 || !Client.hide(var3))) {
                if (var3.type === 0) {
                    if (!var3.v3 && Client.hide(var3) && var3 !== Client.overCom) {
                        continue;
                    }
                    Client.animateLayer(var3.parentId, arg1);
                    if (var3.subcomponents !== null) {
                        Client.animateLayer(var3.parentId, var3.subcomponents);
                    }
                    const var4 = Client.subinterfaces.find(BigInt(var3.parentId)) as SubInterface | null;
                    if (var4 !== null) {
                        Client.animateInterface(var4.id);
                    }
                }
                if (var3.type === 6) {
                    if (var3.modelAnim !== -1 || var3.modelAnim2 !== -1) {
                        const var5: boolean = Client.getIfActive(var3);
                        let var6: number;
                        if (var5) {
                            var6 = var3.modelAnim2;
                        } else {
                            var6 = var3.modelAnim;
                        }
                        if (var6 !== -1) {
                            const var7: SeqType | null = SeqType.list(var6);
                            if (var7 !== null) {
                                var3.animCycle += Client.worldUpdateNum;
                                while (var3.animCycle > var7.delay![var3.animFrame]) {
                                    var3.animCycle -= var7.delay![var3.animFrame];
                                    var3.animFrame++;
                                    if (var3.animFrame >= var7.frames!.length) {
                                        var3.animFrame -= var7.loops;
                                        if (var3.animFrame < 0 || var3.animFrame >= var7.frames!.length) {
                                            var3.animFrame = 0;
                                        }
                                    }
                                    Client.componentUpdated(var3);
                                }
                            }
                        }
                    }
                    if (var3.modelSpin !== 0 && !var3.v3) {
                        const var8: number = (var3.modelSpin << 16) >> 16;
                        const var9: number = var3.modelSpin >> 16;
                        const var10: number = var9 * Client.worldUpdateNum;
                        var3.modelXAn = (var10 + var3.modelXAn) & 0x7ff;
                        const var11: number = var8 * Client.worldUpdateNum;
                        var3.modelYAn = (var11 + var3.modelYAn) & 0x7ff;
                        Client.componentUpdated(var3);
                    }
                }
            }
        }
    }

    // jag::oldscape::Client::ClientVar
    static clientVar(arg0: number): void {
        Client.legacyUpdated();
        BgSound.recalculateMultilocs();
        const var1: number = VarpType.list(arg0).clientcode;
        if (var1 === 0) {
            return;
        }
        const var2: number = VarCache.var[arg0];
        if (var1 === 1) {
            Client.brightness = var2;
            if (Client.brightness === 1) {
                Pix3D.initColourTable(0.9);
            }
            if (Client.brightness === 2) {
                Pix3D.initColourTable(0.8);
            }
            if (Client.brightness === 3) {
                Pix3D.initColourTable(0.7);
            }
            if (Client.brightness === 4) {
                Pix3D.initColourTable(0.6);
            }
            ObjType.resetSpriteCache();
        }
        if (var1 === 3) {
            let var3: number = 0;
            if (var2 === 0) {
                var3 = 255;
            }
            if (var2 === 1) {
                var3 = 192;
            }
            if (var2 === 2) {
                var3 = 128;
            }
            if (var2 === 3) {
                var3 = 64;
            }
            if (var2 === 4) {
                var3 = 0;
            }
            if (Client.midiVolume !== var3) {
                if (Client.midiVolume === 0 && Client.nextMidiSong !== -1) {
                    MidiManager.play(Client.songs!, Client.nextMidiSong, var3);
                    Client.playingJingle = false;
                } else if (var3 === 0) {
                    MidiManager.stop();
                    Client.playingJingle = false;
                } else {
                    MidiManager.setVolume(var3);
                }
                Client.midiVolume = var3;
            }
        }
        if (var1 === 6) {
            Client.chatEffects = var2;
        }
        if (var1 === 9) {
            Client.bankArrangeMode = var2;
        }
        if (var1 === 4) {
            if (var2 === 0) {
                Client.waveVolume = 127;
            }
            if (var2 === 1) {
                Client.waveVolume = 96;
            }
            if (var2 === 2) {
                Client.waveVolume = 64;
            }
            if (var2 === 3) {
                Client.waveVolume = 32;
            }
            if (var2 === 4) {
                Client.waveVolume = 0;
            }
        }
        if (var1 === 10) {
            if (var2 === 0) {
                Client.ambientVolume = 127;
            }
            if (var2 === 1) {
                Client.ambientVolume = 96;
            }
            if (var2 === 2) {
                Client.ambientVolume = 64;
            }
            if (var2 === 3) {
                Client.ambientVolume = 32;
            }
            if (var2 === 4) {
                Client.ambientVolume = 0;
            }
        }
        if (var1 === 5) {
            Client.oneMouseButton = var2;
        }
    }

    // jag::oldscape::Client::ClientComponent
    static clientComponent(arg0: IfType): void {
        const var1: number = arg0.clientCode;
        if (var1 === 324) {
            if (Client.idkDesignButton1 === -1) {
                Client.idkDesignButton2 = arg0.graphic2;
                Client.idkDesignButton1 = arg0.graphic;
            }
            if (Client.idkDesign.gender) {
                arg0.graphic = Client.idkDesignButton1;
            } else {
                arg0.graphic = Client.idkDesignButton2;
            }
        } else if (var1 === 325) {
            if (Client.idkDesignButton1 === -1) {
                Client.idkDesignButton2 = arg0.graphic2;
                Client.idkDesignButton1 = arg0.graphic;
            }
            if (Client.idkDesign.gender) {
                arg0.graphic = Client.idkDesignButton2;
            } else {
                arg0.graphic = Client.idkDesignButton1;
            }
        } else if (var1 === 327) {
            arg0.modelXAn = 150;
            arg0.modelYAn = ((Math.sin(Client.loopCycle / 40.0) * 256.0) | 0) & 0x7ff;
            arg0.model1Id = -1;
            arg0.model1Type = 5;
        } else if (var1 === 328) {
            if (Client.localPlayer!.name == null) {
                arg0.model1Id = 0;
            } else {
                arg0.modelXAn = 150;
                arg0.modelYAn = ((Math.sin(Client.loopCycle / 40.0) * 256.0) | 0) & 0x7ff;
                arg0.model1Type = 5;
                arg0.model1Id = (Number(BigInt.asIntN(32, JagString.fromLatin1String(Client.localPlayer!.name).toUserhash())) << 11) + 2047;
                arg0.modelAnim = Client.localPlayer!.secondarySeqId;
                arg0.animFrame = Client.localPlayer!.secondarySeqFrame;
            }
        }
    }

    // jag::oldscape::Client::CloseModal
    static closeModal(): void {
        Client.out.p1Enc(ClientProt.CLOSE_MODAL);

        for (let var0 = Client.subinterfaces.search() as SubInterface | null; var0 !== null; var0 = Client.subinterfaces.findnext() as SubInterface | null) {
            if (var0.type === 0) {
                Client.closeSubInterface(var0, true);
            }
        }

        if (Client.resumePauseCom !== null) {
            Client.componentUpdated(Client.resumePauseCom);
            Client.resumePauseCom = null;
        }
    }

    // jag::oldscape::Client::OpenSubinterface
    static openSubInterface(arg0: number, arg1: number, arg2: number): SubInterface {
        const var3 = new SubInterface();
        var3.type = arg0;
        var3.id = arg2;
        Client.subinterfaces.put(BigInt(arg1), var3);
        Client.ifAnimReset(arg2);
        const var4 = IfType.get(arg1);
        if (var4 !== null) {
            Client.componentUpdated(var4);
        }
        if (Client.resumePauseCom !== null) {
            Client.componentUpdated(Client.resumePauseCom);
            Client.resumePauseCom = null;
        }
        Client.isMenuOpen = false;
        Client.menuNumEntries = 0;
        Client.dirtyArea(Client.menuHeight, Client.menuWidth, Client.menuY, Client.menuX);
        if (var4 !== null) {
            Client.computeLayerLayout(false, var4);
        }
        ScriptRunner.executeOnLoad(arg2);
        if (Client.toplevelinterface !== -1) {
            Client.runHookImmediate(Client.toplevelinterface, 1);
        }
        return var3;
    }

    // jag::oldscape::Client::CloseSubinterface
    static closeSubInterface(arg0: SubInterface, arg1: boolean): void {
        const var2 = arg0.id;
        const var3 = Number(arg0.key);
        arg0.unlink();
        if (arg1) {
            IfType.unloadInterface(var2);
        }
        Client.purgeServerActive(var2);
        const var4 = IfType.get(var3);
        if (var4 !== null) {
            Client.componentUpdated(var4);
        }
        // 464 parity: full gameframe redraw on close. componentUpdated() no-ops when the parent
        // was not drawn this cycle (it was covered by the modal being closed), leaving stale
        // pixels over the frame.
        Client.redrawAllComponents();
        Client.menuNumEntries = 0;
        Client.isMenuOpen = false;
        Client.dirtyArea(Client.menuHeight, Client.menuWidth, Client.menuY, Client.menuX);
        if (Client.toplevelinterface !== -1) {
            Client.runHookImmediate(Client.toplevelinterface, 1);
        }
    }

    // jag::oldscape::Client::ClientButton
    static clientButton(arg0: IfType): boolean {
        const code = arg0.clientCode;
        if (code === 205) {
            Client.logoutTimer = 250;
            return true;
        }
        // 464 character design (widget 269) — Java Node.java:101-124:
        // 300-313 cycle body part (300+2p back / 301+2p forward), 314-323 cycle colour,
        // 324/325 gender, 326 accept (send IF_PLAYER_DESIGN 49).
        if (code >= 300 && code <= 313) {
            Client.designCyclePart(((code - 300) / 2) | 0, (code & 0x1) === 1);
            return true;
        }
        if (code >= 314 && code <= 323) {
            const idx = ((code - 314) / 2) | 0;
            const forward = (code & 0x1) === 1;
            const len = PlayerModel.recol1d[idx].length;
            const cur = Client.idkDesign.colour[idx];
            Client.idkDesign.idkChangeColour(forward ? (cur + 1) % len : (cur - 1 + len) % len, idx);
            Client.redrawAllComponents();
            return true;
        }
        if (code === 324 || code === 325) {
            const female = code === 325;
            if (Client.idkDesign.gender !== female) {
                // Java method905/901: keep colours, regenerate default parts for the new gender
                Client.idkDesign.setAppearance(-1, null, Client.idkDesign.colour, female);
                Client.redrawAllComponents();
            }
            return true;
        }
        if (code === 326) {
            // accept: [u8 gender][7x u8 idkId or -1][5x u8 colour] (Java PlayerAppearance.method908)
            Client.out.p1Enc(ClientProt.IF_PLAYER_DESIGN);
            Client.out.p1(Client.idkDesign.gender ? 1 : 0);
            for (let i = 0; i < 7; i++) {
                const v = Client.idkDesign.appearance[PlayerModel.basePartMap[i]];
                Client.out.p1(v !== 0 ? v & 0x3fffffff : -1);
            }
            for (let i = 0; i < 5; i++) {
                Client.out.p1(Client.idkDesign.colour[i]);
            }
            return true;
        }
        return false;
    }

    // Java PlayerAppearance.method899: step the part's idk id, skipping disabled entries and
    // entries whose bodypart doesn't match part+(female?7:0); female skips the beard part (1).
    static designCyclePart(part: number, forward: boolean): void {
        if (part === 1 && Client.idkDesign.gender) {
            return;
        }
        const slot = PlayerModel.basePartMap[part];
        const cur = Client.idkDesign.appearance[slot];
        if (cur === 0) {
            return;
        }
        let id = cur & 0x3fffffff;
        const want = part + (Client.idkDesign.gender ? 7 : 0);
        const n = IdkType.numDefinitions;
        for (let guard = 0; guard <= n; guard++) {
            id = forward ? (id + 1) % n : (id - 1 + n) % n;
            const t = IdkType.list(id);
            if (t !== null && !t.disable && t.type === want) {
                break;
            }
        }
        Client.idkDesign.idkChangePart(part, id);
        Client.redrawAllComponents();
    }

    // jag::oldscape::minimap::Minimap::Draw
    // 464 gameframe minimap (Java GraphicsBuffer.method679): the 465 pane's ct-1338 hook is a bare
    // LAYER with no graphic, so rev-500's calculateGraphicMask() gate never passes. Instead the 464
    // client loads the `mapback` frame sprite and derives the map-circle + compass masks from its
    // transparent pixels (Class19_Sub1.method768). These virtual components carry those masks into
    // the unchanged minimapDraw/drawCompass bodies.
    static mapback: SoftwarePix32 | null = null;
    static mapbackCw: number = 0;
    static mapbackCh: number = 0;
    static mapbackFullOffsets: Int32Array | null = null;
    static mapbackFullLengths: Int32Array | null = null;
    static mapMaskCom: IfType | null = null;
    static compassMaskCom: IfType | null = null;

    static loadMapback(): void {
        const sprites = Client.sprites;
        if (sprites === null || sprites.groupNameHashTable === null) {
            console.log('[dbg] mapback: name table unavailable');
            return; // name tables absent (pre-ref-decode or post-boot discard)
        }
        const gid = sprites.getGroupId('mapback');
        if (gid < 0) {
            console.log('[dbg] mapback: group not found');
            return;
        }
        const fid = sprites.getFileId('', gid);
        if (!PixLoader.depack(sprites, gid, fid)) {
            console.log('[dbg] mapback: depack failed gid=' + gid + ' fid=' + fid);
            return;
        }
        console.log('[dbg] mapback: loaded gid=' + gid + ' canvas=' + PixLoader.owi + 'x' + PixLoader.ohi);
        // full-canvas palette indices (index 0 = transparent hole)
        const cw = PixLoader.owi;
        const ch = PixLoader.ohi;
        const sw = PixLoader.wi[0];
        const sh = PixLoader.hi[0];
        const sx = PixLoader.xof[0];
        const sy = PixLoader.yof[0];
        const pix = PixLoader.bspr[0];
        const idx = new Int8Array(cw * ch);
        for (let yy = 0; yy < sh; yy++) {
            for (let xx = 0; xx < sw; xx++) {
                idx[(yy + sy) * cw + xx + sx] = pix[yy * sw + xx];
            }
        }
        // compass mask: rows 0-32, transparent run within cols 0-34 (method768 first loop)
        const compassOff = new Int32Array(33);
        const compassLen = new Int32Array(33);
        for (let yy = 0; yy < 33; yy++) {
            let start = 999;
            let end = 0;
            for (let xx = 0; xx < 35; xx++) {
                if (idx[yy * cw + xx] === 0) {
                    if (start === 999) {
                        start = xx;
                    }
                } else if (start !== 999) {
                    end = xx;
                    break;
                }
            }
            compassOff[yy] = start;
            compassLen[yy] = end - start;
        }
        // map-circle mask: rows 5-155, transparent run within cols 25-171, top-left 35x35
        // (the compass corner) treated as opaque; offsets stored relative to col 25
        const mapOff = new Int32Array(151);
        const mapLen = new Int32Array(151);
        for (let yy = 5; yy < 156; yy++) {
            let start = 999;
            let end = 0;
            for (let xx = 25; xx < 172; xx++) {
                if (idx[yy * cw + xx] !== 0 || (xx <= 34 && yy <= 34)) {
                    if (start !== 999) {
                        end = xx;
                        break;
                    }
                } else if (start === 999) {
                    start = xx;
                }
            }
            mapOff[yy - 5] = start - 25;
            mapLen[yy - 5] = end - start;
        }
        const mapCom = new IfType();
        mapCom.renderWidth = 146;
        mapCom.renderHeight = 151;
        mapCom.graphicMaskLineOffsets = mapOff;
        mapCom.graphicMaskLineLengths = mapLen;
        const compassCom = new IfType();
        compassCom.renderWidth = 33;
        compassCom.renderHeight = 33;
        compassCom.graphicMaskLineOffsets = compassOff;
        compassCom.graphicMaskLineLengths = compassLen;
        const fullOff = new Int32Array(ch);
        const fullLen = new Int32Array(ch);
        for (let yy = 0; yy < ch; yy++) {
            fullLen[yy] = cw;
        }
        Client.mapbackCw = cw;
        Client.mapbackCh = ch;
        Client.mapbackFullOffsets = fullOff;
        Client.mapbackFullLengths = fullLen;
        Client.mapMaskCom = mapCom;
        Client.compassMaskCom = compassCom;
        Client.mapback = PixLoader.makeSoftwarePix32();
    }

    minimapDraw(com: IfType, redrawIndex: number, x: number, y: number): void {
        const localPlayer = Client.localPlayer!;
        Client.doAudio();
        Pix2D.setClipping(x, y, x + com.renderWidth, y + com.renderHeight);
        if (Client.minimapState == 2 || Client.minimapState == 5) {
            Pix2D.fillScanLine(x, y, com.graphicMaskLineOffsets!, com.graphicMaskLineLengths!);
        } else {
            const angle: number = (Client.orbitCameraYaw + Client.macroMinimapAngle) & 0x7ff;
            let anchorX: number = ((localPlayer.x / 32) | 0) + 48;
            let anchorY: number = 464 - ((localPlayer.z / 32) | 0);
            (Client.field2010 as SoftwarePix32).scanlineRotatePlotSprite(x, y, com.renderWidth, com.renderHeight, anchorX, anchorY, angle, Client.macroMinimapZoom + 256, com.graphicMaskLineOffsets!, com.graphicMaskLineLengths!);

            for (let i: number = 0; i < Client.field930; i++) {
                anchorX = Client.field2577[i] * 4 + 2 - ((localPlayer.x / 32) | 0);
                anchorY = Client.field2501[i] * 4 + 2 - ((localPlayer.z / 32) | 0);
                let loc: LocType | null = LocType.list(Client.field2745[i]);
                if (loc.multiloc !== null) {
                    loc = loc.getMultiLoc();
                    if (loc === null || loc.mapfunction === -1) {
                        continue;
                    }
                }
                Client.minimapDrawDot(y, x, anchorY, com, Client.field4525![loc.mapfunction], anchorX);
            }

            for (let ltx: number = 0; ltx < BuildArea.SIZE; ltx++) {
                for (let ltz: number = 0; ltz < BuildArea.SIZE; ltz++) {
                    const objs = Client.groundObj[Client.minusedlevel][ltx][ltz];
                    if (objs) {
                        anchorX = ltx * 4 + 2 - ((localPlayer.x / 32) | 0);
                        anchorY = ltz * 4 + 2 - ((localPlayer.z / 32) | 0);
                        Client.minimapDrawDot(y, x, anchorY, com, Client.mapdots![0], anchorX);
                    }
                }
            }

            for (let i: number = 0; i < Client.npcCount; i++) {
                const npc: ClientNpc | null = Client.npc[Client.npcIds[i]];
                if (npc !== null && npc.ready()) {
                    let npcType: NpcType | null = npc.type;
                    if (npcType !== null && npcType.multinpc) {
                        npcType = npcType.getMultiNpc();
                    }
                    if (npcType !== null && npcType.minimap && npcType.active && !FogOfWar.hideNpc(npc)) {
                        anchorX = ((npc.x / 32) | 0) - ((localPlayer.x / 32) | 0);
                        anchorY = ((npc.z / 32) | 0) - ((localPlayer.z / 32) | 0);
                        Client.minimapDrawDot(y, x, anchorY, com, Client.mapdots![1], anchorX);
                    }
                }
            }

            for (let i: number = 0; i < Client.playerCount; i++) {
                const player: ClientPlayer | null = Client.players[Client.playerIds[i]];
                if (player && player.ready() && !FogOfWar.hidePlayer(player)) {
                    anchorX = ((player.x / 32) | 0) - ((localPlayer.x / 32) | 0);
                    anchorY = ((player.z / 32) | 0) - ((localPlayer.z / 32) | 0);
                    let friend = false;
                    const userhash: bigint = JagString.fromLatin1String(player.name!).toUserhash();
                    for (let j: number = 0; j < Client.friendCount; j++) {
                        if (userhash === Client.field2086[j] && Client.field3092[j] !== 0) {
                            friend = true;
                            break;
                        }
                    }
                    if (friend) {
                        Client.minimapDrawDot(y, x, anchorY, com, Client.mapdots![3], anchorX);
                    } else if (localPlayer.team !== 0 && player.team !== 0 && localPlayer.team === player.team) {
                        Client.minimapDrawDot(y, x, anchorY, com, Client.mapdots![4], anchorX);
                    } else {
                        Client.minimapDrawDot(y, x, anchorY, com, Client.mapdots![2], anchorX);
                    }
                }
            }

            const arrows = Client.field1171;
            for (let i = 0; i < arrows.length; i++) {
                const arrow = arrows[i];
                if (arrow !== null && arrow.hintType !== 0 && Client.loopCycle % 20 < 10) {
                    if (arrow.hintType === 1 && arrow.hintTarget >= 0 && arrow.hintTarget < Client.npc.length) {
                        const npc = Client.npc[arrow.hintTarget];
                        if (npc !== null) {
                            anchorX = ((npc.x / 32) | 0) - ((localPlayer.x / 32) | 0);
                            anchorY = ((npc.z / 32) | 0) - ((localPlayer.z / 32) | 0);
                            Client.minimapDrawArrow(com, anchorX, y, anchorY, arrow.field2137, x);
                        }
                    }
                    if (arrow.hintType === 2) {
                        anchorX = (arrow.hintTileX - Client.mapBuildBaseX) * 4 + 2 - ((localPlayer.x / 32) | 0);
                        anchorY = (arrow.hintTileZ - Client.mapBuildBaseZ) * 4 + 2 - ((localPlayer.z / 32) | 0);
                        Client.minimapDrawArrow(com, anchorX, y, anchorY, arrow.field2137, x);
                    }
                    if (arrow.hintType === 10 && arrow.hintTarget >= 0 && arrow.hintTarget < Client.players.length) {
                        const player = Client.players[arrow.hintTarget];
                        if (player !== null) {
                            anchorX = ((player.x / 32) | 0) - ((localPlayer.x / 32) | 0);
                            anchorY = ((player.z / 32) | 0) - ((localPlayer.z / 32) | 0);
                            Client.minimapDrawArrow(com, anchorX, y, anchorY, arrow.field2137, x);
                        }
                    }
                }
            }

            if (Client.minimapFlagX !== 0) {
                anchorX = Client.minimapFlagX * 4 + 2 - ((localPlayer.x / 32) | 0);
                anchorY = Client.minimapFlagZ * 4 + 2 - ((localPlayer.z / 32) | 0);
                Client.minimapDrawDot(y, x, anchorY, com, Client.mapflag, anchorX);
            }
            FogOfWar.drawMinimapFog(x, y, com); // MOBA fog: darken unseen tiles (after dots)
            Pix2D.fillRect(((com.renderWidth / 2) | 0) + x - 1, y - -((com.renderHeight / 2) | 0) + -1, 3, 3, 0xffffff);
        }
        Client.componentBlitArea[redrawIndex] = true;
    }

    // jag::oldscape::minimap::Minimap::DrawArrow
    static minimapDrawArrow(arg0: IfType, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number): void {
        const var6 = arg3 * arg3 + arg1 * arg1;
        if (var6 > 360000) {
            return;
        }
        let var7 = Math.min((arg0.renderWidth / 2) | 0, (arg0.renderHeight / 2) | 0);
        if (var7 * var7 >= var6) {
            Client.minimapDrawDot(arg2, arg5, arg3, arg0, Client.hintMapmarkers![arg4], arg1);
            return;
        }
        var7 -= 10;
        const var8 = (Client.macroMinimapAngle + Client.orbitCameraYaw) & 0x7ff;
        const var9 = Pix3D.cosTable[var8];
        const var10 = ((var9 * 256) / (Client.macroMinimapZoom + 256)) | 0;
        const var11 = Pix3D.sinTable[var8];
        const var12 = ((var11 * 256) / (Client.macroMinimapZoom + 256)) | 0;
        const var13 = (var10 * arg3 - arg1 * var12) >> 16;
        const var14 = (arg3 * var12 + arg1 * var10) >> 16;
        const var15 = Math.atan2(var14, var13);
        const var17 = (var7 * Math.sin(var15)) | 0;
        const var18 = (Math.cos(var15) * var7) | 0;
        (Client.hintMapedge![arg4]! as SoftwarePix32).rotateTransPlotSprite(arg5 + ((arg0.renderWidth / 2) | 0) + var17 - 10, ((arg0.renderHeight / 2) | 0) + -10 + arg2 - var18, var15);
    }

    // jag::oldscape::minimap::Minimap::DrawDot
    static minimapDrawDot(arg0: number, arg1: number, arg2: number, arg3: IfType, arg4: Pix32 | null, arg5: number): void {
        if (arg4 === null) {
            return;
        }
        const var6 = (Client.macroMinimapAngle + Client.orbitCameraYaw) & 0x7ff;
        const var7 = arg5 * arg5 + arg2 * arg2;
        const var8 = Math.max((arg3.renderWidth / 2) | 0, (arg3.renderHeight / 2) | 0) + 10;
        if (var7 > var8 * var8) {
            return;
        }
        const var9 = Pix3D.cosTable[var6];
        const var10 = ((var9 * 256) / (Client.macroMinimapZoom + 256)) | 0;
        const var11 = Pix3D.sinTable[var6];
        const var12 = ((var11 * 256) / (Client.macroMinimapZoom + 256)) | 0;
        const var13 = (var10 * arg2 - arg5 * var12) >> 16;
        const var14 = (arg5 * var10 + arg2 * var12) >> 16;
        (arg4 as SoftwarePix32).scanlinePlotSprite(((arg3.renderWidth / 2) | 0) + arg1 + var14 - ((arg4.owi / 2) | 0), -((arg4.ohi / 2) | 0) + ((arg3.renderHeight / 2) | 0) + arg0 + -var13, arg3.graphicMaskLineOffsets!, arg3.graphicMaskLineLengths!);
    }

    // jag::oldscape::Client::AddChat
    static addChat(text: string, type: number, sender: string | null): void;
    static addChat(text: string, field: number, sender: string | null, type: number, screenName: string | null): void;
    static addChat(arg0: string, arg1: number, arg2: string | null, arg3?: number, arg4: string | null = null): void {
        if (arg3 === undefined) {
            Client.addChat(arg0, -1, arg2, arg1, null);
            return;
        }
        for (let var5: number = 99; var5 > 0; var5--) {
            Client.chatType[var5] = Client.chatType[var5 - 1];
            Client.chatUsername[var5] = Client.chatUsername[var5 - 1];
            Client.chatText[var5] = Client.chatText[var5 - 1];
            Client.chatScreenName[var5] = Client.chatScreenName[var5 - 1];
            Client.field2483[var5] = Client.field2483[var5 - 1];
        }
        Client.chatHistoryLength++;
        Client.chatUsername[0] = arg2;
        Client.chatText[0] = arg0;
        Client.chatType[0] = arg3;
        Client.field2483[0] = arg1;
        Client.chatScreenName[0] = arg4;
        Client.chatTransmitNum = Client.transmitNum;
    }

    // jag::oldscape::FriendSystem::IsFriend
    static isFriend(arg0: string | null): boolean {
        if (arg0 === null) {
            return false;
        }

        for (let var1: number = 0; var1 < Client.friendCount; var1++) {
            if (JagString.wrap(arg0).equalsIgnoreCase(Client.field370[var1])) {
                return true;
            }
        }

        return JagString.wrap(arg0).equalsIgnoreCase(JagString.wrap(Client.localPlayer!.name!));
    }

    // jag::oldscape::FriendSystem::IsIgnored
    static isIgnored(arg0: string | null): boolean {
        if (arg0 === null) {
            return false;
        }

        for (let var1: number = 0; var1 < Client.privateMessageCount; var1++) {
            if (JagString.wrap(arg0).equalsIgnoreCase(Client.field2741[var1])) {
                return true;
            }
        }

        return false;
    }

    // jag::oldscape::FriendSystem::AddFriend
    static addFriend(arg0: bigint): void {
        if (arg0 === 0n) {
            return;
        }

        if ((Client.friendCount >= 100 && Client.membersAccount != 1) || Client.friendCount >= 200) {
            Client.addChat(Text.friendlistfull, 0, '');
            return;
        }

        const var2: JagString = JagString.toRawUsername(arg0)!.toScreenName();
        for (let var3: number = 0; var3 < Client.friendCount; var3++) {
            if (Client.field2086[var3] === arg0) {
                Client.addChat(var2.toString() + Text.friendlistdupe, 0, '');
                return;
            }
        }

        for (let var4: number = 0; var4 < Client.privateMessageCount; var4++) {
            if (Client.messageIds[var4] === arg0) {
                Client.addChat(Text.removeignore1 + var2.toString() + Text.removeignore2, 0, '');
                return;
            }
        }

        if (var2.strEquals(JagString.wrap(Client.localPlayer!.name!))) {
            Client.addChat(Text.friendcantaddself, 0, '');
            return;
        }
        Client.field370[Client.friendCount] = var2;
        Client.field2086[Client.friendCount] = arg0;
        Client.field3092[Client.friendCount] = 0;
        Client.field3238[Client.friendCount] = '';
        Client.field845[Client.friendCount] = 0;
        Client.field1120[Client.friendCount] = false;
        Client.friendTransmitNum = Client.transmitNum;
        Client.friendCount++;

        Client.out.p1Enc(ClientProt.FRIENDLIST_ADD);
        Client.out.p8(arg0);
    }

    // jag::oldscape::FriendSystem::AddIgnore
    static addIgnore(arg0: bigint): void {
        if (arg0 === 0n) {
            return;
        }

        if (Client.privateMessageCount >= 100) {
            Client.addChat(Text.ignorelistfull, 0, '');
            return;
        }

        const var2: JagString = JagString.toRawUsername(arg0)!.toScreenName();
        for (let var3: number = 0; var3 < Client.privateMessageCount; var3++) {
            if (Client.messageIds[var3] === arg0) {
                Client.addChat(var2.toString() + Text.ignorelistdupe, 0, '');
                return;
            }
        }

        for (let var4: number = 0; var4 < Client.friendCount; var4++) {
            if (arg0 === Client.field2086[var4]) {
                Client.addChat(Text.removefriend1 + var2.toString() + Text.removefriend2, 0, '');
                return;
            }
        }

        if (var2.strEquals(JagString.wrap(Client.localPlayer!.name!))) {
            Client.addChat(Text.ignorecantaddself, 0, '');
            return;
        }

        Client.messageIds[Client.privateMessageCount] = arg0;
        Client.field2741[Client.privateMessageCount++] = JagString.toRawUsername(arg0);
        Client.friendTransmitNum = Client.transmitNum;

        Client.out.p1Enc(ClientProt.IGNORELIST_ADD);
        Client.out.p8(arg0);
    }

    // jag::oldscape::FriendSystem::DelFriend
    static delFriend(arg0: bigint): void {
        if (arg0 === 0n) {
            return;
        }

        for (let var2: number = 0; var2 < Client.friendCount; var2++) {
            if (Client.field2086[var2] === arg0) {
                Client.friendCount--;

                for (let var3: number = var2; var3 < Client.friendCount; var3++) {
                    Client.field370[var3] = Client.field370[var3 + 1];
                    Client.field3092[var3] = Client.field3092[var3 + 1];
                    Client.field3238[var3] = Client.field3238[var3 + 1];
                    Client.field2086[var3] = Client.field2086[var3 + 1];
                    Client.field845[var3] = Client.field845[var3 + 1];
                    Client.field1120[var3] = Client.field1120[var3 + 1];
                }

                Client.friendTransmitNum = Client.transmitNum;
                Client.out.p1Enc(ClientProt.FRIENDLIST_DEL);
                Client.out.p8(arg0);
                return;
            }
        }
    }

    // jag::oldscape::FriendSystem::DelIgnore
    static delIgnore(arg0: bigint): void {
        if (arg0 === 0n) {
            return;
        }

        for (let var2: number = 0; var2 < Client.privateMessageCount; var2++) {
            if (Client.messageIds[var2] === arg0) {
                Client.privateMessageCount--;

                for (let var3: number = var2; var3 < Client.privateMessageCount; var3++) {
                    Client.messageIds[var3] = Client.messageIds[var3 + 1];
                    Client.field2741[var3] = Client.field2741[var3 + 1];
                }

                Client.friendTransmitNum = Client.transmitNum;
                Client.out.p1Enc(ClientProt.IGNORELIST_DEL);
                Client.out.p8(arg0);
                return;
            }
        }
    }

    // jag::oldscape::FriendSystem::SetFriendRank
    static setFriendRank(arg0: string, arg1: number): void {
        // DO NOT SEND: no 464 mapping — the 9-byte body would inject garbage (202 = size 0).
        void arg0;
        void arg1;
    }

    // jag::oldscape::Client::FriendsChatKickUser
    static friendsChatKickUser(arg0: string): void {
        if (Client.friendChatList === null) {
            return;
        }
        let var1 = 0;
        const var2 = JagString.wrap(arg0).toUserhash();
        if (var2 === 0n) {
            return;
        }
        while (var1 < Client.friendChatList.length && var2 !== Client.friendChatList[var1]!.key) {
            var1++;
        }
        if (Client.friendChatList.length > var1 && Client.friendChatList[var1] !== null) {
            // DO NOT SEND: no 464 mapping — 8-byte body would inject garbage (202 = size 0).
        }
    }

    // jag::oldscape::Client::FriendsChatJoinChat
    static friendsChatJoinChat(arg0: bigint): void {
        if (arg0 !== 0n) {
            // DO NOT SEND: no 464 mapping — 8-byte body would inject garbage (202 = size 0).
        }
    }

    // jag::oldscape::Client::FriendsChatLeaveChat
    static friendsChatLeaveChat(): void {
        // DO NOT SEND: no 464 mapping — 8-byte body would inject garbage (202 = size 0).
    }

    // jag::oldscape::Client::PurgeServerActive
    static purgeServerActive(arg0: number): void {
        for (let var1 = Client.serverActive.search() as IntNode | null; var1 !== null; var1 = Client.serverActive.findnext() as IntNode | null) {
            if (BigInt(arg0) === ((var1.key >> 48n) & 0xffffn)) {
                var1.unlink();
            }
        }
    }

    // jag::oldscape::Client::GetActive
    static getActive(arg0: IfType): number {
        const var1 = Client.serverActive.find((BigInt(arg0.parentId) << 32n) + BigInt(arg0.subId));
        return var1 === null ? arg0.eventCode : var1.value;
    }

    // jag::oldscape::Client::Hide
    static hide(arg0: IfType): boolean {
        if (Client.qaOpTest) {
            if (Client.getActive(arg0) !== 0) {
                return false;
            }
            if (arg0.type === 0) {
                return false;
            }
        }
        return arg0.hide;
    }

    // jag::oldscape::minimenu::Minimenu::GetIftypeOpName
    static getIfTypeOpName(arg0: IfType, arg1: number): string | null {
        if (!ServerActive.hasOp(arg1, Client.getActive(arg0)) && arg0.onop === null) {
            return null;
        } else if (arg0.opNames === null || arg1 >= arg0.opNames.length || arg0.opNames[arg1] === null || arg0.opNames[arg1]!.trim().length === 0) {
            return Client.qaOpTest ? 'Hidden-' + JagString.parseInt(arg1).toString() : null;
        } else {
            return arg0.opNames[arg1];
        }
    }

    // jag::oldscape::Client::TargetVerb
    private static getTargetVerb(com: IfType): string | null {
        if (ServerActive.targetMask(Client.getActive(com)) === 0) {
            return null;
        }

        const verb = com.targetVerb;
        if (verb === null || verb.trim().length === 0) {
            return Client.qaOpTest ? 'Hidden-use' : null;
        }

        return verb;
    }

    // ---- todo: sort

    static combatColourCode(arg0: number, arg1: number): string {
        const var2: number = arg1 - arg0;
        // todo: col tag utility function
        if (var2 < -9) {
            return '<col=ff0000>';
        } else if (var2 < -6) {
            return '<col=ff3000>';
        } else if (var2 < -3) {
            return '<col=ff7000>';
        } else if (var2 < 0) {
            return '<col=ffb000>';
        } else if (var2 > 9) {
            return '<col=00ff00>';
        } else if (var2 > 6) {
            return '<col=40ff00>';
        } else if (var2 > 3) {
            return '<col=80ff00>';
        } else if (var2 > 0) {
            return '<col=c0ff00>';
        } else {
            return '<col=ffff00>';
        }
    }

    static blitArea(arg0: number, arg1: number, arg2: number, arg3: number): void {
        for (let var4 = 0; var4 < Client.componentDrawCount; var4++) {
            if (Client.componentDrawWidth[var4] + Client.componentDrawX[var4] > arg0 && Client.componentDrawX[var4] < arg2 + arg0 && Client.componentDrawY[var4] + Client.componentDrawHeight[var4] > arg3 && arg1 + arg3 > Client.componentDrawY[var4]) {
                Client.componentBlitArea[var4] = true;
            }
        }
    }

    static getParentLayer(arg0: IfType): IfType | null {
        if (arg0.layerId !== -1) {
            return IfType.get(arg0.layerId);
        }
        const var1: number = arg0.parentId >>> 16;
        for (let var2 = Client.subinterfaces.search() as SubInterface | null; var2 !== null; var2 = Client.subinterfaces.findnext() as SubInterface | null) {
            if (var1 === var2.id) {
                return IfType.get(Number(var2.key));
            }
        }
        return null;
    }

    static drawCompass(arg0: number, arg1: number, arg2: number, arg3: IfType): void {
        if (Client.minimapState < 3) {
            (Client.compass as SoftwarePix32).scanlineRotatePlotSprite(
                arg1,
                arg2,
                arg3.renderWidth,
                arg3.renderHeight,
                (Client.compass!.wi / 2) | 0,
                (Client.compass!.hi / 2) | 0,
                Client.orbitCameraYaw,
                arg3.graphicMaskLineOffsets!,
                arg3.graphicMaskLineLengths!
            );
        } else {
            Pix2D.fillScanLine(arg1, arg2, arg3.graphicMaskLineOffsets!, arg3.graphicMaskLineLengths!);
        }
        Client.componentBlitArea[arg0] = true;
    }

    static resumePauseButton(arg0: number, arg1: number): void {
        // 464 op 240: the server (close-modal closeWithPayload) reads a BIG-ENDIAN int packed
        // (widget<<16)|child + a LE short. arg1 IS that packed hash; sending it middle-endian
        // (p4_alt3) scrambled widgetId so "click to continue" failed the chatbox match and the
        // dialogue closed instead of advancing. Send BE to match the server.
        Client.out.p1Enc(ClientProt.RESUME_PAUSEBUTTON);
        Client.out.p4(arg1);
        Client.out.p2_alt1(arg0);
    }

    static enterTargetMode(arg0: number, arg1: number, arg2: number): void {
        const var3 = IfType.get(arg2, arg0);
        if (var3 !== null && var3.ontargetenter !== null) {
            const var4 = new HookReq();
            var4.component = var3;
            var4.onop = var3.ontargetenter;
            ScriptRunner.executeScript(var4);
        }
        Client.targetMode = true;
        Client.targetCom = arg2;
        Client.targetMask = arg1;
        Client.targetSub = arg0;
        Client.componentUpdated(var3);
    }

    static computeTopLevelInterfaceLayout(): void {
        Client.computeInterfaceLayout(Client.sWid, Client.toplevelinterface, Client.sHei, false);
    }

    static computeComponentLayout(arg0: IfType): void {
        const var1 = Client.getParentLayer(arg0);
        let var2: number;
        let var3: number;
        if (var1 === null) {
            var2 = Client.sWid;
            var3 = Client.sHei;
        } else {
            var3 = var1.renderHeight;
            var2 = var1.renderWidth;
        }
        Client.computeComponentPosition(arg0, var2, var3);
    }

    static computeLayerLayout(redraw: boolean, layer: IfType): void;
    static computeLayerLayout(width: number, redraw: boolean, layerId: number, height: number, components: IfType[]): void;
    static computeLayerLayout(arg0: boolean | number, arg1: IfType | boolean, arg2?: number, arg3?: number, arg4?: IfType[]): void {
        if (typeof arg0 === 'boolean') {
            if (Client.layoutGuard++ > 96) {
                // A malformed parentId would otherwise recurse forever and freeze the browser.
                Client.layoutGuard--;
                console.log('[dbg] computeLayerLayout depth guard tripped (bad parentId?)');
                return;
            }
            const var6 = arg0;
            const var7 = arg1 as IfType;
            const var8 = var7.scrollWidth === 0 ? var7.renderWidth : var7.scrollWidth;
            const var9 = var7.scrollHeight === 0 ? var7.renderHeight : var7.scrollHeight;
            Client.computeLayerLayout(var8, var6, var7.parentId, var9, IfType.list[var7.parentId >> 16]!);
            if (var7.subcomponents !== null) {
                Client.computeLayerLayout(var8, var6, var7.parentId, var9, var7.subcomponents);
            }
            const var10 = Client.subinterfaces.find(BigInt(var7.parentId));
            if (var10 !== null) {
                Client.computeInterfaceLayout(var8, var10.id, var9, var6);
            }
            Client.layoutGuard--;
            return;
        }

        for (let var5 = 0; var5 < arg4!.length; var5++) {
            const var6 = arg4![var5];
            if (var6 !== null && arg2 === var6.layerId) {
                Client.computeComponentSize(arg1 as boolean, arg3!, arg0, var6);
                Client.computeComponentPosition(var6, arg0, arg3!);
                if (var6.scrollPosY > var6.scrollHeight - var6.renderHeight) {
                    var6.scrollPosY = var6.scrollHeight - var6.renderHeight;
                }
                if (var6.scrollWidth - var6.renderWidth < var6.scrollPosX) {
                    var6.scrollPosX = var6.scrollWidth - var6.renderWidth;
                }
                if (var6.scrollPosX < 0) {
                    var6.scrollPosX = 0;
                }
                if (var6.scrollPosY < 0) {
                    var6.scrollPosY = 0;
                }
                if (var6.type === 0) {
                    Client.computeLayerLayout(arg1 as boolean, var6);
                }
            }
        }
    }

    static computeInterfaceLayout(arg0: number, arg1: number, arg2: number, arg3: boolean): void {
        if (IfType.openInterface(arg1)) {
            Client.computeLayerLayout(arg0, arg3, -1, arg2, IfType.list[arg1]!);
        }
    }

    static computeComponentSize(arg0: boolean, arg1: number, arg2: number, arg3: IfType): void {
        const var4 = arg3.renderWidth;
        if (arg3.widthAlignment === 0) {
            arg3.renderWidth = arg3.width;
        } else if (arg3.widthAlignment === 1) {
            arg3.renderWidth = arg2 - arg3.width;
        } else if (arg3.widthAlignment === 2) {
            arg3.renderWidth = (arg2 * arg3.width) >> 14;
        } else if (arg3.widthAlignment === 3) {
            if (arg3.type === 2) {
                arg3.renderWidth = arg3.width * 32 + arg3.marginX * (arg3.width - 1);
            } else if (arg3.type === 7) {
                arg3.renderWidth = (arg3.width - 1) * arg3.marginX + arg3.width * 115;
            }
        }

        const var5 = arg3.renderHeight;
        if (arg3.heightAlignment === 0) {
            arg3.renderHeight = arg3.height;
        } else if (arg3.heightAlignment === 1) {
            arg3.renderHeight = arg1 - arg3.height;
        } else if (arg3.heightAlignment === 2) {
            arg3.renderHeight = (arg3.height * arg1) >> 14;
        } else if (arg3.heightAlignment === 3) {
            if (arg3.type === 2) {
                arg3.renderHeight = arg3.marginY * (arg3.height - 1) + arg3.height * 32;
            } else if (arg3.type === 7) {
                arg3.renderHeight = arg3.marginY * (arg3.height - 1) + arg3.height * 12;
            }
        }

        if (Client.qaOpTest && (Client.getActive(arg3) !== 0 || arg3.type === 0)) {
            if (arg3.renderHeight < 5 && arg3.renderWidth < 5) {
                arg3.renderWidth = 5;
                arg3.renderHeight = 5;
            } else {
                if (arg3.renderHeight <= 0) {
                    arg3.renderHeight = 5;
                }
                if (arg3.renderWidth <= 0) {
                    arg3.renderWidth = 5;
                }
            }
        }

        if (arg0 && arg3.onresize !== null && (arg3.renderWidth !== var4 || arg3.renderHeight !== var5)) {
            const var6 = new HookReq();
            var6.onop = arg3.onresize;
            var6.component = arg3;
            ScriptRunner.executeScript(var6);
        }
    }

    static computeComponentPosition(arg0: IfType, arg1: number, arg2: number): void {
        if (arg0.yAlignment === 0) {
            arg0.renderY = arg0.y;
        } else if (arg0.yAlignment === 1) {
            arg0.renderY = arg0.y + (((arg2 - arg0.renderHeight) / 2) | 0);
        } else if (arg0.yAlignment === 2) {
            arg0.renderY = arg2 - arg0.renderHeight - arg0.y;
        } else if (arg0.yAlignment === 3) {
            arg0.renderY = (arg0.y * arg2) >> 14;
        } else if (arg0.yAlignment === 4) {
            arg0.renderY = (((arg2 - arg0.renderHeight) / 2) | 0) + ((arg0.y * arg2) >> 14);
        } else {
            arg0.renderY = arg2 - ((arg0.y * arg2) >> 14) - arg0.renderHeight;
        }

        if (arg0.xAlignment === 0) {
            arg0.renderX = arg0.x;
        } else if (arg0.xAlignment === 1) {
            arg0.renderX = (((arg1 - arg0.renderWidth) / 2) | 0) + arg0.x;
        } else if (arg0.xAlignment === 2) {
            arg0.renderX = arg1 - arg0.x - arg0.renderWidth;
        } else if (arg0.xAlignment === 3) {
            arg0.renderX = (arg1 * arg0.x) >> 14;
        } else if (arg0.xAlignment === 4) {
            arg0.renderX = ((arg1 * arg0.x) >> 14) + (((arg1 - arg0.renderWidth) / 2) | 0);
        } else {
            arg0.renderX = arg1 - arg0.renderWidth - ((arg0.x * arg1) >> 14);
        }

        if (Client.qaOpTest) {
            if (Client.getActive(arg0) === 0 && arg0.type !== 0) {
                return;
            }
            if (arg0.renderY < 0) {
                arg0.renderY = 0;
            } else if (arg2 < arg0.renderHeight + arg0.renderY) {
                arg0.renderY = arg2 - arg0.renderHeight;
            }
            if (arg0.renderX < 0) {
                arg0.renderX = 0;
            } else if (arg0.renderX + arg0.renderWidth > arg1) {
                arg0.renderX = arg1 - arg0.renderWidth;
            }
        }
    }

    static serverDraggable(arg0: IfType): IfType | null {
        const var1 = ServerActive.serverDraggable(Client.getActive(arg0));
        if (var1 === 0) {
            return null;
        }

        for (let var2 = 0; var2 < var1; var2++) {
            arg0 = IfType.get(arg0.layerId)!;
            if (arg0 === null) {
                return null;
            }
        }

        return arg0;
    }

    static friendAddChat(arg0: string, arg1: string, arg2: string): void {
        Client.addChat(arg1, -1, arg0, 9, arg2);
    }

    static getFriendIndex(arg0: string | null): number {
        if (arg0 === null) {
            return -1;
        }

        for (let var1: number = 0; var1 < Client.friendCount; var1++) {
            if (JagString.wrap(arg0).equalsIgnoreCase(Client.field370[var1])) {
                return var1;
            }
        }

        return -1;
    }

    static clampCameraAngle(): void {
        const var0: number = Client.orbitCameraX >> 7;
        Client.orbitCameraYaw &= 0x7ff;
        const var1: number = Client.orbitCameraZ >> 7;
        let var2: number = 0;
        if (Client.orbitCameraPitch < 128) {
            Client.orbitCameraPitch = 128;
        }
        if (Client.orbitCameraPitch > 383) {
            Client.orbitCameraPitch = 383;
        }
        const var3: number = Client.getAvH(Client.orbitCameraX, Client.orbitCameraZ, Client.minusedlevel);

        if (var0 > 3 && var1 > 3 && var0 < 100 && var1 < 100) {
            for (let var4: number = var0 - 4; var4 <= var0 + 4; var4++) {
                for (let var5: number = var1 - 4; var5 <= var1 + 4; var5++) {
                    let var6: number = Client.minusedlevel;
                    if (var6 < 3 && (ClientBuild.mapl[1][var4][var5] & 0x2) === 2) {
                        var6++;
                    }

                    const var7: number = var3 - ClientBuild.groundh![var6][var4][var5];
                    if (var2 < var7) {
                        var2 = var7;
                    }
                }
            }
        }

        let var8: number = var2 * 192;
        if (var8 > 98048) {
            var8 = 98048;
        }
        if (var8 < 32768) {
            var8 = 32768;
        }

        if (Client.cameraPitchClamp < var8) {
            Client.cameraPitchClamp += ((var8 - Client.cameraPitchClamp) / 24) | 0;
        } else if (var8 < Client.cameraPitchClamp) {
            Client.cameraPitchClamp += ((var8 - Client.cameraPitchClamp) / 80) | 0;
        }
    }

    static minimapBuildBuffer(arg0: number): void {
        let var1: SoftwarePix32;
        if (Client.field2010 === null) {
            var1 = new SoftwarePix32(512, 512);
        } else {
            var1 = Client.field2010 as SoftwarePix32;
        }
        const var2: Int32Array = var1.data;
        const var3: number = var2.length;
        for (let var4: number = 0; var4 < var3; var4++) {
            var2[var4] = 1;
        }
        for (let var5: number = 1; var5 < 103; var5++) {
            let var6: number = (103 - var5) * 2048 + 24628;
            for (let var7: number = 1; var7 < 103; var7++) {
                if ((ClientBuild.mapl[arg0][var7][var5] & 0x18) === 0) {
                    World.render2DGround(var2, var6, arg0, var7, var5);
                }
                if (arg0 < 3 && (ClientBuild.mapl[arg0 + 1][var7][var5] & 0x8) !== 0) {
                    World.render2DGround(var2, var6, arg0 + 1, var7, var5);
                }
                var6 += 4;
            }
        }
        var1.setPixels();
        const var8: number = (((Math.random() * 20.0) | 0) + 228) << 16;
        const var9: number = ((((Math.random() * 20.0) | 0) + 228) << 16) + (((((Math.random() * 20.0) | 0) + 228) << 8) - (-((Math.random() * 20.0) | 0) - 238)) - 10;
        for (let var10: number = 1; var10 < 103; var10++) {
            for (let var11: number = 1; var11 < 103; var11++) {
                if ((ClientBuild.mapl[arg0][var11][var10] & 0x18) === 0) {
                    Client.drawDetail(var10, var8, arg0, var9, var11);
                }
                if (arg0 < 3 && (ClientBuild.mapl[arg0 + 1][var11][var10] & 0x8) !== 0) {
                    Client.drawDetail(var10, var8, arg0 + 1, var9, var11);
                }
            }
        }
        Client.field930 = 0;
        for (let var12: number = 0; var12 < 104; var12++) {
            for (let var13: number = 0; var13 < 104; var13++) {
                const var14: SceneTag = World.gdType(Client.minusedlevel, var12, var13);
                if (BigInt(var14) !== 0n) {
                    const var16: LocType = LocType.list(Number((BigInt(var14) >> 32n) & 0x7fffffffn));
                    const var17: number = var16.mapfunction;
                    if (var17 >= 0) {
                        let var18: number = var12;
                        let var19: number = var13;
                        if (var17 !== 22 && var17 !== 29 && var17 !== 34 && var17 !== 36 && var17 !== 46 && var17 !== 47 && var17 !== 48) {
                            const var20: Int32Array[] = Client.collision[Client.minusedlevel]!.flags;
                            for (let var21: number = 0; var21 < 10; var21++) {
                                const var22: number = (Math.random() * 4.0) | 0;
                                if (var22 === 0 && var18 > 0 && var12 - 3 < var18 && (var20[var18 - 1][var19] & 0x12c0108) === 0) {
                                    var18--;
                                }
                                if (var22 === 1 && var18 < 103 && var12 + 3 > var18 && (var20[var18 + 1][var19] & 0x12c0180) === 0) {
                                    var18++;
                                }
                                if (var22 === 2 && var19 > 0 && var19 > var13 - 3 && (var20[var18][var19 - 1] & 0x12c0102) === 0) {
                                    var19--;
                                }
                                if (var22 === 3 && var19 < 103 && var19 < var13 + 3 && (var20[var18][var19 + 1] & 0x12c0120) === 0) {
                                    var19++;
                                }
                            }
                        }
                        Client.field2745[Client.field930] = var16.id;
                        Client.field2577[Client.field930] = var18;
                        Client.field2501[Client.field930] = var19;
                        Client.field930++;
                    }
                }
            }
        }
        Client.field2010 = var1;
        GameShell.drawArea.bind();
    }

    static animateLocation(arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number): void {
        if (arg1 < 0 || arg5 < 0 || arg1 >= 103 || arg5 >= 103) {
            return;
        }
        if (arg2 === 0) {
            const var7 = World.getWall(arg4, arg1, arg5);
            if (var7 !== null) {
                const var8 = Number((BigInt(var7.typecode) >> 32n) & 0x7fffffffn);
                if (arg0 === 2) {
                    var7.modelA = new ClientLocAnim(var8, 2, arg3 + 4, arg4, arg1, arg5, arg6, false, var7.modelA);
                    var7.modelB = new ClientLocAnim(var8, 2, (arg3 + 1) & 0x3, arg4, arg1, arg5, arg6, false, var7.modelB);
                } else {
                    var7.modelA = new ClientLocAnim(var8, arg0, arg3, arg4, arg1, arg5, arg6, false, var7.modelA);
                }
            }
        }
        if (arg2 === 1) {
            const var9 = World.getDecor(arg4, arg1, arg5);
            if (var9 !== null) {
                const var10 = Number((BigInt(var9.typecode) >> 32n) & 0x7fffffffn);
                if (arg0 === 4 || arg0 === 5) {
                    var9.model = new ClientLocAnim(var10, 4, arg3, arg4, arg1, arg5, arg6, false, var9.model);
                } else if (arg0 === 6) {
                    var9.model = new ClientLocAnim(var10, 4, arg3 + 4, arg4, arg1, arg5, arg6, false, var9.model);
                } else if (arg0 === 7) {
                    var9.model = new ClientLocAnim(var10, 4, ((arg3 + 2) & 0x3) + 4, arg4, arg1, arg5, arg6, false, var9.model);
                } else if (arg0 === 8) {
                    var9.model = new ClientLocAnim(var10, 4, arg3 + 4, arg4, arg1, arg5, arg6, false, var9.model);
                    var9.model2 = new ClientLocAnim(var10, 4, ((arg3 + 2) & 0x3) + 4, arg4, arg1, arg5, arg6, false, var9.model2);
                }
            }
        }
        if (arg2 === 2) {
            if (arg0 === 11) {
                arg0 = 10;
            }
            const var11 = World.getScene(arg4, arg1, arg5);
            if (var11 !== null) {
                var11.model = new ClientLocAnim(Number((BigInt(var11.typecode) >> 32n) & 0x7fffffffn), arg0, arg3, arg4, arg1, arg5, arg6, false, var11.model);
            }
        }
        if (arg2 === 3) {
            const var12 = World.getGd(arg4, arg1, arg5);
            if (var12 !== null) {
                var12.model = new ClientLocAnim(Number((BigInt(var12.typecode) >> 32n) & 0x7fffffffn), 22, arg3, arg4, arg1, arg5, arg6, false, var12.model);
            }
        }
    }

    static triggerNpcAnim(arg0: number, arg1: number, arg2: ClientNpc): void {
        if (arg0 === arg2.primarySeqId && arg0 !== -1) {
            const var3 = SeqType.list(arg0);
            const var4 = var3.duplicatebehaviour;
            if (var4 === 1) {
                arg2.primarySeqLoop = 0;
                arg2.primarySeqCycle = 0;
                arg2.primarySeqDelay = arg1;
                arg2.primarySeqFrame = 0;
                Client.triggerSeqSound(false, arg2.z, arg2.primarySeqFrame, arg2.x, var3);
            }
            if (var4 === 2) {
                arg2.primarySeqLoop = 0;
            }
        } else if (arg0 === -1 || arg2.primarySeqId === -1 || SeqType.list(arg0).priority >= SeqType.list(arg2.primarySeqId).priority) {
            arg2.primarySeqCycle = 0;
            arg2.primarySeqDelay = arg1;
            arg2.preanimRouteLength = arg2.routeLength;
            arg2.primarySeqFrame = 0;
            arg2.primarySeqLoop = 0;
            arg2.primarySeqId = arg0;
            if (arg2.primarySeqId !== -1) {
                Client.triggerSeqSound(false, arg2.z, arg2.primarySeqFrame, arg2.x, SeqType.list(arg2.primarySeqId));
            }
        }
    }
}
