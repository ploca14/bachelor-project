// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  debug: true,
  sourcemap: {
    server: true,
    client: true,
  },
  logLevel: "debug",
  modules: [
    "@nuxtjs/supabase",
    "nuxt-icon",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@formkit/auto-animate/nuxt",
  ],
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  routeRules: {
    "/": { redirect: "/files" },
  },
  supabase: {
    redirect: false,
  },
  colorMode: {
    preference: "light",
  },
  imports: {
    dirs: ["types", "models", "composables/*/*.ts"],
  },
});
