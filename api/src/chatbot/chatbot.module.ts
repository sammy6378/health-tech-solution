import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
