import { z } from "zod";

export const turnstileErrorCodeSchema = z.enum([
  "TURNSTILE_TOKEN_MISSING",
  "TURNSTILE_VALIDATION_FAILED",
  "TURNSTILE_ACTION_MISMATCH",
  "TURNSTILE_VALIDATION_UNAVAILABLE",
  "TURNSTILE_SERVER_MISCONFIGURED"
]);

export const turnstileErrorDataSchema = z.object({
  code: turnstileErrorCodeSchema,
  expectedAction: z.string().optional()
});

export type TurnstileErrorCode = z.infer<typeof turnstileErrorCodeSchema>;
export type TurnstileErrorData = z.infer<typeof turnstileErrorDataSchema>;
