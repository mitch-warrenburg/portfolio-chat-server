import { Server } from 'socket.io';
import { SessionSocket } from '../types';
import { StorageService } from '../store';
import { SOCKET_DISCONNECTED } from '../constants';
import { broadcastUserSessionDisconnected } from '../util';

export const handleSessionDisconnect = (
  io: Server,
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(SOCKET_DISCONNECTED, async () => {
    const matchingSockets = await io.in(socket.userId).allSockets();

    if (!matchingSockets.size) {
      await storageService.saveSession(socket, false);
      broadcastUserSessionDisconnected(socket);
    }
  });
};
