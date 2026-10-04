<script setup lang="ts">
  withDefaults(
    defineProps<{
      variant?:
        | '500'
        | '404'
        | 'loading'
        | 'delete-loading'
        | 'delete-success'
        | 'delete-error'
        | 'section'
        | 'empty'
        | 'toast-error'
        | 'toast-success';
    }>(),
    { variant: 'empty' },
  );
</script>

<template>
  <svg
    class="construction-scene"
    :class="`construction-scene--${variant}`"
    viewBox="0 0 320 210"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse cx="161" cy="191" rx="134" ry="9" fill="currentColor" class="scene-shadow" />

    <g v-if="variant === 'loading' || variant === 'delete-loading'" class="scene-crane">
      <path
        d="M73 176V43h13v133M61 43h36M79 43 226 25l6 12L85 55M79 43 49 72h-8l32-36"
        stroke="currentColor"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <path
        d="m83 54 20-14m-3 12 22-15m-2 12 22-15m-2 12 22-15m-2 12 22-15m-2 12 22-15"
        stroke="currentColor"
        stroke-width="2"
      />
      <path d="M221 36v61" stroke="currentColor" stroke-width="2" class="scene-cable" />
      <g class="scene-load">
        <path d="m214 96 7 11 7-11" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        <path d="m221 107-27 25m27-25 27 25" stroke="currentColor" stroke-width="2" />
        <path d="m184 132 37-10 38 10v30l-38 12-37-12z" class="scene-block" />
        <path d="m184 132 37 12 38-12m-38 12v30" class="scene-seam" />
      </g>
      <path d="M46 178h70" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
    </g>

    <g v-else-if="variant === 'toast-error' || variant === 'toast-success'">
      <path
        d="m56 148 38-10 39 10v28l-39 11-38-11zM112 139l32-9 34 9v26l-34 10-32-10zM161 151l34-9 34 9v25l-34 10-34-10z"
        class="scene-block"
      />
      <path
        d="m56 148 38 12 39-12m-39 12v27m18-48 32 10 34-10m-34 10v26m17-24 34 11 34-11m-34 11v24"
        class="scene-seam"
      />
      <circle
        cx="235"
        cy="101"
        r="25"
        :class="variant === 'toast-error' ? 'scene-warning' : 'scene-success'"
      />
      <path
        v-if="variant === 'toast-error'"
        d="M235 88v17m0 8v1"
        stroke="var(--bg-card)"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        v-else
        d="m222 101 9 9 17-19"
        stroke="var(--bg-card)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <g v-else class="scene-building">
      <path d="M74 179V72l80-22 83 22v107" class="scene-structure" />
      <path
        d="m74 72 80 22 83-22M154 94v85M74 112l80 21 83-21M74 148l80 18 83-18"
        class="scene-seam"
      />
      <path
        d="M95 89v22m34-13v21m47-21v21m37-30v22M95 126v20m34-13v19m47-19v19m37-26v20"
        class="scene-window"
      />
      <path d="M60 180h190" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
      <g v-if="variant === '500' || variant === '404'" class="scene-top-block">
        <path d="m154 51 39-11 43 12v23l-43 12-39-12z" class="scene-block" />
        <path d="m154 51 39 12 43-11m-43 11v24" class="scene-seam" />
      </g>
      <g v-if="variant === 'delete-error' || variant === 'delete-success'" class="scene-stuck-block">
        <path d="m154 133 43-11 40 10v30l-40 12-43-10z" class="scene-block" />
        <path d="m154 133 43 11 40-12m-40 12v30" class="scene-seam" />
        <path v-if="variant === 'delete-error'" d="M245 108v21m-11-9 11 9 10-9" class="scene-pull" />
      </g>
      <g v-if="variant === 'delete-success'" class="scene-check">
        <circle cx="251" cy="62" r="26" class="scene-success" />
        <path
          d="m238 62 9 9 18-20"
          stroke="var(--bg-card)"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <g v-if="variant === 'delete-error'" class="scene-warning-mark">
        <circle cx="260" cy="64" r="25" class="scene-warning" />
        <path
          d="M260 51v17m0 8v1"
          stroke="var(--bg-card)"
          stroke-width="5"
          stroke-linecap="round"
        />
      </g>
      <path
        v-if="variant === 'section' || variant === 'empty' || variant === '404'"
        d="M258 91v64m-17-48h34m-34 15h34m-34 15h34"
        class="scene-blueprint"
      />
      <path
        v-if="variant === '500'"
        d="M247 167c10-11 17-9 25 0m-213 0c8-10 16-9 25 0"
        class="scene-dust"
      />
    </g>
  </svg>
</template>

<style scoped lang="scss">
  .construction-scene {
    display: block;
    width: 100%;
    max-width: 320px;
    height: auto;
    margin-inline: auto;
    overflow: visible;
    color: var(--quote-copper, var(--PrimaryColor));
  }

  .scene-shadow {
    opacity: 0.09;
  }

  .scene-structure {
    fill: color-mix(in sRGB, var(--bg-card) 72%, var(--quote-copper, var(--PrimaryColor)));
    stroke: currentColor;
    stroke-width: 3;
    stroke-linejoin: round;
  }

  .scene-block {
    fill: color-mix(in sRGB, var(--bg-card) 56%, var(--quote-copper, var(--PrimaryColor)));
    stroke: currentColor;
    stroke-width: 3;
    stroke-linejoin: round;
  }

  .scene-seam,
  .scene-window {
    stroke: color-mix(in sRGB, currentColor 72%, var(--gray-700));
    stroke-width: 2;
  }

  .scene-window {
    stroke-width: 7;
  }

  .scene-blueprint {
    stroke: currentColor;
    stroke-width: 2;
    stroke-dasharray: 4 5;
    opacity: 0.48;
  }

  .scene-pull {
    stroke: var(--danger);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .scene-dust {
    stroke: var(--gray-400);
    stroke-width: 5;
    stroke-linecap: round;
    opacity: 0;
    animation: scene-dust 700ms 520ms ease-out both;
  }

  .scene-warning {
    fill: var(--danger);
  }

  .scene-success {
    fill: var(--success);
  }

  .scene-check,
  .scene-warning-mark {
    transform-origin: center;
    animation: scene-reveal 300ms 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .construction-scene--500 .scene-building {
    transform-origin: center bottom;
    animation: scene-visible 180ms ease-out both, scene-shake 480ms 150ms ease-in-out both;
  }

  .construction-scene--500 .scene-top-block {
    animation: scene-fall 650ms 410ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
  }

  .construction-scene--404 .scene-top-block {
    animation: scene-missing 650ms 250ms ease-out both;
  }

  .construction-scene--delete-error .scene-stuck-block {
    animation: scene-stuck 610ms 140ms ease-in-out both;
  }

  .construction-scene--delete-success .scene-stuck-block {
    animation: scene-remove 550ms 120ms ease-out both;
  }

  .construction-scene--section,
  .construction-scene--empty {
    animation: scene-entrance 360ms ease-out both;
  }

  .construction-scene--toast-error,
  .construction-scene--toast-success {
    animation: scene-reveal 260ms ease-out both;
  }

  .construction-scene--loading .scene-load,
  .construction-scene--delete-loading .scene-load {
    animation: scene-lift 1800ms ease-in-out infinite;
  }

  @keyframes scene-shake {
    0%,
    100% {
      transform: none;
    }

    25% {
      transform: translateX(2px) rotate(0.8deg);
    }

    50% {
      transform: translateX(-3px) rotate(-0.8deg);
    }

    75% {
      transform: translateX(1px);
    }
  }

  @keyframes scene-visible {
    from { opacity: 0.55; }
    to { opacity: 1; }
  }

  @keyframes scene-fall {
    to {
      transform: translate(25px, 50px) rotate(15deg);
      opacity: 0.55;
    }
  }

  @keyframes scene-missing {
    to {
      transform: translate(22px, 27px) rotate(8deg);
      opacity: 0.5;
    }
  }

  @keyframes scene-remove {
    to {
      transform: translate(34px, 15px);
      opacity: 0;
    }
  }

  @keyframes scene-stuck {
    0%,
    100% {
      transform: none;
    }

    34% {
      transform: translate(8px, -4px);
    }

    52% {
      transform: translate(5px, -3px) rotate(1deg);
    }

    66% {
      transform: translate(8px, -4px) rotate(-1deg);
    }
  }

  @keyframes scene-lift {
    0%,
    100% {
      transform: translateY(2px);
    }

    50% {
      transform: translateY(-9px);
    }
  }

  @keyframes scene-reveal {
    from {
      opacity: 0;
      transform: scale(0.87);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes scene-entrance {
    from {
      opacity: 0.5;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes scene-dust {
    30% {
      opacity: 0.4;
    }

    100% {
      opacity: 0;
      transform: translateY(-8px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .construction-scene
      :is(
        .scene-building,
        .scene-top-block,
        .scene-stuck-block,
        .scene-load,
        .scene-check,
        .scene-warning-mark,
        .scene-dust
      ),
    .construction-scene {
      animation: none;
    }

    .construction-scene--500 .scene-top-block {
      transform: translate(25px, 50px) rotate(15deg);
    }

    .construction-scene--404 .scene-top-block {
      transform: translate(22px, 27px) rotate(8deg);
      opacity: 0.5;
    }

    .construction-scene--delete-success .scene-stuck-block {
      opacity: 0;
    }

    .construction-scene .scene-check,
    .construction-scene .scene-warning-mark {
      opacity: 1;
    }
  }
</style>
