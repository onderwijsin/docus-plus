<template>
  <UMain>
    <UContainer>
      <UPage>
        <template #left>
          <UPageAside>
            <DocsAsideLeftTop />
            <DocsAsideLeftBody />
          </UPageAside>
        </template>
        <slot />
      </UPage>
      <InlineNewsletterSignup class="mt-12 mb-6" />
    </UContainer>
  </UMain>
</template>
