import type { HealthCheckThreshold } from "./health";

export interface HealthCheckComponentOptions {
  threshold?: HealthCheckThreshold;
}

export interface ModuleOptions {
  /**
   * Whether the module is enabled.
   * @default true
   */
  enabled?: boolean;
  cache?: HealthCheckComponentOptions;
  directus?: HealthCheckComponentOptions | false;
}
