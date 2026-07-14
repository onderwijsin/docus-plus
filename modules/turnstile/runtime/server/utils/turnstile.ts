import type { H3Event } from "h3";
import type {
  TurnstileErrorCode,
  TurnstileErrorData,
} from "../../types/errors";

import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";

import { SECURITY_HEADERS } from "#layers/docus-plus/config/constants";

/**
 * Validates the Turnstile token sent with a protected request.
 *
 * In local/test environments, validation is bypassed when no secret key is
 * configured to keep developer workflows frictionless.
 *
 * @param event - H3 event.
 * @param expectedAction - Logical action name expected for this route.
 * @returns Nothing when token is valid.
 */
export async function assertTurnstileToken(
  event: H3Event,
  expectedAction: string,
): Promise<void> {
  if (isAdmin(event)) {
    return;
  }

  const config = useRuntimeConfig(event);
  const secretKey = config.turnstile?.secretKey?.trim();
  const isProd = Boolean(config.public?.mode?.isProd);

  if (!secretKey) {
    if (isProd) {
      throw createTurnstileError(
        500,
        "TURNSTILE_SECRET_KEY is missing in runtimeConfig",
        "TURNSTILE_SERVER_MISCONFIGURED",
        expectedAction,
      );
    }

    return;
  }

  const token = getRequestHeader(
    event,
    SECURITY_HEADERS.turnstileToken,
  )?.trim();
  if (!token) {
    throw createTurnstileError(
      400,
      "Turnstile token is missing",
      "TURNSTILE_TOKEN_MISSING",
    );
  }

  let verification: { success: boolean; action?: string };
  try {
    verification = await verifyTurnstileToken(token, event);
  } catch (error: unknown) {
    if (isErrorWithStatusCode(error)) {
      throw error;
    }

    throw createError({
      statusCode: 502,
      statusMessage: "Turnstile validation could not be performed",
      data: createTurnstileErrorData(
        "TURNSTILE_VALIDATION_UNAVAILABLE",
        expectedAction,
      ),
    });
  }

  if (!verification.success) {
    throw createTurnstileError(
      403,
      "Turnstile validation failed",
      "TURNSTILE_VALIDATION_FAILED",
      expectedAction,
    );
  }

  if (verification.action && verification.action !== expectedAction) {
    throw createTurnstileError(
      403,
      "Turnstile action does not match",
      "TURNSTILE_ACTION_MISMATCH",
      expectedAction,
    );
  }
}

/**
 * Creates a consistent H3 error object for Turnstile failures.
 *
 * @param statusCode - HTTP status code to expose to the client.
 * @param statusMessage - Human-readable error message.
 * @param code - Stable Turnstile error code.
 * @param expectedAction - Optional Turnstile action tied to the request.
 * @returns H3 error carrying the normalized Turnstile payload.
 */
export function createTurnstileError(
  statusCode: number,
  statusMessage: string,
  code: TurnstileErrorCode,
  expectedAction?: string,
): Error {
  return createError({
    statusCode,
    statusMessage,
    data: createTurnstileErrorData(code, expectedAction),
  });
}

/**
 * Creates the stable `data` payload used for Turnstile validation errors.
 *
 * @param code - Stable Turnstile error code.
 * @param expectedAction - Optional action expected for the request.
 * @returns Serializable error payload.
 */
export function createTurnstileErrorData(
  code: TurnstileErrorCode,
  expectedAction?: string,
): TurnstileErrorData {
  if (expectedAction) {
    return {
      code,
      expectedAction,
    };
  }

  return { code };
}

/**
 * Narrows unknown exceptions to H3-like errors that already expose an HTTP status code.
 *
 * @param error - Unknown exception value.
 * @returns Whether the value is a status-code carrying error.
 */
export function isErrorWithStatusCode(
  error: unknown,
): error is { statusCode: number } {
  return Boolean(
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number",
  );
}
