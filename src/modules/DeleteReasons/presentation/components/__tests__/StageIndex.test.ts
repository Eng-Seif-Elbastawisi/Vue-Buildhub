import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import DeletedReasonesDialog from '../../subComponent/DeletedReasonesDialog.vue';

// ── Dialog manager ────────────────────────────────────────────────────────────
vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    loading: vi.fn(),
    hideLoading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    progress: vi.fn(),
  },
}));

// ── Controller ────────────────────────────────────────────────────────────────
const mockFetchList = vi.fn().mockResolvedValue(undefined);
const mockCreate = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn().mockResolvedValue(undefined);
const mockListState = ref({ data: [] } as any);

const mockController = {
  listState: mockListState,
  fetchList: mockFetchList,
  create: mockCreate,
  delete: mockDelete,
};

vi.mock('../../controllers/deleted.reasons.controller', () => ({
  default: { getInstance: vi.fn(() => mockController) },
}));

// ── PrimeVue Dialog — always render slot content so we can assert on it ───────
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    props: { visible: Boolean, modal: Boolean, pt: Object, style: Object },
    emits: ['update:visible'],
    template: '<div class="mock-dialog"><slot name="header"/><slot/></div>',
  },
}));

// ── Icon / shared component stubs ─────────────────────────────────────────────
vi.mock('@/shared/icons/IndexAddIcon.vue', () => ({
  default: { template: '<span class="index-add-icon"/>' },
}));
vi.mock('@/shared/icons/DocaumentType/EditeIcon.vue', () => ({
  default: { template: '<span class="edit-icon"/>' },
}));
vi.mock('@/shared/icons/DeletedAccountsIcon.vue', () => ({
  default: { template: '<span class="deleted-accounts-icon"/>' },
}));
vi.mock('@/shared/icons/DocaumentType/IndexDelete.vue', () => ({
  default: { template: '<span class="index-delete-icon"/>' },
}));
vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div class="multi-lang-input"></div>',
    props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
    emits: ['update:modelValue'],
  },
}));
vi.mock('@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue', () => ({
  default: {
    name: 'DeleteDialog',
    template: '<div class="delete-dialog"><slot name="btn"/></div>',
    props: ['title', 'message', 'hasbtn'],
    emits: ['delete'],
  },
}));

// ── Factory ───────────────────────────────────────────────────────────────────
const createWrapper = () =>
  mount(DeletedReasonesDialog, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('DeletedReasonesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListState.value = { data: [] } as any;
    mockFetchList.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the trigger button', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('button.btn.btn-primary').exists()).toBe(true);
  });

  it('trigger button contains "Deleted Reason" text', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('button.btn.btn-primary').text()).toContain('Deleted Reason');
  });

  it('calls fetchList on mount', async () => {
    createWrapper();
    await flushPromises();
    expect(mockFetchList).toHaveBeenCalledOnce();
  });

  it('shows dialog content (header + body always rendered by stub)', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('.mock-dialog').exists()).toBe(true);
  });

  it('shows the MultiLangInput in the dialog', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.find('.multi-lang-input').exists()).toBe(true);
  });

  it('renders save button inside dialog', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const buttons = wrapper.findAll('button');
    const labels = buttons.map((b) => b.text());
    expect(labels).toContain('save');
  });

  it('renders cancel button inside dialog', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const buttons = wrapper.findAll('button');
    const labels = buttons.map((b) => b.text());
    expect(labels).toContain('cancel');
  });

  it('renders dialog header text', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    expect(wrapper.text()).toContain('Add New reason for delete');
  });

  it('shows rows for each item in listState.data', async () => {
    mockListState.value = {
      data: [
        { id: 1, Reason: { title: 'Privacy' }, name: 'A', notes: '' },
        { id: 2, Reason: { title: 'Work' }, name: 'B', notes: '' },
      ],
    } as any;

    const wrapper = createWrapper();
    await flushPromises();

    const rows = wrapper.findAll('.document-type-row');
    expect(rows).toHaveLength(2);
  });

  it('displays reason titles for each row', async () => {
    mockListState.value = {
      data: [{ id: 1, Reason: { title: 'Too expensive' }, name: 'A', notes: '' }],
    } as any;

    const wrapper = createWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain('Too expensive');
  });
});
