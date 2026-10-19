import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createI18n } from 'vue-i18n';
import PrimeVue from 'primevue/config';
import TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';
import { mockNetwork, response } from '../../../SiteTeam/__tests__/network';
import { timelineGroup } from '../../../Procurement/__tests__/fixtures';
import WorkItemsController from '../../../WorkItems/presentation/controllers/work-items.controller';
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
  WorkItemsController.getInstance().release();
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
async function render(locale = 'en') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
  });
  await router.push('/organization/execution-quotes/show/140/work-items');
  const wrapper = mount(TimelineStartRequiredAlert, {
    props: { quoteId: 140 },
    attachTo: document.body,
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
  expect(post).not.toHaveBeenCalled();
  await wrapper.get('.timeline-widget__trigger').trigger('click');
  await flushPromises();
  return wrapper;
}
it('keeps the panel visible and exposes Retry after a failed fetch', async () => {
  let fail = true;
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? fail
          ? { status: false, message: 'Offline' }
          : overview([])
        : { status: true, data: { id: 140, timeline_status: 3 } },
    ),
  );
  const wrapper = await render();
  expect(wrapper.find('.timeline-start-alert').exists()).toBe(true);
  expect(wrapper.text()).toContain(en['schedule.load_error'] ?? 'schedule.load_error');
  expect(
    post.mock.calls.filter(([request]) => request.url.includes('fetch_project_timelines')),
  ).toHaveLength(1);
  expect(wrapper.text()).not.toContain(en['execution_updates.no_active']);
  fail = false;
  const retry = wrapper
    .findAll('button')
    .find((button) => button.text() === en['work_items.retry']);
  if (!retry) throw new Error('Missing Retry action');
  await retry.trigger('click');
  await flushPromises();
  expect(wrapper.text()).toContain(en['execution_updates.create_schedule']);
  expect(wrapper.find('form').exists()).toBe(false);
  wrapper.unmount();
});
it('shows every Group status without dialogs and prevents starting before approval', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? overview([group(2), group(3, 1), group(4, 2), group(5, 3)])
        : { status: true, data: { id: 140, timeline_status: 1 } },
    ),
  );
  const wrapper = await render();
  expect(wrapper.findAll('[data-group-id]')).toHaveLength(4);
  expect(wrapper.findAll('form')).toHaveLength(3);
  expect(wrapper.text()).toContain(en['execution_updates.approval_required']);
  expect(wrapper.get('a').attributes('href')).toBe(
    '/organization/execution-quotes/show/140/schedule',
  );
  for (const form of wrapper.findAll('form')) {
    expect(form.get('button[type="submit"]').attributes('disabled')).toBeDefined();
    await form.trigger('submit');
  }
  expect(post.mock.calls.some(([request]) => request.url.includes('change_'))).toBe(false);
  expect(wrapper.findComponent({ name: 'Dialog' }).exists()).toBe(false);
  wrapper.unmount();
});
it('starts only the chosen Group inline and retains the list after authoritative refresh', async () => {
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
  const workItems = WorkItemsController.getInstance();
  workItems.activate(140);
  const wrapper = await render();
  expect(wrapper.text()).toContain(en['execution_updates.no_active']);
  expect(
    post.mock.calls.filter(([request]) => request.url.includes('fetch_project_timelines')),
  ).toHaveLength(1);
  const row = wrapper.get('[data-group-id="3"]');
  row
    .getComponent(UpdatedCustomInputSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 1, title: 'Client' }));
  await row.get('#timeline-note-140-3').setValue('Resume this group');
  await Promise.all([row.get('form').trigger('submit'), row.get('form').trigger('submit')]);
  await flushPromises();
  const writes = post.mock.calls.filter(([request]) =>
    request.url.includes('change_project_timeline_work_status'),
  );
  expect(writes).toHaveLength(1);
  expect(writes[0]?.[0].data).toEqual({
    project_timeline_id: 3,
    work_status: 1,
    reason: 1,
    note: 'Resume this group',
  });
  expect(
    post.mock.calls.some(
      ([request]) =>
        request.url.includes('fetch_project_timelines') && request.data.work_status === 1,
    ),
  ).toBe(true);
  expect(workItems.stages.value.map((stage) => stage.id)).toContain(17);
  expect(wrapper.findAll('[data-group-id]')).toHaveLength(2);
  expect(wrapper.find('[data-group-id="3"] form').exists()).toBe(false);
  expect(wrapper.find('[data-group-id="2"] form').exists()).toBe(true);
  expect(wrapper.text()).not.toContain(en['execution_updates.no_active']);
  expect(
    ScheduleController.getInstance().listState.value.data?.find((entry) => entry.id === 2)
      ?.workStatus,
  ).toBeNull();
  wrapper.unmount();
});
it('preserves inline values and a focusable RTL action after backend rejection without retries', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('change_project_timeline_work_status')
        ? { status: false, message: 'Permission denied' }
        : request.url.includes('fetch_project_timelines')
          ? overview([group(2)])
          : { status: true, data: { id: 140, timeline_status: 3 } },
    ),
  );
  const wrapper = await render('ar');
  expect(wrapper.get('.timeline-widget').attributes('dir')).toBe('rtl');
  const action = wrapper.get('button[type="submit"]');
  (action.element as HTMLButtonElement).focus();
  expect(document.activeElement).toBe(action.element);
  await wrapper.get('#timeline-note-140-2').setValue('Keep this note');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.text()).toContain('Permission denied');
  expect((wrapper.get('#timeline-note-140-2').element as HTMLInputElement).value).toBe(
    'Keep this note',
  );
  expect(wrapper.find('[data-group-id="2"] form').exists()).toBe(true);
  expect(post.mock.calls.filter(([request]) => request.url.includes('change_'))).toHaveLength(1);
  wrapper.unmount();
});

it('opens only on click and Escape closes the panel and returns focus to the fixed icon', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? overview([group(2, 1)])
        : { status: true, data: { id: 140, timeline_status: 3 } },
    ),
  );
  const wrapper = await render();
  const trigger = wrapper.get('.timeline-widget__trigger');
  expect(trigger.attributes('aria-expanded')).toBe('true');
  expect(wrapper.get('.timeline-start-alert').attributes('id')).toBe(
    trigger.attributes('aria-controls'),
  );
  await wrapper.get('.timeline-start-alert').trigger('keydown', { key: 'Escape' });
  expect(wrapper.find('.timeline-start-alert').exists()).toBe(false);
  expect(trigger.attributes('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(trigger.element);
  wrapper.unmount();
});

it('shows loading without a false no-active warning while the opened panel fetch is pending', async () => {
  let finish: ((result: ReturnType<typeof response>) => void) | undefined;
  const pending = new Promise<ReturnType<typeof response>>((resolve) => {
    finish = resolve;
  });
  post.mockImplementation(async (request) =>
    request.url.includes('fetch_project_timelines')
      ? pending
      : response({ status: true, data: { id: 140, timeline_status: 3 } }),
  );
  const wrapper = await render();
  expect(wrapper.get('[role="status"]').text()).toBe(en['work_items.loading_stages']);
  expect(wrapper.text()).not.toContain(en['execution_updates.no_active']);
  if (!finish) throw new Error('Missing pending Timeline fetch');
  finish(response(overview([])));
  await flushPromises();
  expect(wrapper.text()).toContain(en['execution_updates.create_schedule']);
  wrapper.unmount();
});
