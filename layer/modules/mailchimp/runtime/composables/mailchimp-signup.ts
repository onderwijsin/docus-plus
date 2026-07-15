import type { MailchimpSubscriberSchema } from "../schema/subscribe";
import type { SubmitMailchimpSignupOptions } from "../types/mailchimp";

import { SECURITY_HEADERS } from "#layers/docus-plus/config/constants";
import { mailchimpSubscribeErrorDataSchema } from "../schema/errors";
import { getIcon } from "#layers/docus-plus/shared/utils/icons";

/**
 * Orchestrates newsletter signup submission against `/api/mailchimp`.
 *
 * Responsibilities:
 * - reads and retries Turnstile token retrieval
 * - performs submit call with security header
 * - maps typed API failures to user-facing Dutch toasts
 * - tracks submit lifecycle (`isSubmitting`, `isDone`)
 *
 * @returns Reactive signup state and submit handler.
 */
export function useMailchimpSignup() {
  const {
    token: turnstileToken,
    isEnabled: isTurnstileEnabled,
    getTokenWithRetry,
    isReady,
    reset: resetTurnstile,
    showPendingHint,
    showMissingTokenErrorHint,
    captureTurnstileError
  } = useTurnstile();

  const toast = useToast();

  const isSubmitting = ref(false);
  const isDone = ref(false);

  /**
   * Submits the validated newsletter form payload and handles known API failures.
   *
   * @param formData - Validated form payload from the signup form.
   * @param options - Optional submission context, like Turnstile widget instance for reset.
   */
  async function submitMailchimpSignup(
    formData: MailchimpSubscriberSchema,
    options?: SubmitMailchimpSignupOptions
  ): Promise<void> {
    isSubmitting.value = true;

    try {
      if (!isReady()) {
        showPendingHint();
      }

      const token = await getTokenWithRetry();
      if (isTurnstileEnabled.value && !token) {
        showMissingTokenErrorHint();
        return;
      }

      await $fetch("/api/mailchimp", {
        method: "POST",
        body: formData,
        headers: token
          ? {
              [SECURITY_HEADERS.turnstileToken]: token
            }
          : undefined
      });

      toast.add({
        title: "You're in!",
        description: "Thanks for signing up! You'll receive updates from us soon.",
        color: "success",
        icon: getIcon("success")
      });

      isDone.value = true;
    } catch (error) {
      if (captureTurnstileError(error)) {
        return;
      }

      const mailchimpError = parseMailchimpSubscribeError(error);
      const isMemberExistsError = mailchimpError?.code === "MAILCHIMP_MEMBER_EXISTS";

      if (!isMemberExistsError) {
        console.error("Error submitting form:", error);
      }

      if (showMailchimpErrorToast(error, toast)) {
        return;
      }

      toast.add({
        title: "Something went wrong",
        description: "We couldn't sign you up. Please try again later.",
        color: "error",
        icon: getIcon("warn")
      });
    } finally {
      isSubmitting.value = false;
      resetTurnstile(options?.turnstileInstance);
    }
  }

  return {
    turnstileToken,
    isSubmitting,
    isDone,
    submitMailchimpSignup
  };
}

/**
 * Parses and maps known Mailchimp API failures to user-facing toasts.
 *
 * @param error - Raw thrown value from `$fetch`.
 * @param toast - Nuxt UI toast service.
 * @param getIcon - Icon resolver used by the project icon system.
 * @returns `true` when a toast was shown for a recognized Mailchimp error.
 */
function showMailchimpErrorToast(error: unknown, toast: ReturnType<typeof useToast>): boolean {
  const mailchimpError = parseMailchimpSubscribeError(error);
  if (!mailchimpError) {
    return false;
  }

  if (mailchimpError.code === "MAILCHIMP_MEMBER_EXISTS") {
    toast.add({
      title: "You're already subscribed",
      description: "This email address is already in our newsletter.",
      color: "warning",
      icon: getIcon("warn")
    });
    return true;
  }

  if (mailchimpError.httpStatusCode === 400) {
    toast.add({
      title: "Sign up failed",
      description: mailchimpError.detail ?? "Check your details and try again.",
      color: "warning",
      icon: getIcon("warn")
    });
    return true;
  }

  toast.add({
    title: "Something went wrong",
    description: "Please try again later.",
    color: "error",
    icon: getIcon("error")
  });
  return true;
}

/**
 * Tries to parse a thrown API error into the typed mailchimp subscribe error contract.
 *
 * @param error - Raw thrown value from `$fetch`.
 * @returns Parsed typed error payload when available, otherwise `null`.
 */
function parseMailchimpSubscribeError(error: unknown) {
  const errorData = extractErrorData(error);
  const parsed = mailchimpSubscribeErrorDataSchema.safeParse(errorData);
  return parsed.success ? parsed.data : null;
}

/**
 * Extracts the normalized API error payload from Nuxt/H3 fetch error shapes.
 *
 * @param error - Raw thrown value from `$fetch`.
 * @returns Nested `data` payload when present.
 */
function extractErrorData(error: unknown): unknown {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return undefined;
  }

  const directData = (error as { data?: unknown }).data;
  if (!directData || typeof directData !== "object") {
    return directData;
  }

  if ("data" in directData) {
    return (directData as { data?: unknown }).data;
  }

  return directData;
}
