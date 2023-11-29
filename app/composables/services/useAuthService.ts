import User from "~/models/user";

type UseAuthService = () => {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  user: Ref<User | null>;
};

const useSupabaseAuthService = () => {
  const { auth } = useSupabaseClient();
  const supabaseUser = useSupabaseUser();
  const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;

  const loginWithGoogle = async () => {
    await auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  const logout = async () => {
    await auth.signOut();
    await navigateTo("/login");
  };

  const user = computed(() => {
    if (!supabaseUser.value) {
      return null;
    }

    return User.fromSupabaseUser(supabaseUser.value);
  });

  return {
    loginWithGoogle,
    logout,
    user,
  };
};

export const useAuthService: UseAuthService = useSupabaseAuthService;
