import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
import { disbursementRecord } from '../../../__tests__/disbursement-fixtures';
import PurchaseRequestDisbursementModel from '../../../core/models/purchase-request-disbursement.model';
import FetchDisbursementsParams from '../../../core/params/fetch-disbursements.params';
import MaterialDisbursementHistoryRepository from '../material-disbursement-history.repository';

let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
});

it('maps a direct flat history array with two historical lines for the same item', async () => {
  post.mockResolvedValue(response({ status: true, data: [disbursementRecord()] }));
  const result = await MaterialDisbursementHistoryRepository.getInstance().show(
    new FetchDisbursementsParams(140),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(result.data?.[0]).toBeInstanceOf(PurchaseRequestDisbursementModel);
  expect(result.data?.[0]?.items).toHaveLength(2);
});

it('maps history employees with employee_type', async () => {
  const record = disbursementRecord();
  post.mockResolvedValue(
    response({
      status: true,
      data: [
        {
          ...record,
          receiver: { id: 7, name: 'Receiver', employee_type: 2 },
          organization_employee: { id: 1, name: 'Issuer', employee_type: 1 },
        },
      ],
    }),
  );
  const result = await MaterialDisbursementHistoryRepository.getInstance().show(
    new FetchDisbursementsParams(140),
  );
  expect(result).toBeInstanceOf(DataSuccess);
  expect(result.data?.[0]?.receiver.employee_type).toBe(2);
  expect(result.data?.[0]?.organizationEmployee.employee_type).toBe(1);
});

it('keeps an empty history response as an empty array', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const result = await MaterialDisbursementHistoryRepository.getInstance().show(
    new FetchDisbursementsParams(140),
  );
  expect(result.data).toEqual([]);
});
