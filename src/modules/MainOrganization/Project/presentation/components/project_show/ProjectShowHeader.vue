<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import type { ConvertStatus } from '../../../core/constants/convert.status.enum';
  import type { ProjectShowRaw, StatusMeta } from './projectShow.types';

  type StatusOption = {
    value: ConvertStatus;
    label: string;
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
    actionsLabel: string;
    exportingPdf: boolean;
    convertActionLabel?: string;
    convertActionDisabled?: boolean;
    changeStatusLabel: string;
    changeStatusModalTitle: string;
    statusLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    cancelLabel: string;
    saveStatusLabel: string;
    changingStatusLabel: string;
    changeStatusLoading?: boolean;
    statusOptions: StatusOption[];
    currentStatus: ConvertStatus;
    formatDate: (value?: string | null) => string;
    formatTime: (value?: string | null) => string;
  }>();

  const emit = defineEmits<{
    downloadPdf: [];
    convertStatusAction: [];
    changeProjectStatus: [payload: { status: ConvertStatus; notes: string }];
  }>();

  const isStatusModalOpen = ref(false);
  const isActionsMenuOpen = ref(false);
  const actionsMenuRef = ref<HTMLElement | null>(null);
  const selectedStatus = ref<ConvertStatus>(props.currentStatus);
  const notes = ref('');

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

  const openStatusModal = () => {
    selectedStatus.value = props.currentStatus;
    notes.value = '';
    isStatusModalOpen.value = true;
    closeActionsMenu();
  };

  const closeStatusModal = () => {
    if (props.changeStatusLoading) return;

    isStatusModalOpen.value = false;
  };

  const submitStatusChange = () => {
    emit('changeProjectStatus', {
      status: selectedStatus.value,
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
          <span><i class="pi pi-id-card"></i>{{ projectCodeLabel }}: {{ project.id }}</span>
          <span><i class="pi pi-calendar"></i>{{ formatDate(project.date) }}</span>
          <span
            ><i class="pi pi-clock"></i>{{ createdAtLabel }}
            {{ formatTime(project.created_at) }}</span
          >
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
            class="project-actions__item"
            type="button"
            role="menuitem"
            :disabled="changeStatusLoading"
            @click="openStatusModal"
          >
            <i class="pi pi-flag"></i>
            {{ changeStatusLabel }}
          </button>

          <RouterLink
            class="project-actions__item"
            role="menuitem"
            :to="{ name: 'project-history', params: { project_id: project.id } }"
            @click="closeActionsMenu"
          >
            <i class="pi pi-history"></i>
            {{ historyLabel }}
          </RouterLink>

          <RouterLink
            class="project-actions__item project-actions__item--primary"
            role="menuitem"
            :to="{ name: 'edit-project', params: { project_id: project.id } }"
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
          <!-- <label class="project-status-field project-status-field--full">
            <span>{{ statusLabel }}</span>
            <select v-model.number="selectedStatus" required>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label> -->

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
  </header>
</template>
