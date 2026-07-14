export interface ModuleOptions {
	/**
	 * Whether the module is enabled.
	 */
	enabled?: boolean
}

export type ResolvedModuleOptions = Required<Pick<ModuleOptions, 'enabled'>> & ModuleOptions
