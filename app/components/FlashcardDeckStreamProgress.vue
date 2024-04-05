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
    title: "Unable show flashcard generation progress.",
    color: "red",
  });
});
</script>
