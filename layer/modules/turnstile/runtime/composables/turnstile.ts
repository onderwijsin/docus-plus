import { turnstileErrorDataSchema } from "../types/errors";

/**
 * Turnstile widget instance shape used by forms that need an imperative reset after submission.
 */
export interface TurnstileResetInstance {
  reset: () => void;
}

/**
 * Turnstile composable.
 *
 * Handles:
 * - token state
 * - enabled state
 * - safe token retrieval with lightweight retry
 * - reset lifecycle after submissions
 *
 * @returns Turnstile state and helper methods for token lifecycle handling.
 */
export function useTurnstile() {
  const runtimeConfig = useRuntimeConfig();
  const token = ref<string | undefined>(undefined);

  const toast = useToast();

  const isEnabled = computed(() => {
    return Boolean(runtimeConfig.public.turnstile?.siteKey?.trim());
  });

  function getToken(): string | undefined {
    return token.value?.trim() || undefined;
  }

  async function getTokenWithRetry(retries = 12, delayMs = 250): Promise<string | undefined> {
    if (!isEnabled.value) {
      return undefined;
    }

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const current = getToken();
      if (current) {
        return current;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }

    return undefined;
  }

  function isReady(): boolean {
    if (!isEnabled.value) {
      return true;
    }

    return Boolean(getToken());
  }

  function reset(instance?: TurnstileResetInstance): void {
    token.value = undefined;
    if (!isEnabled.value) {
      return;
    }

    instance?.reset();
  }

  function showPendingHint(): void {
    toast.add({
      title: "Hold tight…",
      description: "Performing security check",
      color: "warning"
    });
  }

  function showMissingTokenErrorHint(): void {
    toast.add({
      title: "Security check failed",
      description: "Refresh the page and try again",
      color: "error"
    });
  }

  function captureTurnstileError(error: unknown): boolean {
    const data = extractErrorData(error);
    const parsed = turnstileErrorDataSchema.safeParse(data);

    if (!parsed.success) {
      return false;
    }

    showMissingTokenErrorHint();
    return true;
  }

  return {
    token,
    isEnabled,
    getToken,
    getTokenWithRetry,
    isReady,
    reset,
    showPendingHint,
    showMissingTokenErrorHint,
    captureTurnstileError
  };
}

/**
 * Extracts the standardized error payload from layered Nuxt/H3 fetch errors.
 *
 * @param error - Unknown error value emitted by a request.
 * @returns Nested error data payload when present.
 */
function extractErrorData(error: unknown): unknown {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return undefined;
  }

  const errorData = (error as { data?: unknown }).data;
  if (!errorData || typeof errorData !== "object") {
    return errorData;
  }

  if ("data" in errorData) {
    return (errorData as { data?: unknown }).data;
  }

  return errorData;
}
