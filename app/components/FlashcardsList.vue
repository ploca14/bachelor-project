<template>
  <div class="mx-auto grid max-w-2xl grid-cols-1 gap-6 p-6">
    <div
      v-for="flashcard in filteredFlashcards"
      class="flex flex-col items-center gap-4 text-balance rounded-lg border p-6 text-center shadow-sm"
    >
      <h3 class="text-xl font-semibold tracking-tight">
        {{ flashcard.front }}
      </h3>
      <p class="text-sm font-medium text-neutral-500">
        {{ flashcard.back }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Flashcard {
  front: string;
  back: string;
}

const props = defineProps<{
  flashcards: DeepPartial<Array<Flashcard>>;
}>();

const isFlashcard = (flashcard: unknown): flashcard is Flashcard => {
  if (!flashcard) return false;

  const { front, back } = flashcard as Flashcard;

  return typeof front === "string" && typeof back === "string";
};

const filteredFlashcards = computed(() => {
  return props.flashcards.filter(isFlashcard);
});
</script>
