<template>
  <li
    :class="[
      role === 'ai'
        ? 'mr-12 bg-white text-gray-800'
        : 'ml-12 self-end bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      pending ? 'animate-pulse' : '',
    ]"
    class="max-w-lg rounded-xl px-3 py-3.5 text-sm leading-relaxed shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px] sm:max-w-2xl sm:px-4"
  >
    <div class="whitespace-pre-wrap break-words">
      {{ content }}
    </div>
  </li>
</template>

<script setup lang="ts">
const props = defineProps<{
  role: "ai" | "human";
  content: string;
  pending?: boolean;
}>();
</script>
