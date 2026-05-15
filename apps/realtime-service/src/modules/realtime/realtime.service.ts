import type { Server, Socket } from "socket.io";
import type { OrderCreatedPayload } from "@rm/events";

export class RealtimeService {
  constructor(private readonly io: Server) {}

  onConnection(socket: Socket): void {
    const tenantId = String(socket.handshake.headers["x-tenant-id"] || "");
    if (tenantId) socket.join(`tenant:${tenantId}`);

    socket.on("join:branch", (branchId: string) => {
      const safeBranchId = String(branchId || "");
      if (tenantId && safeBranchId) {
        socket.join(`tenant:${tenantId}:branch:${safeBranchId}`);
      }
    });
  }

  onOrderCreated(evt: OrderCreatedPayload): void {
    this.io.to(`tenant:${evt.tenantId}`).emit("order:created", evt.payload);
  }
}
