<template>
  <div class="h-full">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UModals />
    <UNotifications />
  </div>
</template>

<style>
#__nuxt,
html,
body {
  @apply h-full;
}
</style>
