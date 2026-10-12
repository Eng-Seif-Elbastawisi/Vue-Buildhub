<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import SiteTeamController from '../controllers/site-team.controller';
  import UpdateProjectSiteInfoParams from '../../core/params/update.project.site-info.params';
  const props = defineProps<{ visible: boolean; quoteId: number }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const controller = SiteTeamController.getInstance();
  const deliveryDate = ref('');
  const siteCondition = ref('');
  const errors = ref<FieldError[]>([]);
  const busy = computed(() => controller.siteSaveState.value instanceof DataLoading);
  const failure = computed(() => controller.siteSaveState.value.error?.displayMessage);
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      deliveryDate.value = controller.siteState.value.data?.deliveryDate ?? '';
      siteCondition.value = controller.siteState.value.data?.siteCondition ?? '';
      errors.value = [];
    },
    { immediate: true },
  );
  function fieldError(field: string) {
    return errors.value.find((error) => error.field === field)?.message;
  }
  async function save() {
    if (busy.value) return;
    const params = new UpdateProjectSiteInfoParams(
      props.quoteId,
      deliveryDate.value,
      siteCondition.value,
    );
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const result = await controller.saveSite(params);
    if (result instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="site-team-dialog"
    :header="$t('site_team.update_site')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="site-team-form" @submit.prevent="save">
      <p>{{ $t('site_team.site_help') }}</p>
      <div class="input-wrapper">
        <label for="site-delivery" class="label">{{ $t('site_team.delivery_date') }}</label>
        <input
          id="site-delivery"
          v-model="deliveryDate"
          type="date"
          class="input"
          :disabled="busy"
          :aria-invalid="!!fieldError('deliveryDate')"
          aria-describedby="site-delivery-error"
        />
        <small id="site-delivery-error" role="alert">{{ fieldError('deliveryDate') }}</small>
      </div>
      <div class="input-wrapper">
        <label for="site-condition" class="label">{{ $t('site_team.site_condition') }}</label>
        <textarea
          id="site-condition"
          v-model="siteCondition"
          rows="5"
          class="input"
          :disabled="busy"
          :aria-invalid="!!fieldError('siteCondition')"
          aria-describedby="site-condition-error"
        ></textarea>
        <small id="site-condition-error" role="alert">{{ fieldError('siteCondition') }}</small>
      </div>
      <p v-if="failure" role="alert">{{ $t(failure) }}</p>
      <div class="site-team-actions">
        <AppButton theme="secondary" :disabled="busy" @click="emit('update:visible', false)">{{
          $t('site_team.cancel')
        }}</AppButton>
        <AppButton type="submit" :loading="busy">{{ $t('site_team.save_changes') }}</AppButton>
      </div>
    </form>
  </Dialog>
</template>
