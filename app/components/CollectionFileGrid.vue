<template>
  <div class="h-full">
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
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-folder-minus"
          @click="handleRemoveFilesFromCollection"
        >
          Remove from collection
        </UButton>
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
          <CollectionFileGridItem
            v-if="file.createdAt"
            :collection-id="props.collectionId"
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
      <FileGridEmpty
        instructions="Get started by adding files to this collection."
      >
        <template #actions>
          <UButton
            icon="i-heroicons-document-plus"
            size="xl"
            @click="handleAddFilesToCollection"
          >
            Add files
          </UButton>
        </template>
      </FileGridEmpty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { AddFilesToCollectionModal } from "#components";

const props = defineProps<{
  collectionId: string;
  files: Array<{
    id: string;
    name: string;
    originalName: string;
    createdAt: string;
  }>;
}>();

const [parent] = useAutoAnimate({
  duration: 300,
});

watch(
  () => props.files,
  () => {
    selectedIndexes.value = [];
  },
);

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

const { mutate } = useRemoveFilesFromCollectionMutation();

const toast = useToast();

const handleRemoveFilesFromCollection = () => {
  const payload = {
    collectionId: props.collectionId,
    fileIds: selectedFiles.value.map((file) => file.id),
  };

  mutate(payload, {
    onError() {
      toast.add({
        title: "Failed to remove files from collection.",
        color: "red",
      });
    },
  });
};

const modal = useModal();

const handleAddFilesToCollection = () => {
  modal.open(AddFilesToCollectionModal, {
    collectionId: props.collectionId,
  });
};
</script>
