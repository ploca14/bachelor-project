<template>
  <div>Redirecting...</div>
</template>

<script setup lang="ts">
const user = useUser();

whenever(user, () => navigateTo("/files"), { immediate: true });
</script>
