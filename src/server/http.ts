import cors from 'cors';
import env from '../env';
import express from 'express';
import AuthService from '../auth';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import StorageService from '../store';
import cookieParser from 'cookie-parser';
import {
  USER_CONNECTED,
  PRIVATE_MESSAGE,
  USER_DISCONNECTED,
} from '../constants';

const app = express();

export default (
  io: Server,
  authService: AuthService,
  storageService: StorageService,
) => {
  app.use(
    cookieParser(),
    bodyParser.json(),
    cors({ origin: env.corsOrigins, methods: env.corsMethods }),
  );

  /* public routes */
  app.get('/health', (_, response) => {
    response.status(200).json({ status: 'UP' });
  });

  /* protected routes */
  app.post('/api/v1/chat/messages', async ({ body, cookies }, response) => {
    if (await authService.authenticateHttpRequest(cookies, response, true)) {
      const message = await storageService.saveMessage(body);
      response.status(201).send(message);
      io.emit(PRIVATE_MESSAGE, message);
    }
  });

  app.post('/api/v1/chat/sessions', async ({ body, cookies }, response) => {
    if (await authService.authenticateHttpRequest(cookies, response, true)) {
      const session = await storageService.createSession(body);
      io.emit(session.connected ? USER_CONNECTED : USER_DISCONNECTED, session);
      response.status(201).send(session);
    }
  });

  app.get('/api/v1/chat/sessions', async ({ cookies }, response) => {
    if (await authService.authenticateHttpRequest(cookies, response, true)) {
      const sessions = await storageService.findAllSessions();
      response.send({ sessions });
    }
  });

  app.get(
    '/api/v1/chat/sessions/:id',
    async ({ params, cookies }, response) => {
      if (await authService.authenticateHttpRequest(cookies, response, true)) {
        const session = await storageService.findSession(params['id']);
        if (session) {
          response.send(session);
        } else {
          response.sendStatus(404);
        }
      }
    },
  );

  app.delete('/api/v1/chat/sessions', async ({ cookies }, response) => {
    if (await authService.authenticateHttpRequest(cookies, response, true)) {
      const sessionIds = await storageService.deleteAllSessions();
      if (sessionIds) {
        response.send({ sessionIds });
      } else {
        response.sendStatus(404);
      }
    }
  });

  app.delete(
    '/api/v1/chat/sessions/:id',
    async ({ params, cookies }, response) => {
      if (await authService.authenticateHttpRequest(cookies, response, true)) {
        const sessionId = await storageService.deleteSession(params['id']);
        if (sessionId) {
          response.send({ sessionId });
        } else {
          response.sendStatus(404);
        }
      }
    },
  );

  app.listen(env.httpPort);
};
