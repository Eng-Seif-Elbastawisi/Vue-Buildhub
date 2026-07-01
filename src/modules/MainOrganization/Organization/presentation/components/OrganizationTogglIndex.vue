<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import ToggleSwitch from 'primevue/toggleswitch';
  import ShowOrganizationToggledParams from '../../core/params/show.organization.toggl.params';
  import ToggleOrganizationParams from '../../core/params/toggle.organization.params';
  import OrganizationController from '../controllers/organization.toggl.controller';

  const ACTIVE_STATUS = 1;
  const INACTIVE_STATUS = 2;
  const STORAGE_KEY = 'organizationFetchToggleStatus';

  const controller = OrganizationController.getInstance();
  const selectedStatus = ref(ACTIVE_STATUS);
  const initialized = ref(false);
  const saving = ref(false);
  const statusKey = ref('');

  const isBrowser = () => typeof window !== 'undefined';
  const normalizeStatus = (status: unknown) => {
    if (status === true) return INACTIVE_STATUS;
    if (status === false) return ACTIVE_STATUS;

    return Number(status) === INACTIVE_STATUS ? INACTIVE_STATUS : ACTIVE_STATUS;
  };

  const readStoredStatus = (): number | null => {
    if (!isBrowser()) return null;

    const storedStatus = window.localStorage.getItem(STORAGE_KEY);

    return storedStatus === null ? null : normalizeStatus(storedStatus);
  };

  const persistStatus = (status: number) => {
    if (!isBrowser()) return;

    window.localStorage.setItem(STORAGE_KEY, String(normalizeStatus(status)));
  };

  const setSelectedStatus = (status: unknown) => {
    selectedStatus.value = normalizeStatus(status);
    persistStatus(selectedStatus.value);
  };

  const statusFromSwitch = (status: unknown) => {
    if (status === INACTIVE_STATUS) return INACTIVE_STATUS;
    if (status === ACTIVE_STATUS) return ACTIVE_STATUS;

    return status ? ACTIVE_STATUS : INACTIVE_STATUS;
  };

  // const setting = computed(() => controller.itemData.value);
  const isActive = computed(() => selectedStatus.value === ACTIVE_STATUS);
  const isBusy = computed(() => !initialized.value || saving.value);
  const statusLabelKey = computed(() =>
    isActive.value ? 'organization_toggle.active' : 'organization_toggle.inactive',
  );

  selectedStatus.value = readStoredStatus() ?? ACTIVE_STATUS;

  const loadSetting = async () => {
    initialized.value = false;
    statusKey.value = '';

    const storedStatus = readStoredStatus();
    if (storedStatus !== null) {
      selectedStatus.value = storedStatus;
    }

    const result = await controller.showSetting(new ShowOrganizationToggledParams());

    if (result instanceof DataSuccess && storedStatus === null) {
      setSelectedStatus(result.data?.toggle_status);
    }

    initialized.value = true;
  };

  const handleToggle = async (nextStatus: boolean | number) => {
    if (saving.value) return;

    const previousStatus = selectedStatus.value;
    const selectedValue = statusFromSwitch(nextStatus);
    setSelectedStatus(selectedValue);
    saving.value = true;
    statusKey.value = '';

    try {
      const result = await controller.toggleSetting(
        new ToggleOrganizationParams({ toggle_status: selectedValue }),
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
    } finally {
      saving.value = false;
    }
  };

  onMounted(loadSetting);
</script>

<template>
  <main class="organization-toggle-page">
    <!-- <header class="toggle-hero">
      <div>
        <p class="eyebrow">{{ $t('organization_toggle.page_label') }}</p>
        <h1>{{ $t('organization_toggle.title') }}</h1>
        <p>{{ $t('organization_toggle.description') }}</p>
      </div>
    </header> -->

    <section class="toggle-card" :aria-busy="isBusy">
      <div class="toggle-copy">
        <span class="toggle-chip">{{ $t(statusLabelKey) }}</span>
        <h2>{{ $t('show organization ') }}</h2>
        <!-- <p>{{ $t('organization_toggle.card_description') }}</p> -->
      </div>

      <div class="toggle-control">
        <ToggleSwitch
          input-id="organization-fetch-toggle"
          :model-value="isActive"
          :disabled="isBusy"
          @update:model-value="handleToggle"
        />

        <!-- <label for="organization-fetch-toggle">
          {{ isActive ? $t('organization_toggle.on_label') : $t('organization_toggle.off_label') }}
        </label> -->
      </div>
      <p>{{ $t('if you choose is active it will show the system owner') }}</p>
    </section>
  </main>
</template>

<style scoped lang="scss">
  @use '../styles/organization_toggle_imports';
</style>
