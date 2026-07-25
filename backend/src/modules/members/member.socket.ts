import { EventEmitter } from "node:events";

import type { Role } from "../../generated/prisma/client.js";

export type MemberSocketEventName =
  | "member:invited"
  | "member:updated"
  | "member:role-changed"
  | "member:status-changed"
  | "member:removed"
  | "invite:cancelled";

export interface MemberSocketEvent {
  event: MemberSocketEventName;
  workspaceId: string;
  memberId?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
  createdAt: Date;
}

class MemberEventBus extends EventEmitter {
  publish(event: MemberSocketEvent): void {
    this.emit(`workspace:${event.workspaceId}`, event);
  }

  subscribe(
    workspaceId: string,
    listener: (event: MemberSocketEvent) => void,
  ): () => void {
    const eventName = `workspace:${workspaceId}`;

    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }
}

export const memberSocket = new MemberEventBus();
