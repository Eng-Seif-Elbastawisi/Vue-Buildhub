<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import { ConvertStatus } from '../../core/constants/convert.status.enum';
  import ShowProjectHistoryParams from '../../core/params/show.project.history.params';
  import ProjectController from '../controllers/project.controller';

  const route = useRoute();
  const { t } = useI18n();
  const controller = ProjectController.getInstance();
  const emptyValue = '—';

  const projectId = computed(() => {
    const value = Number(route.params.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const historyData = computed(() => controller.historyData.value);
  const project = computed(() => historyData.value?.project ?? null);
  const histories = computed(() => historyData.value?.histories ?? []);

  const valueOrEmpty = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return emptyValue;

    return String(value);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return emptyValue;

    const [datePart] = value.split(' ');
    const date = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) return valueOrEmpty(datePart);

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (value?: string | null) => {
    if (!value) return emptyValue;

    const timePart = (value.includes(' ') ? value.split(' ')[1] : value) ?? '';
    if (!timePart) return emptyValue;

    const [hours = '0', minutes = '0'] = timePart.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getStatusMeta = (status?: number | null) => {
    switch (Number(status)) {
      case ConvertStatus.WAITING_PREVIEW:
        return {
          label: t('ProjectHistory.status.waiting_preview'),
          className: 'is-pending',
        };

      case ConvertStatus.WAITING_PREVIEW_RESULT:
        return {
          label: t('ProjectHistory.status.waiting_preview_result'),
          className: 'is-pending',
        };

      case ConvertStatus.WAITING_PRICING:
        return {
          label: t('ProjectHistory.status.waiting_pricing'),
          className: 'is-pending',
        };

      case ConvertStatus.READY_TO_SENT:
        return {
          label: t('ProjectHistory.status.ready_to_send'),
          className: 'is-ready',
        };

      case ConvertStatus.CONVERT_TO_PROJECT:
        return {
          label: t('ProjectHistory.status.converted'),
          className: 'is-converted',
        };

      case ConvertStatus.SEND_TO_CLIENT:
        return {
          label: t('ProjectHistory.status.sent_to_client'),
          className: 'is-send-client',
        };

      case ConvertStatus.REVISE_VERSION:
        return {
          label: t('ProjectHistory.status.revised'),
          className: 'is-revised',
        };

      case ConvertStatus.ACCEPT_CLIENT:
        return {
          label: t('ProjectHistory.status.accepted_client'),
          className: 'is-accepted',
        };

      case ConvertStatus.REJECT_CLIENT:
        return {
          label: t('ProjectHistory.status.rejected_client'),
          className: 'is-rejected',
        };

      default:
        return {
          label: t('unknown'),
          className: 'is-muted',
        };
    }
  };

  const fetchHistory = async () => {
    if (!projectId.value) return;

    await controller.fetchProjectStatusHistories(
      new ShowProjectHistoryParams({ projectId: projectId.value }),
    );
  };

  onMounted(() => {
    void fetchHistory();
  });
</script>

<template>
  <div class="project-details-page project-history-page">
    <DataStatusBuilder
      :controller="controller.historyState.value"
      :on-retry="
        async () => {
          await fetchHistory();
        }
      "
    >
      <template #loader>
        <section class="project-state-card">
          {{ t('loading') }}
        </section>
      </template>

      <template #failed="{ error }">
        <section class="project-state-card project-state-card--error">
          {{ error?.displayMessage || error?.title || t('no_data') }}
        </section>
      </template>

      <template #empty>
        <section class="project-state-card">
          {{ t('ProjectHistory.empty') }}
        </section>
      </template>

      <template #success>
        <header class="project-history-header">
          <RouterLink
            class="project-action-btn"
            :to="{ name: 'show-project', params: { project_id: projectId } }"
          >
            <i class="pi pi-arrow-left"></i>
            {{ t('ProjectHistory.back_to_project') }}
          </RouterLink>

          <div>
            <span class="project-history-eyebrow">{{ t('ProjectHistory.eyebrow') }}</span>
            <!-- <h1>{{ t('ProjectHistory.title') }}</h1> -->
          </div>
        </header>

        <section class="project-card project-history-summary">
          <div class="card-title">
            <i class="pi pi-folder"></i>
            <h2>{{ valueOrEmpty(project?.title) }}</h2>
          </div>

          <div class="project-history-summary__grid">
            <div class="project-history-summary__item">
              <span>{{ t('ProjectShow.project_code') }}</span>
              <strong>{{ valueOrEmpty(project?.id) }}</strong>
            </div>
            <div class="project-history-summary__item">
              <span>{{ t('ProjectShow.client') }}</span>
              <strong>{{ valueOrEmpty(project?.client?.title) }}</strong>
            </div>
            <div class="project-history-summary__item">
              <span>{{ t('ProjectShow.project_date') }}</span>
              <strong>{{ formatDate(project?.date) }}</strong>
            </div>
            <div class="project-history-summary__item">
              <span>{{ t('ProjectShow.created_at') }}</span>
              <strong
                >{{ formatDate(project?.created_at) }} ·
                {{ formatTime(project?.created_at) }}</strong
              >
            </div>
          </div>

          <p v-if="project?.description" class="project-history-summary__description">
            {{ project.description }}
          </p>
        </section>

        <section class="project-card project-history-timeline-card">
          <div class="card-title">
            <i class="pi pi-history"></i>
            <h2>{{ t('ProjectHistory.timeline_title') }}</h2>
          </div>

          <div v-if="histories.length" class="project-history-timeline">
            <article v-for="history in histories" :key="history.id" class="project-history-entry">
              <span
                class="project-history-entry__marker"
                :class="getStatusMeta(history.status).className"
              ></span>
              <div class="project-history-entry__content">
                <div class="project-history-entry__title">
                  <span
                    class="status-badge status-badge--inline bh-status"
                    :class="getStatusMeta(history.status).className"
                  >
                    {{ getStatusMeta(history.status).label }}
                  </span>
                  <small>#{{ valueOrEmpty(history.id) }}</small>
                </div>
                <p>
                  <i class="pi pi-calendar"></i>
                  {{ formatDate(history.created_at) }}
                  <span>{{ formatTime(history.created_at) }}</span>
                </p>
              </div>
            </article>
          </div>

          <div v-else class="empty-panel">
            {{ t('ProjectHistory.no_histories') }}
          </div>
        </section>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style lang="scss">
  @use '../styles/project_show';
  .project-history-summary {
    margin-bottom: 1rem;
  }
</style>
