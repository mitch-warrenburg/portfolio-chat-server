import { ChatMessage } from '../../types';
import { MessageRepository } from './types';

export default class MemoryMessageRepository implements MessageRepository {
  private messages: Array<ChatMessage>;

  constructor() {
    this.messages = [];
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    this.messages.push(message);
  }

  async findMessagesForUser(userId: string): Promise<Array<ChatMessage>> {
    return this.messages.filter(
      ({ from, to }) => from === userId || to === userId,
    );
  }
}
