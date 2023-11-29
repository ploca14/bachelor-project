<template>
  <section
    class="bg-white px-4 py-8 shadow sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:px-10"
  >
    <h2
      class="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900"
    >
      Sign in to your account
    </h2>
    <UButton color="white" size="lg" block @click="loginWithGoogle">
      <Icon name="logos:google-icon" size="22" />
      Sign in with Google
    </UButton>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "simple",
});

const { loginWithGoogle } = useAuthService();
</script>
