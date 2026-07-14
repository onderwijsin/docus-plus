import { z } from "zod";

const baseSubscriber = {
  email: z.email({ error: "Invalid email address" }),
  name: z.string().min(1, { error: "Please enter your name" })
};

export const baseSubscriberSchema = z.object(baseSubscriber);

export const mailchimpSubscriberSchema = z.object({
  ...baseSubscriber,
  lastName: z.string().optional(),
  organisation: z.string().optional()
});

export type MailchimpBaseSubscriberSchema = z.infer<typeof baseSubscriberSchema>;
export type MailchimpSubscriberSchema = z.infer<typeof mailchimpSubscriberSchema>;
