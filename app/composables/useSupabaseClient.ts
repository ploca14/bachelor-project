import { createBrowserClient } from "@supabase/ssr";

export const useSupabaseClient = () => {
  const {
    supabase: { url, key },
  } = useRuntimeConfig().public;

  const supabase = createBrowserClient(url, key);

  return supabase;
};
