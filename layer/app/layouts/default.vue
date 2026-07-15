<template>
  <div>
    <PatternBackground
      class="fixed! z-0 h-screen w-screen"
      animate
      direction="bottom"
      variant="dot"
      mask="ellipse-top"
      size="md"
      :speed="25000"
    />
    <UMain class="relative">
      <slot />
    </UMain>
  </div>
</template>
