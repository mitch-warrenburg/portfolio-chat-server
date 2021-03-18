import cors from 'cors';
import bcrypt from 'bcrypt';
import express from 'express';
import passport from 'passport';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import { AdminUser } from '../types';
import cookieParser from 'cookie-parser';
import { StorageService } from '../store';
import { BasicStrategy } from 'passport-http';
import {
  HTTP_PORT,
  CORS_CONFIG,
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  USER_DISCONNECTED,
} from '../constants';

const app = express();

export default async (io: Server, storageService: StorageService) => {
  await storageService.deleteAllAdminUsers();
  await storageService.saveAdminUser('mw', 'admin');

  passport.serializeUser(async ({ username }: AdminUser, done) => {
    done(null, username);
  });

  passport.deserializeUser(async (username: string, done) => {
    const user = await storageService.findAdminUser(username);
    done(null, user);
  });

  app.use(cookieParser());
  app.use(bodyParser.json(), cors(CORS_CONFIG));
  app.use(passport.initialize());

  passport.use(
    new BasicStrategy(async (username, password, done) => {
      const user = await storageService.findAdminUser(username);

      if (!user) {
        return done(null, false);
      }

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
    '/admin/auth',
    passport.authenticate('basic', { session: false }),
    (request, response) => response.json(request.user),
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

  app.listen(HTTP_PORT);
};
