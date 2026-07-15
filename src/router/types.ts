import type { RouteRecordRaw } from 'vue-router';
import type { UserType } from '@/modules/auth/core/constants/userType.enum';

declare module 'vue-router' {
  interface RouteMeta {
    allowedUserTypes?: readonly UserType[];
  }
}

export interface WebsiteModule {
  path: string;
  name: string;
  singular?: string;
  plural?: string;
}

export interface RouteConfig {
  path: string;
  name: string;
  basePath: string;
}

export type { RouteRecordRaw };
