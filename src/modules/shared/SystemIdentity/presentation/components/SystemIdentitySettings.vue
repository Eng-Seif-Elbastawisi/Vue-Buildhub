<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { useRoute } from 'vue-router';
  import ShowSystemIdentityParams from '../../core/params/show.system.identity.params';
  import type StoreSystemIdentityParams from '../../core/params/store.system.identity.params';
  import SystemIdentityController from '../controllers/system.identity.controller';
  import { useSystemIdentityTheme } from '../composables/useSystemIdentityTheme';
  import SystemIdentityForm from './SystemIdentityForm.vue';

  const controller = SystemIdentityController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<StoreSystemIdentityParams | null>(null);
  const loading = ref(false);
  const statusKey = ref('');
  const { applyPalette, currentPalette } = useSystemIdentityTheme();

  const identity = computed(() => controller.itemData.value ?? undefined);

  const updateData = (updatedParams: StoreSystemIdentityParams) => {
    params.value = updatedParams;
  };

  const saveSetting = async () => {
    if (!params.value) return;

    loading.value = true;
    statusKey.value = '';

    try {
      const result = await controller.storeSetting(params.value);

      if (result instanceof DataSuccess) {
        applyPalette({
          name: params.value.name,
          primary: params.value.primary_color,
          secondary: params.value.secondary_color,
          accent: params.value.accent_color,
          logo: result.data?.logo || params.value.logo || currentPalette.value.logo,
        });
        statusKey.value = 'system_identity.identity_applied';
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.showSetting(new ShowSystemIdentityParams());
  });
</script>

<template>
  <main class="system-identity-settings">
    <header class="settings-header">
      <div>
        <p class="eyebrow">{{ $t('system_identity.page_label') }}</p>
        <h1>{{ $t('system_identity.title') }}</h1>
        <p>{{ $t('system_identity.description') }}</p>
      </div>
    </header>

    <p v-if="statusKey" class="identity-status" role="status">
      {{ $t(statusKey) }}
    </p>

    <SystemIdentityForm
      :identity="identity"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="settings-actions" :class="{ disabled: loading }">
      <button
        class="identity-save-button"
        :class="{ 'btn--loading': loading }"
        type="button"
        :disabled="loading"
        @click="saveSetting"
      >
        {{ $t('system_identity.save') }}
      </button>
    </div>

    <p v-if="controller.errorMessage.value" class="identity-error">
      {{ controller.errorMessage.value }}
    </p>
  </main>
</template>

<style scoped lang="scss">
.system-identity-settings {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

.settings-header {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
  background: var(--BgWhite);
  box-shadow: none;

  h1,
  p {
    margin: 0;
  }

  h1 {
    margin: 0.25rem 0;
    color: var(--gray-900);
    font-size: 1.75rem;
    font-weight: 800;
  }

  p:not(.eyebrow) {
    color: var(--gray-500);
  }
}

.eyebrow {
  color: var(--PrimaryColor);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.identity-status,
.identity-error {
  margin: 0;
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  font-weight: 700;
}

.identity-status {
  border: 1px solid var(--PrimaryColor-alpha-20);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.identity-error {
  border: 1px solid var(--danger);
  background: var(--danger-light);
  color: var(--danger-dark);
}

.settings-actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}

.identity-save-button {
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--button-primary-bg, var(--PrimaryColor));
  border-radius: var(--radius-sm);
  background: var(--button-primary-bg, var(--PrimaryColor));
  color: var(--button-primary-color, var(--BgWhite));
  font-weight: 800;
  cursor: pointer;
}
</style>
