import type {
  MailchimpSubscribeErrorCode,
  MailchimpSubscribeErrorData,
} from "#layers/docus-plus/schema/mailchimp/errors";
import type { MailchimpSubscriberSchema } from "#layers/docus-plus/schema/mailchimp/subscribe";
import type {
  MailchimpErrorPayload,
  MailchimpMergeFields,
  MailchimpRuntimeConfig,
} from "../../types/mailchimp";

/**
 * Subscribes a validated payload to the configured Mailchimp list.
 *
 * @param input - Already validated subscription payload.
 * @param config - Runtime mailchimp credentials and server.
 * @returns Mailchimp response payload.
 */
export async function subscribeToMailchimp(
  input: MailchimpSubscriberSchema,
  config: MailchimpRuntimeConfig,
): Promise<unknown> {
  const apiKey = config.apiKey;
  const listId = config.listId;
  const server = config.server;

  if (!apiKey || !listId || !server) {
    throw createError({
      statusCode: 500,
      statusMessage: "Mailchimp runtime configuration is incomplete",
      data: {
        code: "MAILCHIMP_CONFIGURATION_ERROR",
        httpStatusCode: 500,
      } satisfies MailchimpSubscribeErrorData,
    });
  }

  const mergeFields: MailchimpMergeFields = {
    FNAME: input.name,
  };

  if (input.lastName) {
    mergeFields.LNAME = input.lastName;
  }

  if (input.organisation) {
    mergeFields.ORG = input.organisation;
  }

  const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;

  try {
    return await $fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        email_address: input.email,
        merge_fields: mergeFields,
        status: "subscribed",
        tags: ["signup_via_site"],
      },
    });
  } catch (error: unknown) {
    const normalized = normalizeMailchimpError(error);

    throw createError({
      statusCode: normalized.httpStatusCode,
      statusMessage:
        normalized.title ?? normalized.detail ?? "Mailchimp subscribe failed",
      data: normalized,
    });
  }
}

function normalizeMailchimpError(error: unknown): MailchimpSubscribeErrorData {
  const payload = parseMailchimpPayload(error);
  let httpStatusCode = getHttpStatusCode(error, payload?.status);
  if (httpStatusCode === 500 && payload?.title === "Member Exists") {
    httpStatusCode = 400;
  }
  const code = getMailchimpErrorCode(payload, httpStatusCode);

  return {
    code,
    httpStatusCode,
    title: payload?.title,
    detail: payload?.detail,
  };
}

function parseMailchimpPayload(
  error: unknown,
): MailchimpErrorPayload | undefined {
  const rawData =
    error && typeof error === "object" && "data" in error
      ? (error as { data?: unknown }).data
      : undefined;

  if (!rawData) {
    return undefined;
  }

  if (typeof rawData === "string") {
    try {
      const parsed = JSON.parse(rawData) as MailchimpErrorPayload;
      return typeof parsed === "object" && parsed !== null ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  if (typeof rawData === "object") {
    return rawData as MailchimpErrorPayload;
  }

  return undefined;
}

function getHttpStatusCode(error: unknown, payloadStatus?: number): number {
  const statusFromError =
    error && typeof error === "object" && "statusCode" in error
      ? (error as { statusCode?: unknown }).statusCode
      : undefined;

  if (typeof statusFromError === "number") {
    return statusFromError;
  }

  if (typeof payloadStatus === "number") {
    return payloadStatus;
  }

  return 500;
}

function getMailchimpErrorCode(
  payload: MailchimpErrorPayload | undefined,
  statusCode: number,
): MailchimpSubscribeErrorCode {
  if (payload?.title === "Member Exists") {
    return "MAILCHIMP_MEMBER_EXISTS";
  }

  if (statusCode !== 400) {
    return "MAILCHIMP_UPSTREAM_ERROR";
  }

  return "MAILCHIMP_BAD_REQUEST";
}
