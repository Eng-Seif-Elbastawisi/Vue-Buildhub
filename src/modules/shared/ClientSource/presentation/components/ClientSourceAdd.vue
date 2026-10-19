<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
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
    cancel: [];
  }>();

  const controller = ClientSourceController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddClientSourceParams | EditClientSourceParams | null>(null);
  const loading = ref(false);
  const resetKey = ref(0);

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
          ? await controller.update(paramsToSave, { useJson: true })
          : await controller.create(paramsToSave, { useJson: true });

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

  const cancelClientSource = () => {
    params.value = null;
    resetKey.value += 1;
    emit('cancel');
  };
</script>

<template>
  <StandardFormLayout mode="create" class="email-crud-example">
    <div class="email-form-card">
      <StandardFormSectionHeader :title="$t('client_source')" icon="pi pi-share-alt" />
      <ClientSourceForm
        :form-key="formKey"
        :client-source="clientSource"
        :loading="loading"
        :reset-key="resetKey"
        @update-data="updateData"
      />

      <div class="actions" :class="{ disabled: loading }">
        <AppButton
          :loading="loading"
          class="btn-save"
          :title="$t('save')"
          size="sm"
          icon="right"
          type="submit"
          @click="saveClientSource"
        >
          {{ $t('save') }}

          <template #icon>
            <IconAccept class="icon" />
          </template>
        </AppButton>
        <AppButton
          v-if="clientSource?.id"
          class="btn-cancel"
          theme="secondary"
          :title="$t('cancel')"
          type="button"
          @click="cancelClientSource"
        >
          {{ $t('cancel') }}
        </AppButton>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.email-crud-example {
  padding: 0;
  // padding-block: 20px;
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
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}
</style>
