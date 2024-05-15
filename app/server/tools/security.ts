import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import type { CollectionRepository } from "~/server/repositories/collectionRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError } from "~/types/errors";

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export interface Security {
  getUser: () => Promise<User>;
  getSession: () => Promise<Session>;
  checkFileOwnership(id: string): Promise<void>;
  checkConversationOwnership: (id: string) => Promise<void>;
  checkFlashcardDeckOwnership: (id: string) => Promise<void>;
  checkSampleTestOwnership: (id: string) => Promise<void>;
  checkCollectionOwnership: (id: string) => Promise<void>;
}

const supabaseSecurity = (
  conversationRepository: ConversationRepository,
  fileRepository: FileRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  sampleTestRepository: SampleTestRepository,
  collectionRepository: CollectionRepository,
  supabase: SupabaseClient,
): Security => {
  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      throw new UnauthorizedError("User is not logged in");
    }

    return {
      user: {
        id: data.session.user.id,
        name: data.session.user.user_metadata.full_name,
        avatar_url: data.session.user.user_metadata.avatar_url,
      },
      access_token: data.session.access_token,
    };
  };

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw new UnauthorizedError("User is not logged in");
    }

    return {
      id: data.user.id,
      name: data.user.user_metadata.full_name,
      avatar_url: data.user.user_metadata.avatar_url,
    };
  };

  const checkFileOwnership = async (id: string) => {
    const user = await getUser();
    const file = await fileRepository.getFileById(id);

    if (file.ownerId !== user.id) {
      throw new UnauthorizedError(
        "User is not authorized to access this file.",
      );
    }
  };

  const checkConversationOwnership = async (id: string) => {
    const user = await getUser();
    const conversation = await conversationRepository.getConversationById(id);

    if (conversation.userId !== user.id) {
      throw new UnauthorizedError(
        "User is not authorized to access this conversation.",
      );
    }
  };

  const checkFlashcardDeckOwnership = async (id: string) => {
    const user = await getUser();
    const deck = await flashcardDeckRepository.getFlashcardDeckById(id);

    if (deck.userId !== user.id) {
      throw new UnauthorizedError(
        "User is not authorized to access this deck.",
      );
    }
  };

  const checkSampleTestOwnership = async (id: string) => {
    const user = await getUser();
    const deck = await sampleTestRepository.getSampleTestById(id);

    if (deck.userId !== user.id) {
      throw new UnauthorizedError(
        "User is not authorized to access this deck.",
      );
    }
  };

  const checkCollectionOwnership = async (id: string) => {
    const user = await getUser();
    const collection = await collectionRepository.getCollectionById(id);

    if (collection.userId !== user.id) {
      throw new UnauthorizedError(
        "User is not authorized to access this collection.",
      );
    }
  };

  return {
    getSession,
    getUser,
    checkFileOwnership,
    checkConversationOwnership,
    checkFlashcardDeckOwnership,
    checkSampleTestOwnership,
    checkCollectionOwnership,
  };
};
/* v8 ignore start */
import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useFlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";
import { useCollectionRepository } from "~/server/repositories/collectionRepository";
import { useSupabaseClient } from "~/server/lib/supabase/client";

export const useSecurity = () => {
  const conversationRepository = useConversationRepository();
  const fileRepository = useFileRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const sampleTestRepository = useSampleTestRepository();
  const collectionRepository = useCollectionRepository();
  const supabase = useSupabaseClient();

  return supabaseSecurity(
    conversationRepository,
    fileRepository,
    flashcardDeckRepository,
    sampleTestRepository,
    collectionRepository,
    supabase,
  );
};
