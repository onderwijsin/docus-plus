<script lang="ts" setup>
import { TURNSTILE_ACTIONS } from "#layers/docus-plus/config/constants";
import { useMailchimpSignup } from "../composables/mailchimp-signup";
import { baseSubscriberSchema, type MailchimpBaseSubscriberSchema } from "../schema/subscribe";
import type { FormSubmitEvent } from "@nuxt/ui";

const turnstileRef = useTemplateRef("turnstile");
const form = useTemplateRef("form");
const input = useTemplateRef("input");

const { turnstileToken, isSubmitting, isDone, submitMailchimpSignup } = useMailchimpSignup();
const hasErrors = computed(() => !!form.value?.errors.length);

type RichSchema = Record<
  keyof MailchimpBaseSubscriberSchema,
  { label: string; placeholder: string; fieldType: string }
>;

const richSchema: RichSchema = {
  email: { label: "Email", placeholder: "Your email", fieldType: "email" },
  name: { label: "Naam", placeholder: "Your name", fieldType: "text" }
};

const state = reactive<MailchimpBaseSubscriberSchema>({
  email: "",
  name: ""
});

const currentFieldTarget = ref<keyof MailchimpBaseSubscriberSchema>("email");
const buttonAction = computed<"set-next" | "submit">(() => {
  return currentFieldTarget.value === "name" ? "submit" : "set-next";
});

const activeModel = computed({
  get: () => state[currentFieldTarget.value],
  set: (value: string) => {
    state[currentFieldTarget.value] = value;
  }
});

/**
 * Sets the next input target (if any keys are left)
 */
async function setNext() {
  // Make sure to validate the current target first. If any errors, the UI will show hint
  await form.value?.validate({ name: currentFieldTarget.value });
  if (hasErrors.value) return;
  const keys = Object.keys(state) as (keyof MailchimpBaseSubscriberSchema)[];
  const currentIndex = keys.indexOf(currentFieldTarget.value);
  if (currentIndex < keys.length - 1) {
    currentFieldTarget.value = keys[currentIndex + 1] as keyof MailchimpBaseSubscriberSchema;
    // Make sure the input field is focussed again
    input.value?.inputRef?.focus();
  }
}

async function onSubmit(event: FormSubmitEvent<MailchimpBaseSubscriberSchema>) {
  await submitMailchimpSignup(event.data, {
    turnstileInstance: turnstileRef.value as { reset: () => void }
  });
}
</script>

<template>
  <UForm
    ref="form"
    :state="state"
    :schema="baseSubscriberSchema"
    class="floating-error-message relative flex sm:-mr-1"
    @submit="onSubmit"
  >
    <NuxtTurnstile
      ref="turnstile"
      v-model="turnstileToken"
      :options="{
        action: TURNSTILE_ACTIONS.mailchimp,
        appearance: 'interaction-only'
      }"
      class="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
    />

    <UFormField
      :name="currentFieldTarget"
      :label="richSchema[currentFieldTarget].label"
      size="xl"
      :ui="{ label: 'hidden', container: 'mt-0 sm:py-1.25' }"
      class="grow form-field"
    >
      <UInput
        ref="input"
        v-model.trim="activeModel"
        :name="currentFieldTarget"
        :type="richSchema[currentFieldTarget].fieldType"
        :placeholder="richSchema[currentFieldTarget].placeholder"
        :disabled="isDone"
        :required="true"
        variant="outline"
        color="neutral"
        class="w-full"
        @keydown.enter.prevent="buttonAction === 'set-next' ? setNext() : form?.submit()"
      />
    </UFormField>
    <div
      class="absolute top-1/2 right-2 aspect-square size-8 -translate-y-1/2 rounded-md bg-white sm:relative sm:-left-1 sm:aspect-auto sm:size-auto sm:min-w-[120px]"
    >
      <UButton
        size="lg"
        :loading="isSubmitting"
        :disabled="isDone"
        class="h-full px-1.5 sm:px-4"
        block
        trailing
        :ui="{
          base: 'py-2 px-1.5 sm:px-4',
          label: 'hidden sm:inline',
          trailingIcon: 'ms-0 sm:ms-auto'
        }"
        :trailing-icon="getIcon(buttonAction === 'set-next' ? 'right' : 'mail')"
        :label="buttonAction === 'set-next' ? 'Next' : 'Sign up'"
        @click="buttonAction === 'set-next' ? setNext() : form?.submit()"
      />
    </div>
  </UForm>
</template>

<style lang="postcss">
.floating-error-message .form-field [data-slot="error"] {
  position: absolute;
}
</style>
