import User from "~/models/user";

type UseAuth = () => {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  user: Ref<User | null>;
};

const useSupabaseAuth = () => {
  const { auth } = useSupabaseClient();
  const user = useSupabaseUser();
  const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;

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
      return navigateTo("/login");
    },
    user: computed(() => {
      if (!user.value) {
        return null;
      }

      return new User(user.value);
    }),
  };
};

export const useAuth: UseAuth = useSupabaseAuth;
