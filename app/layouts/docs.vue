<script setup lang="ts">
const { public: publicConfig } = useRuntimeConfig();
const mailchimp = publicConfig.mailchimp;
</script>

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
      <InlineNewsletterSignup v-if="mailchimp.enabled" class="mt-12 mb-6" />
    </UContainer>
  </UMain>
</template>
