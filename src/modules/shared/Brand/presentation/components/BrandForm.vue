<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import AddBrandParams from '../../core/params/add.brand.params';
  import type BrandShowModel from '../../core/models/brand.show.model';
  import type { EquipmentTypeEnum } from '../../core/constant/equipment.type.enum';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  const emit = defineEmits(['updateData']);

  const { brand, formKey, loading } = defineProps<{
    brand?: BrandShowModel;
    formKey?: string;
    loading?: boolean;
  }>();
  const FormStore = useFormsStore();

  onBeforeRouteLeave((to, from) => {
    const savedData = formKey ? FormStore.getFormData(formKey) : null;

    if (savedData && to.path !== from.path && formKey) {
      FormStore.showReturnWarning(formKey);
    }
  });

  const title = ref<string>();
  const equipment = ref<EquipmentTypeEnum>();

  onMounted(async () => {
    if (brand) {
      title.value = brand.title;
      equipment.value = brand.equipment;
    }
  });

  watch(
    () => brand,
    (newBrand) => {
      if (newBrand) {
        title.value = newBrand.title;
        equipment.value = newBrand.equipment;
      }
    },
    { immediate: true },
  );

  const updateData = () => {
    const params = new AddBrandParams({
      name: title.value,
      equipment: equipment.value,
    });

    emit('updateData', params);
  };
</script>

<template>
  <div class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />

      <div class="document-form-header-text">
        <h4>{{ $t('add_Suppliers') }}</h4>

        <p>{{ $t('Upload your Suppliers and fill in its details') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="all_inputs">
        <div class="field-group col-span-2">
          <label class="field-label" for="name">{{ $t(`brand title`) }}</label>
          <div class="input-wrap">
            <input
              id="title"
              v-model="title"
              type="text"
              placeholder="Enter brand title"
              class="field-input"
              @input="updateData"
            />
          </div>
        </div>
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="doc-branch"
            v-model="equipment"
            :label="`Equipment type`"
            :static-options="equipmentOptions"
            :placeholder="$t('Enter equipment type')"
            :reload="true"
            @update:model-value="handleBranchChange($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .form-fields {
    .all_inputs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      align-items: end;
    }
  }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 50px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    max-height: 200px;
    max-width: 100%;
  }

  .disabled-input {
    pointer-events: none;
    opacity: 0.5;
  }
</style>
