<script setup lang="ts">
  withDefaults(
    defineProps<{
      size?: number;
    }>(),
    {
      size: 64,
    },
  );
</script>

<template>
  <svg
    class="invoice-document-icon"
    :width="size"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="invoiceIconBackground"
        x1="10"
        y1="10"
        x2="110"
        y2="110"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-primary)" stop-opacity="0.18" />
        <stop offset="1" stop-color="var(--palette-accent)" stop-opacity="0.08" />
      </linearGradient>

      <linearGradient
        id="invoiceIconDocument"
        x1="34"
        y1="24"
        x2="85"
        y2="96"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-primary)" />
        <stop offset="1" stop-color="var(--palette-secondary)" />
      </linearGradient>

      <filter
        id="invoiceIconShadow"
        x="0"
        y="0"
        width="120"
        height="120"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow
          dx="0"
          dy="6"
          stdDeviation="6"
          flood-color="var(--palette-primary)"
          flood-opacity="0.2"
        />
      </filter>
    </defs>

    <rect
      x="4"
      y="4"
      width="112"
      height="112"
      rx="28"
      fill="url(#invoiceIconBackground)"
      stroke="var(--palette-primary)"
      stroke-opacity="0.25"
      stroke-width="2"
    />
    <path
      d="M37 22H69L87 40V91C87 98 81 104 74 104H37C30 104 24 98 24 91V35C24 28 30 22 37 22Z"
      fill="var(--white)"
      stroke="url(#invoiceIconDocument)"
      stroke-width="5"
      stroke-linejoin="round"
      filter="url(#invoiceIconShadow)"
    />
    <path
      d="M69 23V38C69 42 72 45 76 45H86"
      stroke="var(--palette-secondary)"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path d="M39 65H70" stroke="var(--palette-primary)" stroke-width="5" stroke-linecap="round" />
    <path
      d="M39 78H65"
      stroke="var(--palette-primary)"
      stroke-opacity="0.55"
      stroke-width="5"
      stroke-linecap="round"
    />
    <circle
      cx="79"
      cy="81"
      r="18"
      fill="var(--palette-accent)"
      stroke="var(--white)"
      stroke-width="4"
    />
    <path
      d="M70 81L76 87L88 74"
      stroke="var(--white)"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
  .invoice-document-icon {
    display: block;
    max-width: 100%;
    height: auto;
    flex-shrink: 0;
    user-select: none;
    pointer-events: none;
  }
</style>
