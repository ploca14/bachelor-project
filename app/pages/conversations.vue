<template>
  <div class="flex h-full">
    <div
      class="w-full flex-shrink-0 overflow-y-auto border-r border-gray-200 md:block md:w-72 lg:w-80 xl:w-96"
      :class="{
        hidden: route.params.id,
      }"
    >
      <div class="p-container border-b border-gray-200 py-5">
        <h1 class="text-2xl font-semibold leading-7">Conversations</h1>
      </div>

      <div class="px-2 py-5">
        <UVerticalNavigation :links="links" :ui="{ padding: 'py-3' }">
          <template #default="{ link }">
            <div class="relative flex w-full flex-col">
              <div class="flex flex-1 items-center justify-between truncate">
                <div class="truncate">{{ link.label }}</div>
                <div class="text-xs">{{ link.time }}</div>
              </div>
              <div class="h-4 truncate text-xs">
                {{ link.lastMessage ?? "No message yet" }}
              </div>
            </div>
          </template>
        </UVerticalNavigation>
      </div>
    </div>
    <div class="w-full">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

const breakpoints = useBreakpoints(breakpointsTailwind);
const greaterThanMd = breakpoints.greater("md");
const { data } = useConversationsQuery();

const route = useRoute();
watchEffect(async () => {
  if (!data.value) return;
  //await navigateTo(`/conversations/${data.value[0].id}`);
});

const links = computed(() =>
  data.value?.map((conversation) => ({
    label: conversation.name,
    to: `/conversations/${conversation.id}`,
    time: conversation.lastMessageSentAt
      ? formatTimeAgo(new Date(conversation.lastMessageSentAt))
      : null,
    lastMessage: conversation.lastMessage,
  })),
);
</script>
