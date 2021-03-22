import { ChatMessage } from '../../types';

export interface MessageRepository {
  saveMessage(message: ChatMessage): Promise<ChatMessage>;

  findMessagesForUser(userId: string): Promise<Array<ChatMessage>>;
}
