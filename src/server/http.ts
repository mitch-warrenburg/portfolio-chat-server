import cors from 'cors';
import env from '../env';
import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import AuthService from '../auth';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { AdminUser } from '../types';
import StorageService from '../store';
import cookieParser from 'cookie-parser';
import { BasicStrategy } from 'passport-http';
import {
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  USER_DISCONNECTED,
} from '../constants';

const app = express();

export default async (
  io: Server,
  authService: AuthService,
  storageService: StorageService,
) => {
  passport.serializeUser(async ({ username }: AdminUser, done) => {
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
        const isValid = await authService.authenticateAdmin(username, password);
        done(null, isValid ? { username, password } : false);
      } catch (e) {
        done(e);
      }
    }),
  );

  /* public routes */
  app.get('/health', (_, response) => {
    response.status(200).json({ status: 'UP' });
  });

  app.get('/api/v1/chat/defaultSendToUser', (_, response) => {
    response
      .status(200)
      .json({ userId: env.adminUserId, username: env.adminUsername });
  });

  /* protected routes */

  app.post(
    '/api/v1/chat/messages',
    passport.authenticate('basic', { session: true }),
    async ({ body }, response) => {
      const message = await storageService.saveMessage(body);
      response.status(201).send(message);
      io.emit(PRIVATE_MESSAGE, message);
    },
  );

  app.post(
    '/api/v1/chat/sessions',
    passport.authenticate('basic', { session: true }),
    async ({ body }, response) => {
      const session = await storageService.createSession(body);
      io.emit(session.connected ? USER_CONNECTED : USER_DISCONNECTED, session);
      response.status(201).send(session);
    },
  );

  app.get(
    '/api/v1/chat/sessions',
    passport.authenticate('basic', { session: true }),
    async (_, response) => {
      const sessions = await storageService.findAllSessions();
      response.send({ sessions });
    },
  );

  app.get(
    '/api/v1/chat/sessions/:id',
    passport.authenticate('basic', { session: true }),
    async ({ params }, response) => {
      const session = await storageService.findSession(params['id']);
      if (session) {
        response.send(session);
      } else {
        response.sendStatus(404);
      }
    },
  );

  app.delete(
    '/api/v1/chat/sessions',
    passport.authenticate('basic', { session: true }),
    async (_, response) => {
      const sessionIds = await storageService.deleteAllSessions();

      if (sessionIds) {
        response.send({ sessionIds });
      } else {
        response.sendStatus(404);
      }
    },
  );

  app.delete(
    '/api/v1/chat/sessions/:id',
    passport.authenticate('basic', { session: true }),
    async ({ params }, response) => {
      const sessionId = await storageService.deleteSession(params['id']);
      if (sessionId) {
        response.send({ sessionId });
      } else {
        response.sendStatus(404);
      }
    },
  );

  app.post(
    '/api/v1/admin/auth',
    passport.authenticate('basic', { session: true }),
    async (_, response) => {
      const admin = await storageService.findAdminUser(env.adminUsername);

      if (!admin) {
        response.status(500).json({
          message: 'No admin user found for the configured credentials.',
        });
      } else {
        response.status(200).json({
          userId: env.adminUserId,
          username: env.adminUsername,
          sessionId: env.adminSessionId,
          token: jwt.sign(env.adminUsername, admin.secret),
        });
      }
    },
  );

  app.post('/api/v1/admin/logout', async (request, response) => {
    const authHeader = request.header('Authorization');

    if (!authHeader) {
      response.sendStatus(401);
    }

    try {
      if (await authService.authenticateHttpJwt(authHeader)) {
        await authService.refreshAdminUser();
        response.json({
          username: env.adminUsername,
          message: 'Successfully logged out.',
        });
        return;
      }
    } catch (e) {
      console.error(e);
    }

    response.sendStatus(403);
  });

  app.listen(env.httpPort);
};
