<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import ProjectPricingController from '../controllers/project.pricing.controller';
  import type AddProjectPricingParams from '../../core/params/add.project.pricing.params';
  import IndexProjectPricingParams from '../../core/params/index.project.pricing.params';
  import type ProjectPricingShowModel from '../../core/models/project.pricing.show.model';
  import ProjectPricingForm from './ProjectPricingForm.vue';

  import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
  import IndexProjectItemParams from '@/modules/MainOrganization/ProjectItem/core/params/index.project.Item.params';
  import type ProjectItemModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.model';

  const controller = ProjectPricingController.getInstance();
  const projectItemController = ProjectItemController.getInstance();

  const route = useRoute();
  const router = useRouter();

  const formKey = route.fullPath;

  const params = ref<AddProjectPricingParams | null>(null);

  const loading = ref(false);
  const itemsLoading = ref(false);
  const pricingLoading = ref(false);

  /**
   * رسالة محلية لضمان ظهور خطأ الـ API
   * وعدم الاعتماد فقط على errorMessage في Controller.
   */
  const submitError = ref('');

  const projectId = computed(() => {
    const value = Number(route.query.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectItems = computed<ProjectItemModel[]>(() => {
    const state = projectItemController.listState.value as any;

    const data =
      state?.data?.data ??
      state?.data ??
      state?.response?.data?.data ??
      state?.response?.data ??
      [];

    const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return items as ProjectItemModel[];
  });

  const totalItemsPrice = computed(() => {
    return projectItems.value.reduce((total, item: any) => {
      return total + Number(item.final_price ?? item.finalPrice ?? 0);
    }, 0);
  });

  const projectPricing = computed<ProjectPricingShowModel | undefined>(() => {
    const state = controller.listState.value as any;

    const data =
      state?.data?.data ??
      state?.data ??
      state?.response?.data?.data ??
      state?.response?.data ??
      [];

    const pricingData = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return pricingData[0] as ProjectPricingShowModel | undefined;
  });

  const fetchProjectItems = async (): Promise<void> => {
    if (!projectId.value) {
      return;
    }

    itemsLoading.value = true;

    try {
      await projectItemController.fetchList(
        new IndexProjectItemParams('', 1, 100, 0, undefined, projectId.value),
      );
    } finally {
      itemsLoading.value = false;
    }
  };

  const fetchProjectPricing = async (): Promise<void> => {
    if (!projectId.value) {
      return;
    }

    pricingLoading.value = true;

    try {
      await controller.fetchList(
        new IndexProjectPricingParams('', 1, 100, 0, undefined, projectId.value),
      );
    } finally {
      pricingLoading.value = false;
    }
  };

  const backToEditProject = (): void => {
    router.push(`/organization/project/show/${projectId.value}`);
  };

  const getResultMessage = (result: unknown): string => {
    const response = result as any;

    return (
      response?.message ??
      response?.error?.message ??
      response?.data?.message ??
      response?.response?.data?.message ??
      controller.errorMessage.value ??
      ''
    );
  };

  const saveItem = async (): Promise<void> => {
    if (!params.value || loading.value) {
      return;
    }

    loading.value = true;
    submitError.value = '';

    try {
      const result = await controller.create(params.value, undefined, formKey);

      /**
       * التحويل إلى صفحة Show يتم فقط
       * عندما تكون النتيجة ناجحة بالفعل.
       */
      if (!(result instanceof DataSuccess)) {
        submitError.value = getResultMessage(result) || 'حدث خطأ أثناء حفظ تسعير المشروع.';

        return;
      }

      await fetchProjectPricing();

      backToEditProject();
    } catch (error: unknown) {
      const apiError = error as any;

      submitError.value =
        apiError?.response?.data?.message ??
        apiError?.message ??
        controller.errorMessage.value ??
        'حدث خطأ أثناء حفظ تسعير المشروع.';
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([fetchProjectItems(), fetchProjectPricing()]);
  });
</script>

<template>
  <StandardFormLayout mode="create" class="item-crud-page">
    <ProjectPricingForm
      :item="projectPricing"
      :form-key="formKey"
      :loading="loading || itemsLoading || pricingLoading"
      :project-id="projectId"
      :total-items-price="totalItemsPrice"
      @update-data="params = $event"
    />

    <div v-if="submitError || controller.errorMessage.value" class="error" role="alert">
      {{ submitError || controller.errorMessage.value }}
    </div>

    <template #actions>
      <div
        class="actions"
        :class="{
          disabled: loading || itemsLoading || pricingLoading,
        }"
      >
        <!-- <button
        class="btn btn-primary w-full"
        :class="{
          'btn--loading': loading,
        }"
        type="button"
        :disabled="loading || itemsLoading || pricingLoading"
        @click="saveItem"
      >
        <span v-if="loading" class="loader"></span>

        <span v-else>
          {{ $t('project_pricing.save') }}
        </span>
      </button> -->

        <div class="buttons-container form-action-pair">
          <button
            class="btn btn-primary w-full"
            :class="{
              'btn--loading': loading,
            }"
            type="button"
            :disabled="loading || itemsLoading || pricingLoading"
            @click="saveItem"
          >
            <span v-if="loading" class="loader"></span>

            <span v-else>
              {{ $t('project_pricing.save') }}
            </span>
          </button>

          <button
            :class="{ 'btn--loading': loading }"
            class="btn btn-secondary"
            type="button"
            :disabled="loading || !params"
            @click="router.back()"
          >
            {{ $t('back_step') }}
          </button>
        </div>
      </div>
    </template>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
@use '@/styles/mixins/form_action_pair' as form-actions;

.item-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions.disabled {
  pointer-events: none;
  opacity: 0.7;
}

.error {
  margin-top: 0.25rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--danger-dark);
  border-radius: 8px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  font-family: 'Medium';
  line-height: 1.6;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
