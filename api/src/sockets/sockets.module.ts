import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsController } from './sockets.controller';
import { SocketGateway } from './socket.gateway';

@Module({
  controllers: [SocketsController],
  providers: [SocketsService, SocketGateway],
})
export class SocketsModule {}
