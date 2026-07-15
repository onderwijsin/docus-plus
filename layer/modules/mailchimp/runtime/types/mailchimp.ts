export interface TurnstileResetInstance {
  reset: () => void;
}

export interface MailchimpRuntimeConfig {
  apiKey?: string;
  listId?: string;
  server?: string;
}

export interface MailchimpMergeFields {
  FNAME: string;
  LNAME?: string;
  ORG?: string;
}

export interface MailchimpErrorPayload {
  title?: string;
  detail?: string;
  status?: number;
}

export interface SubmitMailchimpSignupOptions {
  turnstileInstance?: TurnstileResetInstance;
}
