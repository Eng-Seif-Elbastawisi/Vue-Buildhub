import type { RouteRecordRaw } from '@/router/types';

export const TaskAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: 'task-assignment',
    name: 'mainorganization-task-assignment-index',

    component: () =>
      import(
        '@/views/MainOrganization/TaskAssignment/IndexTaskAssignment.vue'
      ),

    meta: {
      breadcrumb: 'task_assignment.title',
    },
  },

  {
    path: 'task-assignment/create',
    name: 'mainorganization-task-assignment-create',

    component: () =>
      import(
        '@/views/MainOrganization/TaskAssignment/AddTaskAssignment.vue'
      ),

    meta: {
      breadcrumb:
        'task_assignment.create_title',

      parent:
        'mainorganization-task-assignment-index',
    },
  },

  {
    path: 'task-assignment/show/:id',
    name: 'mainorganization-task-assignment-show',

    component: () =>
      import(
        '@/views/MainOrganization/TaskAssignment/ShowTaskAssignment.vue'
      ),

    props: (route) => {
      const idParam = Array.isArray(route.params.id)
        ? route.params.id[0]
        : route.params.id;

      const uuidQuery = Array.isArray(route.query.uuid)
        ? route.query.uuid[0]
        : route.query.uuid;

      return {
        id: String(idParam ?? ''),

        uuid:
          typeof uuidQuery === 'string'
            ? uuidQuery
            : '',
      };
    },

    meta: {
      breadcrumb:
        'task_assignment.show_title',

      parent:
        'mainorganization-task-assignment-index',
    },
  },
];