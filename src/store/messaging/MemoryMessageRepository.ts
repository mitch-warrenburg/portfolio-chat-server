import { Message } from '../../types';
import { MessageRepository } from './types';

export default class MemoryMessageRepository implements MessageRepository {
  private messages: Array<Message>;

  constructor() {
    this.messages = [];
  }

  async saveMessage(message: Message): Promise<void> {
    this.messages.push(message);
  }

  async findMessagesForUser(userID: string): Promise<Array<Message>> {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID,
    );
  }
}
