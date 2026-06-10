<script setup lang="ts">
  import { ref } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import { useRoute } from 'vue-router';
  import CountryController from '../controllers/country.controller';
  import CountryForm from './CountryForm.vue';
  import type AddCountryParams from '../../core/params/add.country.params';
  // Controller instance
  const controller = CountryController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  // Form state
  const params = ref<AddCountryParams | null>(null);
  const loading = ref(false);
  /**
   * Save (create or update) email
   */
  const saveEmail = async () => {
    loading.value = true;
    try {
      if (!params.value) {
        console.error('No email parameters to save');
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

  const updateData = (updatedParams: AddCountryParams) => {
    params.value = updatedParams;
    // saveEmail();
  };
</script>

<template>
  <div class="email-crud-example">
    <CountryForm
      :form-key="formKey"
      :email="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <AppButton :title="$t('Save')" :loading="loading" size="sm" icon="right" type="submit" @click="saveEmail">
        {{ $t('Save') }}

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
</template>

<style scoped lang="scss">
  :deep(.input-file) {
    border: 1px solid #d9dbe9 !important;
    padding: 11px;
    border-radius: 20px !important;
    cursor: pointer;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
