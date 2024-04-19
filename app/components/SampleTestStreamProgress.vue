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
    title: "An error occurred while generating questions.",
    color: "red",
  });
});
</script>
