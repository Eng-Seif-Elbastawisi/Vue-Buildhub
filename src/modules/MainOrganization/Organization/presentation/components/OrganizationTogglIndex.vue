<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import ToggleSwitch from 'primevue/toggleswitch';

  import ShowOrganizationToggledParams from '../../core/params/show.organization.toggl.params';
  import ToggleOrganizationParams from '../../core/params/toggle.organization.params';
  import OrganizationController from '../controllers/organization.toggl.controller';

  const ACTIVE_STATUS = 2;
  const INACTIVE_STATUS = 1;
  const STORAGE_KEY = 'organizationFetchToggleStatus';

  const controller = OrganizationController.getInstance();

  const selectedStatus = ref(ACTIVE_STATUS);
  const initialized = ref(false);
  const saving = ref(false);
  const statusKey = ref('');

  const isBrowser = () => typeof window !== 'undefined';

  const normalizeStatus = (status: unknown): number => {
    if (status === true) return ACTIVE_STATUS;
    if (status === false) return INACTIVE_STATUS;

    return Number(status) === INACTIVE_STATUS ? INACTIVE_STATUS : ACTIVE_STATUS;
  };

  const readStoredStatus = (): number | null => {
    if (!isBrowser()) return null;

    const storedStatus = window.localStorage.getItem(STORAGE_KEY);

    return storedStatus === null ? null : normalizeStatus(storedStatus);
  };

  const persistStatus = (status: number): void => {
    if (!isBrowser()) return;

    window.localStorage.setItem(STORAGE_KEY, String(normalizeStatus(status)));
  };

  const setSelectedStatus = (status: unknown): void => {
    selectedStatus.value = normalizeStatus(status);
    persistStatus(selectedStatus.value);
  };

  const statusFromSwitch = (status: unknown): number => {
    if (status === INACTIVE_STATUS) return INACTIVE_STATUS;
    if (status === ACTIVE_STATUS) return ACTIVE_STATUS;

    return status ? ACTIVE_STATUS : INACTIVE_STATUS;
  };

  const isActive = computed(() => selectedStatus.value === ACTIVE_STATUS);

  const isBusy = computed(() => !initialized.value || saving.value);

  /**
   * يكون الـ Toggle معطلاً أثناء التحميل أو الحفظ،
   * وكذلك عندما تكون الحالة Active.
   */
  const isToggleDisabled = computed(() => isBusy.value || isActive.value);

  const statusLabelKey = computed(() =>
    isActive.value ? 'organization_toggle.active' : 'organization_toggle.inactive',
  );

  selectedStatus.value = readStoredStatus() ?? ACTIVE_STATUS;

  const loadSetting = async (): Promise<void> => {
    initialized.value = false;
    statusKey.value = '';

    const storedStatus = readStoredStatus();

    if (storedStatus !== null) {
      selectedStatus.value = storedStatus;
    }

    try {
      const result = await controller.showSetting(new ShowOrganizationToggledParams());

      if (result instanceof DataSuccess && storedStatus === null) {
        setSelectedStatus(result.data?.toggle_status);
      }
    } finally {
      initialized.value = true;
    }
  };

  const handleToggle = async (nextStatus: boolean | number): Promise<void> => {
    if (saving.value || isActive.value) return;

    const previousStatus = selectedStatus.value;
    const selectedValue = statusFromSwitch(nextStatus);

    setSelectedStatus(selectedValue);

    saving.value = true;
    statusKey.value = '';

    try {
      const result = await controller.toggleSetting(
        new ToggleOrganizationParams({
          toggle_status: selectedValue,
        }),
      );

      if (result instanceof DataSuccess) {
        setSelectedStatus(selectedValue);

        statusKey.value =
          selectedValue === ACTIVE_STATUS
            ? 'organization_toggle.saved_enabled'
            : 'organization_toggle.saved_disabled';

        return;
      }

      setSelectedStatus(previousStatus);
    } catch {
      setSelectedStatus(previousStatus);
    } finally {
      saving.value = false;
    }
  };

  onMounted(loadSetting);
</script>

<template>
  <main class="organization-toggle-page">
    <section class="toggle-card" :aria-busy="isBusy">
      <div class="toggle-copy">
        <span class="toggle-chip">
          {{ $t(statusLabelKey) }}
        </span>

        <h2>
          {{ $t('show organization') }}
        </h2>
      </div>

      <div class="toggle-control">
        <ToggleSwitch
          input-id="organization-fetch-toggle"
          :model-value="isActive"
          :disabled="isToggleDisabled"
          @update:model-value="handleToggle"
        />
      </div>

      <p>
        {{ $t('if you choose is active it will show the system owner') }}
      </p>
    </section>
  </main>
</template>

<style scoped lang="scss">
  @use '../styles/organization_toggle_imports';
</style>
