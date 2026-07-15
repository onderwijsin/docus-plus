<script setup lang="ts">
const app = useAppConfig();

const date = useState(() => new Date().getFullYear());
</script>

<template>
  <div class="text-sm text-muted">
    Copyright © {{ date }} -
    <NuxtLink class="underline" :to="app.publisher.url">{{ app.publisher.name }}</NuxtLink>
  </div>
</template>
