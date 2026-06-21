<script setup lang="ts">
import { ref, watch } from 'vue';
import type ClientSourceModel from '../../core/models/client.source.model';
import AddClientSourceParams from '../../core/params/add.client.source.params';
import EditClientSourceParams from '../../core/params/edit.client.source.params';
import MultiLangInput from '@/shared/MultiLangInput.vue';

const emit = defineEmits<{
  updateData: [params: AddClientSourceParams | EditClientSourceParams];
}>();

const { clientSource, loading } = defineProps<{
  clientSource?: ClientSourceModel;
  loading?: boolean;
}>();
const translations = ref<{ [key: string]: string }>({});
const updateData = () => {
  if (clientSource?.id) {
    emit(
      'updateData',
      new EditClientSourceParams({ id: clientSource?.id, translations: { title: translations.value } }),
    );
    return;
  }

  emit(
    'updateData',
    new AddClientSourceParams({
      translations: { title: translations.value },
    }),
  );
};

watch(
  () => clientSource,
  (newClientSource) => {
    translations.value = newClientSource?.translations?.title ?? {};
    updateData();
  },
  { immediate: true },
);
</script>

<template>
  <div class="form-fields">
    <!-- <div class="field-group" :class="{ disabled: loading }">
      <label class="field-label" for="title"> {{ $t('stage_title') }} </label> 
      <div class="input-wrap">
        <input
          id="title"
          v-model="title"
          type="text"
          :placeholder="$t('stage_title')"
          class="field-input"
          @input="updateData"
        />
      </div>
    </div> -->
    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput v-model="translations" field-key="title" :label="$t('client_source_title')"
        :languages="['en', 'ar']" type="title" @update:model-value="updateData" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-fields {
  padding: 20px;
  width: 100%;
  background: var(--bg-main);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-strong);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent);
    pointer-events: none;
  }

  .field-group {
    width: 50%;

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
}

// .field-input{
//   width: 100%;
//   padding: 12px 16px;
//     padding-right: 16px;
//   padding-right: 16px;
//   padding-right: 50px;
//   border: 1px solid var(--border-weak);
//   border-radius: 28px;
//   background: var(--white);
//   outline: none;
//   transition: all 0.25s ease;
//   font-family: "Medium";
//   font-weight: 400;
//   font-size: var(--sm-size);
//   color: var(--bread-crumb-color-span);
//   max-height: 200px;
//   max-width: 100%;
// }
// .email-crud-example .:hover{
//   background-color: transparent !important;
// }
</style>
