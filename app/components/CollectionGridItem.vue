<template>
  <div
    class="col-span-1 flex rounded-md border bg-white shadow-sm ring-green-500 group-focus-visible:ring-2"
  >
    <div
      :class="[
        'flex flex-shrink-0 items-center justify-center p-4 text-gray-500',
      ]"
    >
      <Icon name="i-heroicons-folder-solid" class="h-6 w-6" />
    </div>
    <div
      class="flex flex-1 items-center justify-between truncate border-gray-200"
    >
      <div class="min-w-0 flex-1 py-2 text-sm">
        <p class="truncate font-medium text-gray-900 group-hover:text-gray-600">
          {{ name ? name : "Untitled Collection" }}
        </p>
        <p class="text-gray-500">{{ fileCount }} Files</p>
      </div>
      <div class="flex-shrink-0 pr-2" @click.stop>
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="gray"
            variant="ghost"
            square
            size="lg"
            icon="i-heroicons-ellipsis-vertical"
            :tabindex="active ? 0 : -1"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RenameCollectionModal, DeleteCollectionModal } from "#components";

const props = defineProps<{
  id: string;
  name: string;
  fileCount: number;
  selected: boolean;
  active: boolean;
}>();

const { mutate: createConversation } =
  useCreateConversationForCollectionMutation();
const { mutate: createFlashcardDeck } =
  useCreateFlashcardDeckForCollectionMutation();
const { mutate: createSampleTest } = useCreateSampleTestForCollectionMutation();
const toast = useToast();

const modal = useModal();

const items = [
  [
    {
      label: "Start a conversation",
      icon: "i-heroicons-chat-bubble-left-right",
      click() {
        createConversation(props.id, {
          onSuccess(conversationId) {
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
    },
    {
      label: "Generate flashcards",
      icon: "i-heroicons-rectangle-stack",
      click() {
        createFlashcardDeck(props.id, {
          onSuccess(flashcardDeckId) {
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
    },
    {
      label: "Generate a test",
      icon: "i-heroicons-academic-cap",
      click() {
        createSampleTest(props.id, {
          onSuccess(testId) {
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
    },
  ],
  [
    {
      label: "Rename",
      icon: "i-heroicons-pencil",
      click() {
        modal.open(RenameCollectionModal, {
          collectionId: props.id,
          name: props.name,
        });
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteCollectionModal, {
          collectionId: props.id,
        });
      },
    },
  ],
];
</script>
