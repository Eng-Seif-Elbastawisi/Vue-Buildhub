<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
  import DepartmentController from '../controllers/department.controller';
  import DepartmentForm from './DepartmentForm.vue';
  import DepartmentIdParams from '../../core/params/department-id.params';
  import type EditDepartmentParams from '../../core/params/edit.department.params';
  import { DepartmentTypeEnum } from '../../core/constants/Type.enum';

  const controller = DepartmentController.getInstance();
  const route = useRoute();
  const params = ref<EditDepartmentParams | null>(null);
  const loading = ref(false);
  const resetKey = ref(0);

  const getDepartmentType = (): DepartmentTypeEnum | undefined => {
    const queryType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;
    const type = Number(queryType);

    return Object.values(DepartmentTypeEnum).includes(type as DepartmentTypeEnum)
      ? (type as DepartmentTypeEnum)
      : undefined;
  };

  const save = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value);
    } finally {
      loading.value = false;
    }
  };

  const clearInputs = () => {
    params.value = null;
    resetKey.value += 1;
  };

  onMounted(() => controller.fetchOne(new DepartmentIdParams(Number(route.params.id))));
</script>

<template>
  <section class="department-page">
    <StandardFormSectionHeader :title="$t('department')" icon="pi pi-sitemap" />
    <h2>{{ $t('edit_department') }}</h2>
    <DepartmentForm
      :department="controller.itemData.value ?? undefined"
      :loading="loading"
      :type="getDepartmentType()"
      :reset-key="resetKey"
      @update-data="(value) => (params = value as EditDepartmentParams)"
    />
    <div class="actions form-action-pair" :class="{ disabled: loading }">
      <AppButton :loading="loading" :title="$t('save')" type="button" @click="save">{{
        $t('save')
      }}</AppButton>
      <AppButton theme="secondary" :title="$t('cancel')" type="button" @click="clearInputs">
        {{ $t('cancel') }}
      </AppButton>
    </div>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </section>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/form_action_pair' as form-actions;

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

  .form-action-pair {
    @include form-actions.layout;
  }
</style>
