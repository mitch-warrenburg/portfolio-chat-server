import { Redis } from './util';
import AuthService from './auth';
import StorageService from './store';
import { wsServer, httpServer } from './server';

const redisClient = new Redis();
const storageService = new StorageService(redisClient);
const authService = new AuthService(storageService);

authService
  .refreshAdminUser()
  .then(() => console.log('Admin credentials refreshed.'));

authService
  .refreshAdminDefaultSession()
  .then(() => console.log('Admin default session refreshed.'));

const io = wsServer(redisClient, storageService, authService);

httpServer(io, authService, storageService).then(() =>
  console.log('Started http server.'),
);
