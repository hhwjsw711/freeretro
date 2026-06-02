import type { RetroRegistry } from "./retro-registry";
import type { RetroRoom } from "./retro-room";

export interface Env {
  RETRO_REGISTRY: DurableObjectNamespace<RetroRegistry>;
  RETRO_ROOM: DurableObjectNamespace<RetroRoom>;
}
