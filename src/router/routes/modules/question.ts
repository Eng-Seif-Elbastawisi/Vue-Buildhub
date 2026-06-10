import type { RouteRecordRaw } from '@/router/types';
import EmployeeIcon from '@/shared/icons/BreadcrumbIcons/EmployeeIcon.vue';

export const questionsRoutes: RouteRecordRaw[] = [
  {
    path: 'Questions',
    name: 'Questions',
    component: () => import('@/views/Questions/IndexQuestions.vue'),
    meta: {
      breadcrumb: 'Questions',
      icon: EmployeeIcon,
    },
  },
  {
    path: 'questions/add',
    name: 'Add question',
    component: () => import('@/views/Questions/AddQuestions.vue'),
    meta: {
      breadcrumb: 'Add question',
      icon: EmployeeIcon,
      parent: 'Questions',
    },
  },
  {
    path: 'questions/edit/:id',
    name: 'Edit question',
    component: () => import('@/views/Questions/EditQuestions.vue'),
    props: true,
    meta: {
      breadcrumb: 'Edit question',
      icon: EmployeeIcon,
      parent: 'Questions',
    },
  },
  {
    path: 'questions/show/:id',
    name: 'Show question',
    component: () => import('@/views/Questions/ShowQuestion.vue'),
    props: true,
    meta: {
      breadcrumb: 'Show question',
      icon: EmployeeIcon,
      parent: 'Questions',
    },
  },
];
