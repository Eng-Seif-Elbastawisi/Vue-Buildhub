// src/composables/useRouteSearch.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { dashboardRoutes } from '@/router/routes/modules/index';
import type { RouteRecordRaw } from '@/router/types';

export interface SearchableRoute {
  name: string;
  title: string;
  path: string;
}

function flattenRoutes(routes: RouteRecordRaw[], parentPath = '/eg'): SearchableRoute[] {
  return routes.reduce<SearchableRoute[]>((acc, route) => {
    if (route.meta?.searchable === false) return acc;

    // Skip dynamic segments like :id/edit — nothing useful to navigate to
    if (route.path.includes(':')) return acc;

    const fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');
    const title = route.meta?.title ?? route.meta?.breadcrumb ?? String(route.name ?? '');

    if (title) {
      acc.push({
        name: String(route.name ?? ''),
        title: String(title),
        path: fullPath,
      });
    }
    // console.log(acc, 'acc');

    if (route.children?.length) {
      acc.push(...flattenRoutes(route.children, fullPath));
    }

    return acc;
  }, []);
}

// Built once — routes are static
const allRoutes = flattenRoutes(dashboardRoutes);

export function useRouteSearch() {
  const router = useRouter();
  const query = ref('');
  const isOpen = ref(false);
  const activeIndex = ref(-1);

  const results = computed<SearchableRoute[]>(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return [];

    return allRoutes.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 8);
  });

  function navigate(route: SearchableRoute) {
    router.push(route.path);
    reset();
  }

  function onKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
    } else if (e.key === 'Enter' && activeIndex.value >= 0) {
      navigate(results.value![activeIndex.value]!);
    } else if (e.key === 'Escape') {
      reset();
    }
  }

  function reset() {
    query.value = '';
    isOpen.value = false;
    activeIndex.value = -1;
  }

  return { query, results, isOpen, activeIndex, navigate, onKeydown, reset };
}
