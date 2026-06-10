import type { RouteRecordRaw } from 'vue-router'

export interface WebsiteModule {
  path: string
  name: string
  singular?: string
  plural?: string
}

export interface RouteConfig {
  path: string
  name: string
  basePath: string
}

export type { RouteRecordRaw }
