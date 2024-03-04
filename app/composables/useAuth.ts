export interface User {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Auth {
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  user: Ref<User | null>;
  getLoggedInUser: () => User;
}

const supabaseAuth = (): Auth => {
  const { auth } = useSupabaseClient();
  const redirectTo = `${useRuntimeConfig().public.baseUrl}/auth/callback`;
  const user = useState<User | null>("user");

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

  const getLoggedInUser = () => {
    if (!user.value) {
      throw createError({
        statusCode: 401,
        message: "User is not logged in.",
      });
    }

    return user.value;
  };

  return {
    loginWithGoogle,
    logout,
    user,
    getLoggedInUser,
  };
};

export const useAuth = () => {
  return supabaseAuth();
};
