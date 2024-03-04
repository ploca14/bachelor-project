import { Conversation } from "~/server/domain/conversation";
import { messageMapper } from "~/server/mappers/messageMapper";

export const conversationMapper = {
  toDomain: (raw: any) => {
    return new Conversation(
      raw.name,
      raw.files.map(({ fileId }: any) => fileId),
      raw.userId,
      raw.messages.map((message: any) => messageMapper.toDomain(message)),
      raw.createdAt,
      raw.id,
    );
  },
  toPersistence: (conversation: Conversation) => {
    return {
      id: conversation.id,
      name: conversation.name,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
    };
  },
};
