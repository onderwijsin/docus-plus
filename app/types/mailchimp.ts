export interface TurnstileResetInstance {
  reset: () => void;
}

export interface SubmitMailchimpSignupOptions {
  turnstileInstance?: TurnstileResetInstance;
}
