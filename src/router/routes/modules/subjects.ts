import type { RouteRecordRaw } from "@/router/types";

export const subjectsRoutes: RouteRecordRaw[] = [
  {
    path: "subjects",
    name: "Subjects",
    component: () => import("@/views/Subjects/IndexSubject.vue"),
    meta: {
      breadcrumb: "Subject",
    },
  },
  {
    path: "subjects/add",
    name: "Add Subject",
    component: () => import("@/views/Subjects/AddSubject.vue"),
    meta: {
      breadcrumb: "Add Subject",
      parent: "Subjects",
    },
  },
  {
    path: "subjects/edit/:id",
    name: "Edit Subject",
    component: () => import("@/views/Subjects/EditSubject.vue"),
    props: true,
    meta: {
      breadcrumb: "Edit Subject",
      parent: "Subjects",
    },
  },
];
