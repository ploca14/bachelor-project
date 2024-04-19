<template>
  <ol
    class="flex list-inside list-decimal flex-col gap-12 font-semibold tracking-tight"
  >
    <li v-for="question in filteredQuestions">
      {{ question?.content }}
    </li>
  </ol>
</template>

<script setup lang="ts">
interface Question {
  content: string;
}

const props = defineProps<{
  questions: DeepPartial<Array<Question>>;
}>();

const isQuestion = (question: unknown): question is Question => {
  if (!question) return false;

  const { content } = question as Question;

  return typeof content === "string";
};

const filteredQuestions = computed(() => {
  return props.questions.filter(isQuestion);
});
</script>
