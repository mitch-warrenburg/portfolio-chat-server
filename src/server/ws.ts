import env from '../env';
import AuthService from '../auth';
import { Server } from 'socket.io';
import StorageService from '../store';
import { SOCKET_CONNECTED } from '../constants';
import { createAdapter } from 'socket.io-redis';
import { SessionSocket, RedisExtended } from '../types';
import { createSessionMiddleware } from '../middleware';
import {
  handleTypingEvents,
  handlePrivateMessage,
  handleSessionDisconnect,
} from '../handlers';
import {
  joinRoom,
  emitNewSessionDetails,
  emitUserSessionsWithMessages,
  broadcastUserSessionConnected,
} from '../util';

export default (
  redisClient: RedisExtended,
  storageService: StorageService,
  authService: AuthService,
) => {
  const io = new Server(env.wsPort, {
    cors: { origin: env.corsOrigins, methods: env.corsMethods },
  });

  io.adapter(
    createAdapter({
      pubClient: redisClient.duplicate(),
      subClient: redisClient.duplicate(),
    }),
  );

  io.use(createSessionMiddleware(authService, storageService));

  const onConnection = async (socket: SessionSocket) => {
    await storageService.saveSession(socket, true);

    emitNewSessionDetails(socket);
    joinRoom(socket);

    const sessions = await storageService.getUserSessionsWithMessages(socket);

    emitUserSessionsWithMessages(socket, sessions);
    broadcastUserSessionConnected(socket);

    handleTypingEvents(socket);
    handlePrivateMessage(socket, storageService);
    handleSessionDisconnect(io, socket, storageService);
  };

  io.on(SOCKET_CONNECTED as 'connection', onConnection);

  return io;
};
