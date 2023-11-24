import Session from "~/models/session";
import User from "~/models/user";

type UseAuth = () => {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  user: Ref<User | null>;
  session: Ref<Session | null>;
};

const useSupabaseAuth = () => {
  const { auth } = useSupabaseClient();
  const user = useSupabaseUser();
  const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;
  const session = useState<Session | null>("session", () => null);

  auth.onAuthStateChange((_event, supabaseSession) => {
    if (supabaseSession) {
      const currentSession = new Session(supabaseSession);
      if (JSON.stringify(session.value) !== JSON.stringify(currentSession)) {
        session.value = currentSession;
      }
    } else {
      session.value = null;
    }
  });

  return {
    loginWithGoogle: async () => {
      await auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
    },
    logout: async () => {
      await auth.signOut();
      await navigateTo("/login");
    },
    user: computed(() => {
      if (!user.value) {
        return null;
      }

      return new User(user.value);
    }),
    session,
  };
};

export const useAuth: UseAuth = useSupabaseAuth;
