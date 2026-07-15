<script lang="ts" setup>
import { SCALAR_BASE_PATH } from "#layers/docus-plus/config/constants";
import type { BadgeProps } from "@nuxt/ui";

const { scalar } = useRuntimeConfig().public;
const route = useRoute();
const isExplorer = computed(() => route.path.startsWith(SCALAR_BASE_PATH));
const currentReference = computed(() =>
  scalar.references.find((reference) => route.path.startsWith(reference.path)),
);
const referenceItems = computed(() =>
  scalar.references.map((reference) => ({
    label: reference.label,
    to: reference.path,
    badge: reference.badge as BadgeProps | undefined,
  })),
);

const { data: firstArticle } = await useAsyncData("first-article", () =>
  queryCollection("docs").first(),
);
</script>

<template>
  <UDropdownMenu
    v-if="scalar.enabled && scalar.references.length > 1 && !isExplorer"
    :items="referenceItems"
    :content="{ align: 'end' }"
    open-on-hover
    class="hidden lg:inline-flex"
    :ui="{ item: 'items-center gap-4' }"
  >
    <template #item-trailing="{ item }">
      <UBadge v-if="item.badge" v-bind="item.badge" />
    </template>
    <UButton
      color="primary"
      size="sm"
      variant="soft"
      :icon="getIcon('api_explorer')"
    >
      API Explorer
    </UButton>
  </UDropdownMenu>
  <UButton
    v-else-if="scalar.enabled"
    :to="
      isExplorer
        ? firstArticle?.path || '/'
        : currentReference?.path || SCALAR_BASE_PATH
    "
    color="primary"
    size="sm"
    variant="soft"
    class="hidden lg:inline-flex"
    :icon="isExplorer ? getIcon('docs') : getIcon('api_explorer')"
  >
    {{ isExplorer ? "Documentation" : "API Explorer" }}
  </UButton>
</template>
