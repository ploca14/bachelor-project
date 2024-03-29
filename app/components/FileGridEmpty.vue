<template>
  <div class="p-container h-full pb-16 pt-2">
    <div class="grid h-full place-items-center rounded-lg border border-dashed">
      <div class="text-center">
        <h3 class="mt-2 text-2xl font-bold tracking-tight">No files</h3>
        <p class="mt-1 text-sm text-gray-500">{{ instructions }}</p>
        <div class="mt-6">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  instructions: string;
}>();

const emit = defineEmits<{
  addFiles: [void];
}>();
</script>
