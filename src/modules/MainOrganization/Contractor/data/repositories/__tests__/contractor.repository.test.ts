import { describe, expect, it, vi } from 'vitest';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import ContractorApiService from '../../api/contractor.api-service';
import ContractorRepository from '../contractor.repository';
import IndexContractorParams from '../../../core/params/index.contractor.params';
import DeleteContractorStageParams from '../../../core/params/delete.contractor.stage.params';

describe('ContractorRepository', () => {
  it('keeps the backend message when removing a relation fails', async () => {
    const request = vi.spyOn(ContractorApiService.getInstance(), 'deleteStage').mockResolvedValue({
      statusCode: 200,
      data: { status: false, message: 'Stage is locked' },
    });

    const state = await ContractorRepository.getInstance().deleteStage(
      new DeleteContractorStageParams(1, 152),
    );

    expect(state).toBeInstanceOf(DataFailed);
    expect(state.error?.displayMessage).toBe('Stage is locked');
    request.mockRestore();
  });

  it('maps contractor rows from the existing list response', async () => {
    const request = vi.spyOn(ContractorApiService.getInstance(), 'index').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: [{ id: 9, name: 'Builder', stage_ids: [1] }], meta: {} },
    });

    const state = await ContractorRepository.getInstance().index(new IndexContractorParams(), {
      useStaticData: false,
    });

    expect(state).toBeInstanceOf(DataSuccess);
    expect((state as DataSuccess<unknown[]>).data).toMatchObject([
      { id: 9, name: 'Builder', stageIds: [1] },
    ]);
    request.mockRestore();
  });
});
