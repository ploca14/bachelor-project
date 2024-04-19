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

    <template v-if="collections.length > 0">
      <GridView
        :items="collections"
        :column-count="getGridColumnCount"
        class="p-container grid grid-cols-1 gap-4 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        :ref="(ref) => ref && '$el' in ref && (parent = ref.$el)"
        @update:model-value="handleSelection"
      >
        <template #default="{ item, active, selected }">
          <CollectionGridItem
            :id="item.id"
            :name="item.name"
            :file-count="item.fileCount"
            :selected="selected"
            :active="active"
          />
        </template>
      </GridView>
    </template>
    <template v-else>
      <div class="p-container">
        <p class="text-sm text-gray-500">You have no collections yet.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { NewCollectionModal } from "#components";

const props = defineProps<{
  collections: Array<{
    id: string;
    name: string;
    fileCount: number;
  }>;
}>();

const [parent] = useAutoAnimate({
  duration: 300,
});

const getGridColumnCount = () => {
  const gridComputedStyle = window.getComputedStyle(parent.value);
  const gridTemplateColumns = gridComputedStyle.getPropertyValue(
    "grid-template-columns",
  );
  return gridTemplateColumns.split(" ").length;
};

const handleSelection = ([idx]: number[]) => {
  const collection = props.collections[idx];

  return navigateTo({
    path: `/collections/${collection.id}`,
  });
};

const modal = useModal();

const handleNewCollection = () => {
  modal.open(NewCollectionModal);
};
</script>
