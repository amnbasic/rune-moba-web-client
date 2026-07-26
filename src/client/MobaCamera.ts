import { Client } from '#/client/Client.js';
import ClientMouseListener from '#/client/ClientMouseListener.js';
import GameShell from '#/client/GameShell.js';
import Pix3D from '#/dash3d/Pix3D.js';

/**
 * MobaCamera — League-style camera. Direct port of the Java client's
 * MobaCamera.java.
 *
 * SPACE toggles camera lock (consumed in the MOBA key filter — typing in chat is
 * unaffected). Locked = stock behaviour: the camera focus target is the champion.
 * Unlocked = a FREE ANCHOR that edge-panning moves: pushing the cursor against a
 * window edge pans the view across the map in that screen direction (League
 * edge-pan), rotated by the current camera yaw.
 *
 * Single engine hook: Client.followCamera computes the per-frame camera focus
 * target (champion fine coords + server offsets) and smooths orbitCameraX/Z
 * toward it — when unlocked we substitute the free anchor as that target, so the
 * existing smoothing and the >500-unit snap (which makes re-locking jump-cut
 * straight back to the champion) keep working.
 *
 * Screen->world pan mapping mirrors the render rotation: screenX = east*cos(yaw)
 * + north*sin(yaw), depth = north*cos(yaw) - east*sin(yaw); the pan applies the
 * inverse. Auto re-locks off the game pane and on map rebuilds (rebuilds rebase
 * scene-local fine coords, which would orphan the anchor).
 *
 * Caveat (same as Java): the server only syncs entities within its render radius
 * of the PLAYER, so panning far from the champion shows terrain without units.
 */
export default class MobaCamera {
    /** Camera locked to the champion (stock behaviour). Space toggles. */
    static locked: boolean = true;

    /** Cursor-at-edge zone, px. */
    private static readonly EDGE_PX: number = 12;

    /** Pan speed in fine units (128/tile) per frame while at an edge (~25 tiles/s at 50fps). */
    private static readonly PAN_SPEED: number = 64;

    /**
     * Anchor clamp, tiles 20..83 of the loaded 104x104 scene. The camera orbits up
     * to ~17 tiles behind the focus and the terrain/roof samplers read the
     * heightmap at the CAMERA tile without bounds checks — the free anchor must
     * respect the same band the map-rebuild logic guarantees for the player.
     */
    private static readonly MIN_FINE: number = 20 * 128;
    private static readonly MAX_FINE: number = 83 * 128;

    /** Free-cam focus anchor, scene-local fine coords (north = z axis, east = x axis). */
    private static freeNorth: number = 0;
    private static freeEast: number = 0;

    /** Map base last frame — a change means a rebuild rebased the fine coords. */
    private static lastBaseX: number = -1;
    private static lastBaseZ: number = -1;

    /** Space pressed: unlock seeds the anchor at the current focus so there is no jump. */
    static toggleLock(): void {
        MobaCamera.locked = !MobaCamera.locked;
        if (!MobaCamera.locked) {
            MobaCamera.freeNorth = Client.orbitCameraZ;
            MobaCamera.freeEast = Client.orbitCameraX;
        }
    }

    /** Focus target overrides, called from followCamera with the stock (champion) target. */
    static targetNorth(champTarget: number): number {
        return MobaCamera.locked ? champTarget : MobaCamera.freeNorth;
    }

    static targetEast(champTarget: number): number {
        return MobaCamera.locked ? champTarget : MobaCamera.freeEast;
    }

    /** Per-frame edge-pan (followCamera, before the targets are read). */
    static tick(): void {
        if (Client.toplevelinterface !== 548) {
            // Title/welcome/loading: the anchor is meaningless.
            MobaCamera.locked = true;
            return;
        }
        if (Client.mapBuildBaseX !== MobaCamera.lastBaseX || Client.mapBuildBaseZ !== MobaCamera.lastBaseZ) {
            // Map rebuild rebased the scene-local fine coords — re-lock.
            MobaCamera.lastBaseX = Client.mapBuildBaseX;
            MobaCamera.lastBaseZ = Client.mapBuildBaseZ;
            MobaCamera.locked = true;
            return;
        }
        if (MobaCamera.locked || !document.hasFocus()) {
            return;
        }
        const mx = ClientMouseListener.mouseX;
        const my = ClientMouseListener.mouseY;
        const w = GameShell.sWid;
        const h = GameShell.sHei;
        if (mx < 0 || my < 0 || mx >= w || my >= h) {
            return;
        }
        let panX = 0; // screen-right
        let panD = 0; // screen-up = camera-forward (depth)
        if (mx <= MobaCamera.EDGE_PX) {
            panX = -MobaCamera.PAN_SPEED;
        } else if (mx >= w - 1 - MobaCamera.EDGE_PX) {
            panX = MobaCamera.PAN_SPEED;
        }
        if (my <= MobaCamera.EDGE_PX) {
            panD = MobaCamera.PAN_SPEED;
        } else if (my >= h - 1 - MobaCamera.EDGE_PX) {
            panD = -MobaCamera.PAN_SPEED;
        }
        if (panX === 0 && panD === 0) {
            return;
        }
        const yaw = (Client.orbitCameraYaw + Client.macroCameraAngle) & 0x7ff;
        const sin = Pix3D.sinTable[yaw];
        const cos = Pix3D.cosTable[yaw];
        // Inverse of the render rotation (see class doc): screen pan -> world delta.
        MobaCamera.freeEast += (panX * cos - panD * sin) >> 16;
        MobaCamera.freeNorth += (panX * sin + panD * cos) >> 16;
        MobaCamera.freeEast = MobaCamera.clamp(MobaCamera.freeEast);
        MobaCamera.freeNorth = MobaCamera.clamp(MobaCamera.freeNorth);
    }

    private static clamp(fine: number): number {
        if (fine < MobaCamera.MIN_FINE) {
            return MobaCamera.MIN_FINE;
        }
        if (fine > MobaCamera.MAX_FINE) {
            return MobaCamera.MAX_FINE;
        }
        return fine;
    }
}
