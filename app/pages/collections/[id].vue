<template>
  <div class="flex h-full flex-col">
    <div
      class="p-container z-50 flex flex-wrap items-center gap-6 bg-white py-10 pb-8 sm:flex-nowrap"
    >
      <USkeleton v-if="isLoading" class="h-7 w-64" />
      <h1
        v-else-if="collection?.name"
        class="truncate text-3xl font-semibold leading-7 tracking-tight"
      >
        {{ collection.name }}
      </h1>
      <h1
        v-else
        class="text-3xl font-semibold leading-7 tracking-tight text-gray-400"
      >
        Untitled Collection
      </h1>

      <div class="ml-auto flex gap-4">
        <UButton
          v-if="!isEmpty"
          icon="i-heroicons-document-plus"
          size="xl"
          @click="handleAddFilesToCollection"
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
      <template v-if="collection">
        <CollectionFileGrid
          :collection-id="collectionId"
          :files="collection.files"
        />
      </template>
      <template v-else>
        <FileGridSkeleton />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RenameCollectionModal,
  AddFilesToCollectionModal,
  DeleteCollectionModal,
} from "#components";

const { currentRoute } = useRouter();
const collectionId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: collection, isLoading } = useCollectionQuery(collectionId);
await until(collection).toBeTruthy({
  timeout: 500,
});

const modal = useModal();

const isEmpty = computed(() => collection.value?.files.length === 0);

const { mutate: createConversation } =
  useCreateConversationForCollectionMutation();
const { mutate: createFlashcardDeck } =
  useCreateFlashcardDeckForCollectionMutation();
const { mutate: createSampleTest } = useCreateSampleTestForCollectionMutation();

const handleAddFilesToCollection = () => {
  modal.open(AddFilesToCollectionModal, {
    collectionId: collectionId,
  });
};

const toast = useToast();

const items = computed(() => [
  [
    {
      label: "Start a conversation",
      icon: "i-heroicons-chat-bubble-left-right",
      click() {
        createConversation(collectionId, {
          onSuccess: (conversationId) => {
            navigateTo(`/conversations/${conversationId}`);
          },
          onError() {
            toast.add({
              title: "Failed to start a conversation.",
              color: "red",
            });
          },
        });
      },
      disabled: isEmpty.value,
    },
    {
      label: "Generate flashcards",
      icon: "i-heroicons-rectangle-stack",
      click() {
        createFlashcardDeck(collectionId, {
          onSuccess: (flashcardDeckId) => {
            navigateTo(`/flashcards/${flashcardDeckId}`);
          },
          onError() {
            toast.add({
              title: "Failed to create a flashcard deck.",
              color: "red",
            });
          },
        });
      },
      disabled: isEmpty.value,
    },
    {
      label: "Generate a test",
      icon: "i-heroicons-academic-cap",
      click() {
        createSampleTest(collectionId, {
          onSuccess: (testId) => {
            navigateTo(`/sample-tests/${testId}`);
          },
          onError() {
            toast.add({
              title: "Failed to create a sample test.",
              color: "red",
            });
          },
        });
      },
      disabled: isEmpty.value,
    },
  ],
  [
    {
      label: "Rename",
      icon: "i-heroicons-pencil",
      click() {
        if (!collection.value) return;

        modal.open(RenameCollectionModal, {
          collectionId: collectionId,
          name: collection.value.name,
        });
      },
      disabled: !collection.value,
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteCollectionModal, {
          collectionId,
        });
      },
    },
  ],
]);
</script>
