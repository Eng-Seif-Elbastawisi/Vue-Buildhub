<script setup lang="ts">
  withDefaults(
    defineProps<{
      size?: number;
    }>(),
    {
      size: 250,
    },
  );
</script>

<template>
  <svg
    class="invoice-hero-illustration"
    :width="size"
    viewBox="0 0 360 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="invoiceHeroPlatform"
        x1="80"
        y1="170"
        x2="290"
        y2="250"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-primary)" />
        <stop offset="1" stop-color="var(--palette-secondary)" />
      </linearGradient>

      <linearGradient
        id="invoiceHeroPaper"
        x1="105"
        y1="45"
        x2="245"
        y2="215"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--white)" />
        <stop offset="1" stop-color="var(--palette-accent)" stop-opacity="0.24" />
      </linearGradient>

      <linearGradient
        id="invoiceHeroBadge"
        x1="205"
        y1="145"
        x2="280"
        y2="220"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-accent)" />
        <stop offset="1" stop-color="var(--palette-primary)" />
      </linearGradient>

      <filter
        id="invoiceHeroShadow"
        x="30"
        y="0"
        width="310"
        height="280"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow
          dx="0"
          dy="14"
          stdDeviation="14"
          flood-color="var(--palette-primary)"
          flood-opacity="0.25"
        />
      </filter>
    </defs>

    <ellipse cx="180" cy="155" rx="135" ry="110" fill="var(--palette-primary)" opacity="0.08" />
    <ellipse cx="180" cy="230" rx="112" ry="32" fill="var(--palette-secondary)" opacity="0.38" />
    <path
      d="M68 211C68 194 118 181 180 181C242 181 292 194 292 211V230C292 248 242 262 180 262C118 262 68 248 68 230V211Z"
      fill="url(#invoiceHeroPlatform)"
      filter="url(#invoiceHeroShadow)"
    />
    <ellipse cx="180" cy="210" rx="112" ry="31" fill="var(--palette-accent)" opacity="0.35" />
    <path
      d="M111 38H218L258 78V190C258 207 244 221 227 221H111C94 221 80 207 80 190V69C80 52 94 38 111 38Z"
      fill="url(#invoiceHeroPaper)"
      filter="url(#invoiceHeroShadow)"
    />
    <path
      d="M218 38V68C218 74 223 79 229 79H258"
      stroke="var(--palette-secondary)"
      stroke-width="9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M128 88C128 79 137 73 149 73C161 73 170 79 170 88C170 105 126 96 126 115C126 125 136 132 150 132C163 132 173 125 173 115"
      stroke="var(--palette-primary)"
      stroke-width="9"
      stroke-linecap="round"
    />
    <path d="M150 64V141" stroke="var(--palette-primary)" stroke-width="7" stroke-linecap="round" />
    <path
      d="M190 96H225"
      stroke="var(--palette-secondary)"
      stroke-width="9"
      stroke-linecap="round"
    />
    <path
      d="M190 124H225"
      stroke="var(--palette-secondary)"
      stroke-width="9"
      stroke-linecap="round"
    />
    <path
      d="M116 157H220"
      stroke="var(--palette-primary)"
      stroke-opacity="0.55"
      stroke-width="9"
      stroke-linecap="round"
    />
    <path
      d="M116 183H194"
      stroke="var(--palette-primary)"
      stroke-opacity="0.35"
      stroke-width="9"
      stroke-linecap="round"
    />
    <circle
      cx="246"
      cy="183"
      r="48"
      fill="url(#invoiceHeroBadge)"
      stroke="var(--white)"
      stroke-width="8"
      filter="url(#invoiceHeroShadow)"
    />
    <path
      d="M222 183L239 200L270 165"
      stroke="var(--white)"
      stroke-width="11"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
  .invoice-hero-illustration {
    display: block;
    max-width: 100%;
    height: auto;
    flex-shrink: 0;
    user-select: none;
    pointer-events: none;
  }
</style>
