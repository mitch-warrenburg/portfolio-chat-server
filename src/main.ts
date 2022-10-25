import env from './env';
import AuthService from './auth';
import StorageService from './store';
import firebase from 'firebase-admin';
import {Redis, loadGcpKey} from './util';
import {wsServer, httpServer} from './server';

loadGcpKey();

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
});

const redisClient = new Redis({
  port: 14370,
  host: env.redisHost,
  username: env.redisUser,
  password: env.redisPassword,
});
const authService = new AuthService();
const storageService = new StorageService(redisClient);

storageService
  .createDefaultSession()
  .then((session) => {
    const io = wsServer(redisClient, storageService, authService, session);
    httpServer(io, authService, storageService);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
