<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import { useRoute } from 'vue-router';
  import StageForm from './StageForm.vue';
  import StageController from '../controllers/stage.controller';
  import type AddStageParams from '../../core/params/add.stges.params';
  import EditStageParams from '../../core/params/edit.stage.params';
  import type StageModel from '../../core/models/stage.model';

  const { stage } = defineProps<{
    stage?: StageModel;
  }>();

  const emit = defineEmits<{
    saved: [];
    cancel: [];
  }>();

  const controller = StageController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddStageParams | EditStageParams | null>(null);
  const loading = ref(false);
  const resetKey = ref(0);

  const saveStage = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No stage parameters to save');
        return;
      }

      const paramsToSave = params.value;

      const result =
        paramsToSave instanceof EditStageParams
          ? await controller.update(paramsToSave, { useJson: true })
          : await controller.create(paramsToSave, { useJson: true });

      if (result) {
        emit('saved');
      }
    } catch (error) {
      console.error('Error saving email:', error);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddStageParams | EditStageParams) => {
    params.value = updatedParams;
  };

  const cancelStage = () => {
    params.value = null;
    resetKey.value += 1;
    emit('cancel');
  };
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <StageForm
        :form-key="formKey"
        :stage="stage"
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
          @click="saveStage"
        >
          {{ $t('save') }}

          <template #icon>
            <IconAccept class="icon" />
          </template>
        </AppButton>
        <button
          v-if="stage?.id"
          class="btn-cancel"
          :title="$t('cancel')"
          type="button"
          @click="cancelStage"
        >
          {{ $t('cancel') }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .email-form-card {
    background: var(--bg-main);
    border-radius: 24px;
    padding: 16px;
    overflow: hidden;
    position: relative;
    width: 100%;
    background-color: var(--color-light-gray);
    // display: flex;
    // align-items: end;
    // justify-content: space-between;
    // gap: 24px;

    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 1rem;
    align-items: end;

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

    .actions {
      padding: 0;
      display: flex;
      gap: 0.75rem;

      .btn-save {
        flex: 1;
        border-radius: 20px;
        border: 1px solid white;
        padding: 11px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        font-family: 'medium';

        &:hover {
          border: 1px solid var(--PrimaryColor);

          .icon {
            stroke: var(--PrimaryColor);
          }
        }
      }

      .btn-cancel {
        flex: 0 0 auto;
      }
    }
  }

  .email-crud-example {
    padding: 0;
    // padding-block: 20px;
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

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
