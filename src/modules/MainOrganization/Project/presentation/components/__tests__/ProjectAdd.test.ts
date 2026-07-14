import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectParams from '../../../core/params/add.project.params';
import ProjectAdd from '../ProjectAdd.vue';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  toastWarning: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      create: mocks.create,
      errorMessage: mocks.errorMessage,
    }),
  },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastWarning: mocks.toastWarning,
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    fullPath: '/organization/project/add',
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProjectAdd.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.create.mockResolvedValue({});
    mocks.errorMessage.value = null;
  });

  it('should be defined', () => {
    expect(ProjectAdd).toBeDefined();
  });

  it('does not create a project when emitted params have an empty title', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: ' ', ar: '' } }),
    });

    const wrapper = mount(ProjectAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalledWith('validation.title_required');
  });

  it('does not create a project when required select values are missing', async () => {
    const invalidParams = new AddProjectParams({
      translations: new TranslationParams({ title: { en: 'Project title' } }),
      client_exist: false,
    });

    const wrapper = mount(ProjectAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectForm: {
            emits: ['updateData'],
            template:
              '<button data-test="emit-invalid" type="button" @click="$emit(\'updateData\', invalidParams)">emit</button>',
            setup: () => ({ invalidParams }),
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    await wrapper.find('[data-test="emit-invalid"]').trigger('click');
    await wrapper.find('.btn-primary').trigger('click');
    await flushPromises();

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.toastWarning).toHaveBeenCalled();
  });
});
