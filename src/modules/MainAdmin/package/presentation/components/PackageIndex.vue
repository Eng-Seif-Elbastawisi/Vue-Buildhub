<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import type PackageModel from '../../core/models/package.model';
  import { FeaturesKEY } from '../../core/constants/features.enum';

  import DeletePackageParams from '../../core/params/delete.package.params';
  import IndexPackageParams from '../../core/params/index.package.params';
  import PackageController from '../controllers/package.controller';

  const controller = PackageController.getInstance();

  const router = useRouter();
  const route = useRoute();

  const perPage = ref(10);
  const word = ref('');

  const state = computed(() => controller.listState.value);

  const currentPage = computed(() => {
    const page = Number(route.query.page);

    return Number.isInteger(page) && page > 0 ? page : 1;
  });

  const headers: TableHeader[] = [
    {
      key: 'title',
      label: 'package.title',
      sortable: true,
    },
    {
      key: 'duration',
      label: 'package.duration',
      sortable: true,
    },
    {
      key: 'employeenumbers',
      label: 'package.employeenumbers',
    },
    {
      key: 'hasmobild',
      label: 'package.hasmobild',
    },
    {
      key: 'hasportal',
      label: 'package.hasportal',
    },
    {
      key: 'projectnumbers',
      label: 'package.projectnumbers',
    },
    {
      key: 'price',
      label: 'package.price',
      sortable: true,
    },
  ];

  const getFeatureValue = (
    packageItem: PackageModel,
    key: number,
  ): number | boolean | undefined => {
    const feature = packageItem.features.find((item) => Number(item.key) === key);

    return feature?.value as number | boolean | undefined;
  };

  const getNumberFeature = (packageItem: PackageModel, key: number): number => {
    const value = getFeatureValue(packageItem, key);

    const numberValue = Number(value);

    return Number.isFinite(numberValue) ? numberValue : 0;
  };

  const getBooleanFeature = (packageItem: PackageModel, key: number): boolean => {
    const value = getFeatureValue(packageItem, key);

    return value === true || value === 1 || value === '1' || value === 'true';
  };

  const fetchPackages = async (
    page: number = currentPage.value,
    searchWord: string = word.value,
  ): Promise<void> => {
    await controller.fetchList(new IndexPackageParams(searchWord, page, perPage.value, 1));
  };

  const onPageChange = async (page: number): Promise<void> => {
    await router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
      },
    });

    await fetchPackages(page, word.value);
  };

  const onPerPageChange = async (count: number): Promise<void> => {
    perPage.value = count;

    await router.push({
      query: {
        ...route.query,
        page: '1',
        word: word.value || undefined,
      },
    });

    await fetchPackages(1, word.value);
  };

  const deletePackage = async (id: number): Promise<void> => {
    await controller.delete(new DeletePackageParams(id));

    await fetchPackages(currentPage.value, word.value);
  };

  const deleteSelectedPackages = (packages: PackageModel[]) =>
    deleteSelectedRows(
      packages,
      (id) => controller.delete(new DeletePackageParams(id)),
      () => fetchPackages(currentPage.value, word.value),
    );

  onMounted(async () => {
    word.value = typeof route.query.word === 'string' ? route.query.word : '';

    await fetchPackages(currentPage.value, word.value);
  });
</script>

<template>
  <div class="package-page">
    <div class="package-header">
      <div>
        <h4>
          {{ $t('package.index.title') }}
        </h4>

        <p>
          {{ $t('package.index.description') }}
        </p>
      </div>

      <RouterLink class="btn btn-primary" :to="{ name: 'Add Package' }">
        {{ $t('package.add') }}
      </RouterLink>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="() => fetchPackages(currentPage, word)">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as PackageModel[]"
          :bulk-delete="deleteSelectedPackages"
          hoverable
          selectable
          show-index
          striped
        >
          <!-- Employee numbers -->
          <template #cell-employeenumbers="{ item }">
            {{ getNumberFeature(item, FeaturesKEY.NUMBER_OF_EMPLOYEES) }}
          </template>

          <!-- Mobile -->
          <template #cell-hasmobild="{ item }">
            <span
              class="feature-status"
              :class="
                getBooleanFeature(item, FeaturesKEY.HAS_MOBILE)
                  ? 'feature-status--active'
                  : 'feature-status--inactive'
              "
            >
              <i
                :class="
                  getBooleanFeature(item, FeaturesKEY.HAS_MOBILE)
                    ? 'pi pi-check-circle'
                    : 'pi pi-times-circle'
                "
                aria-hidden="true"
              />

              {{
                $t(getBooleanFeature(item, FeaturesKEY.HAS_MOBILE) ? 'package.yes' : 'package.no')
              }}
            </span>
          </template>

          <!-- Portal -->
          <template #cell-hasportal="{ item }">
            <span
              class="feature-status"
              :class="
                getBooleanFeature(item, FeaturesKEY.HAS_PORTAL)
                  ? 'feature-status--active'
                  : 'feature-status--inactive'
              "
            >
              <i
                :class="
                  getBooleanFeature(item, FeaturesKEY.HAS_PORTAL)
                    ? 'pi pi-check-circle'
                    : 'pi pi-times-circle'
                "
                aria-hidden="true"
              />

              {{
                $t(getBooleanFeature(item, FeaturesKEY.HAS_PORTAL) ? 'package.yes' : 'package.no')
              }}
            </span>
          </template>

          <!-- Project numbers -->
          <template #cell-projectnumbers="{ item }">
            {{ getNumberFeature(item, FeaturesKEY.NUMBER_OF_PROJECTS) }}
          </template>

          <!-- Actions -->
          <template #actions="{ item }">
            <div class="row-actions">
              <RouterLink
                class="action-btn edit"
                :title="$t('package.edit')"
                :to="{
                  name: 'Edit Package',
                  params: {
                    id: item.id,
                  },
                }"
              >
                <i class="pi pi-pencil" />
              </RouterLink>

              <DeleteDialog
                :hasbtn="true"
                :message="$t('package.delete_message')"
                :title="$t('package.delete_title')"
                @delete="deletePackage(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" :title="$t('Delete')" type="button">
                    <i class="pi pi-trash" />
                  </button>
                </template>
              </DeleteDialog>
            </div>
          </template>
        </AppTable>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>
            {{ $t('package.empty_title') }}
          </h3>

          <p>
            {{ $t('package.empty_description') }}
          </p>

          <RouterLink
            class="btn btn-primary"
            :to="{
              name: 'Add Package',
            }"
          >
            {{ $t('package.add') }}
          </RouterLink>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :columns="headers.length"
          :has-actions="true"
          :rows="5"
          :selectable="true"
          :show-index="true"
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .package-page,
  .package-header,
  .row-actions {
    display: flex;
  }

  .package-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .package-header {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    h4,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.25rem;
      color: var(--gray-5);
    }
  }

  .row-actions {
    align-items: center;
    gap: 0.75rem;
  }

  .feature-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    min-width: 4.5rem;
    padding: 0.35rem 0.75rem;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;

    &--active {
      color: #047857;
      border-color: #a7f3d0;
      background: #ecfdf5;
    }

    &--inactive {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fef2f2;
    }
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;

    p {
      color: var(--gray-5);
    }
  }

  @media (max-width: 768px) {
    .package-header {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
