import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { EventsService } from './events.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly websocketService: EventsService) {}

  afterInit(server: Server) {
    this.websocketService.initServer(server);
  }
}
