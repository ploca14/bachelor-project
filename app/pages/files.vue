<template>
  <div class="flex h-full flex-col">
    <div
      class="p-container z-50 flex flex-wrap items-center gap-6 bg-white py-10 pb-8 sm:flex-nowrap"
    >
      <h1 class="text-3xl font-semibold leading-7 tracking-tight">
        Study Materials
      </h1>
      <UButton
        icon="i-heroicons-arrow-up-tray-20-solid"
        size="xl"
        class="ml-auto"
        @click="openFileDialog"
        :disabled="isPending || isUploading"
      >
        Upload file
      </UButton>
    </div>

    <div class="overflow-y-auto">
      <CollectionGrid class="relative z-40" />

      <template v-if="uploadedFiles">
        <FileGrid :files="throttledFiles" />
      </template>
      <template v-else>
        <FileGridSkeleton />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: uploadedFiles, isPending } = useFilesQuery();
const {
  openFileDialog,
  pendingFiles,
  isPending: isUploading,
} = useFileUploader();

const files = computed(() => {
  if (!uploadedFiles.value) return pendingFiles.value;

  const uniquePendingFiles = pendingFiles.value.filter(
    (pendingFile) =>
      !uploadedFiles.value.some(
        (uploadedFile) => uploadedFile.name === pendingFile.name,
      ),
  );

  return [...uniquePendingFiles, ...uploadedFiles.value];
});

const throttledFiles = refThrottled(files, 1000);
</script>
