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
import { Request, Response } from 'express';
import { ChatappService } from './chatapp.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { ChatRequestDto, TestQueryDto } from './dto/chatMessage.dto';
import { AtGuard } from 'src/auth/guards/at.guard';
import {
  CurrentUser,
  CurrentUserData,
} from 'src/auth/decorators/currentuser.decorator';
import { UsersService } from 'src/users/users.service';
import { AiQueryService } from 'src/ai-tool/service/select-services';
import { Role } from 'src/users/dto/create-user.dto';

@Controller('chatapp')
export class ChatappController {
  constructor(
    private readonly chatappService: ChatappService,
    private readonly usersService: UsersService,
    private readonly chatService: AiQueryService,
  ) {}

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
    @Body(ValidationPipe) chatRequest: ChatRequestDto,
    @CurrentUser() user: CurrentUserData,
    @Res() res: Response,
  ): Promise<void> {
    await this.chatappService.handleRequestWithPatientContext(
      chatRequest.messages,
      res,
      user.id,
    );
  }

  @Post('test')
  @UseGuards(AtGuard)
  async chatquery(
    @CurrentUser() user: CurrentUserData,
    @Body(ValidationPipe) testQuery: TestQueryDto, // Change this line
  ) {
    console.log('Test query received:', testQuery.query);
    console.log('User', user.id);
    return await this.chatService.handleQuery(
      user.id,
      Role.PATIENT,
      testQuery.query,
    ); // Change this line
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
