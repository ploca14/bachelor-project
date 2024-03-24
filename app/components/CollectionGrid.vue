<template>
  <div>
    <div
      class="p-container sticky top-0 z-30 flex items-center justify-between bg-white pb-4"
    >
      <h3 class="font-medium">Collections</h3>
      <UButton
        variant="ghost"
        color="gray"
        icon="i-heroicons-folder-plus"
        @click="handleNewCollection()"
      >
        Create collection
      </UButton>
    </div>

    <GridView
      ref="parent"
      :items="items"
      :column-count="getGridColumnCount"
      class="p-container grid grid-cols-1 gap-4 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      @update:model-value="handleSelection"
    >
      <template #default="{ item, active, selected }">
        <CollectionGridItem
          :id="item.id"
          :name="item.name"
          :file-count="item.files"
          :selected="selected"
          :active="active"
        />
      </template>
    </GridView>
  </div>
</template>

<script setup lang="ts">
import { NewCollectionModal } from "#components";

// const props = defineProps<{
//   files: Array<{
//     id: string;
//     name: string;
//     originalName: string;
//     createdAt?: string;
//     status?: "uploading" | "processing" | "failed";
//     uploadProgress?: number;
//   }>;
// }>();

const [parent] = useAutoAnimate({
  duration: 300,
});

const getGridColumnCount = () => {
  const grid = (parent.value as unknown as ComponentPublicInstance | null)?.$el;
  const gridComputedStyle = window.getComputedStyle(grid);
  const gridTemplateColumns = gridComputedStyle.getPropertyValue(
    "grid-template-columns",
  );
  return gridTemplateColumns.split(" ").length;
};

const items = [
  {
    id: "1",
    name: "Collection 1",
    files: 5,
  },
  {
    id: "2",
    name: "Collection 2",
    files: 3,
  },
  {
    id: "2",
    name: "",
    files: 3,
  },
];

const handleSelection = ([idx]: number[]) => {
  const collection = items[idx];

  return navigateTo({
    path: `/collections/${collection.id}`,
  });
};

const modal = useModal();

const handleNewCollection = () => {
  modal.open(NewCollectionModal);
};
</script>
