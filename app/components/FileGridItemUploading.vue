<template>
  <div class="relative">
    <div
      class="group grid aspect-[10/7] w-full animate-pulse overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100"
    >
      <Icon
        name="bi:file-earmark-pdf"
        class="col-start-1 row-start-1 h-12 w-12 place-self-center text-gray-500"
      />
      <UProgress
        class="col-start-1 row-start-1 place-self-end"
        size="sm"
        :value="progress"
        :ui="{
          progress: {
            rounded: 'rounded-none',
          },
        }"
      />
    </div>
    <div class="mt-2 flex">
      <div class="w-full min-w-0">
        <p
          class="pointer-events-none block truncate text-sm font-medium text-gray-900"
        >
          {{ originalName }}
        </p>
        <p class="pointer-events-none block text-sm font-medium text-gray-500">
          <span class="tabular-nums"> {{ progress }} % </span>
          Uploading...
        </p>
      </div>
      <div class="flex items-center">
        <div class="p-2.5">
          <UIcon
            name="i-heroicons-ellipsis-vertical"
            class="h-5 w-5 cursor-wait"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  originalName: string;
  progress: number;
}>();
</script>
