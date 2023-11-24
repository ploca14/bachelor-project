<template>
  <h3 class="mb-4 font-medium">Files</h3>
  <ul
    role="list"
    class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 xl:gap-x-8"
  >
    <li v-for="file in files" :key="file.source" class="relative">
      <div
        class="group grid aspect-[10/7] w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100"
      >
        <Icon
          name="bi:file-earmark-pdf"
          class="h-12 w-12 place-self-center text-gray-500"
        />
        <button type="button" class="absolute inset-0 focus:outline-none">
          <span class="sr-only">View details for {{ file.title }}</span>
        </button>
      </div>
      <p
        class="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900"
      >
        {{ file.title }}
      </p>
      <p class="pointer-events-none block text-sm font-medium text-gray-500">
        {{ file.size }}
      </p>
    </li>
  </ul>
</template>

<script setup>
const files = [
  {
    title: "IMG_4985.HEIC",
  },
  {
    title: "IMG_4985.HEIC",
  },
  {
    title: "IMG_4985.HEIC",
  },
  {
    title: "IMG_4985.HEIC",
  },
  {
    title: "IMG_4985.HEIC",
  },
  // More files...
];
</script>
