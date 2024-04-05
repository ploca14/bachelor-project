<template>
  <div class="flex h-full flex-col">
    <div class="p-container flex flex-wrap items-center gap-6 border-b py-3">
      <h1 class="text-2xl font-semibold leading-7">
        {{ sampleTest?.name }}
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
      <div v-memo="[testId]" class="absolute inset-x-0 top-0">
        <SampleTestStreamProgress
          v-if="!sampleTest || sampleTest.questions?.length === 0"
          :test-id="testId"
        />
      </div>
      <div class="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-6">
        <div class="rounded-lg border p-20 shadow-sm">
          <div
            v-if="!sampleTest || sampleTest.questions?.length === 0"
            class="flex flex-col gap-12"
          >
            <USkeleton
              v-for="idx in 15"
              class="ml-1 mt-1 inline-block h-4 max-w-full align-top"
              :style="{
                width: `${Math.floor(Math.random() * (750 - 250 + 1)) + 250}px`,
              }"
            />
          </div>
          <ol
            v-else
            class="flex list-inside list-decimal flex-col gap-12 font-semibold tracking-tight"
          >
            <li v-for="question in sampleTest.questions">
              {{ question?.content }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteSampleTestModal } from "#components";

const { currentRoute } = useRouter();
const testId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: sampleTest, suspense } = useSampleTestQuery(testId);
await suspense();

const { exportCSV } = useExportCSV();

const modal = useModal();

const items = computed(() => [
  [
    {
      label: "Export",
      icon: "i-heroicons-arrow-down-tray",
      click() {
        if (!sampleTest.value) return;
        if (!sampleTest.value.questions) return;

        const data = sampleTest.value.questions
          .filter(nonNullable)
          .map(({ content }) => ({
            content,
          }));

        exportCSV(data, sampleTest.value.name ?? "sample-test");
      },
      disabled: !sampleTest.value || !sampleTest.value.questions,
    },
    // {
    //   label: "Rename",
    //   icon: "i-heroicons-pencil",
    //   onClick: () => {
    //     RenameSampleTestModal.open({ deckId });
    //   },
    // },
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteSampleTestModal, {
          testId,
        });
      },
    },
  ],
]);
</script>
