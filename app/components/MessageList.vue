<template>
  <ul
    role="list"
    class="flex flex-col space-y-2 py-4 sm:space-y-4 sm:px-6 lg:px-8"
  >
    <MessageBubble
      v-for="message in messages"
      :key="message.id"
      :role="message.role"
      :content="message.content"
      :pending="message.pending"
    />
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  messages: Array<{
    id?: string;
    role: "human" | "ai";
    content: string;
    createdAt?: string;
    pending?: boolean;
  }>;
}>();
</script>
