```vue
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import type { RouteLocationRaw } from 'vue-router';

  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';

  import {
    ConvertStatus,
    type ConvertStatus as ConvertStatusType,
  } from '../../../core/constants/convert.status.enum';

  import type {
    NamedEntity,
    ProjectDepartmentItemRow,
    ProjectDepartmentRow,
  } from './projectShow.types';

  const props = defineProps<{
    title: string;
    projectId?: number;

    /**
     * Current project status.
     * The Add Department action appears only for ACCEPT_CLIENT.
     */
    status?: ConvertStatusType;

    departments: ProjectDepartmentRow[];
    emptyLabel: string;
    idLabel: string;
    departmentLabel: string;
    departmentCountLabel: string;
    itemLabel: string;
    itemsLabel: string;
    itemCountLabel: string;
    quantityLabel: string;
    priceLabel: string;
    unitPriceLabel: string;
    finalPriceLabel: string;
    pricingMethodLabel: string;
    floorLabel: string;
    spaceLabel: string;
    createdAtLabel: string;
    totalLabel: string;
    currencyLabel: string;
    hintLabel: string;
    singleOpenHintLabel: string;

    valueOrEmpty: (value?: string | number | null) => string;

    formatNumber: (value?: number | string | null, fractionDigits?: number) => string;

    formatDate: (value?: string | null) => string;

    getEntityName: (entity?: NamedEntity | null) => string;

    getPricingMethodLabel: (method?: number | null) => string;
  }>();

  const activeDepartment = ref('0');

  const toPositiveInteger = (value: unknown): number | undefined => {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    const numericValue = Number(normalizedValue);

    return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : undefined;
  };

  const validProjectId = computed<number | undefined>(() => {
    return toPositiveInteger(props.projectId);
  });

  /**
   * Add Department is available only when:
   * - Project status is ACCEPT_CLIENT = 13.
   * - Project ID is valid.
   */
  const canAddDepartment = computed<boolean>(() => {
    return (
      Number(props.status) === ConvertStatus.ACCEPT_CLIENT && validProjectId.value !== undefined
    );
  });

  const addDepartmentRoute = computed<RouteLocationRaw>(() => {
    return {
      path: '/organization/project-item/add',

      ...(validProjectId.value
        ? {
            query: {
              project_id: validProjectId.value,
            },
          }
        : {}),
    };
  });

  const getDepartmentItems = (department: ProjectDepartmentRow): ProjectDepartmentItemRow[] => {
    return department.items ?? [];
  };

  const getDepartmentTotal = (department: ProjectDepartmentRow): number => {
    return getDepartmentItems(department).reduce((total, item) => {
      const price = Number(item.final_price);

      return Number.isFinite(price) ? total + price : total;
    }, 0);
  };

  const totalItemsCount = computed<number>(() => {
    return props.departments.reduce((total, department) => {
      return total + getDepartmentItems(department).length;
    }, 0);
  });
</script>

<template>
  <details
    id="project-items"
    class="project-card project-departments-card project-section-disclosure"
  >
    <summary class="card-title project-departments-heading">
      <i class="pi pi-sitemap" aria-hidden="true" />

      <h2>
        {{ title }}
      </h2>

      <span v-if="departments.length" class="department-summary-pill">
        {{ departments.length }}
        {{ departmentCountLabel }}

        ·

        {{ totalItemsCount }}
        {{ itemsLabel }}
      </span>

      <RouterLink
        v-if="canAddDepartment"
        class="btn btn-primary department-add-action project-action-btn project-action-btn--primary"
        :to="addDepartmentRoute"
        @click.stop
      >
        <i class="pi pi-plus" aria-hidden="true" />

        <span>
          {{ $t('add.department') }}
        </span>
      </RouterLink>

      <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true" />
    </summary>

    <p class="project-departments-hint">
      {{ hintLabel }}
    </p>

    <div v-if="!departments.length" class="empty-panel">
      {{ emptyLabel }}
    </div>

    <Accordion v-else v-model:value="activeDepartment" class="department-accordion">
      <AccordionPanel
        v-for="(department, departmentIndex) in departments"
        :key="department.id ?? departmentIndex"
        :value="departmentIndex.toString()"
        class="department-panel"
      >
        <AccordionHeader class="department-panel__header">
          <div class="department-header-content">
            <span class="department-icon" aria-hidden="true">
              <i class="pi pi-building-columns" />
            </span>

            <div class="department-title-group">
              <span>
                {{ departmentLabel }}
              </span>

              <strong>
                {{ getEntityName(department.department) }}
              </strong>

              <small>
                <i class="pi pi-calendar" aria-hidden="true" />

                {{ createdAtLabel }}

                {{ formatDate(department.created_at) }}
              </small>
            </div>

            <div class="department-header-meta">
              <span class="department-count-pill">
                {{ getDepartmentItems(department).length }}

                {{ itemCountLabel }}
              </span>

              <span class="department-total">
                <small>
                  {{ totalLabel }}
                </small>

                <strong>
                  {{ formatNumber(getDepartmentTotal(department)) }}

                  {{ currencyLabel }}
                </strong>
              </span>
            </div>
          </div>
        </AccordionHeader>

        <AccordionContent class="department-panel__content">
          <div v-if="!getDepartmentItems(department).length" class="empty-panel">
            {{ emptyLabel }}
          </div>

          <div v-else class="table-wrap department-table-wrap project-department-table-scroll">
            <table class="project-table project-table--departments">
              <thead>
                <tr>
                  <th>
                    {{ idLabel }}
                  </th>

                  <th>
                    {{ itemLabel }}
                  </th>

                  <th>
                    {{ quantityLabel }}
                  </th>

                  <th>
                    {{ unitPriceLabel || priceLabel }}
                  </th>

                  <th>
                    {{ finalPriceLabel }}
                  </th>

                  <th>
                    {{ pricingMethodLabel }}
                  </th>

                  <th>
                    {{ floorLabel }}
                  </th>

                  <th>
                    {{ spaceLabel }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="(item, itemIndex) in getDepartmentItems(department)"
                  :key="item.uuid ?? item.id ?? itemIndex"
                >
                  <td>
                    {{ itemIndex + 1 }}
                  </td>

                  <td>
                    {{ getEntityName(item.item) }}
                  </td>

                  <td>
                    {{ valueOrEmpty(item.quantity) }}
                  </td>

                  <td>
                    {{ formatNumber(item.price) }}

                    {{ currencyLabel }}
                  </td>

                  <td class="department-price-cell">
                    {{ formatNumber(item.final_price) }}

                    {{ currencyLabel }}
                  </td>

                  <td>
                    <span class="department-method-pill">
                      {{ getPricingMethodLabel(item.pricing_method) }}
                    </span>
                  </td>

                  <td>
                    {{ valueOrEmpty(item.project_floor_id) }}
                  </td>

                  <td>
                    {{ valueOrEmpty(item.project_floor_space_id) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div v-if="departments.length" class="department-review-note">
      <i class="pi pi-info-circle" aria-hidden="true" />

      <span>
        {{ singleOpenHintLabel }}
      </span>
    </div>
  </details>
</template>

<style scoped lang="scss">
  .department-add-action {
    display: inline-flex;
    width: fit-content;
    min-height: 2.35rem;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-inline-start: 0.25rem;
    padding-inline: 0.85rem;
    text-decoration: none;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .project-departments-heading {
      flex-wrap: wrap;
    }

    .department-add-action {
      width: 100%;
      margin-inline-start: 0;
      justify-content: center;
    }
  }
</style>
```
