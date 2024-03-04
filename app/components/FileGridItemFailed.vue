<template>
  <div class="relative">
    <div
      class="group grid aspect-[10/7] w-full overflow-hidden rounded-lg bg-red-100 focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100"
    >
      <Icon
        name="i-heroicons-exclamation-circle"
        class="h-12 w-12 place-self-center text-red-400"
      />

      <button type="button" class="absolute inset-0 focus:outline-none">
        <span class="sr-only">View details for {{ originalName }}</span>
      </button>
    </div>
    <div class="mt-2 flex">
      <div class="w-full">
        <p
          class="pointer-events-none block truncate text-sm font-medium text-gray-900"
        >
          {{ originalName }}
        </p>
        <p class="pointer-events-none block text-sm font-medium text-gray-500">
          Failed to upload
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
defineProps<{
  originalName: string;
}>();

const items = [
  [
    {
      label: "Retry",
      icon: "i-heroicons-arrow-path",
    },
    {
      label: "Delete",
      icon: "i-heroicons-trash-20-solid",
    },
  ],
];
</script>
