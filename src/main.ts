import cors from 'cors';
import bcrypt from 'bcrypt';
import Redis from 'ioredis';
import express from 'express';
import passport from 'passport';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { SessionSocket } from './types';
import { StorageService } from './store';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import { createAdapter } from 'socket.io-redis';
import { createSessionMiddleware } from './middleware';
import { BasicStrategy } from 'passport-http';
import { handlePrivateMessage, handleSessionDisconnect } from './handlers';
import {
  PORT,
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  SOCKET_CONNECTED,
  USER_DISCONNECTED,
} from './constants';
import {
  joinRoom,
  emitNewSessionDetails,
  emitUserSessionsWithMessages,
  broadcastUserSessionConnected,
} from './util';
import session from 'express-session';

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

const findUser = async (username: string) => {
  return redisClient
    .hmget(`user:${username}`, 'username', 'password')
    .then(([username, password]) =>
      username ? { username, password } : undefined,
    );
};

const saveUser = async (username: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);

  await redisClient
    .multi()
    .hset(`user:${username}`, 'username', username, 'password', passwordHash)
    .exec();
};

const ADMIN_USER = 'mw';
const ADMIN_PASSWORD = 'admin';
const SESSION_SECRET = 'secret';
// const CLIENT_URL = 'http://localhost:3000';

// saveUser(ADMIN_USER, ADMIN_PASSWORD);

const app = express();

const RedisStore = connectRedis(session);

interface User {
  password: string;
  username: string;
}

passport.serializeUser(async ({ username }: User, done) => {
  done(null, username);
});

passport.deserializeUser(async (username: string, done) => {
  const user = await findUser(username);
  done(null, user);
});

app.use(bodyParser.json(), cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new BasicStrategy(async (username, password, done) => {
    const user = await findUser(username);

    console.log(user);

    if (!user) {
      return done(null, false);
    }

    // Always use hashed passwords and fixed time comparison
    await bcrypt.compare(password, user.password, (error, isValid) => {
      if (error) {
        return done(error);
      }
      if (!isValid) {
        return done(null, false);
      }
      return done(null, user);
    });
  }),
);

app.post(
  '/admin/login',
  passport.authenticate('basic', { session: true }),
  (request, response) => {
    response.json(request.user);
  },
);

app.post('/messages', async ({ body: message }, response) => {
  io.emit(PRIVATE_MESSAGE, message);
  await storageService.saveMessage(message);
  response.send(message);
});

app.post('/users', async ({ body: user }, response) => {
  await storageService.sessionRepository.saveSession(user.sessionId, user);
  io.emit(user.connected ? USER_CONNECTED : USER_DISCONNECTED, user);
  response.send(user);
});

app.listen(9001);
