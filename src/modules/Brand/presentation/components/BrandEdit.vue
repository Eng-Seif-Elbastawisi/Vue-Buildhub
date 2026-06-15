<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import IconAccept from '@/shared/icons/IconAccept.vue';
// import type AddSuppliersParams from '../../core/params/add.Suppliers.params.ts';
import BrandForm from './BrandForm.vue';
import EditBrandParams from '../../core/params/edit.brand.params.ts';
import ShowBrandParams from '../../core/params/show.brand.params.ts';
import BrandController from '../controllers/brand.controller.ts';

const controller = BrandController.getInstance();
const route = useRoute();
const formKey = route.fullPath;

const params = ref<EditBrandParams | null>(null);
const loading = ref(false);

const saveBrand = async () => {
  if (!params.value) return;
  loading.value = true;
  try {
    await controller.update(params.value, undefined, formKey);
  } finally {
    loading.value = false;
  }
};

const updateData = () => {
  params.value = new EditBrandParams({
    brand_id: Number(route.params.id),
  });
};

onMounted(async () => {
  await controller.fetchOne(
    new ShowBrandParams({ brand_id: Number(route.params.id) }),
  );
});
</script>

<template>
  <div class="document-crud-example">
    <BrandForm :brand="controller.itemData.value!" :form-key="formKey" :loading="loading"
      @update-data="updateData" />

    <!-- <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :title="$t('save_document')"
        size="sm"
        icon="right"
        type="submit"
        @click="saveDocument"
      >
        {{ $t('save_document') }}
        <template #icon>
          <IconAccept />
        </template>
</AppButton>
</div> -->
    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="submit" @click="saveBrand">
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('save_document') }}
          <IconAccept />
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.loader {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 8px solid;
  border-color: #000 #0000;
  animation: l1 1s infinite;
}

@keyframes l1 {
  to {
    transform: rotate(.5turn)
  }
}

@keyframes l7 {
  to {
    transform: rotate(.5turn)
  }
}

.email-crud-example {
  padding: 20px;
  margin: 0 auto;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
