import { Redis } from './util';
import { StorageService } from './store';
import { wsServer, httpServer } from './server';

const redisClient = new Redis();
const storageService = new StorageService(redisClient);

const io = wsServer(redisClient, storageService);

httpServer(io, storageService).then(() => console.log('Started http server.'));
