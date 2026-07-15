import { z } from "zod";

export const mailchimpSubscribeErrorCodeSchema = z.enum([
  "MAILCHIMP_MEMBER_EXISTS",
  "MAILCHIMP_BAD_REQUEST",
  "MAILCHIMP_CONFIGURATION_ERROR",
  "MAILCHIMP_UPSTREAM_ERROR"
]);

export const mailchimpSubscribeErrorDataSchema = z.object({
  code: mailchimpSubscribeErrorCodeSchema,
  httpStatusCode: z.number().int(),
  title: z.string().optional(),
  detail: z.string().optional()
});

export type MailchimpSubscribeErrorCode = z.infer<typeof mailchimpSubscribeErrorCodeSchema>;
export type MailchimpSubscribeErrorData = z.infer<typeof mailchimpSubscribeErrorDataSchema>;
