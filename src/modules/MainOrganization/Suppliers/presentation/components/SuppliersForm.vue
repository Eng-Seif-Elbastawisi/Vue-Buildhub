<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import type SuppliersShowModel from '../../core/models/Suppliers.show.model';
  import AddSuppliersParams from '../../core/params/add.Suppliers.params';

  const emit = defineEmits<{
    updateData: [params: AddSuppliersParams];
  }>();

  const props = defineProps<{
    supplier?: SuppliersShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();

  const name = ref<string>('');
  const phone = ref<string>('');

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  const updateData = () => {
    emit(
      'updateData',
      new AddSuppliersParams({
        name: name.value,

        phone: phone.value,

      }),
    );
  };

  watch(
    () => props.supplier,
    (supplier) => {
      if (!supplier) return;

      name.value = supplier.name ?? '';
      phone.value = supplier.phone ?? '';
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
        <label class="field-label" for="supplier-name">{{ $t('supplier.name') }}</label>
        <div class="input-wrap">
          <input
            id="supplier-name"
            v-model="name"
            type="text"
            :placeholder="$t('supplier.name_placeholder')"
            class="field-input"
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
        <label class="field-label" for="supplier-phone">{{ $t('supplier.phone') }}</label>
        <div class="input-wrap">
          <input
            id="supplier-phone"
            v-model="phone"
            type="text"
            :placeholder="$t('supplier.phone_placeholder')"
            class="field-input"
            @input="updateData"
          />
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

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
