import { Server } from 'socket.io';

type SocketEvent =
  | 'shipment:update'
  | 'alert:new'
  | 'route:blocked'
  | 'recommendation:new'
  | 'initial:state';

class NotifierService {
  private io: Server | null = null;

  init(io: Server) {
    this.io = io;
  }

  emit(event: SocketEvent, data: unknown) {
    if (!this.io) {
      console.warn('[Notifier] Socket.io not initialised');
      return;
    }
    this.io.emit(event, data);
  }

  emitToRoom(room: string, event: SocketEvent, data: unknown) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }
}

export const notifier = new NotifierService();
