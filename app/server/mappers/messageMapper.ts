import { Message } from "~/server/domain/message";

export const messageMapper = {
  toDomain: (raw: any) => {
    return new Message(
      raw.role,
      raw.content,
      raw.conversationId,
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (message: Message) => {
    return {
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
      conversationId: message.conversationId,
    };
  },
};
