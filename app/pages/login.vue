<template>
  <section
    class="bg-white px-4 py-8 shadow sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:px-10"
  >
    <h2
      class="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900"
    >
      Sign in to your account
    </h2>
    <button
      @click="loginWithGoogle"
      class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
    >
      <Icon name="logos:google-icon" size="22" />
      Sign in with Google
    </button>
    <!-- <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-2 text-gray-500">Or</span>
      </div>
    </div> -->
    <!-- <form class="space-y-6" @submit.prevent="login">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700"
          >Email address</label
        >
        <div class="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            v-model="email"
            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <div class="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            v-model="password"
            class="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </div>
    </form> -->
  </section>
</template>

<script setup lang="ts">
import { AuthError } from "@supabase/supabase-js";

definePageMeta({
  layout: "simple",
});

const user = useSupabaseUser();
const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`;

watchEffect(() => {
  if (user.value) {
    navigateTo("/");
  }
});

const email = ref("");
const password = ref("");
const loginError = ref<AuthError | null>();
const supabase = useSupabaseClient();

// const login = async () => {
//   const { error } = await supabase.auth.signInWithPassword({
//     email: email.value,
//     password: password.value,
//   });

//   loginError.value = error;
// };

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  loginError.value = error;
};
</script>
