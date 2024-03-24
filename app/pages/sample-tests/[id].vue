<template>
  <div class="flex h-full flex-col">
    <div class="border-b p-5">
      <h1 class="text-2xl font-semibold leading-7">
        {{ sampleTest?.name }}
      </h1>
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
const { currentRoute } = useRouter();
const testId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: sampleTest, suspense } = useSampleTestQuery(testId);
await suspense();
</script>
