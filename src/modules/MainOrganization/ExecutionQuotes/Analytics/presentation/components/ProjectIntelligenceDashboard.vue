<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/stores/user';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataSuccess,
    DataLoading,
    DataInitial,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import AnalyticsController, { type AnalyticsSource } from '../controllers/analytics.controller';
  import { calendarPeriod } from '../../core/models/analytics.metrics';
  import AnalyticsKpiCard from './AnalyticsKpiCard.vue';
  import AnalyticsPanel from './AnalyticsPanel.vue';
  import AnalyticsStatusChart from './AnalyticsStatusChart.vue';
  import DailyReportsActivityChart from './DailyReportsActivityChart.vue';

  const route = useRoute();
  const { t, locale } = useI18n();
  const user = useUserStore();
  const controller = AnalyticsController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const internalAccess = computed(() => [1, 2].includes(Number(user.user?.type)));
  const validQuote = computed(() => Number.isSafeInteger(quoteId.value) && quoteId.value > 0);
  const base = computed(() => quotePath(route.path, quoteId.value));
  const days = ref(30);
  const rangeOptions = computed(() =>
    [7, 30, 90].map(
      (id) => new TitleInterface({ id, title: t('intelligence.last_days', { days: id }) }),
    ),
  );
  const range = computed({
    get: () => rangeOptions.value.find((option) => option.id === days.value) ?? null,
    set: (
      value: TitleInterface<string | number> | TitleInterface<string | number>[] | null | undefined,
    ) => {
      if (value && !Array.isArray(value) && [7, 30, 90].includes(Number(value.id)))
        days.value = Number(value.id);
    },
  });
  const today = ref(new Date().toISOString().slice(0, 10));
  const period = computed(() => calendarPeriod(days.value, today.value));
  const flat = ref(false);
  const timeline = computed(() => controller.timelineBuckets);
  const reports = computed(() => controller.reportSummary(period.value));
  const activities = computed(() => controller.workMix(period.value));
  const procurement = computed(() => controller.procurementBuckets);
  function stateValue<T, R>(state: DataState<T>, transform: (value: T) => R): R | null {
    return state instanceof DataSuccess && state.data !== null ? transform(state.data) : null;
  }
  function workStatus(status: number | null | undefined) {
    return status === undefined
      ? t('intelligence.unavailable')
      : t(
          `intelligence.${status === null ? 'not_started' : status === 1 ? 'start' : status === 2 ? 'hold' : 'stop'}`,
        );
  }
  const execution = computed(() =>
    stateValue(controller.configuration.value, (value) => workStatus(value.workStatus)),
  );
  const activeGroups = computed(() =>
    timeline.value
      ? `${timeline.value[1]?.count} / ${timeline.value.reduce((sum, bucket) => sum + bucket.count, 0)}`
      : null,
  );
  const assigned = computed(() =>
    stateValue(controller.tasks.value, (rows) => `${controller.taskAssignments} / ${rows.length}`),
  );
  interface IntelligenceKpi {
    key: string;
    source: AnalyticsSource | null;
    value: string | number | null | undefined;
    state: DataState<unknown> | undefined;
    path: string;
    period: boolean;
  }
  const kpis = computed<IntelligenceKpi[]>(() => [
    {
      key: 'execution',
      source: 'configuration',
      value: execution.value,
      state: controller.configuration.value,
      path: '/schedule',
      period: false,
    },
    {
      key: 'active_groups',
      source: 'timelines',
      value: activeGroups.value,
      state: controller.timelines.value,
      path: '/schedule',
      period: false,
    },
    {
      key: 'daily_reports',
      source: 'reports',
      value: reports.value?.count,
      state: controller.reports.value,
      path: '/work-items',
      period: true,
    },
    {
      key: 'pending_requests',
      source: 'procurement',
      value: procurement.value?.[0]?.count,
      state: controller.procurement.value,
      path: '/procurement',
      period: false,
    },
    {
      key: 'shop_drawings',
      source: 'drawings',
      value: stateValue(controller.drawings.value, (rows) => rows.length),
      state: controller.drawings.value,
      path: '/drawings',
      period: false,
    },
    {
      key: 'assigned_tasks',
      source: 'tasks',
      value: assigned.value,
      state: controller.tasks.value,
      path: '/work-items',
      period: false,
    },
    {
      key: 'receiving_complete',
      source: null,
      value: null,
      state: undefined,
      path: '/warehouse/material-receipt',
      period: false,
    },
    {
      key: 'flagged_reports',
      source: 'reports',
      value: reports.value?.flagged,
      state: controller.reports.value,
      path: '/work-items',
      period: true,
    },
  ]);
  const highPriority = computed(() =>
    stateValue(
      controller.procurement.value,
      (rows) => rows.filter((row) => row.status === 1 && row.priority === 3).length,
    ),
  );
  function retry(source: AnalyticsSource | null) {
    if (source) void controller.load(source);
  }
  function refresh() {
    today.value = new Date().toISOString().slice(0, 10);
    void controller.refresh();
  }
  function evidence(state: DataState<unknown>, exists: boolean | undefined) {
    return !(state instanceof DataSuccess) || exists === undefined
      ? t('intelligence.unavailable')
      : t(exists ? 'intelligence.recorded' : 'intelligence.missing');
  }
  const responsibleSelected = computed(() => {
    const configuration = controller.configuration.value.data;
    if (
      !configuration ||
      (configuration.responsibleEmployeeId === undefined &&
        configuration.responsibleEmployee === undefined)
    )
      return undefined;
    return !!(configuration.responsibleEmployeeId || configuration.responsibleEmployee?.id);
  });
  const retrieved = computed(() =>
    controller.retrievedAt.value
      ? new Intl.DateTimeFormat(locale.value, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(new Date(controller.retrievedAt.value))
      : t('intelligence.unavailable'),
  );
  watch(
    [quoteId, internalAccess],
    ([id, access]) => {
      void controller.activate(id, access);
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section class="project-intelligence" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <ProjectWorkspaceNav :quote-id="quoteId" active="intelligence" />
    <header class="intelligence-header feature-header-container">
      <div>
        <p class="intelligence-eyebrow">{{ $t('intelligence.title') }}</p>
        <h1>{{ controller.owner.value.data?.project?.title || $t('schedule.quote_context') }}</h1>
        <p>
          {{ $t('intelligence.execution') }}:
          <strong>{{ execution || $t('intelligence.unavailable') }}</strong>
        </p>
        <small>{{ $t('intelligence.retrieved') }}: {{ retrieved }} · UTC</small>
      </div>
      <div class="intelligence-controls">
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="analytics-period"
            v-model="range"
            :static-options="rangeOptions"
            label="intelligence.range"
            :placeholder="$t('intelligence.range')"
            :type="1"
            :show-help="false"
          />
        </div>
        <AppButton
          class="btn-primary"
          :disabled="
            !internalAccess || !validQuote || controller.owner.value instanceof DataLoading
          "
          @click="refresh"
          ><i class="pi pi-refresh" aria-hidden="true" />{{ $t('intelligence.refresh') }}</AppButton
        >
        <label class="analytics-flat"
          ><input v-model="flat" type="checkbox" />{{ $t('intelligence.flat') }}</label
        >
      </div>
    </header>
    <p v-if="!internalAccess" role="status">{{ $t('intelligence.not_permitted') }}</p>
    <p v-else-if="!validQuote" role="alert">{{ $t('work_items.invalid_quote') }}</p>
    <div
      v-else-if="
        !(controller.owner.value instanceof DataSuccess) &&
        !(controller.owner.value instanceof DataLoading) &&
        !(controller.owner.value instanceof DataInitial)
      "
      class="analytics-message"
      role="alert"
    >
      <p>{{ $t('intelligence.load_error') }}</p>
      <AppButton @click="refresh">{{ $t('intelligence.retry') }}</AppButton>
    </div>
    <template v-else>
      <p class="intelligence-period">
        <i class="pi pi-calendar" aria-hidden="true" />{{ period.from }} — {{ period.to }} ·
        {{ $t('intelligence.date_policy') }}
      </p>
      <div class="analytics-kpis">
        <AnalyticsKpiCard
          v-for="kpi in kpis"
          :key="kpi.key"
          :title="$t(`intelligence.${kpi.key}`)"
          :value="kpi.value"
          :note="$t(kpi.period ? 'intelligence.in_range' : 'intelligence.as_now')"
          :to="base + kpi.path"
          :loading="kpi.state instanceof DataLoading || kpi.state instanceof DataInitial"
          :failed="
            kpi.state !== undefined &&
            !(kpi.state instanceof DataLoading) &&
            !(kpi.state instanceof DataInitial) &&
            !(kpi.state instanceof DataSuccess)
          "
          @retry="retry(kpi.source)"
        />
      </div>
      <div class="analytics-charts">
        <AnalyticsPanel
          class="analytics-panel--wide"
          :title="$t('intelligence.timeline_title')"
          :note="$t('intelligence.timeline_note')"
          :state="controller.timelines.value"
          :available="timeline !== null"
          :to="base + '/schedule'"
          @retry="controller.load('timelines')"
          ><AnalyticsStatusChart
            :buckets="timeline ?? []"
            :title="$t('intelligence.timeline_title')"
            :flat="flat"
        /></AnalyticsPanel>
        <AnalyticsPanel
          :title="$t('intelligence.daily_reports')"
          :note="$t('intelligence.in_range')"
          :state="controller.reports.value"
          :available="reports !== null"
          :to="base + '/work-items'"
          @retry="controller.load('reports')"
          ><DailyReportsActivityChart :buckets="reports?.trend ?? []" :flat="flat"
        /></AnalyticsPanel>
        <AnalyticsPanel
          :title="$t('intelligence.procurement_title')"
          :note="$t('intelligence.as_now')"
          :state="controller.procurement.value"
          :available="procurement !== null"
          :to="base + '/procurement'"
          @retry="controller.load('procurement')"
          ><AnalyticsStatusChart
            :buckets="procurement ?? []"
            :title="$t('intelligence.procurement_title')"
            :flat="flat"
        /></AnalyticsPanel>
        <AnalyticsPanel
          :title="$t('intelligence.work_mix')"
          :note="$t('intelligence.in_range')"
          :state="controller.activities.value"
          :available="activities !== null"
          :to="base + '/work-items'"
          @retry="controller.load('activities')"
          ><AnalyticsStatusChart
            :buckets="activities ?? []"
            :title="$t('intelligence.work_mix')"
            :flat="flat"
        /></AnalyticsPanel>
        <AnalyticsPanel
          :title="$t('intelligence.safety_mix')"
          :note="$t('intelligence.safety_note')"
          :state="controller.reports.value"
          :available="reports !== null"
          :to="base + '/work-items'"
          @retry="controller.load('reports')"
          ><AnalyticsStatusChart
            :buckets="reports?.safety ?? []"
            :title="$t('intelligence.safety_mix')"
            :flat="flat"
        /></AnalyticsPanel>
        <AnalyticsPanel
          :title="$t('intelligence.receiving_title')"
          :note="$t('intelligence.receiving_note')"
          :to="base + '/warehouse/material-receipt'"
        />
      </div>
      <section class="analytics-readiness analytics-panel">
        <header>
          <div>
            <h2>{{ $t('intelligence.attention') }}</h2>
            <p>{{ $t('intelligence.readiness_note') }}</p>
          </div>
        </header>
        <div class="analytics-readiness__grid">
          <div>
            <h3>{{ $t('intelligence.signals') }}</h3>
            <ul>
              <li v-if="timeline && timeline[1]?.count === 0">
                <RouterLink :to="base + '/schedule'">{{
                  $t('intelligence.no_started')
                }}</RouterLink>
              </li>
              <li>
                <RouterLink :to="base + '/procurement'"
                  >{{ $t('intelligence.high_priority') }}:
                  {{ highPriority ?? $t('intelligence.unavailable') }}</RouterLink
                >
              </li>
              <li>
                <RouterLink :to="base + '/work-items'"
                  >{{ $t('intelligence.incident') }}:
                  {{ reports?.incidents ?? $t('intelligence.unavailable') }}</RouterLink
                >
              </li>
            </ul>
          </div>
          <div>
            <h3>{{ $t('intelligence.prerequisites') }}</h3>
            <dl>
              <div>
                <dt>
                  <RouterLink :to="base + '/schedule'">{{
                    $t('intelligence.configuration')
                  }}</RouterLink>
                </dt>
                <dd>
                  {{
                    evidence(
                      controller.configuration.value,
                      controller.configuration.value.data !== null,
                    )
                  }}
                </dd>
              </div>
              <div>
                <dt>
                  <RouterLink :to="base + '/schedule'">{{
                    $t('intelligence.responsible')
                  }}</RouterLink>
                </dt>
                <dd>
                  {{ evidence(controller.configuration.value, responsibleSelected) }}
                </dd>
              </div>
              <div>
                <dt>
                  <RouterLink :to="base + '/drawings'">{{
                    $t('intelligence.shop_drawings')
                  }}</RouterLink>
                </dt>
                <dd>
                  {{
                    evidence(
                      controller.drawings.value,
                      controller.drawings.value.data
                        ? controller.drawings.value.data.length > 0
                        : undefined,
                    )
                  }}
                </dd>
              </div>
              <div>
                <dt>{{ $t('intelligence.payment_check') }}</dt>
                <dd>{{ $t('intelligence.unavailable') }}</dd>
              </div>
            </dl>
          </div>
        </div>
        <p class="analytics-footnote">{{ $t('intelligence.final_authority') }}</p>
      </section>
    </template>
  </section>
</template>
<style lang="scss">
  @use '../styles/analytics';
</style>
