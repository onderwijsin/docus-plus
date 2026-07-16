<script lang="ts" setup>
const { newsletter } = useAppConfig();
const props = defineProps<{
  title?: string;
}>();
</script>

<template>
  <UPageCard
    variant="subtle"
    class="@container text-center relative space-y-2 p-4 py-6 sm:p-6 md:p-8"
  >
    <h3 class="text-xl font-bold @xl:text-2xl">
      <slot name="title" />
      <span v-if="!$slots.title">{{ props.title ?? newsletter.title }}</span>
    </h3>
    <p class="text-md text-muted mb-6 @xl:text-lg">
      <slot name="description" />
      <span v-if="!$slots.description">{{ newsletter.description }}</span>
    </p>
    <div class="grid w-full max-w-lg mx-auto">
      <MailchimpSignup />
    </div>
  </UPageCard>
</template>
