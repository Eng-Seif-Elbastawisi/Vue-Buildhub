import StorePurchaseRequestParams from '../core/params/store.purchase-request.params';
import PurchaseRequestItemParams from '../core/params/purchase-request.item.params';
export const requestRecord = () => ({
  id: 1,
  employee: { id: 1, name: 'Creator', type: 1 },
  assigned_employee: { id: 7, name: 'Responsible Employee', type: 2 },
  quote_id: 140,
  project_id: 86,
  is_all_project: true,
  project_floor_space_id: null,
  project_floor_space: null,
  supply_responsibility: 2,
  priority: 3,
  status: 1,
  items: [
    {
      id: 1,
      project_timeline_stage_id: 17,
      project_timeline_stage: {
        id: 17,
        stage: { id: 129, title: 'Main Stage' },
        sub_stage: null,
        created_at: '2026-10-11 11:33:28',
      },
      itemable_type: 'material',
      itemable_id: 5,
      itemable: { id: 5, title: 'Material Title' },
      quantity: '10.00',
    },
  ],
  created_at: '2026-10-13 12:34:15',
});
export const storeParams = (
  fields: Partial<ConstructorParameters<typeof StorePurchaseRequestParams>[0]> = {},
) =>
  new StorePurchaseRequestParams({
    quoteId: 140,
    employeeId: 7,
    isAllProject: true,
    projectFloorSpaceId: null,
    supplyResponsibility: 2,
    priority: 1,
    items: [new PurchaseRequestItemParams(17, 'material', 5, 10.25)],
    ...fields,
  });
export const timelineGroup = () => ({
  id: 2,
  title: 'Execution Timeline',
  duration: 1,
  duration_type: 4,
  stages: [
    {
      id: 17,
      parent_id: null,
      quote_stage_id: 3,
      stage: { id: 129, title: 'Main Stage' },
      sub_stage: null,
      children: [],
    },
  ],
});
export const overviewRecord = () => ({
  status: true,
  data: { basicData: { count_timeline: 1 }, data: [timelineGroup()] },
});
export const floorRecord = () => ({
  id: 23,
  project: { id: 86, title: 'Linked Project' },
  floor_number: 0,
  spaces: [
    {
      id: 25,
      space: { id: 999, title: 'Living Room' },
      length: '6',
      width: '4',
      height: '3',
      notes: '',
      attachments: [],
    },
  ],
});
