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
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "simple",
});

const { loginWithGoogle } = useAuth();
</script>
