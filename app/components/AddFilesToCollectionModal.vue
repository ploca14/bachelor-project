<template>
  <UModal
    class="z-[60]"
    :ui="{
      width: 'sm:max-w-5xl',
      height: 'sm:h-[calc(100vh-10rem)]',
    }"
  >
    <UCard
      class="flex h-full min-h-0 flex-col"
      :ui="{
        body: {
          base: 'flex-1 overflow-y-auto',
        },
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Add to collection
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="modal.close()"
          />
        </div>
      </template>

      <template v-if="filteredFiles">
        <GridView
          v-model="selectedIndexes"
          aria-label="Files"
          :items="filteredFiles"
          :column-count="getGridColumnCount"
          class="p-container grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
          ref="parent"
          selection-mode="multiple"
        >
          <template #default="{ item: file, active, selected }">
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
      <template v-else-if="error">
        <div class="p-container h-full pb-16 pt-2">
          <div class="grid h-full place-items-center">
            <div class="text-center">
              <Icon name="i-heroicons-face-frown" class="h-10 w-10" />
              <h3 class="mt-2 text-2xl font-bold tracking-tight">
                Failed to load files
              </h3>
              <p class="mt-1 text-sm text-gray-500">Please try again later.</p>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <ul
          class="p-container grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"
        >
          <li v-for="i in 12" :key="i" class="relative">
            <FileGridItemSkeleton />
          </li>
        </ul>
      </template>

      <template #footer>
        <div class="flex justify-end gap-4">
          <UButton
            type="button"
            color="white"
            @click="modal.close()"
            size="lg"
            class="w-20 justify-center"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="lg"
            class="w-20 justify-center"
            @click="handleSubmit"
          >
            Done
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  collectionId: string;
}>();

const modal = useModal();

const { data: files, error } = useFilesQuery();
const { data: collection, error: collectionError } = useCollectionQuery(
  props.collectionId,
);

const filteredFiles = computed(() => {
  if (!files.value) return [];
  return files.value.filter((file) => {
    return !collection.value?.files.some((collectionFile) => {
      return collectionFile.id === file.id;
    });
  });
});

const selectedIndexes = ref<number[]>([]);

const selectedFiles = computed(() => {
  if (!filteredFiles.value) return [];
  return selectedIndexes.value.map((index) => filteredFiles.value[index]);
});

const parent = ref<ComponentPublicInstance | null>(null);

const getGridColumnCount = () => {
  const grid = parent.value?.$el;
  const gridComputedStyle = window.getComputedStyle(grid);
  const gridTemplateColumns = gridComputedStyle.getPropertyValue(
    "grid-template-columns",
  );
  return gridTemplateColumns.split(" ").length;
};

const { mutate } = useAddFilesToCollectionMutation();

const toast = useToast();

const handleSubmit = () => {
  const payload = {
    collectionId: props.collectionId,
    fileIds: selectedFiles.value.map((file) => file.id),
  };

  mutate(payload, {
    onSuccess() {
      modal.close();
    },
    onError() {
      modal.close();
      toast.add({
        title: "Failed to add files to collection.",
        color: "red",
      });
    },
  });
};
</script>
