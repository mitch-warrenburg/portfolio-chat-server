import { Redis, refreshAdminDefaultSession } from './util';
import { StorageService } from './store';
import { refreshAdminUser } from './auth';
import { wsServer, httpServer } from './server';

const redisClient = new Redis();
const storageService = new StorageService(redisClient);

refreshAdminUser(storageService).then(() =>
  console.log('Admin credentials refreshed.'),
);

refreshAdminDefaultSession(storageService).then(() =>
  console.log('Admin default session refreshed.'),
);

const io = wsServer(redisClient, storageService);

httpServer(io, storageService).then(() => console.log('Started http server.'));
