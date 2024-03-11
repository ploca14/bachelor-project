import type { ConversationRepository } from "~/server/repositories/conversationRepository";
import type { FileRepository } from "~/server/repositories/fileRepository";
import type { FlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import type { SampleTestRepository } from "~/server/repositories/sampleTestRepository";
import { useSupabaseClient } from "~/server/lib/supabase/client";
import { UnauthorizedError } from "~/types/errors";
import { SupabaseClient } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Session {
  user: User;
  access_token: string;
}

export interface SecurityService {
  getUser: () => Promise<User>;
  getSession: () => Promise<Session>;
  checkFileOwnership(id: string): Promise<void>;
  checkConversationOwnership: (id: string) => Promise<void>;
  checkFlashcardDeckOwnership: (id: string) => Promise<void>;
  checkSampleTestOwnership: (id: string) => Promise<void>;
}

const supabaseSecurityService = (
  conversationRepository: ConversationRepository,
  fileRepository: FileRepository,
  flashcardDeckRepository: FlashcardDeckRepository,
  sampleTestRepository: SampleTestRepository,
  supabase: SupabaseClient,
): SecurityService => {
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
    const session = await getSession();

    return session.user;
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

  return {
    getSession,
    getUser,
    checkFileOwnership,
    checkConversationOwnership,
    checkFlashcardDeckOwnership,
    checkSampleTestOwnership,
  };
};

import { useConversationRepository } from "~/server/repositories/conversationRepository";
import { useFileRepository } from "~/server/repositories/fileRepository";
import { useFlashcardDeckRepository } from "~/server/repositories/flashcardDeckRepository";
import { useSampleTestRepository } from "~/server/repositories/sampleTestRepository";

export const useSecurityService = () => {
  const conversationRepository = useConversationRepository();
  const fileRepository = useFileRepository();
  const flashcardDeckRepository = useFlashcardDeckRepository();
  const sampleTestRepository = useSampleTestRepository();
  const supabase = useSupabaseClient();

  return supabaseSecurityService(
    conversationRepository,
    fileRepository,
    flashcardDeckRepository,
    sampleTestRepository,
    supabase,
  );
};
