<template>
  <h3 class="p-container sticky top-0 z-40 bg-white pb-4 font-medium">Files</h3>

  <ul
    role="list"
    class="p-container grid grid-cols-2 gap-4 pb-16 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <li v-for="i in 10" :key="i" class="relative">
      <FileGridItemSkeleton />
    </li>
  </ul>
</template>

<script setup lang="ts"></script>
