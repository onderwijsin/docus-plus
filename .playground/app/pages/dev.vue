<script lang="ts" setup>
const { data } = useFetch("/api/directus/settings");
</script>

<template>
  <div>
    <pre>{{ data }}</pre>
  </div>
</template>
