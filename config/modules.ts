import type { Nuxt } from "@nuxt/schema";
import type { ConsolaInstance } from "consola";
import type { DeepPartial } from "./types/utils";

import { defu } from "defu";

/**
 * Helper to check if we are in a prepare environment in
 * the CI/CD pipeline.
 *
 * This is particularly useful for modules that need to
 * perform - or not perform - certain actions during the prepare phase.
 *
 * For example, during the prepare phase, usually not all environment
 * variables are available, so modules that depend on them should skip
 * their setup to avoid errors.
 *
 * @param nuxt - Optional Nuxt instance.
 * @returns An object with a boolean `usePrepareMode` indicating if we are in prepare mode.
 */
export const usePrepareMode = (
  nuxt?: Nuxt
): {
  isPrepareMode: boolean;
} => {
  const isPrepareMode = !!nuxt?.options._prepare;

  return {
    isPrepareMode
  };
};

/**
 * Utility function to handle common module setup tasks.
 * @param MODULE_NAME - The name of the module.
 * @param MODULE_KEY - The configuration key for the module in nuxt.config.
 * @param userOptions - The module options as provided by user, including an optional `enabled` flag.
 * @param DEFAULTS - The default options for the module.
 * @param log - Logger instance scoped to the module.
 * @returns An object with helper methods for module setup.
 */
export const moduleSetup = <T extends object>(
  MODULE_NAME: string,
  MODULE_KEY: string, // For future use
  userOptions: DeepPartial<T>,
  DEFAULTS: DeepPartial<T>,
  log: ConsolaInstance
) => {
  /**
   * Merges user options with default options.
   * For some reason, defaults are not properly applied, so we do it again here.
   * @returns The merged options.
   */
  const options = defu(userOptions, DEFAULTS) as T;

  /**
   * Logs the start of the module setup process.
   */
  const start = () => {
    log.start(`Loading module ${MODULE_NAME}`);
  };

  /**
   * Logs the successful completion of the module setup process.
   */
  const end = () => {
    log.success(`Module ${MODULE_NAME} Loaded`);
  };

  /**
   * Checks if the module is enabled and logs accordingly.
   * @returns boolean indicating if the module is enabled.
   */
  const isEnabled = (): boolean => {
    if ("enabled" in options && options.enabled === false) {
      log.info(`Module ${MODULE_NAME} is disabled. Skipping setup...`);
      return false;
    }
    return true;
  };

  /**
   * Gets a nested value from an object using dot notation
   * @param obj - The object to get the value from
   * @param path - The dot-notation path (e.g., 'rest.directusBaseUrl')
   * @returns The value at the path or undefined
   */
  const getNestedValue = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce((current, key) => {
      if (current && typeof current === "object" && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  };

  /**
   * Checks if a given configuration option is set and return a boolean indicating the result.
   * Logs warnings if the option is missing or invalid.
   * @param opt - Object containing the option key to check and flags for requirement and exit behavior.
   * @returns boolean indicating if the option is set and valid.
   */
  const checkOption = (opt: {
    /** Option key to check against */
    key: string;
    /** Optional message to log if the option is missing or invalid */
    message?: string;
    /** Whether the option is required for the module setup to proceed */
    required?: boolean;
    /**
     * Whether to exit the entire application setup if the option is missing.
     * Will only take effect if `required` is true.
     */
    exitOnMissing?: boolean;
  }) => {
    const { key: optionKey, required = false, exitOnMissing = false } = opt;

    const value = getNestedValue(options, optionKey);

    if (value) return true;

    if (!required) {
      log.warn(
        `Missing optional configuration: ${String(optionKey)}. Please set ${MODULE_KEY}.${String(optionKey)} in your nuxt.config file.`
      );
      if (opt.message) log.warn(opt.message);
      return false;
    }

    log.error(
      `Missing required configuration: ${String(optionKey)}. Please set ${MODULE_KEY}.${String(optionKey)} in your nuxt.config file.`
    );
    if (opt.message) log.error(opt.message);

    if (exitOnMissing) {
      log.error(
        `Cannot proceed with application setup due to missing configuration in ${MODULE_NAME}. Exiting setup.`
      );
      process.exit(1);
    }

    log.warn(`Skipping module ${MODULE_NAME} setup.`);

    return false;
  };

  /**
   * Checks if the API token is set in options, runtime config,
   * or environment variables and returns it if found.
   * Logs errors and warnings if the token is missing.
   * @param opt - Object containing flags for requirement and exit behavior.
   * @param runtimeConfig - The runtime configuration object (provide nuxt.options.runtimeConfig)
   * @returns The API token string if found, otherwise false.
   */
  const checkAndGetApiToken = (
    opt: {
      required?: boolean;
      exitOnMissing?: boolean;
    },
    runtimeConfig: { apiToken?: string }
  ): string | false => {
    const { required = false, exitOnMissing = false } = opt;

    const value =
      (options as { apiToken?: string }).apiToken ??
      runtimeConfig.apiToken ??
      process.env.API_TOKEN;

    if (value) return value;

    log.error(
      "API Token is not defined. This token is required to secure your Nuxt Server routes."
    );
    log.error(
      `Please set ${MODULE_KEY}.apiToken in your nuxt.config file, runtimeConfig.apiToken or set API_TOKEN env variable.`
    );

    if (exitOnMissing) {
      log.error(
        `Cannot proceed with application setup due to missing API token in ${MODULE_NAME}. Exiting setup.`
      );
      process.exit(1);
    }

    if (required) {
      log.warn(`Skipping module ${MODULE_NAME} setup`);
    }
    return false;
  };

  return {
    start,
    end,
    isEnabled,
    options,
    checkOption,
    checkAndGetApiToken
  };
};
