<template>
  <UProgress v-if="isStreaming" animation="carousel" size="sm" />
</template>

<script setup lang="ts">
const props = defineProps<{
  deckId: string;
}>();

const { isStreaming, error } = useFlashcardStreamSubscription(props.deckId);

const toast = useToast();
whenever(error, () => {
  toast.add({
    title: "An error occurred while generating flashcards.",
    color: "red",
  });
});
</script>
