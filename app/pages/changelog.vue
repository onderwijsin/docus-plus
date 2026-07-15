<script lang="ts" setup>
import type { OgImageComponents } from "#og-image/components";

const { data } = await useAsyncData("changelogs", () =>
  queryCollection("changelogs").order("publishedAt", "DESC").all()
);
if (!data.value?.length) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true
  });
}

const title = "Releases";
const description = "Stay up to date with the newest features, enhancements, and fixes.";

useSeo({
  title: title,
  description: description,
  type: "website",
  modifiedAt: data.value[0]?.publishedAt,
  publishedAt: useRuntimeConfig().public.publishedDate
});

defineOgImage("Docs" as keyof OgImageComponents, {
  headline: "Changelog",
  title: title,
  description: description
});
</script>

<template>
  <div>
    <UPageHero
      :title="title"
      :description="description"
      class="md:border-b border-default"
      :ui="{ container: 'relative py-10 sm:py-16 lg:py-24' }"
    >
      <template #top>
        <div
          class="absolute z-[-1] rounded-full bg-primary blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-1/2 -translate-y-80"
        />
      </template>

      <div
        aria-hidden="true"
        class="hidden md:block absolute z-[-1] border-x border-default inset-0 mx-4 sm:mx-6 lg:mx-8"
      />
    </UPageHero>

    <UPageSection :ui="{ container: '!py-0' }">
      <div class="py-4 md:py-8 lg:py-16 md:border-x border-default">
        <UContainer class="max-w-5xl">
          <UChangelogVersions>
            <UChangelogVersion
              v-for="(version, index) in data"
              :key="version.tag"
              v-bind="version"
              :title="version.name"
              :badge="
                index === 0
                  ? {
                      size: 'sm',
                      label: 'Latest',
                      icon: getIcon('sparkles'),
                      variant: 'subtle',
                      color: 'success',
                      ui: { leadingIcon: 'size-3!' }
                    }
                  : undefined
              "
              :date="version.publishedAt"
              :ui="{
                root: 'flex items-start',
                container: 'max-w-xl',
                header: 'border-b border-default pb-4',
                title: 'text-3xl',
                date: 'text-xs/9 text-highlighted font-mono',

                indicator: 'sticky top-0 pt-16 -mt-16 sm:pt-24 sm:-mt-24 lg:pt-32 lg:-mt-32'
              }"
            >
              <template #body>
                <ContentRenderer v-if="version.meta.body" :value="version.meta.body" />
              </template>
            </UChangelogVersion>
          </UChangelogVersions>
        </UContainer>
      </div>
    </UPageSection>
  </div>
</template>
