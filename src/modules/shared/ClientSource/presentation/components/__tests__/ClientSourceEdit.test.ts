import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientSourceEdit from '../ClientSourceEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
}));

vi.mock('../../controllers/client.source.controller.ts', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: { value: { id: 1, title: 'Referral' } },
      errorMessage: { value: '' },
    }),
  },
}));

describe('ClientSourceEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the translated save action', () => {
    const wrapper = mount(ClientSourceEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { ClientSourceForm: true },
      },
    });

    expect(wrapper.text()).toContain('client_source.save');
    expect(wrapper.text()).toContain('cancel');
  });

  it('loads the client source from the route id', () => {
    mount(ClientSourceEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { ClientSourceForm: true },
      },
    });

    expect(fetchOne).toHaveBeenCalledTimes(1);
  });
});
