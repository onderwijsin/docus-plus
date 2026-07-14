import { defineNuxtPlugin } from "#app/nuxt";
import { computed, useColorMode, useHead, watch } from "#imports";
import { SCALAR_BASE_PATH } from "#layers/docus-plus/config/constants";

const NUXT_COLOR_MODE_STORAGE_KEY = "nuxt-color-mode";
const SCALAR_COLOR_MODE_STORAGE_KEY = "colorMode";

const scalarColorModeBridge = {
  id: "scalar-color-mode-bridge",
  tagPosition: "head" as const,
  innerHTML: `(() => {
    if (window.location.pathname !== ${JSON.stringify(SCALAR_BASE_PATH)} && !window.location.pathname.startsWith(${JSON.stringify(`${SCALAR_BASE_PATH}/`)})) return;
    try {
      const preference = window.__NUXT_COLOR_MODE__?.preference ?? window.localStorage.getItem(${JSON.stringify(NUXT_COLOR_MODE_STORAGE_KEY)}) ?? "system";
      const mode = window.__NUXT_COLOR_MODE__?.value ?? (preference === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : preference);
      if (mode === "dark" || mode === "light") window.localStorage.setItem(${JSON.stringify(SCALAR_COLOR_MODE_STORAGE_KEY)}, mode);
    } catch {}
  })();`
    .replace(/[\n\r]/g, "")
    .replace(/ +/g, " "),
};

/**
 * Synchronizes the active color mode with the body class.
 *
 * @returns Nothing.
 */
export default defineNuxtPlugin((nuxtApp): void => {
  useHead({ script: [scalarColorModeBridge] });

  const colorMode = useColorMode();

  // Nuxt OG Image renders pages in an isolated SSR context, where the Color
  // Mode plugin does not provide its state.
  if (!colorMode) {
    return;
  }

  const bodyClass = computed<string>(() => `${colorMode.value}-mode`);

  /**
   * Mirrors the resolved parent color mode into Scalar's storage key.
   *
   * Scalar's Nuxt integration reads this key before hydration, while Nuxt
   * Color Mode stores the user's preference under a different key.
   *
   * @returns Nothing.
   */
  const syncScalarColorMode = (): void => {
    if (!import.meta.client) {
      return;
    }

    try {
      window.localStorage.setItem(
        SCALAR_COLOR_MODE_STORAGE_KEY,
        colorMode.value,
      );
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  };

  /**
   * Removes stale mode classes and applies the current color mode.
   *
   * @returns Nothing.
   */
  const syncBodyClass = (): void => {
    if (!import.meta.client) {
      return;
    }

    const modeClasses = [...document.body.classList].filter((className) =>
      className.endsWith("-mode"),
    );

    document.body.classList.remove(...modeClasses);
    document.body.classList.add(bodyClass.value);
  };

  useHead({ bodyAttrs: { class: bodyClass } });

  /**
   * Applies the parent color mode to Scalar and its document body.
   *
   * @returns Nothing.
   */
  const syncColorMode = (): void => {
    syncScalarColorMode();
    syncBodyClass();
  };

  watch(() => colorMode.value, syncColorMode, { immediate: true });

  nuxtApp.hook("app:mounted", () => {
    syncColorMode();
  });

  nuxtApp.hook("page:finish", () => {
    syncColorMode();
  });
});
