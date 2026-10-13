import { beforeEach, expect, it } from 'vitest';
import {
  DataSuccess,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import PurchaseRequestRepository from '../purchase-request.repository';
import PurchaseRequestModel from '../../../core/models/purchase-request.model';
import FetchPurchaseRequestsParams from '../../../core/params/fetch.purchase-requests.params';
import { RequestTimeoutException } from '@/base/Core/Constants/exceptionConstants';
import { DataTimeout } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { requestRecord, storeParams } from '../../../__tests__/fixtures';
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});
const repository = PurchaseRequestRepository.getInstance();
it('does not display a successful fetch message when a returned record is invalid', async () => {
  post.mockResolvedValue(
    response({
      status: true,
      message: 'Purchase requests fetched successfully.',
      data: [{ ...requestRecord(), status: 9 }],
    }),
  );
  const fetched = await repository.index(new FetchPurchaseRequestsParams(140));
  expect(fetched).toBeInstanceOf(DataFailed);
  expect(fetched.error?.displayMessage).toBe('procurement.invalid_response');
});
it('never replays a potentially committed Store after a timeout', async () => {
  post.mockRejectedValue(new RequestTimeoutException());
  const saved = await repository.create(storeParams());
  expect(saved).toBeInstanceOf(DataTimeout);
  if (!(saved instanceof DataTimeout)) throw new Error('Expected a timeout state');
  expect(await saved.retry()).toBeNull();
  expect(post).toHaveBeenCalledTimes(1);
});
it('maps the unpaginated fetch array and nested decimal strings', async () => {
  post.mockResolvedValue(response({ status: true, data: [requestRecord()] }));
  const fetched = await repository.index(new FetchPurchaseRequestsParams(140));
  expect(fetched).toBeInstanceOf(DataSuccess);
  expect(fetched.data?.[0]).toBeInstanceOf(PurchaseRequestModel);
  expect(fetched.data?.[0]?.items[0]?.quantity).toBe('10.00');
  expect(fetched.pagination).toBeNull();
});
it('accepts an empty fetched list without synthetic records', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const fetched = await repository.index(new FetchPurchaseRequestsParams(140));
  expect(fetched).toBeInstanceOf(DataSuccess);
  expect(fetched.data ?? []).toEqual([]);
});
it.each([{ data: { id: 99 } }, { status: false, message: 'Denied' }, { success: true }])(
  'does not invent Store success for %j',
  async (body) => {
    post.mockResolvedValue(response(body));
    expect(await repository.create(storeParams())).toBeInstanceOf(DataFailed);
    expect(post).toHaveBeenCalledTimes(1);
  },
);
it('accepts explicit Store success while treating returned data as opaque', async () => {
  post.mockResolvedValue(
    response({ status: true, data: { undocumented_result: 'server-owned' } }, 201),
  );
  const saved = await repository.create(storeParams());
  expect(saved).toBeInstanceOf(DataSuccess);
  expect(saved.data).toBeNull();
});
it('retains backend validation messages', async () => {
  post.mockResolvedValue(response({ status: false, message: 'Invalid quantity' }));
  expect((await repository.create(storeParams())).error?.displayMessage).toContain(
    'Invalid quantity',
  );
});
