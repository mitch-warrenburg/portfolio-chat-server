import { ChatMessage } from '../../types';

export interface MessageRepository {
  saveMessage(message: ChatMessage): Promise<ChatMessage>;

  findMessagesForUser(uid: string): Promise<Array<ChatMessage>>;
}
