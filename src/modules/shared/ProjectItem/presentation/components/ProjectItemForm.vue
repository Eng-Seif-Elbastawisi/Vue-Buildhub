<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import IndexItemParams from '@/modules/shared/Item/core/params/index.Item.params';
  import GeneralItemController from '@/modules/shared/Item/presentation/controllers/Item.controller';
  import AddProjectItemParams from '../../core/params/add.project.Item.params';
  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';
  import type ProjectItemShowModel from '../../core/models/project.Item.show.model';
  import { useI18n } from 'vue-i18n';

  const emit = defineEmits<{
    updateData: [params: AddProjectItemParams];
  }>();

  const props = defineProps<{
    item?: ProjectItemShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const { t } = useI18n();
  const generalItemController = GeneralItemController.getInstance();
  const generalItemParams = new IndexItemParams('', 1, 100, 0);
  const pricingMethodOptions = Object.entries(ProjectItemPriceEnum).map(([key, id]) => ({
    id,
    title: t(`project_item.pricing_methods.${key}`),
  }));

  const selectedItem = ref<TitleInterface<string | number> | null>(null);
  const pricingMethod = ref<TitleInterface<string | number> | null>(null);
  const price = ref<number>();
  const quantity = ref<number>();
  const projectFloorId = ref<number>();

  const optionFromId = (id?: number | string): TitleInterface<number> | null => {
    return id !== undefined && id !== null
      ? {
          id: Number(id),
          title: String(id),
        }
      : null;
  };

  const itemOptionFromModel = (item?: ProjectItemShowModel): TitleInterface<number> | null => {
    if (!item?.item_id) return null;

    return {
      id: Number(item.item_id.id),
      title: item.item_id.title,
    };
  };

  const numericId = (value?: string | number) => (value == null ? undefined : Number(value));

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.item,
    (item) => {
      if (!item) return;
      selectedItem.value = itemOptionFromModel(item);
      pricingMethod.value = item.pricing_method
        ? (pricingMethodOptions.find((option) => option.id === item.pricing_method) ??
          optionFromId(item.pricing_method))
        : null;
      price.value = item.price;
      quantity.value = item.quantity;
      projectFloorId.value = item.project_floor_id;
      updateData();
    },
    { immediate: true },
  );

  function updateData() {
    emit(
      'updateData',
      new AddProjectItemParams({
        item_id: numericId(selectedItem.value?.id),
        pricing_method: pricingMethod.value?.id as ProjectItemPriceEnum,
        project_floor_id: projectFloorId.value,
        price: price.value,
        quantity: quantity.value,
      }),
    );
  }
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>{{ $t('project_item.form_title') }}</h3>
      <p>{{ $t('project_item.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-item-item"
          v-model="selectedItem"
          :controller="generalItemController"
          :label="$t('project_item.item')"
          :params="generalItemParams"
          :placeholder="$t('project_item.item_placeholder')"
          :reload="true"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group">
        <label class="field-label" for="project-item-price">{{ $t('project_item.price') }}</label>
        <div class="input-wrap">
          <input
            id="project-item-price"
            v-model.number="price"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            :placeholder="$t('project_item.price_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="project-item-quantity">{{
          $t('project_item.quantity')
        }}</label>
        <div class="input-wrap">
          <input
            id="project-item-quantity"
            v-model.number="quantity"
            class="field-input"
            min="0"
            step="1"
            type="number"
            :placeholder="$t('project_item.quantity_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-item-pricing-method"
          v-model="pricingMethod"
          :label="$t('project_item.pricing_method')"
          :placeholder="$t('project_item.pricing_method_placeholder')"
          :static-options="pricingMethodOptions"
          required
          @update:model-value="updateData"
        />
      </div>
      <!-- 
     <div class="field-group col-span-2">
        <label class="field-label" for="project-item-floor">{{ $t('project_item.project_floor') }}</label>
        <div class="input-wrap">
          <input
            id="project-item-floor"
            v-model.number="projectFloorId"
            class="field-input"
            min="1"
            step="1"
            type="number"
            :placeholder="$t('project_item.project_floor_placeholder')"
            @input="updateData"
          />
        </div>
      </div> 
       -->
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-input {
    width: 100%;
    max-width: 100%;
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

  .notes-input {
    min-height: 96px;
    resize: vertical;
  }

  .material-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-header p {
    color: var(--gray-5);
  }

  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: end;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .col-span-2 {
    grid-column: span 2;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .col-span-2 {
      grid-column: span 1;
    }
  }
</style>
