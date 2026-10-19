<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
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
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import type {
    SupplyResponsibility,
    PurchaseRequestPriority,
  } from '../../core/constants/purchase-request.constants';
  import StorePurchaseRequestParams from '../../core/params/store.purchase-request.params';
  import PurchaseRequestItemParams from '../../core/params/purchase-request.item.params';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import { procurementPath } from '../procurement.routes';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import PurchaseRequestItemRow, {
    type PurchaseRequestItemDraft,
  } from './PurchaseRequestItemRow.vue';
  import ProcurementDiscardConfirmation from './ProcurementDiscardConfirmation.vue';
  import '../styles/procurement.scss';
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const controller = PurchaseRequestController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const projectUrl = computed(() => quotePath(route.path, quoteId.value));
  const procurementUrl = computed(() => procurementPath(route.path, quoteId.value));
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
  const formRef = ref<InstanceType<typeof StandardFormLayout> | null>(null);
  const discardVisible = ref(false);
  const leaveApproved = ref(false);
  let leaveResolver: ((allowed: boolean) => void) | undefined;
  const hasChanges = computed(
    () =>
      !!employee.value ||
      !!supply.value ||
      Number(priority.value?.id) !== 1 ||
      !allProject.value ||
      !!floor.value ||
      !!space.value ||
      rows.value.length !== 1 ||
      rows.value.some(
        (row) =>
          !!row.stage || row.itemableType !== 'material' || !!row.itemable || row.quantity !== null,
      ),
  );
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
    Object.entries(controller.itemState.value.error?.validationErrors ?? {})
      .filter(
        ([field]) =>
          ![
            'employee_id',
            'employeeId',
            'supply_responsibility',
            'supplyResponsibility',
            'priority',
            'project_floor_space_id',
            'projectFloorSpaceId',
          ].includes(field) &&
          !/^items\.\d+\.(project_timeline_stage_id|projectTimelineStageId|itemable_type|itemableType|itemable_id|itemableId|quantity)$/.test(
            field,
          ),
      )
      .flatMap(([, messages]) => messages),
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
    quoteId,
    (id) => {
      employee.value = supply.value = floor.value = space.value = null;
      priority.value = priorityOptions.value[0] ?? null;
      allProject.value = true;
      rows.value = [];
      errors.value = [];
      leaveApproved.value = false;
      controller.itemState.value = new DataInitial();
      addRow();
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  function requestLeave(): Promise<boolean> {
    if (busy.value) return Promise.resolve(false);
    if (leaveApproved.value || !hasChanges.value) return Promise.resolve(true);
    if (leaveResolver) return Promise.resolve(false);
    discardVisible.value = true;
    return new Promise((resolve) => {
      leaveResolver = resolve;
    });
  }
  function resolveLeave(allowed: boolean) {
    discardVisible.value = false;
    if (allowed) leaveApproved.value = true;
    leaveResolver?.(allowed);
    leaveResolver = undefined;
  }
  function beforeUnload(event: BeforeUnloadEvent) {
    if (!hasChanges.value || leaveApproved.value) return;
    event.preventDefault();
    event.returnValue = '';
  }
  onBeforeRouteLeave(requestLeave);
  onBeforeRouteUpdate(requestLeave);
  onMounted(() => window.addEventListener('beforeunload', beforeUnload));
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnload);
    leaveResolver?.(false);
    controller.release();
  });
  function cancel() {
    if (!busy.value) void router.push(procurementUrl.value);
  }
  async function focusFirstInvalid() {
    await nextTick();
    const field = displayedErrors.value[0]?.field;
    if (!field) return;
    const item = field.match(/^items\.(\d+)\.(.+)$/);
    const id = item
      ? `requirement-item-${rows.value[Number(item[1])]?.key}-${
          item[2] === 'projectTimelineStageId'
            ? 'stage'
            : item[2] === 'itemableId'
              ? 'catalog'
              : item[2] === 'itemableType'
                ? 'material'
                : item[2]
        }`
      : (
          {
            employeeId: 'requirement-employee',
            supplyResponsibility: 'requirement-supply',
            priority: 'requirement-priority',
            projectFloorSpaceId: floor.value ? 'requirement-space' : 'requirement-floor',
          } as Record<string, string>
        )[field];
    const control = id
      ? (formRef.value?.$el as HTMLElement | undefined)?.querySelector<HTMLElement>(`#${id}`)
      : null;
    control?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    control?.focus();
  }
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
    if (errors.value.length) {
      await focusFirstInvalid();
      return;
    }
    const saved = await controller.create(params);
    if (saved instanceof DataSuccess) {
      leaveApproved.value = true;
      await router.replace(procurementUrl.value);
    } else await focusFirstInvalid();
  }
</script>
<template>
  <section
    class="procurement procurement-create purchase-request-create standard-crud-page"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <p v-if="!validId(quoteId)" role="alert">{{ $t('procurement.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <nav
        class="procurement-create__breadcrumbs purchase-request-breadcrumbs"
        :aria-label="$t('procurement.request_breadcrumbs')"
      >
        <RouterLink :to="projectUrl">{{ $t('procurement.back_to_project') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink :to="procurementUrl">{{ $t('procurement.title') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ $t('procurement.new_requirement') }}</span>
      </nav>
      <header class="procurement-header procurement-intro">
        <div class="procurement-intro-copy">
          <h1>{{ $t('procurement.new_requirement') }}</h1>
          <p>{{ $t('procurement.new_requirement_description') }}</p>
        </div>
        <AppButton type="button" theme="secondary" :disabled="busy" @click="cancel">{{
          $t('procurement.back_to_procurement')
        }}</AppButton>
      </header>
      <StandardFormLayout
        ref="formRef"
        as="form"
        embedded
        class="procurement-form"
        novalidate
        :aria-busy="busy"
        @submit.prevent="save"
      >
        <section class="procurement-panel" aria-labelledby="requirement-general">
          <header class="procurement-header procurement-section-header">
            <h2 id="requirement-general">{{ $t('procurement.general_information') }}</h2>
          </header>
          <div class="procurement-fields purchase-request-info-fields">
            <div
              class="field-group"
              :class="{ 'procurement-field-invalid': !!error('employeeId') }"
            >
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
            <div
              class="field-group"
              :class="{ 'procurement-field-invalid': !!error('supplyResponsibility') }"
            >
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
            <div class="field-group" :class="{ 'procurement-field-invalid': !!error('priority') }">
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
        <section class="procurement-panel" aria-labelledby="requirement-scope-heading">
          <header class="procurement-header procurement-section-header">
            <h2 id="requirement-scope-heading">{{ $t('procurement.scope') }}</h2>
          </header>
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
            <div class="procurement-type-options purchase-request-scope-options">
              <label for="requirement-all-project" :class="{ 'is-selected': allProject }"
                ><RadioButton
                  v-model="allProject"
                  input-id="requirement-all-project"
                  name="requirement-scope"
                  :value="true"
                  :disabled="busy"
                />{{ $t('procurement.entire_project') }}</label
              >
              <label
                for="requirement-specific-space"
                :class="{ 'is-selected': !allProject, 'is-disabled': !controller.projectId.value }"
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
          <Transition name="procurement-reveal">
            <div v-if="!allProject" class="procurement-fields purchase-request-location-fields">
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
              <div
                class="field-group"
                :class="{ 'procurement-field-invalid': !!error('projectFloorSpaceId') }"
              >
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
                ><small
                  v-if="error('projectFloorSpaceId')"
                  class="procurement-error"
                  role="alert"
                  >{{ error('projectFloorSpaceId') }}</small
                >
                <small v-if="!floor">{{ $t('procurement.select_floor_first') }}</small>
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
          </Transition>
        </section>
        <section class="procurement-panel" aria-labelledby="requirement-items">
          <header class="procurement-header procurement-section-header">
            <div>
              <h2 id="requirement-items">{{ $t('procurement.requested_items') }}</h2>
              <p>{{ $t('procurement.request_form_help') }}</p>
            </div>
            <span class="purchase-request-item-count">{{
              $t('procurement.items_count', { count: rows.length })
            }}</span>
          </header>
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
        <p
          v-if="
            failure && !Object.keys(controller.itemState.value.error?.validationErrors ?? {}).length
          "
          class="procurement-error"
          role="alert"
        >
          {{ $t(failure) }}
        </p>
        <ul v-if="backendErrors.length" class="procurement-error" role="alert">
          <li v-for="(message, index) in backendErrors" :key="index">{{ message }}</li>
        </ul>
        <div class="procurement-actions procurement-create__actions">
          <AppButton type="button" theme="secondary" :disabled="busy" @click="cancel">{{
            $t('procurement.cancel')
          }}</AppButton
          ><AppButton
            type="submit"
            :loading="busy"
            :disabled="busy || !controller.mainStages.value.length"
            >{{ $t('procurement.create_requirement') }}</AppButton
          >
        </div>
      </StandardFormLayout>
      <ProcurementDiscardConfirmation
        :visible="discardVisible"
        @keep="resolveLeave(false)"
        @discard="resolveLeave(true)"
      />
    </template>
  </section>
</template>
