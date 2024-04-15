import { createServerClient } from "@supabase/ssr";
import { requestScope, singletonScope } from "~/server/utils/singleton";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = () => {
  const event = useEvent();
  const {
    supabase: { url, key },
  } = useRuntimeConfig().public;

  const client = createServerClient(url, key, {
    cookies: {
      get: (name: string) => {
        const cookie = getCookie(event, name);

        return cookie;
      },
      set(key, value, options) {
        setCookie(event, key, value, options);
      },
      remove(key, options) {
        setCookie(event, key, "", { ...options, maxAge: 0 });
      },
    },
  });

  return client;
};

const supabaseServiceClient = () => {
  const {
    supabase: { serviceKey },
    public: {
      supabase: { url },
    },
  } = useRuntimeConfig();

  return createClient(url, serviceKey);
};

export const useSupabaseClient = requestScope(supabaseClient);
export const useSupabaseServiceClient = singletonScope(supabaseServiceClient);
