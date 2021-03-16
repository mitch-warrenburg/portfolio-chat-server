import { Message } from '../../types';

export interface MessageRepository {
  saveMessage(message: Message): Promise<void>;

  findMessagesForUser(userID: string): Promise<Array<Message>>;
}
