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
            Delete conversation
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

      <p class="mb-5 text-sm text-gray-500">
        Are you sure you want to delete the selected conversation?
      </p>

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
        <UButton
          type="submit"
          size="lg"
          class="w-20 justify-center"
          @click="handleSubmit"
        >
          OK
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const modal = useModal();

const props = defineProps<{
  conversationId: string;
}>();

const { mutate } = useDeleteConversationMutation();

const toast = useToast();

const handleSubmit = () => {
  mutate(props.conversationId, {
    async onSuccess() {
      await navigateTo("/conversations");
      modal.close();
      toast.add({
        title: "Conversation deleted.",
        color: "green",
      });
    },
    onError() {
      modal.close();
      toast.add({
        title: "Failed to delete conversation.",
        color: "red",
      });
    },
  });
};
</script>
