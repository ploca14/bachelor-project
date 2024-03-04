import {
  useConversationRepository,
  type ConversationRepository,
} from "~/server/repositories/conversationRepository";
import {
  useFileRepository,
  type FileRepository,
} from "~/server/repositories/fileRepository";
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
}

const supabaseSecurityService = (
  conversationRepository: ConversationRepository,
  fileRepository: FileRepository,
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

  return {
    getSession,
    getUser,
    checkFileOwnership,
    checkConversationOwnership,
  };
};

export const useSecurityService = () => {
  const conversationRepository = useConversationRepository();
  const fileRepository = useFileRepository();
  const supabase = useSupabaseClient();

  return supabaseSecurityService(
    conversationRepository,
    fileRepository,
    supabase,
  );
};
