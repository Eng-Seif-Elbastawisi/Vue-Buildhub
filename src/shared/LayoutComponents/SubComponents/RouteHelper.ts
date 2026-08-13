import type { RouteLocationMatched } from 'vue-router';

export interface BreadcrumbItem {
  label?: string;
  labelKey?: string;
  url?: string;
}

export const buildBreadcrumb = (route: any, router: any): BreadcrumbItem[] => {
  const result: BreadcrumbItem[] = [];

  const getUrlWithParams = (_r: RouteLocationMatched, route: any) => {
    const Params = Object.values(route.params)[0];
    return Params;
  };

  result.push({
    labelKey: 'home',
    url: '/',
  });

  const added = new Set<string>();
  const allRoutes = router.getRoutes();

  const addRoute = (r: RouteLocationMatched) => {
    if (!r.meta?.breadcrumb || added.has(r.name as string)) return;

    if (r.meta.parent) {
      const parentRoute = allRoutes.find((pr: any) => pr.name === r.meta.parent);
      if (parentRoute) addRoute(parentRoute as any);
    }

    const breadcrumb = r.meta.breadcrumb;
    const resolvedBreadcrumb = typeof breadcrumb === 'function' ? breadcrumb(route) : breadcrumb;
    const breadcrumbLabel =
      typeof resolvedBreadcrumb === 'string'
        ? { labelKey: resolvedBreadcrumb }
        : (resolvedBreadcrumb as BreadcrumbItem);

    result.push({
      ...breadcrumbLabel,
      url: r.path.replace(/\/:[^/]+(\?)?/g, `/${String(getUrlWithParams(r, route))}`),
    });

    added.add(r.name as string);
  };

  route.matched.forEach(addRoute);

  return result;
};
