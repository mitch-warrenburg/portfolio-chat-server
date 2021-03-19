import { ChatMessage } from '../../types';

export interface MessageRepository {
  saveMessage(message: ChatMessage): Promise<void>;

  findMessagesForUser(userId: string): Promise<Array<ChatMessage>>;
}
