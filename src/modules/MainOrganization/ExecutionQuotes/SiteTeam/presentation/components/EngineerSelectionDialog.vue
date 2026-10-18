<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import SiteTeamController from '../controllers/site-team.controller';
  import AssignQuoteEngineersParams from '../../core/params/assign.quote.engineers.params';
  const props = defineProps<{ visible: boolean; quoteId: number }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const controller = SiteTeamController.getInstance();
  const selected = ref<TitleInterface<string | number>[]>([]);
  const search = ref('');
  const invalid = ref(false);
  const params = computed(() => new IndexEmployeeParams(search.value, 1, 10, 0));
  const busy = computed(() => controller.engineerSaveState.value instanceof DataLoading);
  const ids = computed(() => [...new Set(selected.value.map((employee) => Number(employee.id)))]);
  const removesAssigned = computed(
    () =>
      controller.engineersState.value.data?.some(
        (employee) => !ids.value.includes(Number(employee.id)),
      ) ?? false,
  );
  const failure = computed(() => controller.engineerSaveState.value.error?.displayMessage);
  watch(selected, (value) => {
    const unique = [...new Map(value.map((employee) => [Number(employee.id), employee])).values()];
    if (unique.length !== value.length) selected.value = unique;
  });
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      selected.value = (controller.engineersState.value.data ?? []).map(
        (employee) => new TitleInterface({ id: Number(employee.id), title: employee.name }),
      );
      search.value = '';
      invalid.value = false;
    },
    { immediate: true },
  );
  async function save() {
    // console.log('save', busy.value, removesAssigned.value, ids.value);
    if (busy.value || removesAssigned.value) return;

    // console.log('save', busy.value, removesAssigned.value, ids.value);
    const request = new AssignQuoteEngineersParams(props.quoteId, ids.value);
    invalid.value = !request.validate().isValid;
    // console.log('save', busy.value, removesAssigned.value, ids.value, invalid.value);
    if (invalid.value) return;
    const result = await controller.saveEngineers(request);
    if (result instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="site-team-dialog workspace-dialog"
    :header="$t('site_team.assign_engineers')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="emit('update:visible', $event)"
  >
    <StandardFormLayout as="form" embedded class="site-team-form" @submit.prevent="save">
      <p>{{ $t('site_team.assignment_help') }}</p>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="site-engineers"
          v-model="selected"
          :type="2"
          label="site_team.employees"
          :placeholder="$t('site_team.select_employees')"
          :controller="controller.employeeOptions"
          :params="params"
          :disabled="busy"
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('site_team.employees')"
                field-name="employees"
                field-id="site-engineers"
                :help-text="$t('field_help.execution_fields.employees')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
      </div>
      <p class="site-team-badge" role="status">
        {{ $t('site_team.selected_count', { count: ids.length }) }}
      </p>
      <ul class="site-team-selected">
        <li v-for="employee in selected" :key="employee.id">
          <span>{{ employee.title }}</span>
          <AppButton
            theme="secondary"
            size="sm"
            :disabled="busy"
            :title="$t('site_team.deselect', { name: employee.title })"
            @click="selected = selected.filter((item) => item.id !== employee.id)"
            >{{ $t('site_team.remove') }}</AppButton
          >
        </li>
      </ul>
      <p v-if="removesAssigned" role="alert">{{ $t('site_team.assignment_gap') }}</p>
      <p v-if="invalid" role="alert">{{ $t('site_team.invalid_form') }}</p>
      <p v-if="failure" role="alert">{{ $t(failure) }}</p>
      <div class="site-team-actions">
        <AppButton theme="secondary" :disabled="busy" @click="emit('update:visible', false)">{{
          $t('site_team.cancel')
        }}</AppButton>
        <AppButton type="submit" :loading="busy" :disabled="removesAssigned || !ids.length">{{
          $t('site_team.save_changes')
        }}</AppButton>
      </div>
    </StandardFormLayout>
  </Dialog>
</template>
