<script setup lang="ts">
  withDefaults(
    defineProps<{
      size?: number;
    }>(),
    {
      size: 150,
    },
  );
</script>

<template>
  <svg
    class="notes-pencil-illustration"
    :width="size"
    viewBox="0 0 190 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="notesPaperGradient"
        x1="35"
        y1="20"
        x2="140"
        y2="140"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--white)" />
        <stop offset="1" stop-color="var(--palette-accent)" stop-opacity="0.25" />
      </linearGradient>

      <linearGradient
        id="notesPencilGradient"
        x1="100"
        y1="45"
        x2="160"
        y2="125"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-primary)" />
        <stop offset="1" stop-color="var(--palette-secondary)" />
      </linearGradient>

      <filter
        id="notesIllustrationShadow"
        x="0"
        y="0"
        width="190"
        height="160"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow
          dx="0"
          dy="9"
          stdDeviation="9"
          flood-color="var(--palette-primary)"
          flood-opacity="0.2"
        />
      </filter>
    </defs>

    <ellipse cx="96" cy="140" rx="73" ry="14" fill="var(--palette-primary)" opacity="0.1" />
    <path
      d="M43 19H121C132 19 141 28 141 39V122C141 133 132 142 121 142H43C32 142 23 133 23 122V39C23 28 32 19 43 19Z"
      fill="url(#notesPaperGradient)"
      stroke="var(--palette-primary)"
      stroke-opacity="0.25"
      stroke-width="3"
      filter="url(#notesIllustrationShadow)"
    />
    <rect x="46" y="11" width="14" height="25" rx="7" fill="var(--palette-primary)" />
    <rect x="102" y="11" width="14" height="25" rx="7" fill="var(--palette-secondary)" />
    <path d="M47 58H112" stroke="var(--palette-primary)" stroke-width="7" stroke-linecap="round" />
    <path
      d="M47 80H103"
      stroke="var(--palette-primary)"
      stroke-opacity="0.6"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path
      d="M47 102H91"
      stroke="var(--palette-primary)"
      stroke-opacity="0.35"
      stroke-width="7"
      stroke-linecap="round"
    />
    <g transform="translate(128 48) rotate(38)" filter="url(#notesIllustrationShadow)">
      <rect x="0" y="0" width="20" height="74" rx="9" fill="url(#notesPencilGradient)" />
      <rect x="0" y="0" width="20" height="17" rx="7" fill="var(--palette-accent)" />
      <path
        d="M0 70H20L10 91L0 70Z"
        fill="var(--white)"
        stroke="var(--palette-secondary)"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path d="M7 84L10 91L13 84" fill="var(--palette-primary)" />
      <path
        d="M5 23V62"
        stroke="var(--white)"
        stroke-opacity="0.55"
        stroke-width="3"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
  .notes-pencil-illustration {
    display: block;
    max-width: 100%;
    height: auto;
    flex-shrink: 0;
    user-select: none;
    pointer-events: none;
  }
</style>
