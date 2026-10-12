import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import SiteTeamController from '../site-team.controller';
import AssignQuoteEngineersParams from '../../../core/params/assign.quote.engineers.params';
import UpdateProjectSiteInfoParams from '../../../core/params/update.project.site-info.params';
import IndexSpaceParams from '@/modules/shared/Space/core/params/index.space.params';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import AddProjectFloorSpaceParams from '@/modules/MainOrganization/ProjectFloor/core/params/add.project.floor.space.params';
import AddProjectFloorSpacesParams from '@/modules/MainOrganization/ProjectFloor/core/params/add.project.floor.spaces.params';
import { mockNetwork, response } from '../../../__tests__/network';
let post: ReturnType<typeof mockNetwork>;
const controller = SiteTeamController.getInstance();
beforeEach(() => {
  post = mockNetwork();
  controller.activate(140);
});
it('fetches floors using the linked Project ID, never the Quote ID', async () => {
  post
    .mockResolvedValueOnce(
      response({ status: true, data: { id: 140, project: { id: 43, title: 'Project' } } }),
    )
    .mockResolvedValueOnce(response({ status: true, data: [] }));
  await controller.loadOwner();
  expect(controller.projectId.value).toBe(43);
  expect(post.mock.calls[1]?.[0]).toMatchObject({
    url: expect.stringContaining('fetch_project_floors'),
    data: expect.objectContaining({ project_id: 43 }),
  });
  expect(controller.floorsState.value.data ?? []).toEqual([]);
});
it('does not guess a Project ID for an unlinked Quote', async () => {
  post.mockResolvedValue(response({ status: true, data: { id: 140 } }));
  await controller.loadOwner();
  expect(controller.projectId.value).toBeUndefined();
  expect(post).toHaveBeenCalledTimes(1);
});
it.each(['site', 'engineers', 'owner', 'employees', 'spaces', 'floors'] as const)(
  'isolates late %s responses when switching Quote owners',
  async (resource) => {
    if (resource === 'floors') {
      post
        .mockResolvedValueOnce(response({ status: true, data: { id: 140, project: { id: 43 } } }))
        .mockResolvedValueOnce(response({ status: true, data: [] }));
      await controller.loadOwner();
    }
    let resolve!: (value: ReturnType<typeof response>) => void;
    post.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const requests = {
      site: () => controller.loadSite(),
      engineers: () => controller.loadEngineers(),
      owner: () => controller.loadOwner(),
      employees: () => controller.loadEmployees(),
      spaces: () => controller.loadSpaces(),
      floors: () => controller.loadFloors(),
    };
    const pending = requests[resource]();
    controller.activate(141);
    resolve(
      response({
        status: true,
        data: { delivery_date: '2026-12-01', employee: [{ id: 7 }], id: 140, project: { id: 43 } },
      }),
    );
    await pending;
    expect(controller.siteState.value.data).toBeNull();
    expect(controller.engineersState.value.data).toBeNull();
    expect(controller.ownerState.value.data).toBeNull();
    expect(controller.floorsState.value.data).toBeNull();
    expect(controller.employeesState.value.data).toBeNull();
    expect(controller.spacesState.value.data).toBeNull();
  },
);
it('reuses Space lookup transport and retains search and pagination', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      data: {
        data: [{ id: 13, title: 'Living room' }],
        meta: { current_page: 2, last_page: 3, per_page: 10, total: 25 },
      },
    }),
  );
  const options = await controller.loadSpaces(new IndexSpaceParams('Living', 2, 10, 1));
  expect(options[0]?.id).toBe(13);
  expect(options[0]?.title).toBe('Living room');
  expect(post.mock.calls[0]?.[0]).toMatchObject({
    url: expect.stringContaining('fetch_spaces'),
    data: { word: 'Living', page: 2, per_page: 10, with_pagination: 1 },
  });
  expect(controller.spacesState.value.pagination?.currentPage).toBe(2);
});
it('loads all employees without an invented eligibility filter', async () => {
  post.mockResolvedValue(response({ status: true, data: [{ id: 7, name: 'Engineer' }] }));
  expect((await controller.loadEmployees(new IndexEmployeeParams('Eng', 2)))[0]?.title).toBe(
    'Engineer',
  );
  expect(post.mock.calls[0]?.[0].data).not.toHaveProperty('type');
});
it('protects existing engineers and refreshes an accepted assignment', async () => {
  post.mockResolvedValueOnce(
    response({ status: true, data: { employee: [{ id: 7, name: 'Engineer' }] } }),
  );
  await controller.loadEngineers();
  expect(
    await controller.saveEngineers(new AssignQuoteEngineersParams(140, [12])),
  ).not.toBeInstanceOf(DataSuccess);
  expect(post).toHaveBeenCalledTimes(1);
  post
    .mockResolvedValueOnce(response({ status: true }))
    .mockResolvedValueOnce(response({ status: true, employee: [{ id: 7 }, { id: 12 }] }));
  expect(
    await controller.saveEngineers(new AssignQuoteEngineersParams(140, [7, 12])),
  ).toBeInstanceOf(DataSuccess);
  expect(controller.engineersState.value.data?.employee.map((item) => item.id)).toEqual([7, 12]);
});
it('refreshes authoritative site data after an acknowledged update', async () => {
  post.mockResolvedValueOnce(response({ status: true })).mockResolvedValueOnce(
    response({
      status: true,
      data: { delivery_date: '2026-12-02', site_condition: 'Saved by backend' },
    }),
  );
  await controller.saveSite(new UpdateProjectSiteInfoParams(140, '2026-12-01', 'Ready'));
  expect(controller.siteState.value.data?.deliveryDate).toBe('2026-12-02');
});
it('refreshes existing floors and spaces after adding multiple space rows', async () => {
  post
    .mockResolvedValueOnce(response({ status: true, data: { id: 140, project: { id: 43 } } }))
    .mockResolvedValueOnce(response({ status: true, data: [{ id: 23, floor_number: 0 }] }));
  await controller.loadOwner();
  post.mockResolvedValueOnce(response({ status: true })).mockResolvedValueOnce(
    response({
      status: true,
      data: [
        {
          id: 23,
          floor_number: 0,
          spaces: [
            {
              space: { id: 13, title: 'Living room' },
              length: '6.00',
              width: '4.00',
              height: '3.20',
            },
          ],
        },
      ],
    }),
  );
  const result = await controller.saveSpaces(
    new AddProjectFloorSpacesParams(23, [new AddProjectFloorSpaceParams(13, 6, 4, 3.2, '')]),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(controller.floorsState.value.data?.[0]?.spaces[0]?.space.title).toBe('Living room');
});
it('prevents duplicate saves and discards stale mutation acknowledgements', async () => {
  let resolve!: (value: ReturnType<typeof response>) => void;
  post.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const params = new UpdateProjectSiteInfoParams(140, '2026-12-01', 'Ready');
  const pending = controller.saveSite(params);
  expect(await controller.saveSite(params)).not.toBeInstanceOf(DataSuccess);
  expect(post).toHaveBeenCalledTimes(1);
  controller.activate(141);
  resolve(response({ status: true }));
  expect(await pending).not.toBeInstanceOf(DataSuccess);
  expect(controller.siteSaveState.value.data).toBeNull();
  expect(post).toHaveBeenCalledTimes(1);
});

it.each(['employees', 'spaces'] as const)(
  'treats paginated empty %s results as no matches rather than a request error',
  async (resource) => {
    post.mockResolvedValue(
      response({
        status: true,
        data: { data: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 } },
      }),
    );
    const options =
      resource === 'employees' ? await controller.loadEmployees() : await controller.loadSpaces();
    const lookup = resource === 'employees' ? controller.employeeOptions : controller.spaceOptions;
    expect(options).toEqual([]);
    expect(lookup.isListFailed()).toBe(false);
    expect(lookup.isListSuccess()).toBe(true);
  },
);
