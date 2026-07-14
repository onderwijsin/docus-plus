import { TURNSTILE_ACTIONS } from "#layers/docus-plus/config/constants";
import { mailchimpSubscriberSchema } from "#layers/docus-plus/schema/mailchimp/subscribe";
import { assertTurnstileToken } from "#layers/docus-plus/modules/turnstile/runtime/server/utils/turnstile";
import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { subscribeToMailchimp } from "#layers/docus-plus/server/utils/mailchimp/subscribe";
import { z } from "zod";

const mailchimpConfig = z.object({
  apiKey: z.string(),
  listId: z.string(),
  server: z.string(),
});

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const { success, error } = mailchimpConfig.safeParse(config.mailchimp);
  if (!success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Mailchimp API key not configured",
      data: z.treeifyError(error),
    });
  }

  await assertTurnstileToken(event, TURNSTILE_ACTIONS.mailchimp);

  const body = await readBody(event);
  const parsed = mailchimpSubscriberSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid data",
      data: z.treeifyError(parsed.error),
    });
  }

  const response = await subscribeToMailchimp(
    parsed.data,
    useRuntimeConfig(event).mailchimp,
  );

  return useApiResponse({
    message: response,
  });
});
