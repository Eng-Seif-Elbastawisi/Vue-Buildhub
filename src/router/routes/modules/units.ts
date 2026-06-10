import type { RouteRecordRaw } from "@/router/types";

export const unitsRoutes: RouteRecordRaw[] = [
  {
    path: "units",
    name: "Units",
    component: () => import("@/views/unit/IndexUnit.vue"),
    meta: {
      breadcrumb: "Unit",
    },
  },
  {
    path: "units/add",
    name: "Add Unit",
    component: () => import("@/views/unit/AddUnit.vue"),
    meta: {
      breadcrumb: "Add Unit",
      parent: "Units",
    },
  },
  {
    path: "units/edit/:id",
    name: "Edit Unit",
    component: () => import("@/views/unit/EditUnit.vue"),
    props: true,
    meta: {
      breadcrumb: "Edit Unit",
      parent: "Units",
    },
  },
];
