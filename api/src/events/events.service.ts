import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class EventsService {
  private server: Server;

  initServer(server: Server) {
    this.server = server;
  }

  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  sendToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }
}
