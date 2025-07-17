import { Injectable } from '@nestjs/common';
import { SocketsService } from 'src/sockets/sockets.service';

@Injectable()
export class ChatbotService {
  constructor(private readonly socketService: SocketsService) {}

  sendChatMessage(senderId: string, receiverId: string, message: string) {
    // Emit chat message via WebSocket
    this.socketService.sendChatMessage(senderId, receiverId, message);
  }
}
