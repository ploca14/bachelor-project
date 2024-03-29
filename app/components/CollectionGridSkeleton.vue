<template>
  <div>
    <div
      class="p-container sticky top-0 z-30 flex h-12 items-center justify-between bg-white pb-4"
    >
      <h3 class="font-medium">Collections</h3>
    </div>

    <ul
      role="list"
      class="p-container grid grid-cols-1 gap-4 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <li v-for="i in 6" :key="i" class="relative">
        <CollectionGridItemSkeleton />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts"></script>
