import { SessionSocket } from '../types';
import { StorageService } from '../store';
import { PRIVATE_MESSAGE } from '../constants';

export const handlePrivateMessage = (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(PRIVATE_MESSAGE, async (message, ack) => {
    socket.in(message.to).emit(PRIVATE_MESSAGE, message);
    await storageService.saveMessage(message);
    ack(message);
  });
};
