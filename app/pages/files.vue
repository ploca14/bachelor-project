<template>
  <div class="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
    <div class="flex flex-wrap items-center gap-6 pb-8 sm:flex-nowrap">
      <h1 class="text-3xl font-semibold leading-7 tracking-tight">
        Study Materials
      </h1>
      <UButton
        icon="i-heroicons-arrow-up-tray-20-solid"
        size="xl"
        class="ml-auto"
        @click="open"
      >
        Upload file
      </UButton>
    </div>

    {{ progress }}

    <FileGrid />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const progress = ref(0);

// fetch /api/hello and update the progress with the response stream use for await of
onMounted(async () => {
  const response = await fetch("/api/hello");
  if (!response.body) return;

  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    progress.value = Number(new TextDecoder("utf-8").decode(value));
  }
});

// const uploader = useFileUploader();
</script>
