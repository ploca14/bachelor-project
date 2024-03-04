<template>
  <h3 class="p-container sticky top-0 z-40 bg-white pb-4 font-medium">Files</h3>

  <ul
    role="list"
    class="p-container grid grid-cols-2 gap-4 pb-16 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    ref="parent"
  >
    <li v-for="file in files" :key="file.name">
      <component
        v-if="file.status"
        :is="pendingComponentMap[file.status]"
        :original-name="file.originalName"
        :progress="file.uploadProgress"
      />
      <FileGridItemUploaded
        v-if="file.createdAt"
        :id="file.id"
        :original-name="file.originalName"
        :created-at="file.createdAt"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  files: Array<{
    id: string;
    name: string;
    originalName: string;
    createdAt?: string;
    status?: "uploading" | "processing" | "failed";
    uploadProgress?: number;
  }>;
}>();

const pendingComponentMap = {
  uploading: resolveComponent("FileGridItemUploading"),
  processing: resolveComponent("FileGridItemProcessing"),
  failed: resolveComponent("FileGridItemFailed"),
};

const [parent] = useAutoAnimate({
  duration: 300,
});
</script>
