<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useFormsStore } from '@/stores/formsStore';
import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
import type SuppliersShowModel from '../../core/models/brand.show.model';
import AddSuppliersParams from '../../core/params/add.brand.params';
const emit = defineEmits(['updateData']);

const { Suppliers, formKey, loading } = defineProps<{
  Suppliers?: SuppliersShowModel;
  formKey?: string;
  loading?: boolean;
}>();
const tag = ref<string>('');
const tags = ref<string[]>([]);
const FormStore = useFormsStore();

onBeforeRouteLeave((to, from) => {
  const savedData = formKey ? FormStore.getFormData(formKey) : null;

  if (savedData && to.path !== from.path && formKey) {
    FormStore.showReturnWarning(formKey);
  }
});


const phone = ref<string>('');
const materials = ref<string>('');
const supplier = ref<string>('');
const spacification = ref<string>('');


onMounted(async () => {
  if (Suppliers) {
    phone.value = Suppliers.phone;
    materials.value = Suppliers.materials;
    supplier.value = Suppliers.Supplier;
    spacification.value = Suppliers.spacification;
  }
});

watch(
  () => Suppliers,
  (newSuppliers) => {
    if (newSuppliers) {
      phone.value = newSuppliers.phone;
      materials.value = newSuppliers.materials;
      supplier.value = newSuppliers.Supplier;
      spacification.value = newSuppliers.spacification;
    }
  },
  { immediate: true },
);

const updateData = () => {
  const params = new AddSuppliersParams({
    phone: phone.value,
    materials: materials.value,
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
      <div class="field-group tags-group col-span-2">
        <label class="field-label" for="tag">{{ $t('Tag') }}</label>

        <div class="input-wrap input-tag-wrap">
          <input id="tags" v-model="tag" type="text" :placeholder="$t('Add Tag....')" class="field-input"
            @input="updateData" />

          <button class="btn btn-primary" @click="setTags">{{ $t('Add Tag') }}</button>
        </div>

        <div class="tags-container" :class="tags.length > 0 ? `border` : ``">
          <div v-for="(tagItem, tagIndex) in tags" :key="tagIndex" class="tag">
            <span>{{ tagItem }}</span>

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
