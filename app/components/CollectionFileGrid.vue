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
        <UButton color="gray" variant="ghost" icon="i-heroicons-folder-minus">
          Remove from collection
        </UButton>
      </template>
      <template v-else>
        <h3>Files</h3>
      </template>
    </div>

    <GridView
      v-model="selectedIndexes"
      aria-label="Files"
      :items="files"
      :column-count="getGridColumnCount"
      class="p-container grid grid-cols-2 gap-4 pb-16 pt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      ref="parent"
      selection-mode="multiple"
    >
      <template #default="{ item: file, active, selected }">
        <CollectionFileGridItem
          v-if="file.createdAt"
          :id="file.id"
          :original-name="file.originalName"
          :created-at="file.createdAt"
          :selected="selected"
          :active="active"
        />
      </template>
    </GridView>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
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

const selectedIndexes = ref<number[]>([]);

const selectedFiles = computed(() => {
  return selectedIndexes.value.map((index) => props.files[index]);
});

const getGridColumnCount = () => {
  const grid = (parent.value as unknown as ComponentPublicInstance | null)?.$el;
  const gridComputedStyle = window.getComputedStyle(grid);
  const gridTemplateColumns = gridComputedStyle.getPropertyValue(
    "grid-template-columns",
  );
  return gridTemplateColumns.split(" ").length;
};
</script>
