import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ChooseCountry from '../ChooseCountry.vue';
import CountryController from '@/modules/country/presentation/controllers/country.controller';
import { ref } from 'vue';
import CountryModel from '@/modules/country/core/models/country.model';
import IndexCountryParams from '@/modules/country/core/params/index.country.params';

const mockPush = vi.fn();
const mockQuery = ref({ page: '1', word: '' });

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({
    query: mockQuery.value,
  }),
}));

vi.mock('@/modules/country/presentation/controllers/country.controller', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (fn: any) => fn, // bypass debounce for testing
}));

describe('ChooseCountry.vue', () => {
  let mockFetchList: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchList = vi.fn();
    (CountryController.getInstance as any).mockReturnValue({
      fetchList: mockFetchList,
      listState: ref({
        status: 'success',
        data: [
          new CountryModel({ id: 1, title: 'Egypt', code: 'eg', flag: '/flag1.png' }),
          new CountryModel({ id: 2, title: 'USA', code: 'us', flag: '/flag2.png' }),
        ],
      }),
    });
  });

  const mountOptions = {
    global: {
      mocks: {
        $t: (msg: string) => msg,
      },
      stubs: {
        DataStatusBuilder: {
          template: '<div><slot name="success" :data="data" /></div>',
          setup() {
            return {
              data: [
                new CountryModel({ id: 1, title: 'Egypt', code: 'eg', flag: '/flag1.png' }),
                new CountryModel({ id: 2, title: 'USA', code: 'us', flag: '/flag2.png' }),
              ],
            };
          },
        },
        CountryCard: true,
      },
    },
  };

  it('renders properly and fetches countries on mount', async () => {
    const wrapper = mount(ChooseCountry, mountOptions);
    expect(wrapper.find('h3.title').text()).toBe('Choose your country');

    // The component fetches on mounted
    expect(mockFetchList).toHaveBeenCalledTimes(1);
    expect(mockFetchList).toHaveBeenCalledWith(new IndexCountryParams('', 1, 10));
  });

  it('shows the auth layout section', () => {
    const wrapper = mount(ChooseCountry, mountOptions);
    expect(wrapper.find('section.auth-layout').exists()).toBe(true);
  });

  it('navigates to login on continue button click', async () => {
    const wrapper = mount(ChooseCountry, mountOptions);

    // Select country (simulate emitted event)
    const cards = wrapper.findAllComponents({ name: 'CountryCard' });
    if (cards.length > 0) {
      await cards[0].vm.$emit(
        'select-country',
        new CountryModel({ id: 1, title: 'Egypt', code: 'eg', flag: '/flag1.png' }),
      );
    }

    const continueButton = wrapper.find('button.btn-primary');
    await continueButton.trigger('click');

    expect(mockPush).toHaveBeenCalledWith({
      name: 'Login',
      params: {
        country_code: 'eg',
      },
    });
  });
});
