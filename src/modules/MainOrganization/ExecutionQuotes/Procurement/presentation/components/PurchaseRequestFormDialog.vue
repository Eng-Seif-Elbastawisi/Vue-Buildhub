<script setup lang="ts">
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import RadioButton from 'primevue/radiobutton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import {
    DataInitial,
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import type {
    SupplyResponsibility,
    PurchaseRequestPriority,
  } from '../../core/constants/purchase-request.constants';
  import StorePurchaseRequestParams from '../../core/params/store.purchase-request.params';
  import PurchaseRequestItemParams from '../../core/params/purchase-request.item.params';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseRequestItemRow, {
    type PurchaseRequestItemDraft,
  } from './PurchaseRequestItemRow.vue';
  const props = defineProps<{ visible: boolean }>();
  const emit = defineEmits<{ 'update:visible': [boolean] }>();
  const { t } = useI18n();
  const controller = PurchaseRequestController.getInstance();
  const employeeLookup = controller.createLookup('employee');
  const employee = ref<TitleInterface<string | number> | null>(null);
  const employeeParams = computed(() => new IndexEmployeeParams('', 1, 10, 0));
  const supply = ref<TitleInterface<string | number> | null>(null);
  const priority = ref<TitleInterface<string | number> | null>(null);
  const allProject = ref(true);
  const floor = ref<TitleInterface<string | number> | null>(null);
  const space = ref<TitleInterface<string | number> | null>(null);
  const errors = ref<FieldError[]>([]);
  let nextKey = 0;
  const rows = ref<PurchaseRequestItemDraft[]>([]);
  const busy = computed(() => controller.isStoring.value);
  const supplyOptions = computed(() => [
    new TitleInterface({ id: 1, title: t('procurement.client') }),
    new TitleInterface({ id: 2, title: t('procurement.company') }),
  ]);
  const priorityOptions = computed(() => [
    new TitleInterface({ id: 1, title: t('procurement.normal') }),
    new TitleInterface({ id: 2, title: t('procurement.low') }),
    new TitleInterface({ id: 3, title: t('procurement.high') }),
  ]);
  const floorOptions = computed(() =>
    (controller.floorsState.value.data ?? [])
      .filter((entry) => validId(Number(entry.id)))
      .map(
        (entry) =>
          new TitleInterface({
            id: Number(entry.id),
            title:
              entry.floor_number === 0
                ? t('procurement.ground_floor')
                : entry.floor_number === undefined
                  ? t('procurement.floor_id', { id: entry.id })
                  : t('procurement.floor_number', { number: entry.floor_number }),
          }),
      ),
  );
  const spaceOptions = computed(() =>
    (
      controller.floorsState.value.data?.find((entry) => entry.id === Number(floor.value?.id))
        ?.spaces ?? []
    )
      .filter((entry) => validId(Number(entry.id)))
      .map((entry) => new TitleInterface({ id: Number(entry.id), title: entry.space.title })),
  );
  const loadingFloors = computed(
    () =>
      controller.floorsState.value instanceof DataLoading ||
      controller.ownerState.value instanceof DataLoading,
  );
  const failure = computed(() => controller.itemState.value.error?.displayMessage);
  const backendErrors = computed(() =>
    Object.values(controller.itemState.value.error?.validationErrors ?? {}).flat(),
  );
  const displayedErrors = computed(() => {
    const aliases: Record<string, string> = {
      employee_id: 'employeeId',
      project_floor_space_id: 'projectFloorSpaceId',
      supply_responsibility: 'supplyResponsibility',
      project_timeline_stage_id: 'projectTimelineStageId',
      itemable_id: 'itemableId',
      itemable_type: 'itemableType',
    };
    const serverErrors = Object.entries(
      controller.itemState.value.error?.validationErrors ?? {},
    ).flatMap(([field, messages]) => {
      const parts = field.split('.');
      const last = parts.pop() ?? '';
      const mappedField = [...parts, aliases[last] ?? last].join('.');
      return messages.map((message) => ({ field: mappedField, message }));
    });
    return [...errors.value, ...serverErrors];
  });
  function addRow() {
    rows.value.push({
      key: nextKey++,
      stage: null,
      itemableType: 'material',
      itemable: null,
      quantity: null,
    });
  }
  function single(
    selection: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    return Array.isArray(selection) ? null : selection;
  }
  function error(field: string) {
    return displayedErrors.value.find((entry) => entry.field === field)?.message;
  }
  watch(allProject, () => {
    floor.value = space.value = null;
  });
  watch(floor, () => {
    space.value = null;
  });
  watch(
    () => props.visible,
    (visible) => {
      if (!visible) return;
      employee.value = supply.value = floor.value = space.value = null;
      priority.value = priorityOptions.value[0] ?? null;
      // employeeSearch.value = '';
      allProject.value = true;
      rows.value = [];
      errors.value = [];
      controller.itemState.value = new DataInitial();
      addRow();
    },
    { immediate: true },
  );
  async function save() {
    if (busy.value) return;
    const params = new StorePurchaseRequestParams({
      quoteId: controller.quoteId.value ?? 0,
      employeeId: Number(employee.value?.id),
      isAllProject: allProject.value,
      projectFloorSpaceId: allProject.value ? null : Number(space.value?.id) || null,
      supplyResponsibility: Number(supply.value?.id) as SupplyResponsibility,
      priority: Number(priority.value?.id) as PurchaseRequestPriority,
      items: rows.value.map(
        (row) =>
          new PurchaseRequestItemParams(
            Number(row.stage?.id),
            row.itemableType,
            Number(row.itemable?.id),
            row.quantity ?? 0,
          ),
      ),
    });
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    const saved = await controller.create(params);
    if (saved instanceof DataSuccess) emit('update:visible', false);
  }
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    class="procurement-dialog"
    :header="$t('procurement.new_requirement')"
    :closable="!busy"
    :close-on-escape="!busy"
    @update:visible="!busy && emit('update:visible', $event)"
  >
    <form class="procurement-form" novalidate @submit.prevent="save">
      <p>{{ $t('procurement.request_form_help') }}</p>
      <section aria-labelledby="requirement-general">
        <h2 id="requirement-general">{{ $t('procurement.general_information') }}</h2>
        <div class="procurement-fields">
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="requirement-employee"
              :model-value="employee"
              label="procurement.assigned_employee"
              :placeholder="$t('procurement.select_employee')"
              :controller="employeeLookup"
              :params="employeeParams"
              :disabled="busy"
              :reload="false"
              paginated
              required
              @update:model-value="employee = single($event)"
            >
              <template #LabelHeader>
                <span class="field-help-label-row">
                  <FieldHelpIcon
                    :label="$t('procurement.assigned_employee')"
                    field-name="assigned_employee"
                    field-id="requirement-employee"
                    :help-text="$t('field_help.execution_fields.assigned_employee')"
                  />
                </span> </template
            ></UpdatedCustomInputSelect>
            <small v-if="error('employeeId')" class="procurement-error" role="alert">{{
              error('employeeId')
            }}</small>
          </div>
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="requirement-supply"
              :model-value="supply"
              label="procurement.supply_responsibility"
              :placeholder="$t('procurement.select_supply')"
              :static-options="supplyOptions"
              :disabled="busy"
              :reload="false"
              required
              @update:model-value="supply = single($event)"
            >
              <template #LabelHeader>
                <span class="field-help-label-row">
                  <FieldHelpIcon
                    :label="$t('procurement.supply_responsibility')"
                    field-name="supply_responsibility"
                    field-id="requirement-supply"
                    :help-text="$t('field_help.execution_fields.supply_responsibility')"
                  />
                </span> </template></UpdatedCustomInputSelect
            ><small v-if="error('supplyResponsibility')" class="procurement-error" role="alert">{{
              error('supplyResponsibility')
            }}</small>
          </div>
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="requirement-priority"
              :model-value="priority"
              label="procurement.priority"
              :placeholder="$t('procurement.select_priority')"
              :static-options="priorityOptions"
              :disabled="busy"
              :reload="false"
              required
              @update:model-value="priority = single($event)"
            >
              <template #LabelHeader>
                <span class="field-help-label-row">
                  <FieldHelpIcon
                    :label="$t('procurement.priority')"
                    field-name="priority"
                    field-id="requirement-priority"
                    :help-text="$t('field_help.execution_fields.priority')"
                  />
                </span> </template></UpdatedCustomInputSelect
            ><small v-if="error('priority')" class="procurement-error" role="alert">{{
              error('priority')
            }}</small>
          </div>
        </div>
      </section>
      <section aria-labelledby="requirement-scope-heading">
        <h2 id="requirement-scope-heading">{{ $t('procurement.scope') }}</h2>
        <fieldset class="field-group procurement-type">
          <legend>
            <span class="field-help-label-row"
              >{{ $t('procurement.scope')
              }}<FieldHelpIcon
                :label="$t('procurement.scope')"
                field-name="scope"
                field-id="requirement-scope"
                :help-text="$t('field_help.execution_fields.scope')"
              />
            </span>
          </legend>
          <div class="procurement-type-options">
            <label for="requirement-all-project"
              ><RadioButton
                v-model="allProject"
                input-id="requirement-all-project"
                name="requirement-scope"
                :value="true"
                :disabled="busy"
              />{{ $t('procurement.entire_project') }}</label
            >
            <label for="requirement-specific-space"
              ><RadioButton
                v-model="allProject"
                input-id="requirement-specific-space"
                name="requirement-scope"
                :value="false"
                :disabled="busy || !controller.projectId.value"
              />{{ $t('procurement.specific_space') }}</label
            >
          </div>
        </fieldset>
        <p v-if="!controller.projectId.value && !loadingFloors" role="status">
          {{ $t('procurement.project_missing') }}
        </p>
        <p v-if="loadingFloors" role="status">{{ $t('procurement.loading_locations') }}</p>
        <AppButton
          v-if="controller.ownerState.value.hasError"
          type="button"
          theme="secondary"
          :disabled="busy"
          @click="controller.loadOwner()"
          >{{ $t('procurement.retry') }}</AppButton
        >
        <div v-if="!allProject" class="procurement-fields">
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="requirement-floor"
              :model-value="floor"
              label="procurement.floor"
              :placeholder="$t('procurement.select_floor')"
              :static-options="floorOptions"
              :disabled="busy || loadingFloors"
              :reload="false"
              required
              @update:model-value="floor = single($event)"
            >
              <template #LabelHeader>
                <span class="field-help-label-row">
                  <FieldHelpIcon
                    :label="$t('procurement.floor')"
                    field-name="floor"
                    field-id="requirement-floor"
                    :help-text="$t('field_help.execution_fields.floor')"
                  />
                </span> </template
            ></UpdatedCustomInputSelect>
          </div>
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="requirement-space"
              :model-value="space"
              label="procurement.space"
              :placeholder="$t('procurement.select_space')"
              :static-options="spaceOptions"
              :disabled="busy || !floor || loadingFloors"
              :reload="false"
              required
              @update:model-value="space = single($event)"
            >
              <template #LabelHeader>
                <span class="field-help-label-row">
                  <FieldHelpIcon
                    :label="$t('procurement.space')"
                    field-name="space"
                    field-id="requirement-space"
                    :help-text="$t('field_help.execution_fields.space')"
                  />
                </span> </template></UpdatedCustomInputSelect
            ><small v-if="error('projectFloorSpaceId')" class="procurement-error" role="alert">{{
              error('projectFloorSpaceId')
            }}</small>
            <p v-if="floor && !spaceOptions.length">{{ $t('procurement.no_spaces') }}</p>
          </div>
          <div v-if="controller.floorsState.value.hasError" role="alert">
            <p>{{ $t('procurement.locations_error') }}</p>
            <AppButton
              type="button"
              theme="secondary"
              :disabled="busy"
              @click="controller.loadFloors()"
              >{{ $t('procurement.retry') }}</AppButton
            >
          </div>
          <p v-else-if="!loadingFloors && !floorOptions.length">
            {{ $t('procurement.no_floors') }}
          </p>
        </div>
      </section>
      <section aria-labelledby="requirement-items">
        <h2 id="requirement-items">{{ $t('procurement.requested_items') }}</h2>
        <p v-if="controller.stagesState.value instanceof DataLoading" role="status">
          {{ $t('procurement.loading_stages') }}
        </p>
        <div v-else-if="controller.stagesState.value.hasError" role="alert">
          <p>{{ $t('procurement.stages_error') }}</p>
          <AppButton
            type="button"
            theme="secondary"
            :disabled="busy"
            @click="controller.loadStages()"
            >{{ $t('procurement.retry') }}</AppButton
          >
        </div>
        <p v-else-if="!controller.mainStages.value.length" role="status">
          {{ $t('procurement.main_stages_unavailable') }}
        </p>
        <PurchaseRequestItemRow
          v-for="(row, index) in rows"
          :key="row.key"
          :model-value="row"
          :index="index"
          :can-remove="rows.length > 1"
          :disabled="busy"
          :errors="displayedErrors"
          @update:model-value="rows[index] = $event"
          @remove="rows.length > 1 && rows.splice(index, 1)"
        />
        <div class="action-row">
          <AppButton type="button" theme="secondary" :disabled="busy" @click="addRow">{{
            $t('procurement.add_item')
          }}</AppButton>
        </div>
      </section>
      <p v-if="failure" class="procurement-error" role="alert">{{ $t(failure) }}</p>
      <ul v-if="backendErrors.length" class="procurement-error" role="alert">
        <li v-for="(message, index) in backendErrors" :key="index">{{ message }}</li>
      </ul>
      <div class="procurement-actions">
        <AppButton
          type="button"
          theme="secondary"
          :disabled="busy"
          @click="emit('update:visible', false)"
          >{{ $t('procurement.cancel') }}</AppButton
        ><AppButton
          type="submit"
          :loading="busy"
          :disabled="busy || !controller.mainStages.value.length"
          >{{ $t('procurement.create_requirement') }}</AppButton
        >
      </div>
    </form>
  </Dialog>
</template>
