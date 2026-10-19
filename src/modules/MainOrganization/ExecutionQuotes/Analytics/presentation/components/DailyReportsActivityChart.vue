<script setup lang="ts">
  import { computed, useId, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { AnalyticsBucket } from '../../core/models/analytics.metrics';
  const props = defineProps<{ buckets: readonly AnalyticsBucket[]; flat: boolean }>();
  const { locale } = useI18n();
  const selected = ref<number | null>(null);
  const active = computed(() => (selected.value === null ? null : props.buckets[selected.value]));
  function moveDay(direction: number) {
    selected.value = Math.max(
      0,
      Math.min(props.buckets.length - 1, (selected.value ?? 0) + direction),
    );
  }
  const gradientId = `activity-${useId()}`;
  const maximum = computed(() => Math.max(1, ...props.buckets.map((bucket) => bucket.count)));
  const total = computed(() => props.buckets.reduce((sum, bucket) => sum + bucket.count, 0));
  const points = computed(() =>
    props.buckets
      .map(
        (bucket, index) =>
          `${30 + (index * 374) / Math.max(1, props.buckets.length - 1)},${170 - (bucket.count * 145) / maximum.value}`,
      )
      .join(' '),
  );
  const number = (value: number) => new Intl.NumberFormat(locale.value).format(value);
</script>
<template>
  <div class="activity-chart">
    <p v-if="total === 0" class="analytics-empty">{{ $t('intelligence.empty') }}</p>
    <svg
      v-else
      viewBox="0 0 440 220"
      role="group"
      tabindex="0"
      :aria-label="$t('intelligence.daily_reports')"
      @focus="selected = 0"
      @keydown.left.prevent="moveDay(-1)"
      @keydown.right.prevent="moveDay(1)"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--PrimaryColor)" stop-opacity="0.24" />
          <stop offset="100%" stop-color="var(--PrimaryColor)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g
        v-for="tick in maximum > 1 ? [0, Math.floor(maximum / 2), maximum] : [0, 1]"
        :key="tick"
        class="chart-grid"
      >
        <line
          x1="30"
          x2="404"
          :y1="170 - (tick / maximum) * 145"
          :y2="170 - (tick / maximum) * 145"
        />
        <text x="22" :y="175 - (tick / maximum) * 145" text-anchor="end">{{ number(tick) }}</text>
      </g>
      <polygon v-if="!flat" :points="`30,170 ${points} 404,170`" :fill="`url(#${gradientId})`" />
      <polyline
        :points="points"
        fill="none"
        stroke="var(--PrimaryColor)"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <circle
        v-for="(bucket, index) in buckets"
        :key="bucket.key"
        :cx="30 + (index * 374) / Math.max(1, buckets.length - 1)"
        :cy="170 - (bucket.count * 145) / maximum"
        r="7"
        fill="transparent"
        @mouseenter="selected = index"
        @click="selected = index"
      >
        <title>{{ bucket.key }}: {{ number(bucket.count) }}</title>
      </circle>
      <text x="30" y="204" class="chart-date">{{ buckets[0]?.key }}</text>
      <text x="404" y="204" text-anchor="end" class="chart-date">
        {{ buckets[buckets.length - 1]?.key }}
      </text>
    </svg>
    <p class="analytics-footnote">{{ $t('intelligence.trend_help') }}</p>
    <p v-if="active" class="chart-tooltip" role="status">
      {{ active.key }}: {{ number(active.count) }} {{ $t('intelligence.reports') }}
    </p>
    <details class="analytics-table">
      <summary>{{ $t('intelligence.view_daily_data') }}</summary>
      <table>
        <caption>
          {{
            $t('intelligence.daily_reports')
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ $t('intelligence.date') }}</th>
            <th scope="col">{{ $t('intelligence.reports') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bucket in buckets" :key="bucket.key">
            <th scope="row">{{ bucket.key }}</th>
            <td>{{ number(bucket.count) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>
