<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type { AnalyticsBucket } from '../../core/models/analytics.metrics';
  const props = defineProps<{
    buckets: readonly AnalyticsBucket[];
    title: string;
    flat: boolean;
  }>();
  const { t, locale } = useI18n();
  const maximum = computed(() => Math.max(1, ...props.buckets.map((bucket) => bucket.count)));
  const total = computed(() => props.buckets.reduce((sum, bucket) => sum + bucket.count, 0));
  const selected = ref<string | null>(null);
  const number = (value: number) => new Intl.NumberFormat(locale.value).format(value);
</script>
<template>
  <div class="status-chart" :class="{ 'status-chart--flat': flat }">
    <p v-if="total === 0" class="analytics-empty">{{ $t('intelligence.empty') }}</p>
    <svg v-else viewBox="0 0 440 224" role="img" :aria-label="title" class="status-chart__svg">
      <g
        v-for="tick in maximum > 1 ? [0, Math.floor(maximum / 2), maximum] : [0, 1]"
        :key="tick"
        class="chart-grid"
      >
        <line
          :x1="24 + (tick / maximum) * 380"
          :x2="24 + (tick / maximum) * 380"
          y1="12"
          y2="188"
        />
        <text :x="24 + (tick / maximum) * 380" y="214" text-anchor="middle">
          {{ number(tick) }}
        </text>
      </g>
      <g v-for="(bucket, index) in buckets" :key="bucket.key" :class="`series-${index}`">
        <rect
          class="chart-bar"
          x="24"
          :y="22 + index * 42"
          :width="(380 * bucket.count) / maximum"
          height="22"
          rx="4"
        />
        <path
          v-if="bucket.count > 0"
          class="chart-depth"
          :d="`M24 ${22 + index * 42} l5 -5 h${(380 * bucket.count) / maximum - 5} l-5 5 Z`"
        />
        <text
          :x="Math.min(417, 34 + (380 * bucket.count) / maximum)"
          :y="38 + index * 42"
          class="chart-value"
        >
          {{ number(bucket.count) }}
        </text>
      </g>
    </svg>
    <ul class="chart-legend" :aria-label="title">
      <li v-for="(bucket, index) in buckets" :key="bucket.key">
        <button
          type="button"
          :class="`series-${index}`"
          :aria-pressed="selected === bucket.key"
          @click="selected = selected === bucket.key ? null : bucket.key"
          @focus="selected = bucket.key"
          @mouseenter="selected = bucket.key"
        >
          <span class="chart-dot" aria-hidden="true" />{{ t(bucket.label)
          }}<strong>{{ number(bucket.count) }}</strong>
        </button>
      </li>
    </ul>
    <p v-if="selected !== null" class="chart-tooltip" role="status">
      {{ t(buckets.find((bucket) => bucket.key === selected)?.label ?? '') }}:
      {{ number(buckets.find((bucket) => bucket.key === selected)?.count ?? 0) }}
    </p>
    <details class="analytics-table">
      <summary>{{ $t('intelligence.view_data') }}</summary>
      <table>
        <caption>
          {{
            title
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ $t('intelligence.category') }}</th>
            <th scope="col">{{ $t('intelligence.records') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bucket in buckets" :key="bucket.key">
            <th scope="row">{{ t(bucket.label) }}</th>
            <td>{{ number(bucket.count) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>
