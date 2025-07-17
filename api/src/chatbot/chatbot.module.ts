import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SocketsService } from 'src/sockets/sockets.service';
import { SocketGateway } from 'src/sockets/socket.gateway';

@Module({
  imports: [SocketGateway],
  providers: [ChatbotService, SocketsService, SocketGateway],
  exports: [ChatbotService],
})
export class ChatbotModule {}
