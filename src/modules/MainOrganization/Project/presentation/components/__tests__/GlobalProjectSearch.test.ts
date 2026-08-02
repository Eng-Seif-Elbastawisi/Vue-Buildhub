import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter, type Router, type RouteRecordRaw } from 'vue-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import UserModel from '@/modules/auth/core/models/user.model';
import { useUserStore } from '@/stores/user';

import GlobalProjectSearch from '../GlobalProjectSearch.vue';

const DialogStub = {
  name: 'PrimeDialogStub',
  props: {
    visible: Boolean,
  },
  emits: ['update:visible'],
  template: `
    <section v-if="visible" class="dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

const SkeletonStub = {
  name: 'Skeleton',
  template: '<span class="skeleton-stub" />',
};

const routeComponent = { template: '<div />' };
const routes: RouteRecordRaw[] = [
  { path: '/', component: routeComponent },
  {
    path: '/organization/project/show/:project_id',
    name: 'show-project',
    component: routeComponent,
  },
  { path: '/admin/Project/show/:project_id', component: routeComponent },
];

const projectJson = (id: number, title: string) => ({
  id,
  title,
  created_at: '2026-08-02 12:00:00',
  status: 13,
  client: { id: 7, name: 'Acme Client' },
  project_type: { id: 3, title: 'Residential' },
});

const mountedWrappers: VueWrapper[] = [];

const projectResponse = (
  projects: Array<ReturnType<typeof projectJson>>,
  status = true,
): AxiosResponse => ({
  data: {
    status,
    message: status ? 'Projects loaded' : 'Search failed',
    data: {
      data: projects,
      meta: {
        from: projects.length ? 1 : 0,
        to: projects.length,
        per_page: 20,
        current_page: 1,
        last_page: 1,
        total: projects.length,
      },
    },
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: new AxiosHeaders() },
});

const setUser = (isMaster: boolean): void => {
  useUserStore().user = new UserModel({
    id: 1,
    name: 'Search User',
    email: 'search@example.com',
    type: isMaster ? UserType.ADMIN : UserType.ORGANIZATION,
    isMaster,
    WebSocketToken: 'test-websocket-token',
  });
};

const mountSearch = async (): Promise<{ wrapper: VueWrapper; router: Router }> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  await router.push('/');
  await router.isReady();

  const wrapper = mount(GlobalProjectSearch, {
    attachTo: document.body,
    global: {
      plugins: [router],
      stubs: {
        Dialog: DialogStub,
        Skeleton: SkeletonStub,
      },
    },
  });
  mountedWrappers.push(wrapper);

  return {
    wrapper,
    router,
  };
};

describe('GlobalProjectSearch', () => {
  const networkPost = vi.spyOn(NetworkService.instance, 'post');

  beforeEach(() => {
    setActivePinia(createPinia());
    setUser(false);
    vi.useFakeTimers();
    networkPost.mockReset();
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach((wrapper) => {
      if (wrapper.exists()) wrapper.unmount();
    });
    vi.useRealTimers();
  });

  it('waits for two characters and sends the debounced search on page one', async () => {
    networkPost.mockResolvedValue(projectResponse([projectJson(42, 'Harbor Tower')]));
    const { wrapper } = await mountSearch();
    const input = wrapper.get('input[type="search"]');

    await input.setValue('h');
    await vi.advanceTimersByTimeAsync(500);
    expect(networkPost).not.toHaveBeenCalled();

    await input.setValue('ha');
    expect(wrapper.find('.dialog-stub').exists()).toBe(true);

    await vi.advanceTimersByTimeAsync(449);
    expect(networkPost).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();

    expect(networkPost).toHaveBeenCalledTimes(1);
    expect(networkPost.mock.calls[0]?.[0].data).toMatchObject({
      word: 'ha',
      page: 1,
      per_page: 20,
      with_pagination: 1,
    });
    expect(wrapper.text()).toContain('Harbor Tower');
    expect(wrapper.text()).toContain('Acme Client');
    expect(wrapper.get('.status-badge').classes()).toContain('status-13');
  });

  it('ignores an older response and aborts it when the keyword changes', async () => {
    let resolveFirst: ((response: AxiosResponse) => void) | undefined;
    let resolveSecond: ((response: AxiosResponse) => void) | undefined;
    const firstResponse = new Promise<AxiosResponse>((resolve) => {
      resolveFirst = resolve;
    });
    const secondResponse = new Promise<AxiosResponse>((resolve) => {
      resolveSecond = resolve;
    });

    networkPost.mockReturnValueOnce(firstResponse).mockReturnValueOnce(secondResponse);
    const { wrapper } = await mountSearch();
    const input = wrapper.get('input[type="search"]');

    await input.setValue('ha');
    await vi.advanceTimersByTimeAsync(450);
    const firstSignal = networkPost.mock.calls[0]?.[1]?.signal;

    await input.setValue('har');
    expect(firstSignal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(450);

    resolveSecond?.(projectResponse([projectJson(2, 'Harbor Residence')]));
    await flushPromises();
    expect(wrapper.text()).toContain('Harbor Residence');

    resolveFirst?.(projectResponse([projectJson(1, 'Harbor Legacy')]));
    await flushPromises();
    expect(wrapper.text()).not.toContain('Harbor Legacy');
    expect(wrapper.text()).toContain('Harbor Residence');
  });

  it('moves focus to the first project when Enter is pressed with results open', async () => {
    networkPost.mockResolvedValue(projectResponse([projectJson(42, 'Harbor Tower')]));
    const { wrapper } = await mountSearch();

    await wrapper.get('input[type="search"]').setValue('harbor');
    await vi.advanceTimersByTimeAsync(450);
    await flushPromises();

    await wrapper
      .get('.project-search-dialog__search-field input')
      .trigger('keydown', { key: 'Enter' });
    await flushPromises();

    expect(document.activeElement).toBe(wrapper.get('.project-search-card').element);
  });

  it('shows an error, retries, and then renders the empty state', async () => {
    networkPost
      .mockResolvedValueOnce(projectResponse([], false))
      .mockResolvedValueOnce(projectResponse([]));
    const { wrapper } = await mountSearch();

    await wrapper.get('input[type="search"]').setValue('missing');
    await vi.advanceTimersByTimeAsync(450);
    await flushPromises();

    expect(wrapper.text()).toContain('Projects could not be loaded');

    await wrapper.get('.project-search-dialog__primary-action').trigger('click');
    await flushPromises();

    expect(networkPost).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('No projects found');
  });

  it.each([
    [false, '/organization/project/show/42'],
    [true, '/admin/Project/show/42'],
  ] as const)(
    'navigates through the available project route when isMaster is %s',
    async (isMaster, path) => {
      setUser(isMaster);
      networkPost.mockResolvedValue(projectResponse([projectJson(42, 'Harbor Tower')]));
      const { wrapper, router } = await mountSearch();

      await wrapper.get('input[type="search"]').setValue('harbor');
      await vi.advanceTimersByTimeAsync(450);
      await flushPromises();
      await wrapper.get('.project-search-card__action').trigger('click');
      await flushPromises();

      expect(router.currentRoute.value.path).toBe(path);
      expect(wrapper.find('.dialog-stub').exists()).toBe(false);
    },
  );

  it('aborts the active request when unmounted', async () => {
    networkPost.mockImplementation(() => new Promise<AxiosResponse>(() => undefined));
    const { wrapper } = await mountSearch();

    await wrapper.get('input[type="search"]').setValue('harbor');
    await vi.advanceTimersByTimeAsync(450);
    const signal = networkPost.mock.calls[0]?.[1]?.signal;

    wrapper.unmount();

    expect(signal?.aborted).toBe(true);
  });
});
