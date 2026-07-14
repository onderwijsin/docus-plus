<script setup lang="ts">
const appConfig = useAppConfig();
const { forced: forcedColorMode } = useDocusColorMode();

interface FooterLink {
  icon: string;
  to: string;
  target: "_blank";
  "aria-label": string;
}

const links = computed<FooterLink[]>(() => {
  const socialLinks = Object.entries(appConfig.socials || {}).flatMap(
    ([key, url]) => {
      if (typeof url !== "string" || !url) {
        return [];
      }

      return [
        {
          icon: `i-simple-icons-${key}`,
          to: url,
          target: "_blank" as const,
          "aria-label": `${key} social link`,
        },
      ];
    },
  );

  const githubLink =
    appConfig.github && appConfig.github.url
      ? [
          {
            icon: getIcon("github"),
            to: appConfig.github.url,
            target: "_blank" as const,
            "aria-label": "GitHub repository",
          },
        ]
      : [];

  return [...socialLinks, ...githubLink];
});
</script>

<template>
  <div class="flex">
    <UButton
      v-if="appConfig.statusPage"
      size="sm"
      color="neutral"
      variant="ghost"
      :to="appConfig.statusPage"
      label="Status"
    />
    <UButton
      v-for="(link, index) of links"
      :key="index"
      size="sm"
      v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
    />
    <UColorModeButton v-if="!forcedColorMode" />
  </div>
</template>
