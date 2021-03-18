import Redis from 'ioredis';
import express from 'express';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { SessionSocket } from './types';
import { StorageService } from './store';
import { createAdapter } from 'socket.io-redis';
import {
  PORT,
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  SOCKET_CONNECTED,
} from './constants';
import { createSessionMiddleware } from './middleware';
import { handlePrivateMessage, handleSessionDisconnect } from './handlers';
import {
  joinRoom,
  emitNewSessionDetails,
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

  emitNewSessionDetails(socket);
  joinRoom(socket);

  const sessions = await storageService.getUserSessionsWithMessages(socket);

  emitUserSessionsWithMessages(socket, sessions);
  broadcastUserSessionConnected(socket);

  handlePrivateMessage(socket, storageService);
  handleSessionDisconnect(io, socket, storageService);
};

io.on(SOCKET_CONNECTED as 'connection', onConnection);

const app = express();

app.use(bodyParser.json());

app.post('/messages', async ({ body: message }, response) => {
  io.emit(PRIVATE_MESSAGE, message);
  await storageService.saveMessage(message);
  response.send(message);
});

app.post('/users', async ({ body: user }, response) => {
  await storageService.sessionRepository.saveSession(user.sessionId, user);
  io.emit(USER_CONNECTED, user);
  response.send(user);
});

app.listen(9001);
