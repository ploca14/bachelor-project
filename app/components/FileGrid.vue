<template>
  <h3 class="p-container sticky top-0 z-40 bg-white pb-4 font-medium">Files</h3>

  <ul
    role="list"
    class="p-container grid grid-cols-2 gap-4 pb-16 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    ref="parent"
  >
    <li v-for="file in files" :key="file.name">
      <FileGridItemUploading v-if="file.status === 'uploading'" :file="file" />
      <FileGridItemProcessing
        v-else-if="file.status === 'processing'"
        :file="file"
      />
      <FileGridItemUploaded
        v-else-if="file.status === 'uploaded'"
        :file="file"
      />
      <FileGridItemFailed v-else-if="file.status === 'failed'" :file="file" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { UploadedFile, PendingFile } from "#imports";

defineProps<{
  files: (UploadedFile | PendingFile)[];
}>();

const [parent] = useAutoAnimate({
  duration: 300,
});
</script>
