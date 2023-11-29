<script setup lang="ts">
const props = defineProps({
  error: Object,
});
</script>

<template>
  <div>
    <pre>{{ error }}</pre>
  </div>
</template>
