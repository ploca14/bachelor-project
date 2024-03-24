<template>
  <div
    class="relative rounded-lg ring-green-500 ring-offset-8 ring-offset-white group-focus-visible:ring-2"
  >
    <Icon
      name="i-heroicons-check-16-solid"
      :class="[
        !selected ? 'invisible' : '',
        'absolute right-1 top-1 h-5 w-5 text-green-600',
      ]"
      aria-hidden="true"
    />
    <div
      :class="[
        'group grid aspect-[10/7] w-full overflow-hidden rounded-lg bg-gray-100',
        'ring-green-200',
        selected ? 'bg-green-50 ring-2' : '',
      ]"
    >
      <Icon
        name="bi:file-earmark-pdf"
        class="h-12 w-12 place-self-center text-gray-500"
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
          {{ formatDate(createdAt) }}
        </p>
      </div>
      <div v-if="menu" class="flex items-center" @click.stop>
        <UDropdown :items="menu" :popper="{ placement: 'bottom-start' }">
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
const props = defineProps<{
  id: string;
  originalName: string;
  createdAt: string;
  selected: boolean;
  active: boolean;
  menu?: Array<object>;
}>();

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-UK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};
</script>
