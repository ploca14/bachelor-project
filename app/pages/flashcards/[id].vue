<template>
  <div class="flex h-full flex-col">
    <div class="p-container flex flex-wrap items-center gap-6 border-b py-3">
      <h1 class="text-2xl font-semibold leading-7">
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
      <div v-memo="[deckId]" class="absolute inset-x-0 top-0">
        <FlashcardDeckStreamProgress
          v-if="!flashcardDeck || flashcardDeck.flashcards?.length === 0"
          :deck-id="deckId"
        />
      </div>
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
import { DeleteFlashcardDeckModal } from "#components";

const { currentRoute } = useRouter();
const deckId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: flashcardDeck, suspense } = useFlashcardDeckQuery(deckId);
await suspense();

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
