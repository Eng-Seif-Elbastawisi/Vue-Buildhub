<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import { useRoute } from 'vue-router';
  import StageForm from './StageForm.vue';
  import StageController from '../controllers/stage.controller';
  import type AddStageParams from '../../core/params/add.stges.params';

  const controller = StageController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddStageParams | null>(null);
  const loading = ref(false);

  const saveStage = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No stage parameters to save');
        return;
      }

      const paramsToSave = params.value;

      await controller.create(paramsToSave, undefined, formKey);
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddStageParams) => {
    params.value = updatedParams;
    // saveEmail();
  };
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <StageForm
        :form-key="formKey"
        :email="controller.itemData.value!"
        :loading="loading"
        @update-data="updateData"
      />

      <div class="actions" :class="{ disabled: loading }">
        <AppButton title="Save Stage" size="sm" icon="right" type="submit" @click="saveStage">
          Save Stage

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
    padding: 0px 0 10px 20px;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
