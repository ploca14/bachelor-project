<template>
  <FileCard v-bind="props" :menu="menu" />
</template>

<script setup lang="ts">
import { AddToCollectionModal } from "#components";

const props = defineProps<{
  id: string;
  originalName: string;
  createdAt: string;
  selected: boolean;
  active: boolean;
}>();

const { mutate: deleteFile } = useDeleteFileMutation();
const { mutate: createConversation } = useCreateConversationMutation();
const { mutate: createFlashcardDeck } = useCreateFlashcardDeckMutation();
const { mutate: createSampleTest } = useCreateSampleTestMutation();
const toast = useToast();

const handleError = (error: Error) => {
  toast.add({ title: error.message, color: "red" });
};

const modal = useModal();

const addToCollection = () => {
  modal.open(AddToCollectionModal, {
    fileIds: [props.id],
  });
};

const menu = [
  [
    {
      label: "Start a conversation",
      icon: "i-heroicons-chat-bubble-left-right",
      click: () => {
        createConversation(props.id, {
          onSuccess: (conversationId) => {
            navigateTo(`/conversations/${conversationId}`);
          },
          onError: handleError,
        });
      },
    },
    {
      label: "Generate flashcards",
      icon: "i-heroicons-rectangle-stack",
      click: () => {
        createFlashcardDeck(props.id, {
          onSuccess: (flashcardDeckId) => {
            navigateTo(`/flashcards/${flashcardDeckId}`);
          },
          onError: handleError,
        });
      },
    },
    {
      label: "Generate a test",
      icon: "i-heroicons-academic-cap",
      click: () => {
        createSampleTest(props.id, {
          onSuccess: (testId) => {
            navigateTo(`/sample-tests/${testId}`);
          },
          onError: handleError,
        });
      },
    },
  ],
  [
    {
      label: "Add to collection",
      icon: "i-heroicons-folder-plus",
      click: addToCollection,
    },
    {
      label: "Remove from collection",
      icon: "i-heroicons-folder-minus",
      click: () => {
        // removeFromCollection(props.id, {
        //   onError: handleError,
        // });
      },
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click: () => {
        deleteFile(props.id, {
          onError: handleError,
        });
      },
    },
  ],
];
</script>
