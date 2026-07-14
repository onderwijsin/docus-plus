import type { JSONObject } from "@ai-sdk/provider";

export interface AssistantAiConfig {
  /** Model identifier passed to the configured provider. */
  model: string;
  /** Replaces the generated documentation assistant prompt when provided. */
  systemPrompt?: string;
  /** Reasoning effort requested from the model. */
  reasoning: "low" | "medium" | "high" | "none" | "provider-default";
  /** Maximum number of output tokens per model step. */
  maxOutputTokens: number;
  /** Number of times a failed model request may be retried. */
  maxRetries: number;
  /** Maximum number of model and tool-calling steps. */
  maxSteps: number;
  /** Sampling temperature; avoid combining this with topP unless intentional. */
  temperature?: number;
  /** Nucleus sampling threshold. */
  topP?: number;
  /** Number of highest-probability tokens considered at each step. */
  topK?: number;
  /** Penalty for introducing tokens already present in the response. */
  presencePenalty?: number;
  /** Penalty for repeatedly using tokens already present in the response. */
  frequencyPenalty?: number;
  /** Sequences that stop generation when produced. */
  stopSequences?: string[];
  /** Optional deterministic seed, when supported by the provider. */
  seed?: number;
  /** Request timeout in milliseconds or per-operation timeout settings. */
  timeout?: number | { totalMs?: number; stepMs?: number; chunkMs?: number; toolMs?: number };
  /** Additional HTTP headers sent to the model provider. */
  headers?: Record<string, string>;
  /** Provider-specific options, such as Gateway caching settings. */
  providerOptions: Record<string, JSONObject>;
  /** Controls whether the model may call tools automatically, never, or mandatorily. */
  toolChoice?: "auto" | "none" | "required";
  /** Restricts the configured tool set to these tool names. */
  activeTools?: string[];
  /** Preferred order for sending tools to the provider. */
  toolOrder?: string[];
  /** Controls which request data and raw provider chunks are retained. */
  include?: {
    /** Retain the generated request body in step results. */
    requestBody?: boolean;
    /** Retain converted request messages in step results. */
    requestMessages?: boolean;
    /** Include unprocessed provider chunks in the stream. */
    rawChunks?: boolean;
  };
  /** Enables word- or line-buffered smoothing for streamed output. */
  smoothStream: boolean;
  /** Delay between smoothed stream chunks; null disables the delay. */
  smoothStreamDelayInMs: number | null;
  /** Chunking strategy used by the smoothing transform. */
  smoothStreamChunking: "word" | "line";
  /** Send model reasoning parts to the assistant UI. */
  sendReasoning: boolean;
  /** Send source parts to the assistant UI. */
  sendSources: boolean;
  /** Send the UI message start event. */
  sendStart: boolean;
  /** Send the UI message finish event. */
  sendFinish: boolean;
}

declare module "nuxt/schema" {
  interface NuxtConfig {
    ai?: Partial<AssistantAiConfig>;
  }
}
