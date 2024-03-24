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

      <GridView
        v-model="selectedIndexes"
        aria-label="Files"
        :items="files"
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
          <UButton type="submit" size="lg" class="w-20 justify-center">
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

const files = [
  {
    id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
    name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
    originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
    createdAt: "2024-03-23T17:43:42.685Z",
  },
  {
    id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
    name: "PSTprednaska5.pdf-1711142505460",
    originalName: "PSTprednaska5.pdf",
    createdAt: "2024-03-22T21:21:45.598Z",
  },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
  // {
  //   id: "e9ee900f-e1fa-4a97-9e2e-446b2d9eeb0d",
  //   name: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf-1711215822580",
  //   originalName: "A7B32KBE_C04_Transpozicni_sifry_v1.0.6M.pdf",
  //   createdAt: "2024-03-23T17:43:42.685Z",
  // },
  // {
  //   id: "3b1ff909-5e76-43ea-83b8-b32696a7d5e6",
  //   name: "PSTprednaska5.pdf-1711142505460",
  //   originalName: "PSTprednaska5.pdf",
  //   createdAt: "2024-03-22T21:21:45.598Z",
  // },
];

const selectedIndexes = ref<number[]>([]);

const selectedFiles = computed(() => {
  return selectedIndexes.value.map((index) => files[index]);
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
</script>
