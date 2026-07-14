<script lang="ts" setup>
const { data } = await useAsyncData("index", () =>
  queryCollection("landing").first(),
);
if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

const page = data.value!;

useSeo({
  title: page.seo?.title,
  description: page.seo?.description,
  ogImage: page.seo?.ogImage,
});
</script>

<template>
  <div>
    <UPageHero :links="page.hero.links">
      <template #top>
        <GradientGlow class="top-1/2 -translate-y-1/2 w-full h-2/3" />
      </template>
      <template #title>
        <span v-if="page.hero.title_as_html" v-html="page.hero.title"></span>
        <span v-else>{{ page.hero.title }}</span>
      </template>
      <template #description>
        {{ page.hero.description }}
      </template>
    </UPageHero>

    <UPageSection
      id="features"
      :ui="{
        root: 'scroll-mt-(--ui-header-height)',
        container: 'max-w-5xl',
        headline:
          'font-mono font-medium text-xs text-primary uppercase tracking-[0.12em] text-center',
        title: 'max-w-lg mx-auto',
        description: 'max-w-3xl mx-auto text-dimmed',
      }"
    >
      <template v-if="page.features.headline" #headline>
        {{ page.features.headline }}
      </template>

      <template #title>
        {{ page.features.title }}
      </template>

      <template #description>
        {{ page.features.description }}
      </template>

      <div class="rounded-2xl border border-default bg-default overflow-hidden">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px">
          <UPageCard
            v-for="(feature, index) in page.features.items"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
            class="rounded-none duration-300"
            :ui="{
              leading:
                'mb-5 flex size-9 justify-center rounded-lg bg-primary/10',
              title: 'text-sm tracking-tight',
              description:
                'text-sm leading-relaxed sm:line-clamp-2 lg:line-clamp-3 text-dimmed',
            }"
          />
        </div>
      </div>
    </UPageSection>
    <UPageCTA
      variant="naked"
      :ui="{
        root: 'relative pb-24 sm:pb-32',
        container: 'max-w-3xl text-center',
        title: 'lg:text-5xl tracking-tighter whitespace-pre-line',
        description: 'mx-auto max-w-3xl leading-relaxed text-dimmed',
      }"
    >
      <template #top>
        <GradientGlow
          class="top-1/2 -translate-y-1/2 w-full h-1/2 opacity-80"
        />
      </template>

      <template #title>
        {{ page.cta.title }}
      </template>

      <template #description>
        {{ page.cta.description }}
      </template>

      <template #links>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton
            v-for="link in page.cta.links"
            :key="link.label"
            v-bind="link"
            size="xl"
          />
        </div>
      </template>
    </UPageCTA>
  </div>
</template>
