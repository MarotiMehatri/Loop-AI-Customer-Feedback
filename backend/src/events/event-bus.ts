import { EventEmitter } from "node:events";
import type { EventMap, EventHandler } from "./event.types.js";
import type { EventName } from "./event-names.js";

class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  on<K extends EventName>(event: K, handler: EventHandler<EventMap[K]>): void {
    this.emitter.on(event, handler as (...args: unknown[]) => void);
  }

  off<K extends EventName>(event: K, handler: EventHandler<EventMap[K]>): void {
    this.emitter.off(event, handler as (...args: unknown[]) => void);
  }

  async emit<K extends EventName>(event: K, data: EventMap[K]): Promise<void> {
    const listeners = this.emitter.listeners(event) as Array<
      EventHandler<EventMap[K]>
    >;
    await Promise.all(listeners.map((handler) => handler(data)));
  }
}

export const eventBus = new EventBus();
