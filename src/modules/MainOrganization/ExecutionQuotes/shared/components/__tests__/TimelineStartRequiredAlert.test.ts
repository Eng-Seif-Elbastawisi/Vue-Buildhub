import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import {
  DataSuccess,
  DataLoading,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import { mockNetwork, response } from '../../../SiteTeam/__tests__/network';
import { timelineGroup } from '../../../Procurement/__tests__/fixtures';
import ScheduleGroupModel from '../../../Schedule/core/models/schedule.group.model';
import ScheduleController from '../../../Schedule/presentation/controllers/schedule.controller';
import TimelineStartRequiredAlert from '../TimelineStartRequiredAlert.vue';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  ScheduleController.getInstance().release();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const group = (id: number, status: 1 | 2 | 3 | null = null) => ({
  ...timelineGroup(),
  id,
  work_status: status,
});
const overview = (groups: unknown[]) => ({
  status: true,
  data: { basicData: { count_timeline: groups.length }, data: groups },
});
async function render(state = new DataSuccess<ScheduleGroupModel[]>({ data: [] }), locale = 'en') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  });
  await router.push('/organization/execution-quotes/show/140/work-items');
  const wrapper = mount(TimelineStartRequiredAlert, {
    attachTo: document.body,
    props: { quoteId: 140, state },
    global: {
      mocks: { $t: (key: string) => (locale === 'ar' ? ar : en)[key] ?? key },
      plugins: [
        router,
        PrimeVue,
        createI18n({
          legacy: false,
          locale,
          flatJson: true,
          messages: { en: { ...en }, ar: { ...ar } },
        }),
      ],
      stubs: {
        Teleport: true,
        Dialog: { props: ['visible'], template: '<section v-if="visible"><slot /></section>' },
      },
    },
  });
  await flushPromises();
  return wrapper;
}
it('loading stays quiet and a failed Fetch shows Retry without a false empty warning', async () => {
  const wrapper = await render(new DataLoading());
  expect(wrapper.find('aside').exists()).toBe(false);
  expect(post).not.toHaveBeenCalled();
  await wrapper.setProps({
    state: new DataFailed({ error: new ErrorModel('Offline', ErrorType.networkConnection) }),
  });
  expect(wrapper.text()).toContain('Offline');
  expect(wrapper.text()).not.toContain(en['execution_updates.no_active']);
  await wrapper.get('button').trigger('click');
  expect(wrapper.emitted('refresh')).toHaveLength(1);
  expect(post).not.toHaveBeenCalled();
  wrapper.unmount();
});
it.each([
  ['no-groups', 3, []],
  ['approval', 1, [group(2)]],
])('directs %s to Schedule without starting a Group', async (_scenario, approval, groups) => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? overview(groups as unknown[])
        : { status: true, data: { id: 140, timeline_status: approval } },
    ),
  );
  const wrapper = await render();
  expect(wrapper.get('a').attributes('href')).toBe(
    '/organization/execution-quotes/show/140/schedule',
  );
  expect(wrapper.text()).toContain(
    _scenario === 'no-groups'
      ? en['execution_updates.create_schedule']
      : en['execution_updates.approval_required'],
  );
  expect(post.mock.calls.some((call) => call[0].url.includes('change_'))).toBe(false);
  wrapper.unmount();
});
it('starts only the selected Group through Schedule, then hides after an authoritative active refetch', async () => {
  let started = false;
  post.mockImplementation(async (request) => {
    if (request.url.includes('change_project_timeline_work_status')) {
      started = true;
      return response({
        status: true,
        data: { project_timeline_id: 3, quote_id: 140, work_status: 1 },
      });
    }
    return response(
      request.url.includes('fetch_project_timelines')
        ? overview([group(2), group(3, started ? 1 : null)])
        : { status: true, data: { id: 140, timeline_status: 3 } },
    );
  });
  const wrapper = await render();
  expect(wrapper.text()).toContain(en['execution_updates.no_active']);
  await wrapper.setProps({ quoteId: 140 });
  expect(
    post.mock.calls.filter((call) => call[0].url.includes('fetch_project_timelines')),
  ).toHaveLength(1);
  await wrapper.get('aside button').trigger('click');
  wrapper
    .getComponent(UpdatedCustomInputSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 3, title: 'Chosen Group' }));
  await flushPromises();
  const startAction = wrapper
    .findAll('button')
    .filter((button) => button.text() === en['execution_updates.start'])
    .at(-1);
  if (!startAction) throw new Error('Missing Start Timeline action');
  await startAction.trigger('click');
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const writes = post.mock.calls.filter((call) =>
    call[0].url.includes('change_project_timeline_work_status'),
  );
  expect(writes).toHaveLength(1);
  expect(writes[0]?.[0].data).toEqual({
    project_timeline_id: 3,
    work_status: 1,
    reason: null,
    note: null,
  });
  expect(
    ScheduleController.getInstance().listState.value.data?.find((entry) => entry.id === 2)
      ?.workStatus,
  ).toBeNull();
  expect(wrapper.emitted('refresh')).toHaveLength(1);
  await wrapper.setProps({
    state: new DataSuccess({ data: [ScheduleGroupModel.fromJson(group(3, 1))] }),
  });
  expect(wrapper.find('aside').exists()).toBe(false);
  await wrapper.setProps({ state: new DataSuccess({ data: [] }) });
  await flushPromises();
  expect(wrapper.find('aside').exists()).toBe(true);
  wrapper.unmount();
});
it('uses RTL direction and a focusable action while showing a failed start without automatic retries', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('change_project_timeline_work_status')
        ? { status: false, message: 'Permission denied' }
        : request.url.includes('fetch_project_timelines')
          ? overview([group(2)])
          : { status: true, data: { id: 140, timeline_status: 3 } },
    ),
  );
  const wrapper = await render(undefined, 'ar');
  expect(wrapper.get('aside').attributes('dir')).toBe('rtl');
  const action = wrapper.get('aside button');
  expect(action.attributes('disabled')).toBeUndefined();
  (action.element as HTMLButtonElement).focus();
  expect(document.activeElement).toBe(action.element);
  await action.trigger('click');
  wrapper
    .getComponent(UpdatedCustomInputSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 2, title: 'Chosen Group' }));
  await flushPromises();
  const startAction = wrapper
    .findAll('button')
    .filter((button) => button.text() === ar['execution_updates.start'])
    .at(-1);
  if (!startAction) throw new Error('Missing Start Timeline action');
  await startAction.trigger('click');
  await flushPromises();
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Permission denied');
  expect(wrapper.find('form').exists()).toBe(true);
  expect(wrapper.find('aside').exists()).toBe(true);
  expect(post.mock.calls.filter((call) => call[0].url.includes('change_'))).toHaveLength(1);
  expect(wrapper.emitted('refresh')).toBeUndefined();
  wrapper.unmount();
});
