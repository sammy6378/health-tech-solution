import {
  Controller,
  Header,
  Post,
  Res,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatappService } from './chatapp.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { ChatRequestDto, ChatWithContextDto } from './dto/chatMessage.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import {
  CurrentUser,
  CurrentUserData,
} from 'src/auth/decorators/currentuser.decorator';

@Controller('chatapp')
export class ChatappController {
  constructor(private readonly chatappService: ChatappService) {}

  @Post('chat')
  @Public()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Transfer-Encoding', 'chunked')
  async chat(
    @Body(ValidationPipe) chatRequest: ChatRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.chatappService.handleRequest(chatRequest.messages, res);
  }

  @Post('chat-with-context')
  @UseGuards(AtGuard)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Transfer-Encoding', 'chunked')
  async chatWithContext(
    @Body(ValidationPipe) chatRequest: ChatWithContextDto,
    @CurrentUser() user: CurrentUserData,
    @Res() res: Response,
  ): Promise<void> {
    console.log('user', user);
    await this.chatappService.handleRequestWithContext(
      chatRequest.messages,
      res,
      chatRequest.contextData,
      user.id,
    );
  }

  @Get('health')
  @Public()
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
