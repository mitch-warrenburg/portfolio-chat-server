import { StorageService } from '../store';
import { PRIVATE_MESSAGE, TYPING_STATUS } from '../constants';
import { SessionSocket, ChatMessage, TypingEvent } from '../types';

export const handlePrivateMessage = (
  socket: SessionSocket,
  storageService: StorageService,
) => {
  socket.on(PRIVATE_MESSAGE, async (message: ChatMessage, ack) => {
    socket.in(message.to).emit(PRIVATE_MESSAGE, message);
    await storageService.saveMessage(message);
    ack(message);
  });
};

export const handleTypingEvents = (socket: SessionSocket) => {
  socket.on(TYPING_STATUS, async (event: TypingEvent) => {
    socket.in(event.to).emit(TYPING_STATUS, event);
  });
};
