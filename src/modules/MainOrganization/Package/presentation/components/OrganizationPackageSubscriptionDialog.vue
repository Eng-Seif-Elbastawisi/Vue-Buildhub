<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import type OrganizationPackageModel from '../../core/models/organization.package.model';
  import { getDurationLabelKey } from '../composables/useOrganizationPackages';

  const props = defineProps<{
    modelValue: boolean;
    packageOffer: OrganizationPackageModel | null;
    loading: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [visible: boolean];
    confirm: [];
  }>();

  const { t } = useI18n();

  const durationLabel = computed(() => {
    if (!props.packageOffer) {
      return '-';
    }

    return t(getDurationLabelKey(props.packageOffer.duration_type, props.packageOffer.duration), {
      count: props.packageOffer.duration,
    });
  });

  const updateVisibility = (visible: boolean): void => {
    if (!props.loading) {
      emit('update:modelValue', visible);
    }
  };
</script>

<template>
  <Dialog
    :visible="modelValue"
    modal
    :closable="!loading"
    :dismissable-mask="!loading"
    :draggable="false"
    :style="{ width: '32rem', maxWidth: 'calc(100vw - 2rem)' }"
    class="organization-package-dialog"
    @update:visible="updateVisibility"
  >
    <template #header>
      <div class="organization-package-dialog__header">
        <span class="organization-package-dialog__icon" aria-hidden="true">
          <i class="pi pi-box" />
        </span>

        <div>
          <h3>{{ $t('organization_packages.confirm_subscription') }}</h3>
          <p>{{ $t('organization_packages.subscription_confirmation_message') }}</p>
        </div>
      </div>
    </template>

    <dl v-if="packageOffer" class="organization-package-dialog__summary">
      <div>
        <dt>{{ $t('organization_packages.package') }}</dt>
        <dd>{{ packageOffer.title || '-' }}</dd>
      </div>

      <div>
        <dt>{{ $t('organization_packages.final_price') }}</dt>
        <dd>
          {{ packageOffer.price_after_discount }}
          {{ $t('organization_packages.currency') }}
        </dd>
      </div>

      <div>
        <dt>{{ $t('organization_packages.duration') }}</dt>
        <dd>{{ durationLabel }}</dd>
      </div>
    </dl>

    <template #footer>
      <div class="organization-package-dialog__actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="loading"
          @click="updateVisibility(false)"
        >
          {{ $t('cancel') }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || !packageOffer"
          @click="emit('confirm')"
        >
          <i v-if="loading" class="pi pi-spinner pi-spin" aria-hidden="true" />
          {{ $t('organization_packages.confirm_subscription') }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
  .organization-package-dialog__header,
  .organization-package-dialog__actions {
    display: flex;
    align-items: center;
  }

  .organization-package-dialog__header {
    gap: 0.85rem;
  }

  .organization-package-dialog__header h3,
  .organization-package-dialog__header p,
  .organization-package-dialog__summary {
    margin: 0;
  }

  .organization-package-dialog__header h3 {
    color: var(--gray-900);
    font-family: 'Bold';
  }

  .organization-package-dialog__header p {
    margin-block-start: 0.25rem;
    color: var(--gray-600);
    font-size: var(--sm-size);
  }

  .organization-package-dialog__icon {
    display: inline-flex;
    width: 2.75rem;
    height: 2.75rem;
    flex: 0 0 2.75rem;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: var(--xl-size-base);
  }

  .organization-package-dialog__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--gray-50);
  }

  .organization-package-dialog__summary div {
    min-width: 0;
  }

  .organization-package-dialog__summary dt {
    color: var(--gray-600);
    font-size: var(--xs-size);
  }

  .organization-package-dialog__summary dd {
    overflow: hidden;
    margin: 0.35rem 0 0;
    color: var(--gray-900);
    font-family: 'Bold';
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .organization-package-dialog__actions {
    width: 100%;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 560px) {
    .organization-package-dialog__summary {
      grid-template-columns: minmax(0, 1fr);
    }

    .organization-package-dialog__actions {
      align-items: stretch;
      flex-direction: column-reverse;
    }

    .organization-package-dialog__actions .btn {
      width: 100%;
    }
  }
</style>
