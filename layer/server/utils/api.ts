import type { InternalApiResponse } from "../types/api";

/**
 * Generic JSON API wrapper used by local server handlers and module runtime routes.
 */
/**
 * A utility function to wrap API responses in a consistent structure.
 * @param data - The data to be included in the API response.
 * @returns An object conforming to the InternalApiResponse interface.
 */
export function useApiResponse<T>(data: T): InternalApiResponse<T> {
  return { data };
}

export type { InternalApiResponse } from "../types/api";
