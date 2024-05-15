<template>
  <FileCard v-bind="props" :menu="menu" />
</template>

<script setup lang="ts">
import { AddToCollectionModal, DeleteFilesModal } from "#components";

const props = defineProps<{
  collectionId: string;
  id: string;
  originalName: string;
  createdAt: string;
  selected: boolean;
  active: boolean;
}>();

const { mutate: createConversation } = useCreateConversationMutation();
const { mutate: createFlashcardDeck } = useCreateFlashcardDeckMutation();
const { mutate: createSampleTest } = useCreateSampleTestMutation();
const { mutate: removeFilesFromCollection } =
  useRemoveFilesFromCollectionMutation();
const toast = useToast();

const modal = useModal();

const menu = [
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
      label: "Add to collection",
      icon: "i-heroicons-folder-plus",
      click() {
        modal.open(AddToCollectionModal, {
          fileIds: [props.id],
        });
      },
    },
    {
      label: "Remove from collection",
      icon: "i-heroicons-folder-minus",
      click() {
        removeFilesFromCollection(
          {
            collectionId: props.collectionId,
            fileIds: [props.id],
          },
          {
            onError() {
              toast.add({
                title: "Failed to remove file from collection.",
                color: "red",
              });
            },
          },
        );
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteFilesModal, {
          fileIds: [props.id],
        });
      },
    },
  ],
];
</script>
