export const supportedRuntimePresets = ['node-server', 'cloudflare_module'] as const

export type SupportedRuntimePreset = (typeof supportedRuntimePresets)[number]

export interface ResolvedRuntime {
	preset: SupportedRuntimePreset
}

export interface ResolveRuntimeRuntimeConfigShape {
	resolveRuntime: ResolvedRuntime
}
