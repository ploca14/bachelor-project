<template>
  <div class="flex h-full flex-col">
    <div class="p-container flex items-center gap-6 border-b py-3">
      <h1 class="truncate text-2xl font-semibold leading-7">
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
      <template v-if="sampleTest && !isPlaceholderData">
        <template
          v-if="sampleTest.status === 'complete' && sampleTest.questions"
        >
          <div class="mx-auto max-w-4xl p-6">
            <div class="rounded-lg border p-20 shadow-sm">
              <QuestionsList :questions="sampleTest.questions" />
            </div>
          </div>
        </template>
        <template v-else-if="sampleTest.status === 'pending'">
          <div class="absolute inset-x-0 top-0">
            <SampleTestStreamProgress :test-id="testId" />
          </div>

          <div class="mx-auto max-w-4xl p-6">
            <div class="rounded-lg border p-20 shadow-sm">
              <QuestionsList
                v-if="sampleTest.questions?.length"
                :questions="sampleTest.questions"
              />
              <div v-else class="flex flex-col gap-12">
                <USkeleton
                  v-for="idx in 15"
                  class="ml-1 mt-1 inline-block h-4 max-w-full align-top"
                  :style="{
                    width: `${Math.floor(Math.random() * (750 - 250 + 1)) + 250}px`,
                  }"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex h-full flex-col items-center justify-center gap-3">
            <p class="text-center text-sm text-gray-500">
              There was an error while generating the sample test.
            </p>
            <UButton size="lg" to="/files"> Create New Sample Test </UButton>
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
import { DeleteSampleTestModal } from "#components";
import { promiseTimeout } from "@vueuse/core";

const { currentRoute } = useRouter();
const testId = z.coerce.string().parse(currentRoute.value.params.id);

const {
  data: sampleTest,
  isPlaceholderData,
  suspense,
} = useSampleTestQuery(testId);
await Promise.race([suspense(), promiseTimeout(200)]);

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
