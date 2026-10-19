import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, expect, it } from 'vitest';
import type { AxiosResponse } from 'axios';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AnalyticsController from '../analytics.controller';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { sourceResponse, drawing, overview, report } from '../../../__tests__/fixtures';
const controller = AnalyticsController.getInstance();
let network: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  network = mockNetwork();
  network.mockImplementation(async (request) => sourceResponse(request.url));
});
afterEach(() => controller.release());
it('uses eight bounded Quote reads with unfiltered timelines and no financial or per-record fanout', async () => {
  await controller.activate(140, true);
  expect(network.mock.calls).toHaveLength(8);
  const requests = network.mock.calls.map(([request]) => ({
    url: request.url.split('/').pop(),
    data: request.data,
  }));
  expect(requests.find((request) => request.url === 'fetch_project_timelines')?.data).toEqual({
    quote_id: 140,
  });
  expect(
    requests
      .filter((request) => request.url !== 'show_quote')
      .every((request) => JSON.stringify(request.data) === JSON.stringify({ quote_id: 140 })),
  ).toBe(true);
  expect(controller.owner.value.data?.timelineStatus).toBe(3);
  expect(controller.configuration.value.data?.workStatus).toBe(2);
  expect(
    controller.timelines.value.data?.projectTimelines.filter((group) => group.workStatus === 1),
  ).toHaveLength(2);
  expect(controller.tasks.value.data?.[0]?.assignedEmployee?.id).toBe(4);
  expect(
    requests.some((request) =>
      /price|payment|receipt|purchase_order|analytics/.test(request.url ?? ''),
    ),
  ).toBe(false);
});
it.each([false, true])(
  'does not read without permission or with an invalid Quote (access %s)',
  async (access) => {
    await controller.activate(access ? 0 : 140, access);
    expect(network).not.toHaveBeenCalled();
  },
);
it('keeps empty success distinct from HTTP failure and supports isolated Retry', async () => {
  network.mockImplementation(async (request) =>
    request.url.includes('stage_reports')
      ? response({ status: false, message: 'Forbidden' }, 403)
      : request.url.includes('stage_tasks')
        ? response({ status: true, data: [] })
        : sourceResponse(request.url),
  );
  await controller.activate(140, true);
  expect(controller.reports.value).not.toBeInstanceOf(DataSuccess);
  expect(controller.reports.value.data).toBeNull();
  expect(controller.tasks.value).toBeInstanceOf(DataSuccess);
  expect(controller.tasks.value.data).toEqual([]);
  network.mockClear().mockImplementation(async (request) => sourceResponse(request.url));
  await controller.load('reports');
  expect(network.mock.calls).toHaveLength(1);
  expect(controller.reports.value.data).toHaveLength(1);
});
it.each([
  { quote: 141, project: 86 },
  { quote: 140, project: 999 },
])('rejects foreign drawing ownership: %j', async ({ quote, project }) => {
  network.mockImplementation(async (request) =>
    request.url.includes('fetch_shop_drawing')
      ? response({ status: true, data: [drawing(quote, project)] })
      : sourceResponse(request.url),
  );
  await controller.activate(140, true);
  expect(controller.drawings.value.hasError).toBe(true);
  expect(controller.drawings.value.data).toBeNull();
});
it('rejects a partial timeline list rather than presenting a complete distribution', async () => {
  const partial = overview();
  partial.data.basicData.count_timeline = 10;
  network.mockImplementation(async (request) =>
    request.url.includes('fetch_project_timelines')
      ? response(partial)
      : sourceResponse(request.url),
  );
  await controller.activate(140, true);
  expect(controller.timelines.value.hasError).toBe(true);
});
it('ignores late Quote A responses after navigation to Quote B', async () => {
  let resolve!: (value: AxiosResponse<unknown>) => void;
  const pending = new Promise<AxiosResponse<unknown>>((accept) => {
    resolve = accept;
  });
  network.mockImplementation((request) =>
    request.url.includes('stage_reports') && request.data.quote_id === 140
      ? pending
      : Promise.resolve(sourceResponse(request.url, request.data.quote_id, 87)),
  );
  const first = controller.activate(140, true);
  // Allow the owner read and the batch to start; hold only the report HTTP response.
  await flushPromises();
  network.mockImplementation(async (request) => sourceResponse(request.url, 141, 87));
  await controller.activate(141, true);
  resolve(response({ status: true, data: [] }));
  await first;
  expect(controller.quoteId.value).toBe(141);
  expect(controller.owner.value.data?.id).toBe(141);
  expect(controller.reports.value.data).toHaveLength(1);
});

it('a newer refresh wins when an older same-Quote report response arrives later', async () => {
  let resolve!: (value: AxiosResponse<unknown>) => void;
  const pending = new Promise<AxiosResponse<unknown>>((accept) => {
    resolve = accept;
  });
  let reportReads = 0;
  network.mockImplementation((request) => {
    if (request.url.includes('stage_reports') && reportReads++ === 0) return pending;
    return Promise.resolve(sourceResponse(request.url));
  });
  const first = controller.activate(140, true);
  await flushPromises();
  await controller.refresh();
  resolve(response({ status: true, data: [] }));
  await first;
  expect(controller.reports.value.data).toHaveLength(1);
});

it('rejects duplicate report identities rather than inflating report or safety counts', async () => {
  network.mockImplementation(async (request) =>
    request.url.includes('stage_reports')
      ? response({ status: true, data: [report(), report()] })
      : sourceResponse(request.url),
  );
  await controller.activate(140, true);
  expect(controller.reports.value.hasError).toBe(true);
  expect(controller.reports.value.data).toBeNull();
});
