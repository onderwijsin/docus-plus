<script lang="ts" setup>
import { SCALAR_BASE_PATH } from "#layers/docus-plus/config/constants";

const { scalar } = useRuntimeConfig().public;
const route = useRoute();
const isExplorer = computed(() => route.path.startsWith(SCALAR_BASE_PATH));
</script>

<template>
  <UButton
    v-if="scalar.enabled"
    :to="isExplorer ? '/getting-started/introduction' : SCALAR_BASE_PATH"
    color="primary"
    size="sm"
    variant="soft"
    class="hidden lg:inline-flex"
    :icon="isExplorer ? getIcon('docs') : getIcon('api_explorer')"
  >
    {{ isExplorer ? "Documentation" : "API Explorer" }}
  </UButton>
</template>
