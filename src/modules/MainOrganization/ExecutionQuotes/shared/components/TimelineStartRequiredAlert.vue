<script setup lang="ts">
  import { computed, onBeforeUnmount, nextTick, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataSuccess,
    DataLoading,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleGroupModel from '../../Schedule/core/models/schedule.group.model';
  import WorkItemsController from '../../WorkItems/presentation/controllers/work-items.controller';
  import PurchaseRequestController from '../../Procurement/presentation/controllers/purchase-request.controller';
  import ScheduleController from '../../Schedule/presentation/controllers/schedule.controller';
  import ScheduleOwnerParams from '../../Schedule/core/params/schedule.owner.params';
  import { ChangeTimelineWorkStatusParams } from '../../Schedule/core/params/schedule.status.params';
  import { schedulePath } from '../../Schedule/presentation/schedule.routes';
  import {
    TimelineWorkStatus,
    TimelineWorkReason,
    type TimelineWorkReason as WorkReason,
  } from '../../Schedule/core/constants/timeline.status';

  const props = defineProps<{ quoteId: number }>();
  const opened = ref(false);
  const trigger = ref<HTMLButtonElement | null>(null);
  const route = useRoute();
  const { t } = useI18n();
  const schedule = ScheduleController.getInstance();
  type Selection = TitleInterface<string | number> | TitleInterface<string | number>[] | null;
  const reasons = ref<Record<number, Selection>>({});
  const notes = ref<Record<number, string>>({});
  const lastGroupId = ref<number | null>(null);
  const validQuote = computed(() => Number.isSafeInteger(props.quoteId) && props.quoteId > 0);
  const state = computed(() => schedule.overviewState.value);
  const ownerMatches = computed(() => schedule.ownerState.value.data?.id === props.quoteId);
  const groups = computed(() =>
    ownerMatches.value
      ? (state.value.data?.projectTimelines ?? schedule.listState.value.data ?? [])
      : [],
  );
  const loading = computed(
    () => state.value instanceof DataLoading || schedule.ownerState.value instanceof DataLoading,
  );
  const ready = computed(
    () =>
      ownerMatches.value &&
      state.value instanceof DataSuccess &&
      schedule.ownerState.value instanceof DataSuccess,
  );
  const noStartedGroups = computed(
    () =>
      state.value instanceof DataSuccess &&
      !groups.value.some(
        (group: ScheduleGroupModel) => group.workStatus === TimelineWorkStatus.START,
      ),
  );
  const error = computed(
    () => state.value.error ?? schedule.ownerState.value.error ?? schedule.listState.value.error,
  );
  const mutationError = computed(() => schedule.workStatusState.value.error);
  const reasonOptions = computed(() =>
    Object.values(TimelineWorkReason).map(
      (id) => new TitleInterface({ id, title: t(`schedule.reason_${id}`) }),
    ),
  );

  let refreshingQuote: number | null = null;
  async function refreshSchedule() {
    if (
      !validQuote.value ||
      (schedule.busy.value && ownerMatches.value) ||
      refreshingQuote === props.quoteId
    )
      return;
    const quoteId = props.quoteId;
    refreshingQuote = quoteId;
    schedule.activate(
      quoteId,
      route.params.groupId === undefined ? null : Number(route.params.groupId),
    );
    try {
      const [, overview] = await Promise.all([
        schedule.ownerState.value instanceof DataLoading ? Promise.resolve() : schedule.readOwner(),
        schedule.readOverview(quoteId, schedule.overviewState.value instanceof DataSuccess),
      ]);
      if (props.quoteId === quoteId && overview instanceof DataSuccess)
        await schedule.fetchList(new ScheduleOwnerParams(quoteId));
    } finally {
      if (refreshingQuote === quoteId) refreshingQuote = null;
    }
  }
  watch(
    () => props.quoteId,
    () => {
      reasons.value = {};
      notes.value = {};
      lastGroupId.value = null;
      opened.value = false;
    },
    { immediate: true },
  );
  watch(
    () => route.fullPath,
    () => {
      opened.value = false;
    },
  );
  async function startGroup(groupId: number) {
    if (
      !ready.value ||
      schedule.busy.value ||
      !schedule.timelineApproved.value ||
      !groups.value.some(
        (group) => group.id === groupId && group.workStatus !== TimelineWorkStatus.START,
      )
    )
      return;
    const selection = reasons.value[groupId];
    const reason =
      selection && !Array.isArray(selection) ? (Number(selection.id) as WorkReason) : null;
    const quoteId = props.quoteId;
    lastGroupId.value = groupId;
    const result = await schedule.changeWorkStatus(
      new ChangeTimelineWorkStatusParams(
        groupId,
        TimelineWorkStatus.START,
        reason,
        notes.value[groupId]?.trim() || null,
      ),
    );
    if (result instanceof DataSuccess && props.quoteId === quoteId) {
      const workItems = WorkItemsController.getInstance();
      const purchaseRequests = PurchaseRequestController.getInstance();
      await Promise.all([
        workItems.quoteId.value === quoteId ? workItems.loadStages() : Promise.resolve(),
        purchaseRequests.quoteId.value === quoteId
          ? purchaseRequests.loadStages()
          : Promise.resolve(),
      ]);
    }
  }
  function statusKey(group: ScheduleGroupModel) {
    return group.workStatus === undefined
      ? 'schedule.not_available'
      : group.workStatus === null
        ? 'schedule.work_unstarted'
        : `schedule.work_${group.workStatus}`;
  }
  async function toggle() {
    opened.value = !opened.value;
    if (opened.value) await refreshSchedule();
  }
  async function close() {
    opened.value = false;
    await nextTick();
    trigger.value?.focus();
  }
  function onFocus() {
    if (opened.value) void refreshSchedule();
  }
  onMounted(() => window.addEventListener('focus', onFocus));
  onBeforeUnmount(() => window.removeEventListener('focus', onFocus));
</script>
<template>
  <div class="timeline-widget" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <button
      ref="trigger"
      class="timeline-widget__trigger btn btn-primary"
      type="button"
      :aria-label="$t('execution_updates.toggle_timeline')"
      :title="$t('execution_updates.toggle_timeline')"
      :aria-expanded="opened"
      :aria-controls="`timeline-panel-${quoteId}`"
      @click="toggle"
    >
      <i class="pi pi-calendar" aria-hidden="true" />
    </button>
    <section
      v-if="opened"
      :id="`timeline-panel-${quoteId}`"
      class="timeline-start-alert"
      :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
      :aria-labelledby="`timeline-groups-${quoteId}`"
      @keydown.esc.stop.prevent="close"
    >
      <header class="timeline-start-alert__header">
        <h2 :id="`timeline-groups-${quoteId}`">
          <i class="pi pi-calendar" aria-hidden="true" /> {{ $t('schedule.title') }}
        </h2>
        <div class="timeline-start-alert__actions">
          <RouterLink
            v-if="validQuote"
            :to="schedulePath(route.path, quoteId)"
            class="btn btn-secondary"
            >{{ $t('execution_updates.manage_schedule') }}</RouterLink
          >
          <button
            type="button"
            class="timeline-widget__close btn btn-secondary"
            :aria-label="$t('execution_updates.close_timeline')"
            @click="close"
          >
            <i class="pi pi-times" aria-hidden="true" />
          </button>
        </div>
      </header>
      <p v-if="!validQuote" role="alert">{{ $t('work_items.invalid_quote') }}</p>
      <p v-else-if="loading" role="status">{{ $t('work_items.loading_stages') }}</p>
      <div v-if="error" role="alert" class="timeline-start-alert__feedback">
        <p>{{ $t(error.displayMessage) }}</p>
        <AppButton
          type="button"
          theme="secondary"
          :disabled="schedule.busy.value"
          @click="refreshSchedule"
          >{{ $t('work_items.retry') }}</AppButton
        >
      </div>
      <template v-else-if="state instanceof DataSuccess">
        <p v-if="!groups.length">{{ $t('execution_updates.create_schedule') }}</p>
        <p v-else-if="noStartedGroups" class="timeline-start-alert__notice">
          {{ $t('execution_updates.no_active') }}. {{ $t('execution_updates.start_help') }}
        </p>
        <p
          v-if="!loading && !schedule.timelineApproved.value && groups.length"
          class="timeline-start-alert__notice"
        >
          {{ $t('execution_updates.approval_required') }}
        </p>
      </template>
      <ul v-if="groups.length" class="timeline-start-alert__list">
        <li
          v-for="group in groups"
          :key="group.id"
          class="timeline-start-alert__group"
          :data-group-id="group.id"
        >
          <div class="timeline-start-alert__group-heading">
            <h3>{{ group.title }}</h3>
            <span
              class="timeline-start-alert__status"
              :class="{
                'timeline-start-alert__status--started':
                  group.workStatus === TimelineWorkStatus.START,
              }"
              >{{ $t(statusKey(group)) }}</span
            >
          </div>
          <form
            v-if="group.workStatus !== TimelineWorkStatus.START"
            class="timeline-start-alert__form"
            @submit.prevent="startGroup(group.id)"
          >
            <div class="field-group">
              <UpdatedCustomInputSelect
                :id="`timeline-reason-${quoteId}-${group.id}`"
                :model-value="reasons[group.id] ?? null"
                label="schedule.reason"
                :placeholder="$t('schedule.choose_reason')"
                :static-options="reasonOptions"
                :disabled="!ready || !schedule.timelineApproved.value || schedule.busy.value"
                optional
                @update:model-value="reasons[group.id] = $event"
              >
                <template #LabelHeader
                  ><FieldHelpIcon
                    :label="$t('schedule.reason')"
                    field-name="reason"
                    :field-id="`timeline-reason-${quoteId}-${group.id}`"
                    :help-text="$t('schedule.reason_help')"
                /></template>
              </UpdatedCustomInputSelect>
            </div>
            <div class="field-group input-wrapper">
              <span class="field-help-label-row field-help-label-row--block"
                ><label class="field-label label" :for="`timeline-note-${quoteId}-${group.id}`">{{
                  $t('schedule.note')
                }}</label
                ><FieldHelpIcon
                  :label="$t('schedule.note')"
                  field-name="work_note"
                  :field-id="`timeline-note-${quoteId}-${group.id}`"
                  :help-text="$t('schedule.note_help')"
              /></span>
              <input
                :id="`timeline-note-${quoteId}-${group.id}`"
                v-model="notes[group.id]"
                class="input"
                type="text"
                :disabled="!ready || !schedule.timelineApproved.value || schedule.busy.value"
              />
            </div>
            <AppButton
              type="submit"
              :disabled="!ready || !schedule.timelineApproved.value || schedule.busy.value"
              :loading="schedule.busy.value && lastGroupId === group.id"
              :aria-label="$t('execution_updates.start_group', { title: group.title })"
              >{{ $t('execution_updates.start') }}</AppButton
            >
            <div
              v-if="lastGroupId === group.id && mutationError"
              role="alert"
              class="timeline-start-alert__mutation-error"
            >
              <p>{{ $t(mutationError.displayMessage) }}</p>
              <ul v-if="mutationError.validationErrors">
                <li
                  v-for="(message, index) in Object.values(mutationError.validationErrors).flat()"
                  :key="index"
                >
                  {{ message }}
                </li>
              </ul>
            </div>
          </form>
        </li>
      </ul>
    </section>
  </div>
</template>
<style scoped lang="scss">
  .timeline-widget {
    position: fixed;
    inset-block-end: calc(1.5rem + env(safe-area-inset-bottom));
    inset-inline-end: max(1.5rem, env(safe-area-inset-right), env(safe-area-inset-left));
    z-index: 150;
  }

  .timeline-widget__trigger {
    width: 3.25rem;
    height: 3.25rem;
    padding: 0;
    border-radius: 50%;
    box-shadow: var(--bh-shadow-popover);
  }

  .timeline-widget__trigger .pi {
    font-size: 1.25rem;
  }

  .timeline-widget__close {
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
  }

  .timeline-widget :focus-visible {
    outline: 2px solid var(--bh-focus);
    outline-offset: 3px;
  }

  .timeline-start-alert {
    position: absolute;
    inset-block-end: calc(100% + 0.75rem);
    inset-inline-end: 0;
    max-block-size: calc(100dvh - 12rem);
    overflow-y: auto;
    display: grid;
    gap: 0.85rem;
    width: min(42rem, calc(100vw - 2rem));
    box-sizing: border-box;
    padding: 1rem;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    background: var(--bh-surface);
    color: var(--bh-text);
    box-shadow: var(--bh-shadow-popover);
    animation: timeline-panel-enter 160ms ease-out;
  }

  @keyframes timeline-panel-enter {
    from {
      opacity: 0;
      transform: translateY(0.4rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-start-alert {
      animation: none;
    }
  }

  .timeline-start-alert__actions,
  .timeline-start-alert__header,
  .timeline-start-alert__group-heading,
  .timeline-start-alert__feedback {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .timeline-start-alert h2,
  .timeline-start-alert h3,
  .timeline-start-alert p {
    margin: 0;
  }

  .timeline-start-alert h2 {
    font-size: 1rem;
  }

  .timeline-start-alert h3 {
    font-size: 0.95rem;
    overflow-wrap: anywhere;
  }

  .timeline-start-alert__notice {
    color: var(--warning-dark);
  }

  .timeline-start-alert__list {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .timeline-start-alert__group {
    padding: 0.85rem;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
  }

  .timeline-start-alert__status {
    color: var(--bh-muted);
    font-size: 0.85rem;
  }

  .timeline-start-alert__status--started {
    color: var(--success-dark);
  }

  .timeline-start-alert__form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.75rem;
    align-items: end;
    margin-block-start: 0.75rem;
  }

  .timeline-start-alert__form > .app-btn {
    grid-column: 1 / -1;
    justify-self: end;
  }

  .timeline-start-alert__form .field-group {
    min-width: 0;
    margin: 0;
  }

  .timeline-start-alert__mutation-error {
    grid-column: 1 / -1;
    color: var(--danger);
  }

  .timeline-start-alert :focus-visible {
    outline: 2px solid var(--bh-focus);
    outline-offset: 3px;
  }

  @media (width <= 640px) {
    .timeline-widget {
      inset-block-end: calc(6rem + env(safe-area-inset-bottom));
      inset-inline-end: max(1rem, env(safe-area-inset-right), env(safe-area-inset-left));
    }

    .timeline-start-alert {
      padding: 0.85rem;
    }

    .timeline-start-alert__form {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
