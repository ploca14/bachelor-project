<template>
  <div class="flex h-full flex-col">
    <div class="p-container flex flex-wrap items-center gap-6 border-b py-3">
      <h1 class="text-2xl font-semibold leading-7">
        {{ conversation?.name }}
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
    <div class="relative flex h-full flex-col-reverse overflow-y-auto px-3">
      <div>
        <MessageList v-if="conversation" :messages="conversation.messages" />
        <div
          v-else
          class="absolute inset-x-0 top-10 flex items-center justify-center"
        >
          <Icon name="eos-icons:loading" class="text-primary h-10 w-10" />
        </div>
        <MessageList v-if="isPending" :messages="currentMessages" />
        <div
          class="sticky bottom-0 isolate -mx-3 flex flex-col items-center px-3 pb-6 pt-12"
        >
          <div
            class="absolute inset-0 -z-10 bg-gradient-to-t from-gray-100 from-50% to-transparent"
          ></div>
          <div v-if="isDisabled" class="flex flex-col items-center gap-3">
            <p class="text-sm text-gray-500">
              This conversation is archived because all reference files have
              been deleted.
            </p>
            <UButton size="lg" to="/files">Create New Conversation</UButton>
          </div>
          <form @submit.prevent="handleSubmit" ref="form" class="w-full" v-else>
            <MessageInput v-model="input" class="mx-auto w-full max-w-prose" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteConversationModal } from "#components";

const { currentRoute } = useRouter();
const conversationId = z.coerce.string().parse(currentRoute.value.params.id);

const { data: conversation } = useConversationQuery(conversationId);
const {
  mutateAsync: sendMessage,
  variables,
  isPending,
} = useSendMessageMutation(conversationId);

const input = ref("");
const streamedResponse = ref("");

const isDisabled = computed(() => {
  return conversation.value?.files.length === 0;
});

const handleSubmit = () => {
  sendMessage(
    {
      content: input.value,
      onToken: (token) => {
        streamedResponse.value += token;
      },
    },
    {
      onSuccess: () => {
        streamedResponse.value = "";
      },
    },
  );

  input.value = "";
};

const currentMessages = computed(() => {
  if (!variables.value) return [];

  if (streamedResponse.value.length === 0) {
    return [
      {
        content: variables.value.content,
        role: "human" as const,
      },
      {
        content: "Thinking...",
        role: "ai" as const,
        pending: true,
      },
    ];
  }

  return [
    {
      content: variables.value.content,
      role: "human" as const,
    },
    {
      content: streamedResponse.value,
      role: "ai" as const,
    },
  ];
});

const { shift } = useMagicKeys();

defineShortcuts({
  enter: {
    usingInput: "messageInput",
    whenever: [computed(() => !shift.value)],
    handler: handleSubmit,
  },
});

const modal = useModal();

const items = computed(() => [
  [
    // {
    //   label: "Rename",
    //   icon: "i-heroicons-pencil",
    //   onClick: () => {
    //     RenameConversationModal.open({ conversationId });
    //   },
    // },
    {
      label: "Delete",
      icon: "i-heroicons-trash",
      click() {
        modal.open(DeleteConversationModal, { conversationId });
      },
    },
  ],
]);
</script>
