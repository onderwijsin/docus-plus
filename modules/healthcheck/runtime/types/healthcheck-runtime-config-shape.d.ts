import type { HealthCheckComponentOptions } from "./options";

export interface HealthcheckRuntimeConfigShape {
  healthcheck: {
    cache?: HealthCheckComponentOptions;
    directus?: HealthCheckComponentOptions | false;
  };
}
