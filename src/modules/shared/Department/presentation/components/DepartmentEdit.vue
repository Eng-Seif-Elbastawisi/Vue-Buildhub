<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import DepartmentController from '../controllers/department.controller';
  import DepartmentForm from './DepartmentForm.vue';
  import DepartmentIdParams from '../../core/params/department-id.params';
  import type EditDepartmentParams from '../../core/params/edit.department.params';

  const controller = DepartmentController.getInstance();
  const route = useRoute();
  const params = ref<EditDepartmentParams | null>(null);
  const loading = ref(false);

  const save = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => controller.fetchOne(new DepartmentIdParams(Number(route.params.id))));
</script>

<template>
  <section class="department-page">
    <h2>{{ $t('edit_department') }}</h2>
    <DepartmentForm
      :department="controller.itemData.value ?? undefined"
      :loading="loading"
      @update-data="(value) => (params = value as EditDepartmentParams)"
    />
    <AppButton :title="$t('save')" type="button" @click="save">{{ $t('save') }}</AppButton>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </section>
</template>
