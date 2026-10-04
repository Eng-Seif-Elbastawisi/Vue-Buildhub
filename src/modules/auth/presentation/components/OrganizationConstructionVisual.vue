<script setup lang="ts">
  const floors = [
    { top: 660, bottom: 740 },
    { top: 570, bottom: 660 },
    { top: 480, bottom: 570 },
    { top: 390, bottom: 480 },
    { top: 300, bottom: 390 },
  ];

  const windowColumns = [150, 218, 286, 354];
</script>

<template>
  <div class="organization-construction" aria-hidden="true">
    <svg
      class="organization-construction__scene"
      viewBox="0 0 720 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="organization-construction-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path d="M48 0H0V48" class="organization-construction__grid-line" />
        </pattern>
        <linearGradient id="organization-construction-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" class="organization-construction__front-light" />
          <stop offset="0.52" class="organization-construction__front-mid" />
          <stop offset="1" class="organization-construction__front-dark" />
        </linearGradient>
        <linearGradient id="organization-construction-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" class="organization-construction__side-light" />
          <stop offset="1" class="organization-construction__side-dark" />
        </linearGradient>
        <linearGradient id="organization-construction-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" class="organization-construction__glass-light" />
          <stop offset="0.55" class="organization-construction__glass-mid" />
          <stop offset="1" class="organization-construction__glass-dark" />
        </linearGradient>
        <radialGradient id="organization-construction-glow">
          <stop offset="0" class="organization-construction__glow-center" />
          <stop offset="1" class="organization-construction__glow-edge" />
        </radialGradient>
      </defs>

      <rect width="720" height="900" class="organization-construction__sky" />
      <rect
        width="720"
        height="900"
        fill="url(#organization-construction-grid)"
        class="organization-construction__grid"
      />
      <g class="organization-construction__draft">
        <path d="M32 780H632M66 740H555M110 292V758M430 292V758M515 322V748" />
        <path
          d="M110 292 430 292 515 322M110 390H430L515 420M110 480H430L515 510M110 570H430L515 600M110 660H430L515 690"
        />
        <path
          d="M110 292 195 322 515 322M110 390 195 420 515 420M110 480 195 510 515 510M110 570 195 600 515 600M110 660 195 690 515 690"
        />
        <circle cx="110" cy="292" r="4" />
        <circle cx="430" cy="292" r="4" />
        <circle cx="110" cy="740" r="4" />
        <circle cx="515" cy="740" r="4" />
      </g>

      <ellipse
        cx="318"
        cy="522"
        rx="270"
        ry="330"
        fill="url(#organization-construction-glow)"
        class="organization-construction__ambient"
      />
      <g class="organization-construction__building" transform="translate(14 64) scale(0.66 0.92)">
        <ellipse
          cx="313"
          cy="792"
          rx="255"
          ry="30"
          class="organization-construction__ground-shadow"
        />

        <g class="organization-construction__foundation">
          <path
            d="M64 740 430 740 547 772 192 772Z"
            class="organization-construction__foundation-top"
          />
          <path
            d="M64 740 192 772V799L64 765Z"
            class="organization-construction__foundation-side"
          />
          <path
            d="M192 772 547 772V796L192 799Z"
            class="organization-construction__foundation-front"
          />
          <path
            d="M64 740 430 740 547 772 192 772 64 740M192 772V799M547 772V796"
            class="organization-construction__edge"
          />
        </g>

        <g class="organization-construction__facade">
          <path d="M110 302 430 302V740H110Z" fill="url(#organization-construction-front)" />
          <path d="M430 302 515 331V740H430Z" fill="url(#organization-construction-side)" />
          <path d="M110 302 195 330H515L430 302Z" class="organization-construction__roof" />
          <path d="M120 313H420V730H120Z" class="organization-construction__front-inset" />
          <path d="M438 319 507 343V728H438Z" class="organization-construction__side-inset" />

          <g
            v-for="(floor, index) in floors"
            :key="`facade-${floor.top}`"
            class="organization-construction__facade-floor"
            :style="{ '--floor-index': index }"
          >
            <rect
              v-for="column in windowColumns"
              :key="column"
              :x="column"
              :y="floor.top + 18"
              width="48"
              height="52"
              rx="1"
              fill="url(#organization-construction-glass)"
              class="organization-construction__window"
            />
            <path
              :d="`M${windowColumns.map((column) => `${column + 24} ${floor.top + 18}v52`).join(' M')}`"
              class="organization-construction__window-mullion"
            />
            <path
              :d="`M443 ${floor.top + 22} 493 ${floor.top + 39}v43l-50-16Z`"
              class="organization-construction__side-window"
            />
            <path
              :d="`M466 ${floor.top + 30}v44`"
              class="organization-construction__window-mullion"
            />
            <path
              :d="`M119 ${floor.top + 75}H423l83 28`"
              class="organization-construction__balcony-rail"
            />
          </g>
        </g>

        <g class="organization-construction__structure">
          <path
            d="M110 740V302M430 740V302M515 740V331"
            class="organization-construction__column"
            pathLength="1"
          />
          <path
            d="M194 740V330M274 740V330M354 740V330"
            class="organization-construction__column organization-construction__column--inner"
            pathLength="1"
          />
          <g
            v-for="(floor, index) in floors"
            :key="`frame-${floor.top}`"
            class="organization-construction__floor"
            :style="{ '--floor-index': index }"
          >
            <path
              :d="`M110 ${floor.bottom}V${floor.top}M194 ${floor.bottom}V${floor.top}M274 ${floor.bottom}V${floor.top}M354 ${floor.bottom}V${floor.top}M430 ${floor.bottom}V${floor.top}M515 ${floor.bottom}V${floor.top + 30}`"
              class="organization-construction__floor-column"
              pathLength="1"
            />
            <path
              :d="`M110 ${floor.top}H430L515 ${floor.top + 30}H195Z`"
              class="organization-construction__slab"
              pathLength="1"
            />
            <path
              :d="`M110 ${floor.top}H430L515 ${floor.top + 30}`"
              class="organization-construction__floor-light"
              pathLength="1"
            />
          </g>
        </g>

        <g class="organization-construction__details">
          <path
            d="M110 302V740M430 302V740M515 331V740M110 302H430L515 331"
            class="organization-construction__detail-edge"
          />
          <path
            d="M122 313H419M122 730H419M139 294V272H430M430 272l85 29v30"
            class="organization-construction__roof-line"
          />
          <path
            d="M110 390H430l85 30M110 480H430l85 30M110 570H430l85 30M110 660H430l85 30"
            class="organization-construction__detail-slab"
          />
          <path d="M126 301V740M422 301V740" class="organization-construction__vertical-light" />
          <path d="M86 740H535M100 751H546" class="organization-construction__ground-line" />
        </g>
      </g>

      <g class="organization-construction__crane">
        <path
          d="M71 673V104H89V673M71 104 80 76 89 104M56 673H105"
          class="organization-construction__crane-main"
          pathLength="1"
        />
        <path
          d="M71 116 89 137 71 158 89 179 71 200 89 221 71 242 89 263 71 284 89 305 71 326 89 347 71 368 89 389 71 410 89 431 71 452 89 473 71 494 89 515 71 536 89 557 71 578 89 599 71 620 89 641"
          class="organization-construction__crane-truss"
          pathLength="1"
        />
        <path
          d="M26 118 80 91 575 136 575 149 80 107 26 130Z"
          class="organization-construction__crane-main"
          pathLength="1"
        />
        <path
          d="M98 109 130 124 164 114 197 130 230 120 263 136 296 126 329 142 362 132 395 148 428 138 461 154 494 144 527 160"
          class="organization-construction__crane-truss"
          pathLength="1"
        />
        <path
          d="M80 76 575 136M80 76 26 118M80 76 80 55"
          class="organization-construction__crane-cable"
          pathLength="1"
        />
        <circle cx="80" cy="104" r="10" class="organization-construction__crane-joint" />
        <path d="M38 129v22m-6 0h12M418 145v16" class="organization-construction__crane-cable" />
        <g class="organization-construction__hook">
          <path d="M418 161v108" class="organization-construction__crane-cable" />
          <path d="M410 269h16v10h-16z" class="organization-construction__hook-block" />
          <path d="M418 279v9c0 12-16 12-16 1" class="organization-construction__crane-cable" />
        </g>
      </g>

      <g class="organization-construction__measurements">
        <path d="M40 740V300m-8 0h16m-16 440h16M110 814H515m-405-8v16m405-16v16" />
        <path d="M570 290h65m-65 180h65m-65 180h65M610 290v360" />
        <circle cx="110" cy="302" r="3" />
        <circle cx="515" cy="740" r="3" />
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
  .organization-construction {
    --scene-copper: var(--auth-copper);
    --scene-copper-light: color-mix(in sRGB, var(--auth-copper) 64%, var(--standard-white));
    --scene-copper-dark: color-mix(in sRGB, var(--auth-copper) 54%, var(--gray-950));
    --scene-stone: color-mix(in sRGB, var(--gray-800) 82%, var(--auth-copper));
    --scene-stone-light: color-mix(in sRGB, var(--gray-700) 76%, var(--auth-copper));
    --scene-glass: color-mix(in sRGB, var(--gray-900) 84%, var(--auth-copper));

    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .organization-construction__scene {
    display: block;
    width: 100%;
    height: 100%;
  }

  .organization-construction__building {
    opacity: 0.9;
  }

  .organization-construction__sky {
    fill: var(--gray-950);
  }

  .organization-construction__grid-line {
    fill: none;
    stroke: var(--auth-copper-16);
    stroke-width: 1;
  }

  .organization-construction__front-light {
    stop-color: var(--scene-stone-light);
  }

  .organization-construction__front-mid {
    stop-color: var(--scene-stone);
  }

  .organization-construction__front-dark {
    stop-color: var(--gray-950);
  }

  .organization-construction__side-light {
    stop-color: var(--scene-stone);
  }

  .organization-construction__side-dark {
    stop-color: var(--gray-950);
  }

  .organization-construction__glass-light {
    stop-color: var(--scene-copper-dark);
  }

  .organization-construction__glass-mid {
    stop-color: var(--scene-glass);
  }

  .organization-construction__glass-dark {
    stop-color: var(--gray-950);
  }

  .organization-construction__glow-center {
    stop-color: var(--auth-copper-30);
  }

  .organization-construction__glow-edge {
    stop-color: transparent;
  }

  .organization-construction__grid {
    opacity: 0.45;
    animation: organization-grid-reveal 620ms ease-out both;
  }

  .organization-construction__draft,
  .organization-construction__measurements {
    fill: none;
    stroke: var(--auth-copper-30);
    stroke-width: 1;
    opacity: 0.48;
    animation:
      organization-draft-reveal 780ms ease-out both,
      organization-draft-settle 600ms ease-out forwards;
  }

  .organization-construction__draft {
    animation-delay: 180ms, 2180ms;
  }

  .organization-construction__measurements {
    animation-delay: 480ms, 2380ms;
  }

  .organization-construction__ambient {
    opacity: 0.64;
    animation: organization-ambient-reveal 850ms ease-out 2850ms both;
  }

  .organization-construction__ground-shadow {
    fill: var(--black-alpha-40);
    opacity: 0.8;
    animation: organization-foundation-reveal 450ms ease-out 430ms both;
  }

  .organization-construction__foundation {
    animation: organization-foundation-reveal 500ms cubic-bezier(0.22, 1, 0.36, 1) 430ms both;
  }

  .organization-construction__foundation-top {
    fill: var(--scene-stone-light);
  }

  .organization-construction__foundation-side {
    fill: var(--scene-copper-dark);
  }

  .organization-construction__foundation-front {
    fill: var(--scene-stone);
  }

  .organization-construction__edge {
    fill: none;
    stroke: var(--scene-copper-light);
    stroke-width: 2;
  }

  .organization-construction__facade {
    animation: organization-finish-reveal 750ms ease-out 1960ms both;
  }

  .organization-construction__roof {
    fill: var(--scene-stone-light);
  }

  .organization-construction__front-inset {
    fill: var(--black-alpha-40);
  }

  .organization-construction__side-inset {
    fill: var(--black-alpha-45);
  }

  .organization-construction__window {
    stroke: var(--scene-copper-dark);
    stroke-width: 1.5;
  }

  .organization-construction__side-window {
    fill: url('#organization-construction-glass');
    stroke: var(--scene-copper-dark);
  }

  .organization-construction__window-mullion {
    fill: none;
    stroke: var(--scene-copper-light);
    stroke-width: 1.2;
    opacity: 0.7;
  }

  .organization-construction__balcony-rail {
    fill: none;
    stroke: var(--scene-copper-light);
    stroke-width: 1.3;
    opacity: 0.75;
  }

  .organization-construction__facade-floor {
    animation: organization-finish-reveal 460ms ease-out both;
    animation-delay: calc(2220ms + var(--floor-index) * 120ms);
  }

  .organization-construction__structure {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .organization-construction__column,
  .organization-construction__floor-column,
  .organization-construction__slab,
  .organization-construction__floor-light,
  .organization-construction__crane-main,
  .organization-construction__crane-truss,
  .organization-construction__crane-cable {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: organization-line-draw 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .organization-construction__column {
    stroke: var(--scene-copper);
    stroke-width: 2.2;
    animation-delay: 650ms;
  }

  .organization-construction__column--inner {
    stroke: var(--auth-copper-42);
    stroke-width: 1.3;
    animation-delay: 780ms;
  }

  .organization-construction__floor {
    animation: organization-floor-rise 430ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(900ms + var(--floor-index) * 245ms);
  }

  .organization-construction__floor-column {
    stroke: var(--scene-copper);
    stroke-width: 1.8;
    animation-delay: calc(900ms + var(--floor-index) * 245ms);
  }

  .organization-construction__slab {
    stroke: var(--scene-copper-light);
    stroke-width: 2.8;
    animation-delay: calc(900ms + var(--floor-index) * 245ms);
  }

  .organization-construction__floor-light {
    stroke: var(--scene-copper-light);
    stroke-width: 1.7;
    filter: drop-shadow(0 0 6px var(--auth-copper-60));
    animation-delay: calc(900ms + var(--floor-index) * 245ms);
  }

  .organization-construction__details {
    fill: none;
    animation: organization-finish-reveal 680ms ease-out 2650ms both;
  }

  .organization-construction__detail-edge {
    stroke: var(--scene-copper-light);
    stroke-width: 2;
  }

  .organization-construction__roof-line {
    stroke: var(--scene-copper-light);
    stroke-width: 2;
  }

  .organization-construction__detail-slab {
    stroke: var(--scene-copper);
    stroke-width: 1.5;
  }

  .organization-construction__vertical-light {
    stroke: var(--scene-copper-light);
    stroke-width: 1.5;
    filter: drop-shadow(0 0 5px var(--auth-copper-60));
  }

  .organization-construction__ground-line {
    stroke: var(--auth-copper-42);
    stroke-width: 1.4;
  }

  .organization-construction__crane {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.85;
  }

  .organization-construction__crane-main {
    stroke: var(--scene-copper-light);
    stroke-width: 2;
    animation-delay: 160ms;
  }

  .organization-construction__crane-truss {
    stroke: var(--scene-copper);
    stroke-width: 1;
    animation-delay: 400ms;
  }

  .organization-construction__crane-cable {
    stroke: var(--auth-copper-60);
    stroke-width: 1;
    animation-delay: 350ms;
  }

  .organization-construction__crane-joint {
    fill: var(--scene-copper-light);
  }

  .organization-construction__hook-block {
    fill: var(--scene-copper);
    stroke: var(--scene-copper-light);
    stroke-width: 1;
  }

  .organization-construction__hook {
    animation: organization-hook-settle 3400ms ease-in-out 600ms infinite alternate;
  }

  @keyframes organization-grid-reveal {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.45;
    }
  }

  @keyframes organization-draft-reveal {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.48;
    }
  }

  @keyframes organization-draft-settle {
    to {
      opacity: 0.12;
    }
  }

  @keyframes organization-ambient-reveal {
    from {
      opacity: 0;
    }

    to {
      opacity: 0.64;
    }
  }

  @keyframes organization-foundation-reveal {
    from {
      opacity: 0;
      transform: translateY(16px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes organization-finish-reveal {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes organization-line-draw {
    from {
      stroke-dashoffset: 1;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes organization-floor-rise {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes organization-hook-settle {
    from {
      transform: translateY(0);
    }

    to {
      transform: translateY(4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .organization-construction__draft,
    .organization-construction__measurements {
      opacity: 0.12;
    }

    .organization-construction *,
    .organization-construction *::before,
    .organization-construction *::after {
      animation: none !important;
      stroke-dashoffset: 0 !important;
      transform: none !important;
    }
  }
</style>
