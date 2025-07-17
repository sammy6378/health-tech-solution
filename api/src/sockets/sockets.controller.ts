import { Controller, Post, Body } from '@nestjs/common';
import { SocketsService } from './sockets.service';

@Controller('sockets')
export class SocketsController {
  constructor(private readonly socketsService: SocketsService) {}

  // chat messages
  @Post('chat')
  sendChatMessage(
    @Body() body: { senderId: string; receiverId: string; message: string },
  ) {
    const { senderId, receiverId, message } = body;
    this.socketsService.sendChatMessage(senderId, receiverId, message);
  }

  // notifications
  @Post('notification')
  sendNotification(
    @Body() body: { userId: string; title: string; description: string },
  ) {
    const { userId, title, description } = body;
    this.socketsService.sendNotification(userId, title, description);
  }
}
