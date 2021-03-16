import Redis from 'ioredis';
import { Server } from 'socket.io';
import StorageService from './store';
import { SessionSocket } from './types';
import { createAdapter } from 'socket.io-redis';
import { PORT, SOCKET_CONNECTED } from './constants';
import { createSessionMiddleware } from './middleware';
import { handlePrivateMessage, handleSessionDisconnect } from './handlers';
import {
  joinRoom,
  emitSessionDetails,
  emitUserSessionsWithMessages,
  broadcastUserSessionConnected,
} from './util';

const io = new Server(PORT, { cors: { origin: '*' } });
const redisClient = new Redis();
const storageService = new StorageService(redisClient.duplicate());


io.adapter(
  createAdapter({
    pubClient: redisClient.duplicate(),
    subClient: redisClient.duplicate(),
  }),
);

io.use(createSessionMiddleware(storageService));

const onConnection = async (socket: SessionSocket) => {
  await storageService.saveSession(socket, true);

  emitSessionDetails(socket);
  joinRoom(socket);

  const sessions = await storageService.getUserSessionsWithMessages(socket);

  emitUserSessionsWithMessages(socket, sessions);
  broadcastUserSessionConnected(socket);

  handlePrivateMessage(socket, storageService);
  handleSessionDisconnect(io, socket, storageService);
};

io.on(SOCKET_CONNECTED, onConnection);
