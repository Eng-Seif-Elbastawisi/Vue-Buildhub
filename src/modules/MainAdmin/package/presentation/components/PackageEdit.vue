<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddPackageParams from '../../core/params/add.package.params';
  import EditPackageParams from '../../core/params/edit.package.params';
  import ShowPackageParams from '../../core/params/show.package.params';
  import PackageController from '../controllers/package.controller';
  import PackageForm from './PackageForm.vue';

  const controller = PackageController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const packageId = Number(route.params.id);
  const params = ref<EditPackageParams | null>(null);
  const loading = ref(false);

  const updatePackageParams = (packageParams: AddPackageParams) => {
    params.value = new EditPackageParams({
      id: packageId,
      duration: packageParams.duration,
      hasmobild: packageParams.hasmobild,
      hasportal: packageParams.hasportal,
      projectnumbers: packageParams.projectnumbers,
      employeenumbers: packageParams.employeenumbers,
      price: packageParams.price,
    });
  };

  const savePackage = async () => {
    if (!params.value) return;

    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowPackageParams(packageId));
  });
</script>

<template>
  <div class="package-crud-page">
    <PackageForm
      :form-key="formKey"
      :loading="loading"
      :package-data="controller.itemData.value ?? undefined"
      @update-data="updatePackageParams"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :class="{ 'btn--loading': loading }"
        :disabled="loading"
        class="btn btn-primary w-full"
        type="button"
        @click="savePackage"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('package.update') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .package-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions.disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid var(--danger-dark);
    border-radius: 4px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
  }
</style>
