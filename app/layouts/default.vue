<template>
  <div class="flex h-full flex-col">
    <USlideover
      v-model="sidebarOpen"
      side="left"
      class="lg:hidden"
      :ui="{
        width: 'max-w-xs',
      }"
    >
      <div class="p-4 pt-8">
        <UVerticalNavigation
          :links="navigation"
          :ui="{
            size: 'text-md',
            icon: { base: 'h-6 w-6' },
            padding: 'px-4 py-2.5',
          }"
        />
      </div>
    </USlideover>

    <div
      :class="[
        'hidden lg:flex',
        'fixed inset-y-0 left-0 z-[60] w-20 overflow-y-auto px-3 pb-4 ring-1 ring-gray-200',
        'flex-col items-center justify-between gap-y-8',
      ]"
    >
      <UVerticalNavigation
        :links="navigation"
        :ui="{
          label: 'hidden sr-only',
          padding: '',
          width: 'w-auto',
          wrapper: 'flex flex-col items-center space-y-1',
        }"
        class="mt-8"
      >
        <template #icon="{ link }">
          <UTooltip
            :text="link.label"
            :popper="{ placement: 'right' }"
            :open-delay="500"
            :ui="{
              wrapper: 'p-3',
              transition: {
                enterFromClass: '-translate-x-1',
                enterToClass: 'translate-x-0',
                leaveFromClass: 'translate-x-0',
                leaveToClass: '-translate-x-1',
              },
            }"
          >
            <UIcon :name="link.icon" class="h-6 w-6" />
          </UTooltip>
        </template>
      </UVerticalNavigation>
      <UserMenu size="md" />
    </div>

    <div
      class="sticky top-0 z-50 flex h-16 items-center justify-between gap-x-6 bg-white px-4 py-4 ring-1 ring-gray-200 sm:px-6 lg:hidden"
    >
      <UButton
        icon="i-heroicons-bars-3"
        variant="link"
        size="xl"
        square
        class="-m-2.5 lg:hidden"
        color="gray"
        @click="sidebarOpen = true"
      >
        <span class="sr-only">Open sidebar</span>
      </UButton>
      <UserMenu />
    </div>

    <main class="h-[calc(100%-64px)] lg:h-full lg:pl-20">
      <slot />
    </main>
  </div>
</template>

<script setup>
const navigation = [
  { label: "Files", to: "/files", icon: "i-heroicons-folder" },
  {
    label: "Conversations",
    to: "/conversations",
    icon: "i-heroicons-chat-bubble-left-right",
  },
  {
    label: "Flashcards",
    to: "/flashcards",
    icon: "i-heroicons-rectangle-stack",
  },
  {
    label: "Sample Tests",
    to: "/sample-tests",
    icon: "i-heroicons-academic-cap",
  },
];

const sidebarOpen = ref(false);

const { currentRoute } = useRouter();

watch(currentRoute, () => {
  sidebarOpen.value = false;
});
</script>
