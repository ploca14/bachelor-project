<template>
  <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
    <slot />
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: "h-full bg-gray-50 dark:bg-gray-900",
  },
  bodyAttrs: {
    class: "h-full",
  },
});
</script>