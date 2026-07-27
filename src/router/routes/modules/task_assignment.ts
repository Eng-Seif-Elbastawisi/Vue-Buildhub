import type { RouteRecordRaw } from '@/router/types';

export const TaskAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: 'task-assignment',
    name: 'mainorganization-task-assignment-index',
    component: () => import('@/views/MainOrganization/TaskAssignment/IndexTaskAssignment.vue'),
    meta: {
      breadcrumb: 'task_assignment.title',
    },
  },
  {
    path: 'task-assignment/create',
    name: 'mainorganization-task-assignment-create',
    component: () => import('@/views/MainOrganization/TaskAssignment/AddTaskAssignment.vue'),
    meta: {
      breadcrumb: 'task_assignment.create_title',
      parent: 'mainorganization-task-assignment-index',
    },
  },
];
