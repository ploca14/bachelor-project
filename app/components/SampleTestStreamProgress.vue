<template>
  <UProgress v-if="isStreaming" animation="carousel" size="sm" />
</template>

<script setup lang="ts">
const props = defineProps<{
  testId: string;
}>();

// # TODO: Handle error
const { isStreaming, error } = useQuestionStreamSubscription(props.testId);
</script>
