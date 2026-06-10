import type { RouteRecordRaw } from '@/router/types';
import EmployeeIcon from '@/shared/icons/BreadcrumbIcons/EmployeeIcon.vue';

export const ArticlesRoutes: RouteRecordRaw[] = [
  {
    path: 'Articles',
    name: 'Articles',
    component: () => import('@/views/Articles/IndexArticles.vue'),
    meta: {
      breadcrumb: 'Articles',
      icon: EmployeeIcon,
    },
  },
  {
    path: 'articles/add',
    name: 'Add article',
    component: () => import('@/views/Articles/AddArticles.vue'),
    meta: {
      breadcrumb: 'add artical questions',
      icon: EmployeeIcon,
      parent: 'Articles',
    },
  },
  {
    path: 'articles/edit/:id',
    name: 'Edit article',
    component: () => import('@/views/Articles/EditArticles.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit article',
      icon: EmployeeIcon,
      parent: 'Articles',
    },
  },
  {
    path: 'articles/show/:id',
    name: 'Show article',
    component: () => import('@/views/Articles/ShowArticles.vue'),
    props: true,
    meta: {
      breadcrumb: 'artical details',
      icon: EmployeeIcon,
      parent: 'Articles',
    },
  },
];
