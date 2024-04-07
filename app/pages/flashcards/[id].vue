<template>
  <div class="flex h-full flex-col">
    <div class="p-container flex items-center gap-6 border-b py-3">
      <h1 class="truncate text-2xl font-semibold leading-7">
        {{ flashcardDeck?.name }}
      </h1>

      <div class="ml-auto flex gap-4">
        <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            square
            size="xl"
            icon="i-heroicons-ellipsis-vertical"
          />
        </UDropdown>
      </div>
    </div>

    <div class="relative h-full overflow-y-auto">
      <template v-if="flashcardDeck && !isPlaceholderData">
        <template
          v-if="flashcardDeck.status === 'complete' && flashcardDeck.flashcards"
        >
          <FlashcardsList :flashcards="flashcardDeck.flashcards" />
        </template>
        <template v-else-if="flashcardDeck.status === 'pending'">
          <div class="absolute inset-x-0 top-0">
            <FlashcardDeckStreamProgress :deck-id="deckId" />
          </div>

          <FlashcardsList
            v-if="flashcardDeck.flashcards"
            :flashcards="flashcardDeck.flashcards"
          />
          <p v-else class="text-center text-sm text-gray-500">
            Hold on, we're generating your flashcards.
          </p>
        </template>
        <template v-else>
          <div class="flex h-full flex-col items-center justify-center gap-3">
            <p class="text-center text-sm text-gray-500">
              There was an error while generating the flashcards.
            </p>
            <UButton size="lg" to="/files"> Create New Flashcard Deck </UButton>
          </div>
        </template>
      </template>
      <template v-else>
        <UProgress animation="carousel" size="sm" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteFlashcardDeckModal } from "#components";
import { promiseTimeout } from "@vueuse/core";

const { currentRoute } = useRouter();
const deckId = z.coerce.string().parse(currentRoute.value.params.id);

const {
  data: flashcardDeck,
  isPlaceholderData,
  suspense,
} = useFlashcardDeckQuery(deckId);
await Promise.race([suspense(), promiseTimeout(200)]);

const { exportCSV } = useExportCSV();

const modal = useModal();

const items = computed(() => [
  [
    {
      label: "Export",
      icon: "i-heroicons-arrow-down-tray",
      click() {
        if (!flashcardDeck.value) return;
        if (!flashcardDeck.value.flashcards) return;

        const data = flashcardDeck.value.flashcards
          .filter(nonNullable)
          .map(({ front, back }) => ({
            front,
            back,
          }));

        exportCSV(data, flashcardDeck.value.name ?? "flashcards");
      },
      disabled: !flashcardDeck.value || !flashcardDeck.value.flashcards,
    },
    // {
    //   label: "Rename",
    //   icon: "i-heroicons-pencil",
    //   onClick: () => {
    //     RenameFlashcardDeckModal.open({ deckId });
    //   },
    // },
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteFlashcardDeckModal, { deckId });
      },
    },
  ],
]);
</script>
