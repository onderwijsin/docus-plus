import { defineDriver } from 'unstorage'
import redisDriver from 'unstorage/drivers/redis'

import { createCacheDriverWithMeta } from './utils.mjs'

/**
 * Redis-backed cache driver with sidecar metadata support.
 */
export default defineDriver((driverOptions) =>
	createCacheDriverWithMeta({
		name: 'redis-cache-with-meta',
		driver: redisDriver(driverOptions)
	})
)
