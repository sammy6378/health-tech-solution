import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  handleMessage(@Body() body: { message: string }) {
    const response = this.chatbotService.getResponse(body.message);
    return { response };
  }
}
