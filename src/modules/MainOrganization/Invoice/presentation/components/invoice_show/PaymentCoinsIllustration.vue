<script setup lang="ts">
  withDefaults(
    defineProps<{
      size?: number;
    }>(),
    {
      size: 110,
    },
  );
</script>

<template>
  <svg
    class="payment-coins-illustration"
    :width="size"
    viewBox="0 0 180 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="paymentCoinGradient"
        x1="30"
        y1="30"
        x2="150"
        y2="130"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-primary)" />
        <stop offset="1" stop-color="var(--palette-secondary)" />
      </linearGradient>

      <linearGradient
        id="paymentCoinTop"
        x1="30"
        y1="30"
        x2="150"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="var(--palette-accent)" />
        <stop offset="1" stop-color="var(--palette-primary)" />
      </linearGradient>

      <filter
        id="paymentCoinsShadow"
        x="0"
        y="0"
        width="180"
        height="150"
        filterUnits="userSpaceOnUse"
      >
        <feDropShadow
          dx="0"
          dy="9"
          stdDeviation="8"
          flood-color="var(--palette-primary)"
          flood-opacity="0.24"
        />
      </filter>
    </defs>

    <ellipse cx="90" cy="123" rx="72" ry="18" fill="var(--palette-primary)" opacity="0.12" />
    <g filter="url(#paymentCoinsShadow)">
      <path
        d="M19 91V106C19 118 40 128 66 128C92 128 113 118 113 106V91"
        fill="url(#paymentCoinGradient)"
      />
      <ellipse cx="66" cy="91" rx="47" ry="18" fill="url(#paymentCoinTop)" />
      <ellipse cx="66" cy="91" rx="33" ry="11" fill="var(--white)" fill-opacity="0.34" />
    </g>
    <g filter="url(#paymentCoinsShadow)">
      <path
        d="M43 65V82C43 94 64 104 90 104C116 104 137 94 137 82V65"
        fill="url(#paymentCoinGradient)"
      />
      <ellipse cx="90" cy="65" rx="47" ry="18" fill="url(#paymentCoinTop)" />
      <ellipse cx="90" cy="65" rx="31" ry="10" fill="var(--white)" fill-opacity="0.38" />
    </g>
    <g filter="url(#paymentCoinsShadow)">
      <path
        d="M72 34V51C72 63 92 73 117 73C142 73 162 63 162 51V34"
        fill="url(#paymentCoinGradient)"
      />
      <ellipse cx="117" cy="34" rx="45" ry="18" fill="url(#paymentCoinTop)" />
      <ellipse cx="117" cy="34" rx="28" ry="10" fill="var(--white)" fill-opacity="0.42" />
    </g>
    <path
      d="M31 99V108"
      stroke="var(--white)"
      stroke-opacity="0.65"
      stroke-width="4"
      stroke-linecap="round"
    />
    <path
      d="M55 73V82"
      stroke="var(--white)"
      stroke-opacity="0.65"
      stroke-width="4"
      stroke-linecap="round"
    />
    <path
      d="M84 42V51"
      stroke="var(--white)"
      stroke-opacity="0.65"
      stroke-width="4"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
  .payment-coins-illustration {
    display: block;
    max-width: 100%;
    height: auto;
    flex-shrink: 0;
    user-select: none;
    pointer-events: none;
  }
</style>
