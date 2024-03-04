import { v4 as uuidv4 } from "uuid";

export default defineNuxtRouteMiddleware(async (to) => {
  const home = "/";
  const login = "/login";
  const callback = "/auth/callback";

  const supabase = useSupabaseClient();
  const user = useState<User | null>("user");
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
  }
  user.value = data.user
    ? {
        id: data.user.id,
        name: data.user.user_metadata.full_name,
        avatar_url: data.user.user_metadata.avatar_url,
      }
    : null;

  // On the login page, check whether the user is logged in. If so, redirect to the home page.
  if (to.path === login) {
    if (data.user) {
      return navigateTo(home);
    }
  } else if (to.path === callback) {
    // On the callback page, do nothing.
    return;
  } else {
    // On any other page, check whether the user is logged in. If not, redirect to the login page.
    if (!data.user) {
      return navigateTo(login);
    }
  }
});
