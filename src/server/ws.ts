import { Server } from 'socket.io';
import { StorageService } from '../store';
import { createAdapter } from 'socket.io-redis';
import { SessionSocket, RedisExtended } from '../types';
import { createSessionMiddleware } from '../middleware';
import { WS_PORT, SOCKET_CONNECTED, CORS_CONFIG } from '../constants';
import { handlePrivateMessage, handleSessionDisconnect } from '../handlers';
import {
  joinRoom,
  emitNewSessionDetails,
  emitUserSessionsWithMessages,
  broadcastUserSessionConnected,
} from '../util';

export default (redisClient: RedisExtended, storageService: StorageService) => {
  const io = new Server(WS_PORT, { cors: CORS_CONFIG });

  io.adapter(
    createAdapter({
      pubClient: redisClient.duplicate(),
      subClient: redisClient.duplicate(),
    }),
  );

  io.use(createSessionMiddleware(storageService));

  const onConnection = async (socket: SessionSocket) => {
    await storageService.saveSession(socket, true);

    emitNewSessionDetails(socket);
    joinRoom(socket);

    const sessions = await storageService.getUserSessionsWithMessages(socket);

    emitUserSessionsWithMessages(socket, sessions);
    broadcastUserSessionConnected(socket);

    handlePrivateMessage(socket, storageService);
    handleSessionDisconnect(io, socket, storageService);
  };

  io.on(SOCKET_CONNECTED as 'connection', onConnection);

  return io;
};
