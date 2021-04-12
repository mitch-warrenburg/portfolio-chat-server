import env from '../env';
import AuthService from '../auth';
import { Server } from 'socket.io';
import StorageService from '../store';
import { createAdapter } from 'socket.io-redis';
import { SOCKET_CONNECTED } from '../constants';
import { createSessionMiddleware } from '../middleware';
import { SessionSocket, RedisExtended, Session } from '../types';
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
  adminSession: Session,
) => {
  const io = new Server(env.wsPort, {
    pingInterval: 5000,
    pingTimeout: 10000,
    transports: ['websocket'],
    cors: { origin: env.corsOrigins, methods: env.corsMethods },
  });

  io.adapter(
    createAdapter({
      pubClient: redisClient.duplicate(),
      subClient: redisClient.duplicate(),
    }),
  );

  io.use(createSessionMiddleware(adminSession, authService, storageService));

  const onConnection = async (socket: SessionSocket) => {
    await storageService.saveSession(socket, true);

    emitNewSessionDetails(socket);
    joinRoom(socket);

    const sessions = await storageService.getUserSessionsWithMessages(socket, adminSession);

    emitUserSessionsWithMessages(socket, sessions);
    broadcastUserSessionConnected(socket);

    handleTypingEvents(socket);
    handlePrivateMessage(socket, storageService);
    handleSessionDisconnect(io, socket, storageService);
  };

  io.on(SOCKET_CONNECTED as 'connection', onConnection);

  return io;
};
