import cors from 'cors';
import env from '../env';
import express from 'express';
import passport from 'passport';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { User } from '../types';
import cookieParser from 'cookie-parser';
import { StorageService } from '../store';
import { authenticateAdmin } from '../auth';
import { BasicStrategy } from 'passport-http';
import {
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  USER_DISCONNECTED,
} from '../constants';

const app = express();

export default async (io: Server, storageService: StorageService) => {
  await storageService.deleteAllAdminUsers();
  await storageService.saveAdminUser(env.adminUsername, env.adminPassword);

  passport.serializeUser(async ({ username }: User, done) => {
    done(null, username);
  });

  passport.deserializeUser(async (username: string, done) => {
    const user = await storageService.findAdminUser(username);
    done(null, user);
  });

  app.use(
    cookieParser(),
    bodyParser.json(),
    cors({ origin: env.corsOrigins, methods: env.corsMethods }),
  );
  app.use(passport.initialize());

  passport.use(
    new BasicStrategy(async (username, password, done) => {
      try {
        const isValid = await authenticateAdmin(
          storageService,
          username,
          password,
        );
        done(null, isValid ? { username, password } : false);
      } catch (e) {
        done(e);
      }
    }),
  );

  /* public routes */

  app.get('/api/v1/chat/defaultSendToUserId', (_, response) => {
    response.json({ userId: env.adminUserId });
  });

  /* protected routes */

  app.post(
    '/admin/auth',
    passport.authenticate('basic', { session: true }),
    (request, response) => {
      const { username } = request.user as User;
      response.json({
        username,
        userId: env.adminUserId,
        sessionId: env.adminSessionId,
      });
    },
  );

  app.post(
    '/messages',
    passport.authenticate('basic', { session: true }),
    async ({ body: message }, response) => {
      io.emit(PRIVATE_MESSAGE, message);
      await storageService.saveMessage(message);
      response.send(message);
    },
  );

  app.post(
    '/users',
    passport.authenticate('basic', { session: true }),
    async ({ body: user }, response) => {
      await storageService.sessionRepository.saveSession(user.sessionId, user);
      io.emit(user.connected ? USER_CONNECTED : USER_DISCONNECTED, user);
      response.send(user);
    },
  );

  app.listen(env.httpPort);
};
