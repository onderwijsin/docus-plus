import { ofetch } from 'ofetch'

interface CloudflareBulkDeleteResponse {
	errors?: Array<{
		code?: number
		message?: string
	}>
	success: boolean
}

/**
 * Bulk deletes cache keys from the configured Cloudflare KV namespace.
 *
 * Cloudflare accepts up to 10,000 keys per request, so keys are chunked accordingly.
 *
 * @param keys - Fully qualified KV keys to delete.
 * @returns Promise that resolves once every chunk has been deleted.
 */
export async function bulkDeleteCloudflareCacheKeys(keys: string[]): Promise<void> {
	if (!keys.length) {
		return
	}

	const runtimeConfig = useRuntimeConfig()
	const { accountId, cacheNamespaceId, kvApiToken } = runtimeConfig.cache.cloudflare!
	const client = ofetch.create({
		baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}`,
		headers: {
			Authorization: `Bearer ${kvApiToken}`
		}
	})

	for (let index = 0; index < keys.length; index += 10000) {
		const chunk = keys.slice(index, index + 10000)
		const response = await client<CloudflareBulkDeleteResponse>(
			`/storage/kv/namespaces/${cacheNamespaceId}/bulk/delete`,
			{
				method: 'POST',
				body: chunk
			}
		)

		if (!response.success) {
			throw createError({
				statusCode: 502,
				statusMessage: 'Cloudflare KV bulk delete failed',
				data: response.errors
			})
		}
	}
}
