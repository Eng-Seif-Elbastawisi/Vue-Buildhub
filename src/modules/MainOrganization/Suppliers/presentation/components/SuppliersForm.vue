<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type SuppliersShowModel from '../../core/models/Suppliers.show.model';
  import AddSuppliersParams from '../../core/params/add.Suppliers.params';
  import { isValidSupplierPhone } from '../../core/params/supplier.phone.validation';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddSuppliersParams];
  }>();

  const props = defineProps<{
    supplier?: SuppliersShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const { t } = useI18n();

  const name = ref<string>('');
  const phone = ref<string>('');
  const phoneError = ref<string>('');

  const validatePhone = (): void => {
    phoneError.value = isValidSupplierPhone(phone.value)
      ? ''
      : t('supplier.phone_positive_digits_error');
  };

  const preventInvalidPhoneKeys = (event: KeyboardEvent): void => {
    if (!event.ctrlKey && !event.metaKey && event.key.length === 1 && !/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  const updateData = (): void => {
    emit(
      'updateData',
      new AddSuppliersParams({
        name: name.value,

        phone: phone.value,
      }),
    );
  };

  const updatePhone = (): void => {
    validatePhone();
    updateData();
  };

  onMounted(() => {
    validatePhone();
    updateData();
  });

  watch(
    () => props.supplier,
    (supplier) => {
      if (!supplier) return;

      name.value = supplier.name ?? '';
      phone.value = supplier.phone ?? '';
      validatePhone();
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />

      <div class="document-form-header-text">
        <h4>{{ $t('supplier.form_title') }}</h4>
        <p>{{ $t('supplier.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="supplier-name">{{ $t('supplier.name') }}</label>
          <FieldHelpIcon :label="$t('supplier.name')" field-name="name" field-id="supplier-name" />
        </span>
        <div class="input-wrap">
          <input
            id="supplier-name"
            v-model="name"
            type="text"
            :placeholder="$t('supplier.name_placeholder')"
            class="field-input"
            min="1"
            @input="updateData"
          />
        </div>
      </div>
      <!-- 
      <div class="field-group">
        <label class="field-label" for="supplier-specialization">
          {{ $t('supplier.specialization') }}
        </label>
        <div class="input-wrap">
          <input
            id="supplier-specialization"
            v-model="Specialization"
            type="text"
            :placeholder="$t('supplier.specialization_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div> -->

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="supplier-phone">{{ $t('supplier.phone') }}</label>
          <FieldHelpIcon
            :label="$t('supplier.phone')"
            field-name="phone"
            field-id="supplier-phone"
          />
        </span>
        <div class="input-wrap">
          <input
            id="supplier-phone"
            v-model="phone"
            type="tel"
            :placeholder="$t('supplier.phone_placeholder')"
            class="field-input"
            :class="{ 'field-input--error': phoneError }"
            inputmode="numeric"
            pattern="[0-9]*"
            :aria-invalid="Boolean(phoneError)"
            aria-describedby="supplier-phone-error"
            @keydown="preventInvalidPhoneKeys"
            @input="updatePhone"
          />
          <small
            v-if="phoneError"
            id="supplier-phone-error"
            class="field-error"
            role="alert"
            aria-live="polite"
          >
            {{ phoneError }}
          </small>
        </div>
      </div>

      <!-- <div class="field-group">
        <label class="field-label" for="supplier-materials">{{ $t('supplier.materials') }}</label>
        <div class="input-wrap">
          <input
            id="supplier-materials"
            v-model="materials"
            type="text"
            :placeholder="$t('supplier.materials_placeholder')"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
  .document-form-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  .field-input--error {
    border-color: var(--danger-dark);
  }

  .field-error {
    margin-top: 0.35rem;
    color: var(--danger-dark);
    font-size: var(--xs-size);
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
