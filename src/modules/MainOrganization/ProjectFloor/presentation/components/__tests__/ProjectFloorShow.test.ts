import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ProjectFloorShowModel from '../../../core/models/project.floor.show.model';
import ProjectFloorShow from '../ProjectFloorShow.vue';

const { fetchListMock, routeMock } = vi.hoisted(() => ({
  fetchListMock: vi.fn(),
  routeMock: {
    params: { project_floor_id: '9' },
    query: {},
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeMock,
}));

vi.mock('../../controllers/project.floor.controller', () => ({
  default: {
    getInstance: () => ({
      errorMessage: { value: '' },
      fetchList: fetchListMock,
    }),
  },
}));

describe('ProjectFloorShow', () => {
  beforeEach(() => {
    fetchListMock.mockReset();
    routeMock.params = { project_floor_id: '9' };
    routeMock.query = {};
  });

  it('fetches the floor by route id and renders its details', async () => {
    const floor = new ProjectFloorShowModel({
      id: 9,
      project: { id: 3, title: 'Tower Renovation' },
      project_preview: {
        id: 4,
        preview_date: '2026-07-01',
        preview_time: '10:30:00',
        engineer: { id: 8, title: 'Site Engineer' },
      },
      floor_number: 1,
      site_description: 'Existing lobby and corridor review',
      technical_general_notes: 'Check ceiling levels',
      inspection_recommendations: 'Replace damaged tiles',
      spaces: [
        {
          id: 12,
          space: { id: 5, title: 'Lobby' },
          length: '12.00',
          width: '8.00',
          height: '3.20',
          notes: 'Needs lighting update',
          attachments: [
            {
              id: 15,
              file: 'https://example.com/lobby.pdf',
              file_size: '240 KB',
              alt: 'Lobby report',
            },
          ],
        },
      ],
      attachments: [],
      created_at: '2026-07-05',
    });

    fetchListMock.mockResolvedValue(new DataSuccess({ data: floor }));

    const wrapper = mount(ProjectFloorShow, {
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await flushPromises();

    expect(fetchListMock).toHaveBeenCalledTimes(1);
    expect(fetchListMock.mock.calls[0][0].toMap()).toMatchObject({
      project_floor_id: 9,
      allLocales: true,
    });
    expect(wrapper.text()).toContain('First Floor');
    expect(wrapper.text()).toContain('Tower Renovation');
    expect(wrapper.text()).toContain('Site Engineer');
    expect(wrapper.text()).toContain('Lobby');
    expect(wrapper.text()).toContain('Lobby report');
    expect(wrapper.find('a[href="https://example.com/lobby.pdf"]').exists()).toBe(true);
  });

  it('renders the empty state when no floor id is available', async () => {
    routeMock.params = {};
    routeMock.query = {};

    const wrapper = mount(ProjectFloorShow, {
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await flushPromises();

    expect(fetchListMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Project.no_data_for_this_floor');
  });
});
