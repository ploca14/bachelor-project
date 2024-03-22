<template>
  <UProgress v-if="isStreaming" animation="carousel" size="sm" />
</template>

<script setup lang="ts">
const props = defineProps<{
  deckId: string;
}>();

// # TODO: Handle error
const { isStreaming, error } = useFlashcardStreamSubscription(props.deckId);
</script>
