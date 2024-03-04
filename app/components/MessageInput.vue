<template>
  <div class="relative">
    <div
      class="flex overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-green-600"
    >
      <textarea
        ref="textarea"
        v-model="input"
        name="messageInput"
        class="form-textarea block w-full resize-none border-0 bg-transparent py-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
        placeholder="What's on your mind?"
      />
      <span class="w-16 shrink-0" />
    </div>
    <div
      class="absolute bottom-0 right-0 flex items-center justify-end py-[7px] pr-2"
    >
      <div class="flex-shrink-0">
        <button
          type="submit"
          class="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          <Icon name="heroicons:paper-airplane-solid" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits(["update:modelValue"]);

const input = useVModel(props, "modelValue", emit);

const { textarea } = useTextareaAutosize({
  input,
});
</script>
