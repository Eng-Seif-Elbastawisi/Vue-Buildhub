import { describe, expect, it, vi } from 'vitest';
import ContractorApiService from '../contractor.api-service';
import EditContractorParams from '../../../core/params/edit.contractor.params';
import { ContractorApiEndpoints } from '../contractor.api.endpoints';
import DeleteContractorStageParams from '../../../core/params/delete.contractor.stage.params';

describe('ContractorApiService', () => {
  it('posts one contractor-stage relation to the exact endpoint without URL IDs', async () => {
    const service = ContractorApiService.getInstance();
    const request = vi.spyOn(service, 'call').mockResolvedValue({
      statusCode: 200,
      data: { status: true },
    });
    const params = new DeleteContractorStageParams(1, 152);

    await service.deleteStage(params);

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: new ContractorApiEndpoints().deleteStage,
        type: 'post',
        params,
        useJson: true,
      }),
    );
    expect(request.mock.calls[0]?.[0].url).toMatch(/\/organization\/delete_contractor_stage$/);
    expect(params.toMap()).toEqual({ contractor_id: 1, stage_id: 152 });
    request.mockRestore();
  });

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
