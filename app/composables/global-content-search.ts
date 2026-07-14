import { computed, shallowRef, watch, type MaybeRefOrGetter, toValue } from "vue";

import type { ContentNavigationItem, PageCollections } from "@nuxt/content";

import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";
import {
  API_SEARCH_FTS_WEIGHTS,
  CONTENT_SEARCH_RESULT_LIMITS
} from "#layers/docus-plus/config/constants";

type ContentSearchResult = {
  id: string;
  title: string;
  titles: string[];
  content: string;
  level: number;
  rank: number;
  snippets?: {
    title?: string;
    content?: string;
  };
};

type ApiContentRecord = {
  path: string;
  title: string;
  description: string;
  kind: "info" | "tag" | "operation" | "schema";
  scalarTarget: string;
  method?: string;
  operationId?: string;
};

// API records share one FTS5 index. Fetching more than the visible group caps
// prevents strongly-ranked schemas from hiding matching route operations.
const API_SEARCH_CANDIDATE_LIMIT = 50;

/** Normalize text using the same word boundaries that the FTS title index uses. */
function toSearchWords(value: string): string[] {
  return (
    value
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

/**
 * Score a complete prefix match in one user-facing field.
 *
 * A non-zero result means every query word is represented by a word in the
 * field. Exact names score above longer names with the same prefix.
 */
function getTextMatchScore(value: string, terms: string[]): number {
  const words = toSearchWords(value);
  if (!words.length || !terms.every((term) => words.some((word) => word.startsWith(term)))) {
    return 0;
  }

  const exactTerms = terms.filter((term) => words.includes(term)).length;
  const exactName = words.length === terms.length;
  const exactPhrase = words.join(" ").includes(terms.join(" "));

  return exactTerms * 100 + (exactName ? 50 : 0) + (exactPhrase ? 20 : 0);
}

/**
 * Keep user-facing fields ahead of generated OpenAPI metadata.
 *
 * FTS5 retrieves metadata matches; this score gives title matches first,
 * description matches second, and retains FTS5's rank as the tie-breaker.
 */
function getApiResultScore(record: ApiContentRecord, terms: string[]): number {
  const titleScore = getTextMatchScore(record.title, terms);
  if (titleScore) {
    return 2_000_000 + titleScore;
  }

  const descriptionScore = getTextMatchScore(record.description, terms);
  return descriptionScore ? 1_000_000 + descriptionScore : 0;
}

export interface GlobalSearchItem extends CommandPaletteItem {
  id?: string;
  method?: string;
  path?: string;
}

/**
 * Run documentation and generated API searches through separate FTS5 indexes.
 *
 * Keeping indexes separate lets documentation retain a fixed visual and result
 * precedence while API results expose the metadata needed by the command palette.
 */
export function useGlobalContentSearch({
  collection,
  navigation,
  links,
  themeItems
}: {
  collection: MaybeRefOrGetter<keyof PageCollections>;
  navigation: MaybeRefOrGetter<ContentNavigationItem[] | undefined>;
  links: MaybeRefOrGetter<GlobalSearchItem[]>;
  themeItems: MaybeRefOrGetter<GlobalSearchItem[]>;
}) {
  const searchTerm = shallowRef("");
  const documents = useSearchCollection(collection, {
    immediate: false,
    ignoredTags: ["style"]
  });
  const api = useSearchCollection("api", {
    immediate: false,
    ignoredTags: ["style"]
  });
  const { mapSearchResults } = useContentSearch();
  const documentResults = shallowRef<ContentSearchResult[]>([]);
  const apiResults = shallowRef<ContentSearchResult[]>([]);
  const apiRecords = shallowRef(new Map<string, ApiContentRecord>());
  const isMetadataReady = shallowRef(false);
  const isSearching = computed(
    () => documents.status.value === "loading" || api.status.value === "loading"
  );
  let requestId = 0;
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  async function loadApiRecords() {
    if (isMetadataReady.value) {
      return;
    }

    const records = await queryCollection("api")
      .select("path", "title", "description", "kind", "scalarTarget", "method", "operationId")
      .all();
    apiRecords.value = new Map(
      records.flatMap((record) =>
        typeof record.path === "string" ? [[record.path, record as ApiContentRecord] as const] : []
      )
    );
    isMetadataReady.value = true;
  }

  async function initialize() {
    await Promise.all([documents.init(), api.init(), loadApiRecords()]);
  }

  async function runSearch(term: string) {
    const currentRequest = ++requestId;
    const query = term.trim();
    if (!query) {
      documentResults.value = [];
      apiResults.value = [];
      return;
    }

    const [docs, apiSearch] = await Promise.all([
      documents.search(query, {
        limit: CONTENT_SEARCH_RESULT_LIMITS.documentation,
        snippet: { columns: ["title", "content"], around: 20 }
      }),
      api.search(query, {
        limit: API_SEARCH_CANDIDATE_LIMIT,
        weights: API_SEARCH_FTS_WEIGHTS,
        snippet: { columns: ["title", "content"], around: 20 }
      })
    ]);

    if (currentRequest !== requestId) {
      return;
    }

    documentResults.value = docs as ContentSearchResult[];
    apiResults.value = apiSearch as ContentSearchResult[];
  }

  watch(searchTerm, (term) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      void runSearch(term);
    }, 100);
  });

  const groups = computed<CommandPaletteGroup[]>(() => {
    const result: CommandPaletteGroup[] = [];
    const term = searchTerm.value.trim();

    if (!term) {
      const linkItems = toValue(links);
      if (linkItems.length) {
        result.push({
          id: "links",
          label: "Links",
          items: linkItems,
          ignoreFilter: true
        });
      }
      const theme = toValue(themeItems);
      if (theme.length) {
        result.push({
          id: "theme",
          label: "Theme",
          items: theme,
          ignoreFilter: true
        });
      }
      return result;
    }

    const documentItems = mapSearchResults(documentResults.value, toValue(navigation)).flatMap(
      (item) =>
        typeof item.to === "string" && item.label
          ? [
              {
                id: item.to,
                label: item.label,
                description: item.description,
                prefix: item.prefix,
                suffix: item.suffix,
                icon: item.icon,
                to: item.to
              }
            ]
          : []
    );
    if (documentItems.length) {
      result.push({
        id: "documentation",
        label: "Documentation",
        items: documentItems,
        ignoreFilter: true
      });
    }

    const apiCandidates = new Map(apiResults.value.map((item) => [item.id, item]));
    const terms = toSearchWords(term);
    for (const [id, record] of apiRecords.value) {
      if (getApiResultScore(record, terms) > 0 && !apiCandidates.has(id)) {
        apiCandidates.set(id, {
          id,
          title: record.title,
          titles: [],
          content: record.description,
          level: 1,
          rank: 0
        });
      }
    }

    const rankedApiResults = [...apiCandidates.values()].sort((left, right) => {
      const leftRecord = apiRecords.value.get(left.id);
      const rightRecord = apiRecords.value.get(right.id);
      const leftScore = leftRecord ? getApiResultScore(leftRecord, terms) : 0;
      const rightScore = rightRecord ? getApiResultScore(rightRecord, terms) : 0;

      return rightScore - leftScore || left.rank - right.rank;
    });

    const operationItems: GlobalSearchItem[] = [];
    const metadataItems: GlobalSearchItem[] = [];
    for (const resultItem of rankedApiResults) {
      const record = apiRecords.value.get(resultItem.id);
      if (!record) {
        continue;
      }

      const item: GlobalSearchItem = {
        id: resultItem.id,
        label: record.kind === "operation" ? (record.path ?? record.title) : record.title,
        description: record.description || resultItem.content,
        icon:
          record.kind === "schema"
            ? getIcon("braces")
            : record.kind === "tag"
              ? getIcon("tag")
              : getIcon("api_explorer"),
        method: record.method,
        path: record.kind === "operation" ? record.path : undefined,
        slot: record.kind === "operation" ? "api-operation" : undefined,
        to: record.scalarTarget
      };

      if (record.kind === "operation") {
        if (operationItems.length < CONTENT_SEARCH_RESULT_LIMITS.operations) {
          operationItems.push(item);
        }
      } else {
        if (metadataItems.length < CONTENT_SEARCH_RESULT_LIMITS.metadata) {
          metadataItems.push(item);
        }
      }
    }

    if (operationItems.length) {
      result.push({
        id: "api-operations",
        label: "API operations",
        items: operationItems,
        ignoreFilter: true
      });
    }
    if (metadataItems.length) {
      result.push({
        id: "api-metadata",
        label: "API models & metadata",
        items: metadataItems,
        ignoreFilter: true
      });
    }

    const theme = toValue(themeItems);
    if (theme.length) {
      result.push({
        id: "theme",
        label: "Theme",
        items: theme,
        ignoreFilter: true
      });
    }

    return result;
  });

  return {
    groups,
    initialize,
    isSearching,
    searchTerm
  };
}
