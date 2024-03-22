<template>
  <div class="flex h-full flex-col">
    <div class="border-b p-5">
      <h1 class="text-2xl font-semibold leading-7">
        {{ flashcardDeck?.name }}
      </h1>
    </div>
    <div class="h-full overflow-y-auto">
      <FlashcardDeckStreamProgress
        v-once
        v-if="
          !isDefined(flashcardDeck) || flashcardDeck.flashcards?.length === 0
        "
        :deck-id="deckId"
      />
      <div class="mx-auto grid max-w-2xl grid-cols-1 gap-6 p-6">
        <div
          v-for="flashcard in flashcardDeck?.flashcards"
          class="flex flex-col items-center gap-4 text-balance rounded-lg border p-6 text-center shadow-sm"
        >
          <h3 class="text-xl font-semibold tracking-tight">
            {{ flashcard?.front }}
          </h3>
          <p class="text-sm font-medium text-neutral-500">
            {{ flashcard?.back }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { currentRoute } = useRouter();
const deckId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: flashcardDeck, suspense } = useFlashcardDeckQuery(deckId);
await suspense();
</script>
