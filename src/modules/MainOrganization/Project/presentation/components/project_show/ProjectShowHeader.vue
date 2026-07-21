<script setup lang="ts">
  import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  import { ConvertStatus } from '../../../core/constants/convert.status.enum';
  import type { ProjectShowRaw, StatusMeta } from './projectShow.types';

  const AutoInvoicesModal = defineAsyncComponent(
    () =>
      import('@/modules/MainOrganization/Invoice/presentation/components/AutoInvoicesModal.vue'),
  );

  type StatusAction = {
    status: ConvertStatus;
    label: string;
    tone: 'success' | 'danger' | 'warning' | 'info';
  };

  const props = defineProps<{
    project: ProjectShowRaw;
    projectTitle: string;
    statusMeta: StatusMeta;
    projectCodeLabel: string;
    createdAtLabel: string;
    downloadPdfLabel: string;
    generatingPdfLabel: string;
    editProjectLabel: string;
    historyLabel: string;
    pricePercentageLabel: string;
    addInvoiceActionLabel: string;
    autoInvoicesLabel: string;
    actionsLabel: string;
    exportingPdf: boolean;
    convertActionLabel?: string;
    convertActionDisabled?: boolean;
    statusActions: StatusAction[];
    changeStatusModalTitle: string;
    notesLabel: string;
    notesPlaceholder: string;
    cancelLabel: string;
    saveStatusLabel: string;
    changingStatusLabel: string;
    changeStatusLoading?: boolean;
    formatDate: (value?: string | null) => string;
    formatTime: (value?: string | null) => string;
  }>();

  const emit = defineEmits<{
    downloadPdf: [];
    convertStatusAction: [];
    changeProjectStatus: [payload: { status: ConvertStatus; notes: string }];
  }>();

  const isStatusModalOpen = ref(false);
  const isAutoInvoicesModalOpen = ref(false);
  const isActionsMenuOpen = ref(false);
  const actionsMenuRef = ref<HTMLElement | null>(null);
  const activeStatusTarget = ref<ConvertStatus | null>(null);
  const notes = ref('');

  const canEditProject = computed(() => {
    const projectStatus = Number(props.project.status);

    return [
      ConvertStatus.WAITING_PREVIEW,
      ConvertStatus.WAITING_PREVIEW_RESULT,
      ConvertStatus.REVISE_VERSION,
    ].includes(projectStatus as ConvertStatus);
  });

  const canManagePricePercentage = computed(() => {
    const projectStatus = Number(props.project.convert_status ?? props.project.status);

    return projectStatus === ConvertStatus.READY_TO_SENT;
  });

  const closeActionsMenu = () => {
    isActionsMenuOpen.value = false;
  };

  const toggleActionsMenu = () => {
    isActionsMenuOpen.value = !isActionsMenuOpen.value;
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (!actionsMenuRef.value?.contains(event.target as Node)) {
      closeActionsMenu();
    }
  };

  const triggerDownloadPdf = () => {
    emit('downloadPdf');
    closeActionsMenu();
  };

  const triggerConvertStatusAction = () => {
    emit('convertStatusAction');
    closeActionsMenu();
  };

  const openStatusModal = (status: ConvertStatus) => {
    activeStatusTarget.value = status;
    notes.value = '';
    isStatusModalOpen.value = true;
    closeActionsMenu();
  };

  const closeStatusModal = () => {
    if (props.changeStatusLoading) return;

    isStatusModalOpen.value = false;
  };

  const openAutoInvoicesModal = () => {
    isAutoInvoicesModalOpen.value = true;
    closeActionsMenu();
  };

  const closeAutoInvoicesModal = () => {
    isAutoInvoicesModalOpen.value = false;
  };

  const submitStatusChange = () => {
    if (activeStatusTarget.value === null) return;

    emit('changeProjectStatus', {
      status: activeStatusTarget.value,
      notes: notes.value,
    });
  };

  watch(
    () => props.changeStatusLoading,
    (isLoading, wasLoading) => {
      if (!isLoading && wasLoading) {
        isStatusModalOpen.value = false;
      }
    },
  );

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
  });
</script>

<template>
  <header class="project-hero">
    <div class="project-hero__body">
      <div class="project-hero__content">
        <div class="project-title-row">
          <h1>{{ projectTitle }}</h1>

          <span class="status-badge" :class="statusMeta.className">
            {{ statusMeta.label }}
          </span>
        </div>

        <div class="project-meta-row">
          <span>
            <i class="pi pi-id-card"></i>
            {{ projectCodeLabel }}: {{ project.id }}
          </span>

          <span>
            <i class="pi pi-calendar"></i>
            {{ formatDate(project.date) }}
          </span>

          <span>
            <i class="pi pi-clock"></i>
            {{ createdAtLabel }}
            {{ formatTime(project.created_at) }}
          </span>
        </div>
      </div>

      <div ref="actionsMenuRef" class="project-actions" @keydown.esc="closeActionsMenu">
        <button
          class="project-action-btn project-actions__trigger"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="isActionsMenuOpen"
          @click.stop="toggleActionsMenu"
        >
          <i class="pi pi-ellipsis-v"></i>
          {{ actionsLabel }}
        </button>

        <div v-if="isActionsMenuOpen" class="project-actions__menu" role="menu">
          <button
            class="project-actions__item"
            type="button"
            role="menuitem"
            :disabled="exportingPdf"
            @click="triggerDownloadPdf"
          >
            <i class="pi pi-download"></i>

            {{ exportingPdf ? generatingPdfLabel : downloadPdfLabel }}
          </button>

          <button
            v-if="convertActionLabel"
            class="project-actions__item project-actions__item--primary"
            type="button"
            role="menuitem"
            :disabled="convertActionDisabled"
            @click="triggerConvertStatusAction"
          >
            <i class="pi pi-sync"></i>
            {{ convertActionLabel }}
          </button>

          <button
            v-for="statusAction in statusActions"
            :key="statusAction.status"
            class="project-actions__item"
            :class="`project-actions__item--${statusAction.tone}`"
            type="button"
            role="menuitem"
            :disabled="changeStatusLoading"
            @click="openStatusModal(statusAction.status)"
          >
            <i class="pi pi-flag"></i>
            {{ statusAction.label }}
          </button>

          <RouterLink
            class="project-actions__item project-actions__item--neutral"
            role="menuitem"
            :to="{
              name: 'project-history',
              params: {
                project_id: project.id,
              },
            }"
            @click="closeActionsMenu"
          >
            <i class="pi pi-history"></i>
            {{ historyLabel }}
          </RouterLink>

          <RouterLink
            v-if="canManagePricePercentage"
            class="project-actions__item project-actions__item--neutral"
            role="menuitem"
            :to="{
              name: 'project-price-percentage',
              params: {
                project_id: project.id,
              },
            }"
            @click="closeActionsMenu"
          >
            <i class="pi pi-percentage"></i>
            {{ pricePercentageLabel }}
          </RouterLink>

          <RouterLink
            class="project-actions__item project-actions__item--neutral"
            role="menuitem"
            :to="{
              name: 'project-invoice-action-add',
              params: {
                project_id: project.id,
              },
            }"
            @click="closeActionsMenu"
          >
            <i class="pi pi-check-square"></i>
            {{ addInvoiceActionLabel }}
          </RouterLink>

          <button
            class="project-actions__item project-actions__item--neutral project-actions__auto-invoices"
            type="button"
            role="menuitem"
            @click="openAutoInvoicesModal"
          >
            <i class="pi pi-list"></i>
            {{ autoInvoicesLabel }}
          </button>

          <RouterLink
            v-if="canEditProject"
            class="project-actions__item project-actions__item--primary project-actions__item--neutral"
            role="menuitem"
            :to="{
              name: 'edit-project',
              params: {
                project_id: project.id,
              },
            }"
            @click="closeActionsMenu"
          >
            <i class="pi pi-pencil"></i>
            {{ editProjectLabel }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="isStatusModalOpen" class="project-status-modal" role="dialog" aria-modal="true">
      <div class="project-status-modal__backdrop" @click="closeStatusModal"></div>

      <form class="project-status-modal__panel" @submit.prevent="submitStatusChange">
        <header class="project-status-modal__header">
          <h2>{{ changeStatusModalTitle }}</h2>

          <button
            class="project-status-modal__close"
            type="button"
            :disabled="changeStatusLoading"
            @click="closeStatusModal"
          >
            <i class="pi pi-times"></i>
          </button>
        </header>

        <div class="project-status-modal__grid">
          <label class="project-status-field project-status-field--full">
            <span>{{ notesLabel }}</span>

            <textarea v-model="notes" :placeholder="notesPlaceholder" rows="4"></textarea>
          </label>
        </div>

        <footer class="project-status-modal__actions">
          <button
            class="project-action-btn"
            type="button"
            :disabled="changeStatusLoading"
            @click="closeStatusModal"
          >
            {{ cancelLabel }}
          </button>

          <button
            class="project-action-btn project-action-btn--primary"
            type="submit"
            :disabled="changeStatusLoading"
          >
            {{ changeStatusLoading ? changingStatusLabel : saveStatusLabel }}
          </button>
        </footer>
      </form>
    </div>

    <AutoInvoicesModal
      v-if="isAutoInvoicesModalOpen"
      :project-id="Number(project.id)"
      @close="closeAutoInvoicesModal"
    />
  </header>
</template>
