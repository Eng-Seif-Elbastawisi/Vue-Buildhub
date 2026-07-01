import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ClientSourceModel from '../../../core/models/client.source.model';
import ClientSourceAdd from '../ClientSourceAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/client.source.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/client-source/add' }),
}));

describe('ClientSourceAdd', () => {
  it('shows cancel during edit and emits cancel while resetting the child form', async () => {
    const wrapper = mount(ClientSourceAdd, {
      props: { clientSource: ClientSourceModel.example },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          ClientSourceForm: {
            props: ['resetKey'],
            template: '<div class="client-source-form-stub" :data-reset-key="resetKey"></div>',
          },
          AppButton: {
            emits: ['click'],
            template: '<button class="app-button-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          IconAccept: true,
        },
      },
    });

    expect(wrapper.find('.client-source-form-stub').attributes('data-reset-key')).toBe('0');

    await wrapper.findAll('.app-button-stub').at(1)?.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.find('.client-source-form-stub').attributes('data-reset-key')).toBe('1');
  });
});
