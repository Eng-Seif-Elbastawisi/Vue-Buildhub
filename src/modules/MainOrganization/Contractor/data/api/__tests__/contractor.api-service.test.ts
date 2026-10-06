import { describe, expect, it, vi } from 'vitest';
import ContractorApiService from '../contractor.api-service';
import EditContractorParams from '../../../core/params/edit.contractor.params';
import { ContractorApiEndpoints } from '../contractor.api.endpoints';

describe('ContractorApiService', () => {
  it('posts the update to the exact endpoint with the contractor ID in the body', async () => {
    const service = ContractorApiService.getInstance();
    const request = vi.spyOn(service, 'call').mockResolvedValue({
      statusCode: 200,
      data: { status: true },
    });
    const params = new EditContractorParams(9, 'Builder', [1, 4]);

    await service.update(params, { useJson: true });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: new ContractorApiEndpoints().update,
        type: 'post',
        params,
      }),
    );
    expect(request.mock.calls[0]?.[0].url).toMatch(/\/organization\/update_contractor$/);
    expect(params.toMap()).toEqual({ id: 9, name: 'Builder', stage_ids: [1, 4] });
    request.mockRestore();
  });
});
