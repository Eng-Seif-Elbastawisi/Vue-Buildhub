import type { RouteRecordRaw } from "@/router/types";
import DocumentIcon from "@/shared/icons/BreadcrumbIcons/DocumentIcon.vue";

export const documentRoutes: RouteRecordRaw[] = [
  {
    path: "documents",
    name: "Documents",
    component: () => import("@/views/Document/IndexDocument.vue"),
    meta: {
      breadcrumb: "Documents",
      icon: DocumentIcon,
    },
  },
  {
    path: "documents/add",
    name: "Add Document",
    component: () => import("@/views/Document/AddDocument.vue"),
    meta: {
      breadcrumb: "Add Document",
      icon: DocumentIcon,
      parent: "Documents",
    },
  },
  {
    path: "documents/edit/:id",
    name: "Edit Document",
    component: () => import("@/views/Document/EditDocument.vue"),
    props: true,
    meta: {
      breadcrumb: "Edit Document",
      icon: DocumentIcon,
      parent: "Documents",
    },
  },
];
