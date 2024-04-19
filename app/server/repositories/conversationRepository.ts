import {
  usePrismaClient,
  type ExtendedPrismaClient,
} from "~/server/lib/prisma/client";
import { Conversation } from "~/server/domain/conversation";
import { conversationMapper } from "~/server/mappers/conversationMapper";
import { Message } from "~/server/domain/message";
import { messageMapper } from "~/server/mappers/messageMapper";
import { transactional } from "~/server/utils/transactional";
import type { Prisma } from "@prisma/client";
import { NotFoundError } from "~/types/errors";

export interface ConversationRepository {
  getConversationById: (id: string) => Promise<Conversation>;
  exists: (id: string) => Promise<boolean>;
  save: (conversation: Conversation) => Promise<Conversation>;
  remove: (id: string) => Promise<void>;
}

export const prismaConversationRepository = (
  prisma: ExtendedPrismaClient,
): ConversationRepository => {
  const BASE_QUERY_OPTIONS = {
    include: {
      files: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  } satisfies Prisma.ConversationDefaultArgs;

  const getConversationById = async (id: string) => {
    const result = await prisma.conversation.findUnique({
      where: { id },
      ...BASE_QUERY_OPTIONS,
    });

    if (!result) {
      throw new NotFoundError("Conversation not found");
    }

    return conversationMapper.toDomain(result);
  };

  const exists = async (id: string) => {
    const result = await prisma.conversation.findUnique({ where: { id } });

    return result !== null;
  };

  const setConversationFiles = transactional(
    async (conversationId: string, fileIds: string[]) => {
      // Disassociate all files from the conversation
      await prisma.conversationFile.deleteMany({
        where: {
          conversationId,
        },
      });

      if (fileIds.length === 0) {
        return;
      }

      // Associate the new files to the conversation
      await prisma.conversationFile.createMany({
        data: fileIds.map((fileId) => ({
          fileId,
          conversationId,
        })),
      });
    },
  );

  const saveConversationMessages = transactional(
    async (conversationId: string, messages: Message[]) => {
      // Delete all messages from the conversation
      await prisma.message.deleteMany({
        where: {
          conversationId,
        },
      });

      if (messages.length === 0) {
        return;
      }

      // Recreate the messages
      await prisma.message.createMany({
        data: messages.map((message) => messageMapper.toPersistence(message)),
      });
    },
  );

  const save = transactional(async (conversation: Conversation) => {
    const rawConversation = conversationMapper.toPersistence(conversation);

    // If the conversation already exists, update it. Otherwise, create it.
    await prisma.conversation.upsert({
      where: { id: conversation.id },
      create: rawConversation,
      update: rawConversation,
      ...BASE_QUERY_OPTIONS,
    });

    // Associate the files to the conversation
    await setConversationFiles(conversation.id, conversation.fileIds);

    // Save the messages
    await saveConversationMessages(conversation.id, conversation.messages);

    return conversation;
  });

  const remove = async (id: string) => {
    await prisma.conversation.delete({ where: { id } });
  };

  return {
    getConversationById,
    exists,
    save,
    remove,
  };
};

export const useConversationRepository = () => {
  const prisma = usePrismaClient();
  return prismaConversationRepository(prisma);
};
