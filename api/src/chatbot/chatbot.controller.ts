import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chat')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  async handleChat(@Body() body: { message: string }) {
    const response = await this.chatbotService.sendMessage(body.message);
    return { response };
  }
}
