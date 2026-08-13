import type { RouteRecordRaw } from '@/router/types';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';

const itemBreadcrumb = (route: RouteLocationNormalizedLoaded) => {
  const queryType = Array.isArray(route.query.service_type)
    ? route.query.service_type[0]
    : route.query.service_type;

  if (Number(queryType) === ItemServiceTypeEnum.DESIGN) {
    return { labelKey: 'item.design_title' };
  }

  if (Number(queryType) === ItemServiceTypeEnum.SUPERVISION) {
    return { labelKey: 'item.execution_title' };
  }

  return { labelKey: 'Item' };
};

export const itemRoutes: RouteRecordRaw[] = [
  {
    path: 'item',
    name: 'Item',
    component: () => import('@/views/shared/Item/Indexitem.vue'),
    meta: {
      breadcrumb: itemBreadcrumb,
    },
  },
  {
    path: 'item/add',
    name: 'Add Item',
    component: () => import('@/views/shared/Item/AddItem.vue'),
    meta: {
      breadcrumb: 'Add Item',
      parent: 'Item',
    },
  },
  {
    path: 'item/edit/:id',
    name: 'Edit Item',
    component: () => import('@/views/shared/Item/EditItem.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit Item',
      parent: 'Item',
    },
  },
];
