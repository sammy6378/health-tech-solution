/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>(); // userId => socketId

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSocketMap.set(userId, client.id);
      await client.join(userId); // join a private room for the user
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      message: string;
      timestamp?: string;
    },
  ) {
    const { senderId, receiverId, message, timestamp } = data;

    console.log('Received message from client:', data);

    this.emitToUser(receiverId, 'chat:message', {
      senderId,
      receiverId,
      message,
      timestamp: timestamp || new Date().toISOString(),
    });

    this.server.to(receiverId).emit('chat:message', data);
  }
}
