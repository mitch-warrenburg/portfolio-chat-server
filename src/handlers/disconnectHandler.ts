import { Server } from 'socket.io';
import StorageService from '../store';
import { SessionSocket } from '../types';
import { SOCKET_DISCONNECTED } from '../constants';
import { broadcastUserSessionDisconnected } from '../util';

export const handleSessionDisconnect = (
  io: Server,
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(SOCKET_DISCONNECTED, async () => {
    const matchingSockets = await io.in(socket.uid).allSockets();

    if (!matchingSockets.size) {
      await storageService.saveSession(socket, false);
      broadcastUserSessionDisconnected(socket);
    }
  });
};
