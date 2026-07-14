<script setup lang="ts">
/** A responsive, lazily loaded iframe for embedded documentation videos. */
defineProps<{
  /** The trusted video embed URL. */
  src: string;
  /** Accessible description of the embedded video. */
  title: string;
}>();
</script>

<template>
  <div class="embedded-video">
    <iframe
      :src
      :title
      class="embedded-video-frame"
      loading="lazy"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
        web-share;
      "
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"
    />
  </div>
</template>

<style scoped>
.embedded-video {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--ui-radius);
}

.embedded-video-frame {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
