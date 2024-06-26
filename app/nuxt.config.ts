// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    "nuxt-icon",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@formkit/auto-animate/nuxt",
    "@nuxt/test-utils/module",
  ],
  runtimeConfig: {
    supabase: {
      serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    },
    openAIModel: process.env.NUXT_OPENAI_MODEL,
    charsPerToken: process.env.NUXT_CHARS_PER_TOKEN,
    maxTokensPerBatch: process.env.NUXT_MAX_TOKENS_PER_BATCH,
    chunkSize: process.env.NUXT_CHUNK_SIZE,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      },
    },
  },
  routeRules: {
    "/": { redirect: "/files" },
  },
  colorMode: {
    preference: "light",
  },
  imports: {
    dirs: [
      // "types",
      // "dto",
      // "handlers",
      // "domain",
      // "repositories",
      // "lib",
      "composables/*/*.ts",
    ],
    presets: [
      {
        from: "@tanstack/vue-query",
        imports: ["useQuery", "useMutation", "useQueryClient"],
      },
      {
        from: "zod",
        imports: ["z"],
      },
    ],
  },
  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
});
