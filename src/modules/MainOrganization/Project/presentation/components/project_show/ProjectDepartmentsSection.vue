<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';
  import type {
    ProjectDepartmentItemRow,
    ProjectDepartmentRow,
    NamedEntity,
  } from './projectShow.types';

  const props = defineProps<{
    title: string;
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

  const getDepartmentItems = (department: ProjectDepartmentRow): ProjectDepartmentItemRow[] => {
    return department.items ?? [];
  };

  const getDepartmentTotal = (department: ProjectDepartmentRow) => {
    return getDepartmentItems(department).reduce((total, item) => {
      const price = Number(item.final_price);

      return Number.isFinite(price) ? total + price : total;
    }, 0);
  };

  const totalItemsCount = computed(() => {
    return props.departments.reduce(
      (total, department) => total + getDepartmentItems(department).length,
      0,
    );
  });
</script>

<template>
  <details
    id="project-items"
    class="project-card project-departments-card project-section-disclosure"
  >
    <summary class="card-title project-departments-heading">
      <i class="pi pi-sitemap"></i>
      <h2>{{ title }}</h2>
      <span v-if="departments.length" class="department-summary-pill">
        {{ departments.length }} {{ departmentCountLabel }} · {{ totalItemsCount }}
        {{ itemsLabel }}
      </span>
      <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
    </summary>

    <p class="project-departments-hint">{{ hintLabel }}</p>

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
              <i class="pi pi-building-columns"></i>
            </span>

            <div class="department-title-group">
              <span>{{ departmentLabel }}</span>
              <strong>{{ getEntityName(department.department) }}</strong>
              <small>
                <i class="pi pi-calendar"></i>
                {{ createdAtLabel }} {{ formatDate(department.created_at) }}
              </small>
            </div>

            <div class="department-header-meta">
              <span class="department-count-pill">
                {{ getDepartmentItems(department).length }} {{ itemCountLabel }}
              </span>
              <span class="department-total">
                <small>{{ totalLabel }}</small>
                <strong>
                  {{ formatNumber(getDepartmentTotal(department)) }} {{ currencyLabel }}
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
                  <th>{{ idLabel }}</th>
                  <th>{{ itemLabel }}</th>
                  <th>{{ quantityLabel }}</th>
                  <th>{{ unitPriceLabel || priceLabel }}</th>
                  <th>{{ finalPriceLabel }}</th>
                  <th>{{ pricingMethodLabel }}</th>
                  <th>{{ floorLabel }}</th>
                  <th>{{ spaceLabel }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, itemIndex) in getDepartmentItems(department)"
                  :key="item.uuid ?? item.id"
                >
                  <td>{{ itemIndex + 1 }}</td>
                  <td>{{ getEntityName(item.item) }}</td>
                  <td>{{ valueOrEmpty(item.quantity) }}</td>
                  <td>{{ formatNumber(item.price) }} {{ currencyLabel }}</td>
                  <td class="department-price-cell">
                    {{ formatNumber(item.final_price) }} {{ currencyLabel }}
                  </td>
                  <td>
                    <span class="department-method-pill">
                      {{ getPricingMethodLabel(item.pricing_method) }}
                    </span>
                  </td>
                  <td>{{ valueOrEmpty(item.project_floor_id) }}</td>
                  <td>{{ valueOrEmpty(item.project_floor_space_id) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div v-if="departments.length" class="department-review-note">
      <i class="pi pi-info-circle"></i>
      <span>{{ singleOpenHintLabel }}</span>
    </div>
  </details>
</template>
