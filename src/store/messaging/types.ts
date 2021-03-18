import { Message } from '../../types';

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;

  findMessagesForUser(userId: string): Promise<Array<Message>>;
}
