<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';
import IconAccept from '@/shared/icons/IconAccept.vue';
import { useRoute } from 'vue-router';
import ClientSourceController from '../controllers/client.source.controller.ts';
import type AddClientSourceParams from '../../core/params/add.client.source.params.ts';
import EditClientSourceParams from '../../core/params/edit.client.source.params.ts';
import type ClientSourceModel from '../../core/models/client.source.model.ts';
import ClientSourceForm from './ClientSourceForm.vue';

const { clientSource } = defineProps<{ 
  clientSource?: ClientSourceModel;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const controller = ClientSourceController.getInstance();
const route = useRoute();
const formKey = route.fullPath;
const params = ref<AddClientSourceParams | EditClientSourceParams | null>(null);
const loading = ref(false);

const saveClientSource = async () => {
  loading.value = true;
  try {
    if (!params.value) {
      console.error('No client source parameters to save');
      return;
    }

    const paramsToSave = params.value;

    const result =
      paramsToSave instanceof EditClientSourceParams
        ? await controller.update(paramsToSave, undefined)
        : await controller.create(paramsToSave, undefined);

    if (result) {
      emit('saved');
    }
  } catch (error) {
    console.error('Error saving client source:', error);
  } finally {
    loading.value = false;
  }
};

const updateData = (updatedParams: AddClientSourceParams | EditClientSourceParams) => {
  params.value = updatedParams;
};
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <ClientSourceForm :form-key="formKey" :client-source="clientSource" :loading="loading" @update-data="updateData" />

      <div class="actions" :class="{ disabled: loading }">
        <AppButton :title="$t('save')" size="sm" icon="right" type="submit" @click="saveClientSource">
          {{ $t('save') }}

          <template #icon>
            <IconAccept />
          </template>
        </AppButton>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"> 
.email-crud-example {
  padding: 0;
  padding-block: 20px;
}

:deep(.input-file) {
  border: 1px solid var(--input-file-border) !important;
  padding: 11px;
  border-radius: 20px !important;
  cursor: pointer;
}

.actions {
  padding: 0 0 10px 20px;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
