import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';

export function useCountryRouting() {
  const router = useRouter();

  function pushWithCountry(to: RouteLocationRaw) {
    return router.push(to);
  }

  function replaceWithCountry(to: RouteLocationRaw) {
    return router.replace(to);
  }

  function createCountryRoute(to: RouteLocationRaw): RouteLocationRaw {
    return to;
  }

  function createCountryPath(path: string): string {
    return path;
  }

  return {
    pushWithCountry,
    replaceWithCountry,
    createCountryRoute,
    createCountryPath,
  };
}
