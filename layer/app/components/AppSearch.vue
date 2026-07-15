<script setup lang="ts">
import { SCALAR_BASE_PATH } from "#layers/docus-plus/config/constants";

import type { ContentNavigationItem, PageCollections } from "@nuxt/content";
import type { CommandPaletteGroup } from "@nuxt/ui";
import type { GlobalSearchItem } from "#layers/docus-plus/app/composables/global-content-search";

const { scalar } = useRuntimeConfig().public;

const props = defineProps<{
  navigation?: ContentNavigationItem[];
}>();

const { publisher } = useAppConfig();
const { forced: forcedColorMode } = useDocusColorMode();
const { locale, isEnabled } = useDocusI18n();

const collectionName = computed(
  () => (isEnabled.value ? `docs_${locale.value}` : "docs") as keyof PageCollections
);

const { open } = useContentSearch();
const colorMode = useColorMode();

const links = computed<GlobalSearchItem[]>(() => {
  const items: GlobalSearchItem[] = [];

  if (props.navigation) {
    items.push(
      ...props.navigation
        .filter((item) => item.children?.length)
        .map((item) => ({
          id: item.children![0]!.path,
          label: item.title,
          icon: item.icon as string,
          to: item.children![0]!.path
        }))
    );
  }

  if (
    scalar.enabled &&
    scalar.references.length === 1 &&
    !scalar.references[0]!.excludeFromSearch
  ) {
    items.push({
      id: SCALAR_BASE_PATH,
      label: "API Reference",
      icon: getIcon("api_explorer"),
      to: SCALAR_BASE_PATH
    });
  }

  if (publisher.contact) {
    items.push({
      id: publisher.contact,
      label: "Get in touch",
      icon: getIcon("mail"),
      to: publisher.contact
    });
  }
  return items;
});

const scalarLinkGroups = computed<CommandPaletteGroup[]>(() => {
  if (!scalar.enabled || scalar.references.length < 2) {
    return [];
  }

  const items = scalar.references
    .filter((reference) => !reference.excludeFromSearch)
    .map((reference) => ({
      id: reference.path,
      label: reference.label,
      icon: getIcon("api_explorer"),
      to: reference.path
    }));

  return items.length
    ? [{ id: "api-references", label: "API references", items, ignoreFilter: true }]
    : [];
});

const themeItems = computed<GlobalSearchItem[]>(() => {
  if (forcedColorMode) {
    return [];
  }

  return [
    {
      id: "theme-system",
      label: "System theme",
      active: colorMode.preference === "system",
      icon: colorMode.preference === "system" ? "lucide:monitor" : undefined,
      to: "#",
      onSelect: (event) => {
        event.preventDefault();
        colorMode.preference = "system";
      }
    },
    {
      id: "theme-light",
      label: "Light theme",
      active: colorMode.preference === "light",
      icon: "lucide:sun",
      to: "#",
      onSelect: (event) => {
        event.preventDefault();
        colorMode.preference = "light";
      }
    },
    {
      id: "theme-dark",
      label: "Dark theme",
      active: colorMode.preference === "dark",
      icon: "lucide:moon",
      to: "#",
      onSelect: (event) => {
        event.preventDefault();
        colorMode.preference = "dark";
      }
    }
  ];
});

const { groups, initialize, isSearching, searchTerm } = useGlobalContentSearch({
  collection: collectionName,
  navigation: computed(() => props.navigation),
  links,
  themeItems,
  linkGroups: scalarLinkGroups
});

watch(open, (isOpen) => {
  if (isOpen) {
    void initialize();
  }
});

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      open.value = !open.value;
    }
  }
});

/**
 * Badge colors for different api operations. These matches the color types used
 * by Scalar
 * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
 */
function getMethodBadgeColor(
  method?: string
): "success" | "info" | "warning" | "error" | "neutral" {
  switch (method) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "PUT":
    case "PATCH":
      return "warning";
    case "DELETE":
      return "error";
    default:
      return "neutral";
  }
}

function closeSearch(reset?: boolean) {
  open.value = false;
  if (reset) {
    setTimeout(() => {
      searchTerm.value = "";
    }, 200);
  }
}

const input = ref("");
</script>

<template>
  <UModal
    v-model:open="open"
    title="Search documentation"
    description="Search guides, API operations, models and metadata."
    class="sm:max-w-3xl h-full sm:h-[65vh]"
  >
    <template #content>
      <UCommandPalette
        v-model="input"
        v-model:search-term="searchTerm"
        :groups="groups"
        :loading="isSearching"
        :input="{ fixed: true }"
        close
        @update:open="
          (isOpen) => {
            if (!isOpen) closeSearch(true);
          }
        "
        @update:model-value="closeSearch(true)"
      >
        <template #api-operation="{ item }">
          <div class="flex min-w-0 items-center gap-2">
            <UBadge :color="getMethodBadgeColor(item.method)" size="xs" variant="subtle">
              {{ item.method }}
            </UBadge>
            <span class="truncate font-mono text-sm">{{ item.path }}</span>
          </div>
          <span v-if="item.description" class="line-clamp-1 text-sm text-dimmed">
            {{ item.description }}
          </span>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>
