<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useFormsStore } from '@/stores/formsStore';
import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
import AddBrandParams from '../../core/params/add.materials.params';
import type BrandShowModel from '../../core/models/materials.show.model';
import type { EquipmentTypeEnum } from '../../core/constant/unit.type.enum';
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
        <div class="group">

          <div class="field-group col-span-2">
            <label class="field-label" for="name">{{ $t(`brand title`) }}</label>
            <div class="input-wrap">
              <input id="title" v-model="title" type="text" placeholder="Enter brand title" class="field-input"
                @input="updateData" />
            </div>
          </div>
          <div class="field-group">
            <UpdatedCustomInputSelect id="doc-branch" :label="`Equipment type`" :static-options="equipmentOptions"
              v-model="equipment" :placeholder="$t('Enter equipment type')" :reload="true"
              @update:model-value="handleBranchChange($event)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disabled-input {
  pointer-events: none;
  opacity: 0.5;
}
</style>
