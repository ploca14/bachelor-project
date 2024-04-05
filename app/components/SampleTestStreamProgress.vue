<template>
  <UProgress v-if="isStreaming" animation="carousel" size="sm" />
</template>

<script setup lang="ts">
const props = defineProps<{
  testId: string;
}>();

const { isStreaming, error } = useQuestionStreamSubscription(props.testId);

const toast = useToast();
whenever(error, () => {
  toast.add({
    title: "Unable show flashcard generation progress.",
    color: "red",
  });
});
</script>
