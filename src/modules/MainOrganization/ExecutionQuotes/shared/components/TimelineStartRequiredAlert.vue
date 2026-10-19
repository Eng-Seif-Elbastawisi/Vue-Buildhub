<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import Dialog from 'primevue/dialog';
  import { useI18n } from 'vue-i18n';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataSuccess,
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleGroupModel from '../../Schedule/core/models/schedule.group.model';
  import ScheduleController from '../../Schedule/presentation/controllers/schedule.controller';
  import ScheduleOwnerParams from '../../Schedule/core/params/schedule.owner.params';
  import ScheduleWorkStatusDialog from '../../Schedule/presentation/components/ScheduleWorkStatusDialog.vue';
  import { schedulePath } from '../../Schedule/presentation/schedule.routes';
  import { TimelineWorkStatus } from '../../Schedule/core/constants/timeline.status';

  const props = defineProps<{ quoteId: number; state: DataState<ScheduleGroupModel[]> }>();
  const emit = defineEmits<{ refresh: [] }>();
  const route = useRoute();
  const { t } = useI18n();
  const schedule = ScheduleController.getInstance();
  const choosing = ref(false);
  const selected = ref<TitleInterface<string | number> | TitleInterface<string | number>[] | null>(
    null,
  );
  const starting = ref(false);
  const empty = computed(
    () =>
      props.state instanceof DataSuccess &&
      !props.state.data?.some(
        (group: ScheduleGroupModel) => group.workStatus === TimelineWorkStatus.START,
      ),
  );
  const loading = computed(
    () =>
      schedule.listState.value instanceof DataLoading ||
      schedule.ownerState.value instanceof DataLoading,
  );
  const failed = computed(
    () => schedule.listState.value.hasError || schedule.ownerState.value.hasError,
  );
  const groups = computed(() =>
    (schedule.listState.value.data ?? []).filter(
      (group) => group.workStatus !== TimelineWorkStatus.START,
    ),
  );
  const options = computed(() =>
    groups.value.map((group) => new TitleInterface({ id: group.id, title: group.title })),
  );
  const group = computed(() => {
    const selection = selected.value;
    return !Array.isArray(selection)
      ? (schedule.listState.value.data ?? []).find((entry) => entry.id === selection?.id)
      : undefined;
  });
  const noGroups = computed(
    () => schedule.listState.value instanceof DataSuccess && !schedule.listState.value.data?.length,
  );
  async function loadSchedule() {
    if (!empty.value || !Number.isSafeInteger(props.quoteId) || props.quoteId <= 0) return;
    schedule.activate(props.quoteId);
    const quoteId = props.quoteId;
    await Promise.all([schedule.readOwner(), schedule.readOverview(quoteId, true)]);
    if (quoteId === props.quoteId && empty.value)
      await schedule.fetchList(new ScheduleOwnerParams(quoteId));
  }
  watch(
    [() => props.quoteId, empty],
    () => {
      choosing.value = false;
      starting.value = false;
      selected.value = null;
      if (empty.value) void loadSchedule();
    },
    { immediate: true },
  );
  function refreshed() {
    starting.value = false;
    choosing.value = false;
    emit('refresh');
  }
  function refresh() {
    emit('refresh');
  }
  onMounted(() => window.addEventListener('focus', refresh));
  onBeforeUnmount(() => window.removeEventListener('focus', refresh));
</script>
<template>
  <div v-if="empty || state.hasError" class="timeline-alert-space" aria-hidden="true" />
  <Teleport to="body">
    <aside
      v-if="empty || state.hasError"
      class="timeline-start-alert"
      :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
      role="status"
      aria-live="polite"
    >
      <i class="pi pi-exclamation-triangle" aria-hidden="true" />
      <div>
        <h2>
          {{ $t(state.hasError ? 'work_items.stages_error' : 'execution_updates.no_active') }}
        </h2>
        <p v-if="state.hasError">{{ $t(state.error!.displayMessage) }}</p>
        <p v-else>
          {{
            $t(
              noGroups
                ? 'execution_updates.create_schedule'
                : !loading && !failed && !schedule.timelineApproved.value
                  ? 'execution_updates.approval_required'
                  : 'execution_updates.start_help',
            )
          }}
        </p>
        <AppButton v-if="state.hasError" type="button" @click="emit('refresh')">{{
          $t('work_items.retry')
        }}</AppButton>
        <template v-else-if="failed">
          <p role="alert">
            {{
              $t(
                schedule.listState.value.error?.displayMessage ??
                  schedule.ownerState.value.error?.displayMessage ??
                  'schedule.load_error',
              )
            }}
          </p>
          <AppButton type="button" @click="loadSchedule">{{ $t('work_items.retry') }}</AppButton>
        </template>
        <RouterLink
          v-else-if="!loading && (noGroups || !schedule.timelineApproved.value)"
          class="btn btn-primary"
          :to="schedulePath(route.path, quoteId)"
          >{{ $t('schedule.title') }}</RouterLink
        >
        <AppButton v-else type="button" :disabled="loading" @click="choosing = true">{{
          $t('execution_updates.start')
        }}</AppButton>
      </div>
    </aside>
  </Teleport>
  <Dialog
    :visible="choosing && !starting"
    modal
    class="workspace-dialog"
    :header="$t('execution_updates.start')"
    @update:visible="choosing = $event"
  >
    <div class="field-group">
      <UpdatedCustomInputSelect
        id="execution-start-group"
        v-model="selected"
        label="schedule.title"
        :placeholder="t('execution_updates.select_group')"
        :static-options="options"
        required
        ><template #LabelHeader
          ><FieldHelpIcon
            :label="$t('schedule.title')"
            field-name="timeline_group"
            field-id="execution-start-group"
            :help-text="$t('execution_updates.start_help')" /></template
      ></UpdatedCustomInputSelect>
    </div>
    <AppButton
      type="button"
      :disabled="!group || !schedule.timelineApproved.value"
      @click="starting = true"
      >{{ $t('execution_updates.start') }}</AppButton
    >
  </Dialog>
  <ScheduleWorkStatusDialog
    v-if="starting && group"
    :group="group"
    start-only
    @close="starting = false"
    @saved="refreshed"
  />
</template>
<style scoped lang="scss">
  .timeline-start-alert {
    position: fixed;
    inset-inline-end: max(1.25rem, env(safe-area-inset-right));
    inset-block-end: max(1.25rem, env(safe-area-inset-bottom));
    z-index: 900;
    display: flex;
    gap: 0.85rem;
    width: min(24rem, calc(100vw - 2.5rem));
    padding: 1rem;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    background: var(--bh-surface);
    color: var(--bh-text);
    box-shadow: 0 8px 28px var(--black-alpha-15);
    animation: timeline-alert-enter 160ms ease-out;
  }

  .timeline-start-alert h2 {
    margin: 0;
    font-size: 1rem;
  }

  .timeline-start-alert p {
    margin-block: 0.5rem 0.85rem;
  }

  .timeline-start-alert i {
    color: var(--warning);
  }

  .timeline-start-alert :focus-visible {
    outline: 2px solid var(--bh-focus);
    outline-offset: 3px;
  }

  .timeline-alert-space {
    min-block-size: 12rem;
  }

  @keyframes timeline-alert-enter {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (width <= 640px) {
    .timeline-start-alert {
      inset-inline: max(1rem, env(safe-area-inset-left), env(safe-area-inset-right));
      inset-block-end: calc(6rem + env(safe-area-inset-bottom));
      width: auto;
      max-block-size: 45dvh;
      overflow-y: auto;
    }

    .timeline-alert-space {
      min-block-size: 18rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-start-alert {
      animation: none;
    }
  }
</style>
