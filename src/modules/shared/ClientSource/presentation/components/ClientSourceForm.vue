<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type ClientSourceModel from '../../core/models/client.source.model';
  import AddClientSourceParams from '../../core/params/add.client.source.params';
  import EditClientSourceParams from '../../core/params/edit.client.source.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const emit = defineEmits<{
    updateData: [params: AddClientSourceParams | EditClientSourceParams];
  }>();

  const props = defineProps<{
    clientSource?: ClientSourceModel;
    loading?: boolean;
    resetKey?: number;
  }>();
  const translations = ref<{ [key: string]: string }>({});
  const updateData = () => {
    if (props.clientSource?.id) {
      emit(
        'updateData',
        new EditClientSourceParams({
          id: props.clientSource.id,
          translations: { title: translations.value },
        }),
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
    () => props.clientSource,
    (newClientSource) => {
      translations.value = newClientSource?.translations?.title ?? {};
      updateData();
    },
    { immediate: true },
  );

  watch(
    () => props.resetKey,
    () => {
      translations.value = {};
    },
  );
</script>

<template>
  <div class="field-group" :class="{ disabled: props.loading }">
    <MultiLangInput
      v-model="translations"
      field-key="title"
      :label="$t('client_source_title')"
      :languages="['en', 'ar']"
      type="title"
      @update:model-value="updateData"
    />
  </div>
</template>

<style scoped lang="scss">
  .field-group.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
</style>
