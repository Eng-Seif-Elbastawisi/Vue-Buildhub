import { describe, it, expect } from 'vitest';
import { buildBreadcrumb } from '../RouteHelper';

const makeRoute = (params: Record<string, string>, matched: any[]) => ({
  params,
  matched,
});

const makeRouter = (routes: any[]) => ({
  getRoutes: () => routes,
});

describe('buildBreadcrumb', () => {
  it('should always include a Home crumb as the first item', () => {
    const route = makeRoute({ country_code: 'eg' }, []);
    const router = makeRouter([]);
    const crumbs = buildBreadcrumb(route, router);
    expect(crumbs[0]).toEqual({ label: 'Home', url: '/eg/' });
  });

  it('should use "/" as the Home url when no country_code param exists', () => {
    const route = makeRoute({}, []);
    const router = makeRouter([]);
    const crumbs = buildBreadcrumb(route, router);
    expect(crumbs[0]).toEqual({ label: 'Home', url: '/' });
  });

  it('should add breadcrumb entries for matched routes that have meta.breadcrumb', () => {
    const matchedRoute = {
      name: 'Employees',
      meta: { breadcrumb: 'Employees' },
      path: '/:country_code/employees',
    };
    const route = makeRoute({ country_code: 'sa' }, [matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route, router);

    expect(crumbs).toHaveLength(2);
    // expect(crumbs[1].label).toBe('Employees');
  });

  it('should skip matched routes without meta.breadcrumb', () => {
    const matchedRoute = {
      name: 'Hidden',
      meta: {},
      path: '/:country_code/hidden',
    };
    const route = makeRoute({ country_code: 'kw' }, [matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route, router);

    // Only the Home crumb should be present
    expect(crumbs).toHaveLength(1);
  });

  it('should not add duplicate breadcrumb entries for the same route name', () => {
    const matchedRoute = {
      name: 'Dashboard',
      meta: { breadcrumb: 'Dashboard' },
      path: '/:country_code/',
    };
    // Simulate route matched twice (e.g., parent + child both have same name — edge case)
    const route = makeRoute({ country_code: 'eg' }, [matchedRoute, matchedRoute]);
    const router = makeRouter([matchedRoute]);
    const crumbs = buildBreadcrumb(route, router);

    const dashboardCrumbs = crumbs.filter((c) => c.label === 'Dashboard');
    expect(dashboardCrumbs).toHaveLength(1);
  });

  it('should resolve parent route and prepend it before the child', () => {
    const parentRoute = {
      name: 'Admin',
      meta: { breadcrumb: 'Admin' },
      path: '/:country_code/admin',
    };
    const childRoute = {
      name: 'Users',
      meta: { breadcrumb: 'Users', parent: 'Admin' },
      path: '/:country_code/admin/users',
    };
    const route = makeRoute({ country_code: 'qa' }, [childRoute]);
    const router = makeRouter([parentRoute, childRoute]);
    const crumbs = buildBreadcrumb(route, router);

    const labels = crumbs.map((c) => c.label);
    expect(labels).toContain('Admin');
    expect(labels).toContain('Users');
    expect(labels.indexOf('Admin')).toBeLessThan(labels.indexOf('Users'));
  });
});
