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
        <span class="sr-only">View details for {{ file.name }}</span>
      </button>
    </div>
    <div class="mt-2 flex">
      <div class="w-full min-w-0">
        <p
          class="pointer-events-none block truncate text-sm font-medium text-gray-900"
        >
          {{ file.name }}
        </p>
        <p class="pointer-events-none block text-sm font-medium text-gray-500">
          {{ formatDate(file.created_at) }}
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
import { UploadedFile } from "#imports";

const props = defineProps<{
  file: UploadedFile;
}>();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-UK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const { mutate: deleteFile } = useDeleteFileQuery();
const toast = useToast();

const items = [
  [
    {
      label: "Start a conversation",
      icon: "i-heroicons-chat-bubble-left-right",
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
        deleteFile(props.file.id, {
          onError: (error) => {
            console.log(error.message);
            toast.add({ title: error.message, color: "red" });
          },
        });
      },
    },
  ],
];
</script>
