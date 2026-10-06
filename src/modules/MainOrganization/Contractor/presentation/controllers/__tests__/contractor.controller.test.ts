import { describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import ContractorModel from '../../../core/models/contractor.model';
import AddContractorParams from '../../../core/params/add.contractor.params';
import ContractorRepository from '../../../data/repositories/contractor.repository';
import ContractorController from '../contractor.controller';

describe('ContractorController', () => {
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
