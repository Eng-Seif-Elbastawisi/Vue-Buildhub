import type { RouteRecordRaw, WebsiteModule } from '../types'

/**
 * Generate CRUD routes for a resource
 */
export function createCrudRoutes(
  path: string,
  name: string,
  basePath: string
): RouteRecordRaw[] {
  return [
    {
      path,
      name,
      component: () => import(`@/views/${basePath}/Index${name}.vue`),
    },
    {
      path: `${path}/add`,
      name: `Add ${name}`,
      component: () => import(`@/views/${basePath}/Add${name}.vue`),
    },
    {
      path: `${path}/:id`,
      name: `Edit ${name}`,
      component: () => import(`@/views/${basePath}/Edit${name}.vue`),
    },
  ]
}

/**
 * Generate location routes with parent support
 */
export function createLocationRoutes(
  path: string,
  name: string
): RouteRecordRaw[] {
  return [
    {
      path: `${path}/:parent_id?`,
      name: `locations ${name}`,
      component: () => import(`@/views/Admin/Location/${name}/Index${name}.vue`),
    },
    {
      path: `${path}/add/:parent_id?`,
      name: `Add Location ${name}`,
      component: () => import(`@/views/Admin/Location/${name}/Add${name}.vue`),
    },
    {
      path: `${path}/:id`,
      name: `Edit Location ${name}`,
      component: () => import(`@/views/Admin/Location/${name}/Edit${name}.vue`),
    },
  ]
}

/**
 * Generate website module routes
 */
export function createWebsiteModuleRoutes(
  modules: WebsiteModule[]
): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  modules.forEach((module: WebsiteModule) => {
    const singular = module.singular || module.path
    const displayName = module.plural || module.name

    routes.push(
      {
        path: module.path,
        name: displayName,
        component: () => import(`@/views/Admin/Website/${module.name}/Index${module.name}.vue`),
      },
      {
        path: `${singular}/add`,
        name: `Add ${displayName}`,
        component: () => import(`@/views/Admin/Website/${module.name}/Add${module.name}.vue`),
      },
      {
        path: `${singular}/:id`,
        name: `Edit ${displayName}`,
        component: () => import(`@/views/Admin/Website/${module.name}/Edit${module.name}.vue`),
      }
    )
  })

  return routes
}

/**
 * Add suffix to route names
 */
export function addSuffix(
  routes: RouteRecordRaw[],
  suffix: string
): RouteRecordRaw[] {
  return routes.map((route: RouteRecordRaw) => ({
    ...route,
    name: route.name ? `${String(route.name)} ${suffix}` : route.name,
  }))
}
