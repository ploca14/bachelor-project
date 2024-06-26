<template>
  <UModal
    :ui="{
      width: 'sm:max-w-sm',
    }"
  >
    <UCard
      :ui="{
        body: 'p-0',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Add to
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

      <Menu @keydown.esc="modal.close()">
        <MenuItems
          class="scroll-py-2 divide-gray-100 overflow-y-auto rounded-lg outline-2 outline-green-500 dark:divide-gray-800"
          :class="collections.length > 0 ? 'divide-y' : 'divide-none'"
          static
        >
          <div
            class="p-2 text-sm text-gray-700 dark:text-gray-200"
            role="none"
            v-for="group in groups"
          >
            <MenuItem v-for="item in group.commands" :key="item.id">
              <button
                :class="[
                  'ui-active:bg-gray-100 ui-active:text-gray-900 ui-active:dark:bg-gray-800 ui-active:dark:text-white',
                  'relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2.5 py-1.5',
                ]"
                @click="onSelect({ ...item, group: group.key })"
              >
                <div
                  v-if="'icon' in item"
                  class="flex min-w-0 items-center gap-1.5"
                >
                  <Icon
                    v-if="'icon' in item"
                    :name="item.icon"
                    class="ui-active:text-gray-900 ui-active:dark:text-white mr-2 h-5 w-5 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                  {{ item.label }}
                </div>
                <template v-else>
                  {{ item.label }}
                </template>
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { NewCollectionModal } from "#components";
import { Menu, MenuItems, MenuItem } from "@headlessui/vue";

const modal = useModal();

const props = defineProps<{
  fileIds: string[];
}>();

const { data, suspense } = useCollectionsQuery();
await suspense();

const collections = computed(() => {
  if (!data.value) {
    return [];
  }

  return data.value.map((collection) => ({
    id: collection.id,
    label: collection.name ? collection.name : "Untitled collection",
    group: "collections",
  }));
});

const newCollection = async () => {
  modal.close();
  await nextTick();
  modal.open(NewCollectionModal, {
    fileIds: props.fileIds,
  });
};

const toast = useToast();

const { mutate } = useAddFilesToCollectionMutation();

const groups = computed(() => [
  {
    key: "actions",
    commands: [
      {
        id: "new-collection",
        label: "New collection",
        icon: "i-heroicons-plus",
        click: newCollection,
      },
    ],
  },
  {
    key: "collections",
    commands: collections.value,
  },
]);

const onSelect = (option: any) => {
  if (option.group === "actions") {
    option.click();
  } else if (option.group === "collections") {
    const payload = {
      collectionId: option.id,
      fileIds: props.fileIds,
    };

    mutate(payload, {
      onSuccess(_data, { collectionId, fileIds }) {
        const collection = collections.value.find((c) => c.id === collectionId);

        modal.close();
        toast.add({
          title: `${fileIds.length > 1 ? "Files" : "File"} added to ${collection?.label ?? "collection"}.`,
          color: "green",
        });
      },
      onError(_error, { fileIds }) {
        modal.close();
        toast.add({
          title: `Failed to add ${fileIds.length > 1 ? "Files" : "File"} to collection.`,
          color: "red",
        });
      },
    });
  }
};
</script>
