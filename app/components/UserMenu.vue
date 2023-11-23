<template>
  <UDropdown
    :items="items"
    :ui="{ item: { disabled: 'cursor-text select-text' } }"
    :popper="{ placement: 'bottom-start' }"
  >
    <UAvatar :size="size" :src="user.avatar_url" :alt="user.name" />

    <template #account="{ item }">
      <div class="text-left">
        <p>Signed in as</p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
          {{ item.label }}
        </p>
      </div>
    </template>

    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>

      <UIcon
        :name="item.icon"
        class="ms-auto h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
      />
    </template>
  </UDropdown>
</template>

<script setup lang="ts">
defineProps<{ size: "sm" | "md" }>();

const user = useUser();
const { logout } = useAuth();

const items = computed(() => [
  [
    {
      label: user.value.name,
      slot: "account",
      disabled: true,
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: logout,
    },
  ],
]);
</script>
