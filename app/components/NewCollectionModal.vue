<template>
  <UModal
    :ui="{
      width: 'sm:max-w-sm',
    }"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            New collection
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="modal.close()"
          />
        </div>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup name="name">
          <UInput
            v-auto-focus
            placeholder="Untitled Collection"
            v-model="state.name"
            size="lg"
          />
        </UFormGroup>

        <div class="flex justify-end gap-4">
          <UButton
            type="button"
            color="white"
            @click="modal.close()"
            size="lg"
            class="w-20 justify-center"
          >
            Cancel
          </UButton>
          <UButton type="submit" size="lg" class="w-20 justify-center">
            Create
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { vAutoFocus } from "#imports";

interface Props {
  fileIds: string[];
}

const props = withDefaults(defineProps<Props>(), {
  fileIds: () => [],
});

const modal = useModal();

const schema = z.object({
  name: z.string(),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  name: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data, props.fileIds);
  modal.close();
  return navigateTo(`/collections/new-uuid`);
}
</script>
