<script lang="ts" setup>
const { title, description, headline } = defineProps<{
  title?: string;
  description?: string;
  headline?: string;
}>();

const appConfig = useAppConfig();
const { name: siteName } = useSiteConfig();
const primaryColor = appConfig.ui?.colors?.primary ?? "emerald";
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-neutral-950 px-[80px] py-[60px]">
    <!-- Radial glow top-right: wide soft layer -->
    <div
      class="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.01)_40%,transparent_50%)]"
    />
    <!-- Radial glow top-right: tight bright core -->
    <div
      class="absolute top-0 right-0 w-[350px] h-[350px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_25%,transparent_45%)]"
    />

    <div class="flex-1 flex flex-col justify-center items-start">
      <span
        v-if="headline"
        :class="`uppercase text-[16px] m-0 mb-8 tracking-[0.05em] text-${primaryColor}-500 rounded-md px-3 py-1.5 border-1 border-${primaryColor}-500/50 bg-${primaryColor}-500/10 inline-block`"
        style="
          font-family:
            JetBrains Mono,
            ui-monospace,
            monospace;
        "
      >
        {{ headline }}
      </span>
      <h1
        v-if="title"
        class="m-0 mb-6 text-[50px] font-bold text-white leading-[1.1] w-full max-w-[900px] wrap-break-word"
        style="font-family: Figtree, sans-serif"
      >
        {{ title?.slice(0, 60) }}
      </h1>
      <p
        v-if="description"
        class="m-0 text-[28px] text-neutral-400 leading-[1.4] w-full max-w-[900px] wrap-break-word"
        style="font-family: Figtree, sans-serif"
      >
        {{ description?.slice(0, 200) }}
      </p>
    </div>

    <div class="flex">
      <div
        :class="`text-[18px] font-normal rounded-lg pr-5 py-2 text-${primaryColor}-500`"
        style="font-family: Figtree, sans-serif"
      >
        {{ siteName }}
      </div>
    </div>
  </div>
</template>
