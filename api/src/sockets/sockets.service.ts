// src/socket/socket.service.ts
import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketsService {
  constructor(private readonly socketGateway: SocketGateway) {}

  // Send chat message
  sendChatMessage(senderId: string, receiverId: string, message: string) {
    const payload = {
      senderId,
      receiverId,
      message,
      timestamp: new Date().toISOString(),
    };
    this.socketGateway.emitToUser(receiverId, 'chat:message', payload);
  }

  // Send notification
  sendNotification(userId: string, title: string, description: string) {
    const notification = {
      title,
      description,
      timestamp: new Date().toISOString(),
    };
    this.socketGateway.emitToUser(userId, 'notification:new', notification);
  }
}
