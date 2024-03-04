<template>
  <div class="relative">
    <div
      class="group grid aspect-[10/7] w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100"
    >
      <Icon
        name="bi:file-earmark-pdf"
        class="h-12 w-12 place-self-center text-gray-500"
      />
      <button type="button" class="absolute inset-0 focus:outline-none">
        <span class="sr-only">View details for {{ originalName }}</span>
      </button>
    </div>
    <div class="mt-2 flex">
      <div class="w-full min-w-0">
        <p
          class="pointer-events-none block truncate text-sm font-medium text-gray-900"
        >
          {{ originalName }}
        </p>
        <p class="pointer-events-none block text-sm font-medium text-gray-500">
          {{ formatDate(createdAt) }}
        </p>
      </div>
      <div class="flex items-center">
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="gray"
            variant="ghost"
            square
            size="lg"
            icon="i-heroicons-ellipsis-vertical"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string;
  originalName: string;
  createdAt: string;
}>();

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-UK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const { mutate: deleteFile } = useDeleteFileMutation();
const { mutate: createConversation } = useCreateConversationMutation();
const toast = useToast();

const handleError = (error: Error) => {
  toast.add({ title: error.message, color: "red" });
};

const items = [
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
    },
    {
      label: "Generate a test",
      icon: "i-heroicons-academic-cap",
    },
  ],
  [
    {
      label: "Add to collection",
      icon: "i-heroicons-folder-plus",
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
      click: () => {
        deleteFile(props.id, {
          onError: handleError,
        });
      },
    },
  ],
];
</script>
