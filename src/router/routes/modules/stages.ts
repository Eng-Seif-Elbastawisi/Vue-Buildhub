import type { RouteRecordRaw } from "@/router/types";

export const stagesRoutes: RouteRecordRaw[] = [
  {
    path: "stages",
    name: "Stages",
    component: () => import("@/views/Stages/IndexStage.vue"),
    meta: {
      breadcrumb: "Stages",
    },
  },
  {
    path: "stages/add",
    name: "Add Stage",
    component: () => import("@/views/Stages/AddStage.vue"),
    meta: {
      breadcrumb: "Add Stage",
      parent: "Stages",
    },
  },
  {
    path: "stages/edit/:id",
    name: "Edit Stage",
    component: () => import("@/views/Stages/EditStage.vue"),
    props: true,
    meta: {
      breadcrumb: "Edit Stage",
      parent: "Stages",
    },
  },
];
