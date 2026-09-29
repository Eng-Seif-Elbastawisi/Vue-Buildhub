<script setup lang="ts">
  import { computed, defineAsyncComponent, nextTick, ref, watch } from 'vue';
  import Popover from 'primevue/popover';

  import { ConvertStatus } from '../../../core/constants/convert.status.enum';
  import ProjectHeroBreadcrumb from './ProjectHeroBreadcrumb.vue';
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

  interface ActionsPopoverRef {
    toggle: (event: Event) => void;
    hide: () => void;
  }
  const props = defineProps<{
    project: ProjectShowRaw;
    projectTitle: string;
    projectTypeLabel: string;
    imageSource: string;
    fallbackImageSource: string;
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
    hasAutoInvoices?: boolean;
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
  const actionsPopoverRef = ref<ActionsPopoverRef | null>(null);
  const actionsMenuPanelRef = ref<HTMLElement | null>(null);
  const actionsTriggerRef = ref<HTMLButtonElement | null>(null);
  const activeStatusTarget = ref<ConvertStatus | null>(null);
  const notes = ref('');

  const canEditProject = computed(() => {
    const projectStatus = Number(props.project.status);

    return (
      projectStatus === ConvertStatus.WAITING_PREVIEW ||
      projectStatus === ConvertStatus.REVISE_VERSION
    );
  });

  const canManagePricePercentage = computed(() => {
    const projectStatus = Number(props.project.convert_status ?? props.project.status);

    return projectStatus === ConvertStatus.READY_TO_SENT;
  });

  const closeActionsMenu = () => {
    actionsPopoverRef.value?.hide();
  };

  const getEnabledMenuItems = () => {
    return Array.from(
      actionsMenuPanelRef.value?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    );
  };

  const focusFirstAction = async () => {
    await nextTick();
    getEnabledMenuItems()[0]?.focus();
  };

  const handleActionsMenuShow = () => {
    isActionsMenuOpen.value = true;
    void focusFirstAction();
  };

  const handleActionsMenuHide = () => {
    isActionsMenuOpen.value = false;
  };

  const toggleActionsMenu = (event: MouseEvent) => {
    actionsPopoverRef.value?.toggle(event);
  };

  const openActionsMenu = async (event: KeyboardEvent) => {
    if (!isActionsMenuOpen.value) {
      actionsPopoverRef.value?.toggle(event);
      await nextTick();
    }

    await focusFirstAction();
  };

  const closeActionsMenuAndRestoreFocus = () => {
    closeActionsMenu();
    actionsTriggerRef.value?.focus();
  };

  const moveMenuFocus = (offset: number) => {
    const menuItems = getEnabledMenuItems();
    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + offset + menuItems.length) % menuItems.length;

    menuItems[nextIndex]?.focus();
  };

  const navigateActionsMenu = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeActionsMenuAndRestoreFocus();
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();

    const menuItems = getEnabledMenuItems();
    if (event.key === 'Home') menuItems[0]?.focus();
    else if (event.key === 'End') menuItems[menuItems.length - 1]?.focus();
    else moveMenuFocus(event.key === 'ArrowDown' ? 1 : -1);
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

  const useFallbackHeroImage = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement;

    if (image.dataset.fallbackApplied === 'true') return;

    image.dataset.fallbackApplied = 'true';
    image.src = props.fallbackImageSource;
  };

  watch(
    () => props.changeStatusLoading,
    (isLoading, wasLoading) => {
      if (!isLoading && wasLoading) {
        isStatusModalOpen.value = false;
      }
    },
  );
</script>

<template>
  <header class="project-hero">
    <img
      :key="imageSource"
      class="project-hero__background"
      :src="imageSource"
      :alt="projectTitle"
      decoding="async"
      fetchpriority="high"
      @error="useFallbackHeroImage"
    />
    <div class="project-hero__overlay" aria-hidden="true"></div>

    <div class="project-hero__inner">
      <ProjectHeroBreadcrumb :current-label="projectTitle" />

      <div class="project-hero__body">
        <div class="project-hero__content">
          <span v-if="projectTypeLabel" class="project-type-badge">
            {{ projectTypeLabel }}
          </span>

          <div class="project-title-row">
            <h1>{{ projectTitle }}</h1>

            <span class="status-badge" :class="statusMeta.className">
              {{ statusMeta.label }}
            </span>
          </div>

          <div class="project-meta-row">
            <span>
              <i class="pi pi-qrcode"></i>
              {{ projectCodeLabel }}: {{ project.id }}
            </span>

            <span>
              <i class="pi pi-calendar-clock"></i>
              {{ formatDate(project.date) }}
            </span>

            <span>
              <i class="pi pi-clock"></i>
              {{ createdAtLabel }}
              {{ formatTime(project.created_at) }}
            </span>
          </div>
        </div>

        <div class="project-actions">
          <button
            ref="actionsTriggerRef"
            class="project-action-btn project-actions__trigger"
            type="button"
            aria-haspopup="menu"
            aria-controls="project-actions-menu"
            :aria-expanded="isActionsMenuOpen"
            @click.stop="toggleActionsMenu"
            @keydown.down.prevent="openActionsMenu"
          >
            <i class="pi pi-sparkles" aria-hidden="true"></i>
            {{ actionsLabel }}
            <i class="pi pi-chevron-down project-actions__chevron" aria-hidden="true"></i>
          </button>

          <Popover
            ref="actionsPopoverRef"
            class="project-actions-popover"
            @show="handleActionsMenuShow"
            @hide="handleActionsMenuHide"
          >
            <div
              id="project-actions-menu"
              ref="actionsMenuPanelRef"
              class="project-actions__menu"
              role="menu"
              @keydown="navigateActionsMenu"
            >
              <button
                class="project-actions__item"
                type="button"
                role="menuitem"
                :disabled="exportingPdf"
                @click="triggerDownloadPdf"
              >
                <i class="pi pi-file-pdf"></i>

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
                <i class="pi pi-replay"></i>
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
                <i class="pi pi-flag-fill"></i>
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
                v-if="canManagePricePercentage && !props.hasAutoInvoices"
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
                v-if="props.hasAutoInvoices"
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
                <i class="pi pi-verified"></i>
                {{ addInvoiceActionLabel }}
              </RouterLink>

              <button
                v-if="props.hasAutoInvoices"
                class="project-actions__item project-actions__item--neutral project-actions__auto-invoices"
                type="button"
                role="menuitem"
                @click="openAutoInvoicesModal"
              >
                <i class="pi pi-list-check"></i>
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
                <i class="pi pi-pen-to-square"></i>
                {{ editProjectLabel }}
              </RouterLink>
            </div>
          </Popover>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isStatusModalOpen"
        class="project-status-modal"
        role="dialog"
        aria-modal="true"
      >
        <div class="project-status-modal__backdrop" @click="closeStatusModal"></div>

        <form class="project-status-modal__panel" @submit.prevent="submitStatusChange">
          <header class="project-status-modal__header">
            <h2>{{ changeStatusModalTitle }}</h2>

            <button
              class="project-status-modal__close"
              type="button"
              :aria-label="cancelLabel"
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
    </Teleport>

    <AutoInvoicesModal
      v-if="isAutoInvoicesModalOpen"
      :project-id="Number(project.id)"
      @close="closeAutoInvoicesModal"
    />
  </header>
</template>
