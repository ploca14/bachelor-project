<template>
  <div>
    <div
      class="p-container sticky top-0 z-30 flex h-14 items-center justify-between bg-white font-medium"
    >
      <template v-if="selectedFiles.length > 0">
        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            color="gray"
            square
            icon="i-heroicons-x-mark"
            @click="selectedIndexes = []"
          >
            <span class="sr-only">Deselect all</span>
          </UButton>
          {{ selectedFiles.length }} selected
        </div>

        <div class="flex items-center gap-4">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-folder-plus"
            @click="addToCollection"
          >
            Add to collection
          </UButton>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-trash"
            @click="deleteFiles"
          >
            Delete
          </UButton>
        </div>
      </template>
      <template v-else>
        <h3>Files</h3>
      </template>
    </div>

    <template v-if="files.length > 0">
      <GridView
        v-model="selectedIndexes"
        aria-label="Files"
        :items="files"
        :column-count="getGridColumnCount"
        class="p-container grid grid-cols-2 gap-4 pb-16 pt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        :ref="(ref) => ref && '$el' in ref && (parent = ref.$el)"
        selection-mode="multiple"
      >
        <template #default="{ item: file, active, selected }">
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
            :selected="selected"
            :active="active"
          />
        </template>
      </GridView>
    </template>
    <template v-else>
      <div class="p-container">
        <p class="text-sm text-gray-500">You have no files yet.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AddToCollectionModal, DeleteFilesModal } from "#components";

const props = defineProps<{
  files: Array<{
    id: string;
    name: string;
    originalName: string;
    createdAt?: string;
    status?: "uploading" | "processing" | "failed";
    uploadProgress?: number;
  }>;
}>();

watch(
  () => props.files,
  () => {
    selectedIndexes.value = [];
  },
);

const [parent] = useAutoAnimate({
  duration: 300,
});

const selectedIndexes = ref<number[]>([]);

const selectedFiles = computed(() => {
  return selectedIndexes.value.map((index) => props.files[index]);
});

const getGridColumnCount = () => {
  const gridComputedStyle = window.getComputedStyle(parent.value);
  const gridTemplateColumns = gridComputedStyle.getPropertyValue(
    "grid-template-columns",
  );
  return gridTemplateColumns.split(" ").length;
};

const pendingComponentMap = {
  uploading: resolveComponent("FileGridItemUploading"),
  processing: resolveComponent("FileGridItemProcessing"),
  failed: resolveComponent("FileGridItemFailed"),
};

const modal = useModal();

const addToCollection = () => {
  modal.open(AddToCollectionModal, {
    fileIds: selectedFiles.value.map((file) => file.id),
  });
};

const deleteFiles = () => {
  modal.open(DeleteFilesModal, {
    fileIds: selectedFiles.value.map((file) => file.id),
  });
};
</script>
