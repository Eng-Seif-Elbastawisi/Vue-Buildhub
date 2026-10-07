import { describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { NetworkDisconnectException } from '@/base/Core/Constants/exceptionConstants';
import router from '@/router';
import ContractorModel from '../../../core/models/contractor.model';
import AddContractorParams from '../../../core/params/add.contractor.params';
import DeleteContractorStageParams from '../../../core/params/delete.contractor.stage.params';
import ContractorRepository from '../../../data/repositories/contractor.repository';
import ContractorApiService from '../../../data/api/contractor.api-service';
import ContractorController from '../contractor.controller';

describe('ContractorController', () => {
  it('keeps network failures recognizable to the shared delete dialog', async () => {
    const remove = vi
      .spyOn(ContractorApiService.getInstance(), 'deleteStage')
      .mockRejectedValue(new NetworkDisconnectException());

    const deletionState = await ContractorController.getInstance().deleteStage(
      new DeleteContractorStageParams(1, 152),
    );

    expect(deletionState).toBeInstanceOf(DataFailed);
    expect(deletionState.error?.displayMessage).toBe('No network connection');
    remove.mockRestore();
  });

  it('returns a successful single-stage removal without navigating', async () => {
    const remove = vi
      .spyOn(ContractorApiService.getInstance(), 'deleteStage')
      .mockResolvedValue({ statusCode: 200, data: { status: true, message: 'Stage removed' } });
    const push = vi.spyOn(router, 'push').mockResolvedValue(undefined);
    const params = new DeleteContractorStageParams(1, 152);

    const deletionState = await ContractorController.getInstance().deleteStage(params);

    expect(deletionState).toBeInstanceOf(DataSuccess);
    expect(push).not.toHaveBeenCalled();
    remove.mockRestore();
    push.mockRestore();
  });

  it('creates with JSON and navigates to the contractor list after success', async () => {
    const create = vi
      .spyOn(ContractorRepository.getInstance(), 'create')
      .mockResolvedValue(new DataSuccess({ data: new ContractorModel(9, 'Builder', [1], []) }));
    const push = vi.spyOn(router, 'push').mockResolvedValue(undefined);
    const params = new AddContractorParams('Builder', [1]);

    await ContractorController.getInstance().create(params);

    expect(create).toHaveBeenCalledWith(params, expect.objectContaining({ useJson: true }), false);
    expect(push).toHaveBeenCalledWith('/organization/contractors');
    create.mockRestore();
    push.mockRestore();
  });
});
