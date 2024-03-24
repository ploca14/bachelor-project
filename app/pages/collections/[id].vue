<template>
  <div class="flex h-full flex-col">
    <div
      class="p-container z-50 flex flex-wrap items-center gap-6 bg-white py-10 pb-8 sm:flex-nowrap"
    >
      <h1
        v-if="collection.name"
        class="text-3xl font-semibold leading-7 tracking-tight"
      >
        {{ collection.name }}
      </h1>
      <h1 class="text-3xl font-semibold leading-7 tracking-tight text-gray-400">
        Untitled Collection
      </h1>

      <div class="ml-auto flex gap-4">
        <UButton
          v-if="!isEmpty"
          icon="i-heroicons-document-plus"
          size="xl"
          @click="addFiles"
        >
          Add files
        </UButton>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            square
            size="xl"
            icon="i-heroicons-ellipsis-vertical"
          />
        </UDropdown>
      </div>
    </div>

    <div class="h-full overflow-y-auto">
      <template v-if="false">
        <FileGridSkeleton />
      </template>
      <template v-else-if="isEmpty">
        <FileGridEmpty
          instructions="Get started by adding files to this collection."
        >
          <template #actions>
            <UButton
              icon="i-heroicons-document-plus"
              size="xl"
              @click="addFiles"
            >
              Add files
            </UButton>
          </template>
        </FileGridEmpty>
      </template>
      <template v-else>
        <CollectionFileGrid :files="throttledFiles" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RenameCollectionModal, AddFilesToCollectionModal } from "#components";

const { data: uploadedFiles, isPending } = useFilesQuery();

const collection = ref({
  id: "collection-id",
  name: "",
  files: [
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
  ],
});

const files = computed(() => {
  return collection.value.files;
});

const throttledFiles = refThrottled(files, 1000);

const modal = useModal();

const isEmpty = computed(() => files.value.length === 0);

const renameCollection = () => {
  modal.open(RenameCollectionModal, {
    collectionId: "collection-id",
    name: "",
  });
};

const addFiles = () => {
  modal.open(AddFilesToCollectionModal, {
    collectionId: "collection-id",
  });
};

const items = computed(() => [
  [
    {
      label: "Start a conversation",
      icon: "i-heroicons-chat-bubble-left-right",
      // click: () => {
      //   createConversation(props.id, {
      //     onSuccess: (conversationId) => {
      //       navigateTo(`/conversations/${conversationId}`);
      //     },
      //     onError: handleError,
      //   });
      // },
      disabled: isEmpty,
    },
    {
      label: "Generate flashcards",
      icon: "i-heroicons-rectangle-stack",
      // click: () => {
      //   createFlashcardDeck(props.id, {
      //     onSuccess: (flashcardDeckId) => {
      //       navigateTo(`/flashcards/${flashcardDeckId}`);
      //     },
      //     onError: handleError,
      //   });
      // },
      disabled: isEmpty,
    },
    {
      label: "Generate a test",
      icon: "i-heroicons-academic-cap",
      // click: () => {
      //   createSampleTest(props.id, {
      //     onSuccess: (testId) => {
      //       navigateTo(`/sample-tests/${testId}`);
      //     },
      //     onError: handleError,
      //   });
      // },
      disabled: isEmpty,
    },
  ],
  [
    {
      label: "Rename",
      icon: "i-heroicons-pencil",
      click: renameCollection,
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      //       click: () => {
      //         deleteFile(props.id, {
      //           onError: handleError,
      //         });
      //       },
    },
  ],
]);
</script>
