<script lang="ts" setup>
const { data } = useFetch("https://api.github.com/repos/nuxt/nuxt");
</script>

<template>
  <div>
    <pre>{{ data }}</pre>
  </div>
</template>
