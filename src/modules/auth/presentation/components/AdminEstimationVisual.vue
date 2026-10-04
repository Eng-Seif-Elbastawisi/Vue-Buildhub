<template>
  <div class="admin-estimation" aria-hidden="true">
    <svg class="admin-estimation__scene" viewBox="0 0 560 680" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="admin-estimation-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" class="admin-estimation__grid-line" />
        </pattern>
        <radialGradient id="admin-estimation-glow">
          <stop offset="0" class="admin-estimation__glow-center" />
          <stop offset="1" class="admin-estimation__glow-edge" />
        </radialGradient>
      </defs>

      <ellipse
        cx="272"
        cy="350"
        rx="260"
        ry="300"
        fill="url(#admin-estimation-glow)"
        class="admin-estimation__glow"
      />
      <rect
        x="20"
        y="88"
        width="506"
        height="510"
        rx="12"
        fill="url(#admin-estimation-grid)"
        class="admin-estimation__grid"
      />

      <g class="admin-estimation__blueprint">
        <path d="M72 152H394V466H72Z" class="admin-estimation__sheet" />
        <path d="M102 184H362V431H102Z" class="admin-estimation__plan" pathLength="1" />
        <path
          d="M102 253H234V184M234 253H362M174 253V431M174 336H362M287 253V336M234 336V431"
          class="admin-estimation__plan"
          pathLength="1"
        />
        <path
          d="M115 197h48v44h-48zM247 197h102v44H247zM187 266h87v56h-87zM300 349h49v69h-49z"
          class="admin-estimation__plan admin-estimation__plan--faint"
          pathLength="1"
        />
        <circle cx="102" cy="184" r="3" class="admin-estimation__node" />
        <circle cx="362" cy="431" r="3" class="admin-estimation__node" />
      </g>

      <g class="admin-estimation__dimensions">
        <path d="M102 133H362M102 125v16M362 125v16M58 184V431M50 184h16M50 431h16" />
        <path d="m107 129-5 4 5 4m250-8 5 4-5 4M54 189l4-5 4 5m-8 237 4 5 4-5" />
        <path d="M178 456h180M178 450v12M358 450v12" />
        <circle cx="232" cy="133" r="2" />
        <circle cx="58" cy="307" r="2" />
      </g>

      <g class="admin-estimation__estimate">
        <rect
          x="54"
          y="492"
          width="292"
          height="122"
          rx="12"
          class="admin-estimation__estimate-panel"
        />
        <path
          d="M74 517h91M74 538h40m15 0h75m-130 20h40m15 0h112m-167 20h40m15 0h87"
          class="admin-estimation__estimate-lines"
        />
        <path d="M250 532h72M270 552h52M242 572h80" class="admin-estimation__estimate-values" />
        <path d="M74 592h248" class="admin-estimation__estimate-rule" />
        <path d="M251 602h71" class="admin-estimation__estimate-total" />
        <circle cx="60" cy="538" r="2" class="admin-estimation__node" />
        <circle cx="60" cy="558" r="2" class="admin-estimation__node" />
        <circle cx="60" cy="578" r="2" class="admin-estimation__node" />
      </g>

      <g class="admin-estimation__building" transform="translate(-85 10)">
        <path
          d="M229 432V214L355 177l91 38v217M229 214l91 39 126-38M320 253v179M355 177v219M229 432h217"
          class="admin-estimation__frame"
          pathLength="1"
        />
        <path
          d="M229 286h217M229 359h217M320 286l126-36M320 359l126-36M229 286l91 37M229 359l91 37"
          class="admin-estimation__floors"
          pathLength="1"
        />
        <path
          d="M265 225v205M390 200v232M229 214l126-37M355 177l91 38"
          class="admin-estimation__frame admin-estimation__frame--light"
          pathLength="1"
        />
        <path
          d="M229 432l91 32 126-32M320 253v211"
          class="admin-estimation__frame admin-estimation__frame--faint"
          pathLength="1"
        />
        <circle cx="229" cy="214" r="3" class="admin-estimation__building-node" />
        <circle cx="355" cy="177" r="3" class="admin-estimation__building-node" />
        <circle cx="446" cy="432" r="3" class="admin-estimation__building-node" />
      </g>

      <g class="admin-estimation__crane" transform="translate(-130 0)">
        <path d="M451 68h61M481 68v60" class="admin-estimation__crane-arm" pathLength="1" />
        <g class="admin-estimation__hook">
          <path d="M481 128v57" class="admin-estimation__crane-cable" />
          <path d="M473 185h16v10h-16z" class="admin-estimation__hook-block" />
          <path d="M481 195v12c0 13-17 13-17 1" class="admin-estimation__crane-cable" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
  .admin-estimation {
    position: absolute;
    inset: 7% auto 12% -2%;
    z-index: 0;
    width: min(51%, 520px);
    pointer-events: none;
    opacity: 0.88;
    mask-image: linear-gradient(90deg, black 0 68%, transparent 100%);
  }

  .admin-estimation__scene {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .admin-estimation__grid-line {
    fill: none;
    stroke: var(--auth-admin-accent-16);
    stroke-width: 0.7;
  }

  .admin-estimation__grid {
    opacity: 0.4;
  }

  .admin-estimation__glow-center {
    stop-color: var(--auth-admin-accent-16);
  }

  .admin-estimation__glow-edge {
    stop-color: transparent;
  }

  .admin-estimation__glow {
    opacity: 0.55;
    animation: admin-estimation-glow 1.05s ease-out 2.325s both;
  }

  .admin-estimation__sheet {
    fill: var(--auth-admin-accent-08);
    stroke: var(--auth-admin-accent-30);
    stroke-width: 1;
  }

  .admin-estimation__blueprint {
    animation: admin-estimation-blueprint-settle 490ms ease-out 2025ms forwards;
  }

  .admin-estimation__plan,
  .admin-estimation__frame,
  .admin-estimation__floors,
  .admin-estimation__crane-arm {
    fill: none;
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: admin-estimation-draw 675ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .admin-estimation__plan {
    stroke: var(--auth-copper-60);
    stroke-width: 1.5;
    animation-delay: 135ms;
  }

  .admin-estimation__plan--faint {
    stroke: var(--auth-copper-30);
    stroke-width: 1;
    animation-delay: 340ms;
  }

  .admin-estimation__node {
    fill: var(--auth-copper);
  }

  .admin-estimation__dimensions {
    fill: none;
    stroke: var(--auth-copper-60);
    stroke-width: 1.1;
    opacity: 0.8;
    animation: admin-estimation-reveal 360ms ease-out 675ms both;
  }

  .admin-estimation__estimate {
    animation: admin-estimation-reveal 420ms ease-out 1110ms both;
  }

  .admin-estimation__estimate-panel {
    fill: var(--auth-admin-panel);
    stroke: var(--auth-copper-42);
    stroke-width: 1;
  }

  .admin-estimation__estimate-lines,
  .admin-estimation__estimate-values,
  .admin-estimation__estimate-rule,
  .admin-estimation__estimate-total {
    fill: none;
    stroke-linecap: round;
    stroke-width: 3;
  }

  .admin-estimation__estimate-lines {
    stroke: var(--auth-white-20);
  }

  .admin-estimation__estimate-values {
    stroke: var(--auth-copper-60);
  }

  .admin-estimation__estimate-rule {
    stroke: var(--auth-copper-30);
    stroke-width: 1;
  }

  .admin-estimation__estimate-total {
    stroke: var(--auth-copper);
    stroke-width: 4;
  }

  .admin-estimation__building {
    opacity: 0.92;
  }

  .admin-estimation__frame {
    stroke: var(--auth-copper);
    stroke-width: 2;
    animation-delay: 1575ms;
  }

  .admin-estimation__frame--light {
    stroke: var(--auth-copper-60);
    stroke-width: 1.4;
    animation-delay: 1770ms;
  }

  .admin-estimation__frame--faint {
    stroke: var(--auth-copper-30);
    stroke-width: 1;
    animation-delay: 1905ms;
  }

  .admin-estimation__floors {
    stroke: var(--auth-copper-60);
    stroke-width: 1.3;
    animation-delay: 1750ms;
  }

  .admin-estimation__building-node {
    fill: var(--auth-copper);
    animation: admin-estimation-reveal 285ms ease-out 2025ms both;
  }

  .admin-estimation__crane {
    fill: none;
    stroke: var(--auth-copper-60);
    stroke-width: 1.5;
    animation: admin-estimation-reveal 375ms ease-out 2205ms both;
  }

  .admin-estimation__crane-arm {
    animation-delay: 2205ms;
  }

  .admin-estimation__hook {
    animation: admin-estimation-hook 675ms ease-out 2475ms both;
  }

  .admin-estimation__hook-block {
    fill: var(--auth-copper);
  }

  @keyframes admin-estimation-draw {
    from {
      stroke-dashoffset: 1;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes admin-estimation-reveal {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes admin-estimation-blueprint-settle {
    to {
      opacity: 0.28;
    }
  }

  @keyframes admin-estimation-hook {
    from {
      transform: translateY(-5px);
    }

    to {
      transform: translateY(0);
    }
  }

  @keyframes admin-estimation-glow {
    from {
      opacity: 0.2;
    }

    to {
      opacity: 0.55;
    }
  }

  @media (max-width: 1180px) {
    .admin-estimation {
      width: 47%;
      opacity: 0.65;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-estimation * {
      animation: none !important;
      stroke-dashoffset: 0 !important;
    }
  }
</style>
