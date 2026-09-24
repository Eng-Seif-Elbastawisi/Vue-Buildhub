import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientTypeEnum } from '../../../core/constant/client.type.enum';
import AddClientParams from '../../../core/params/add.client.params';
import ClientApiService from '../../../data/api/client.api-service';
import ClientShowModel from '../../../core/models/client.show.model';
import ClientController from '../client.controller';

const mocks = vi.hoisted(() => ({
  clearFormData: vi.fn(),
  push: vi.fn(),
}));

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({ clearFormData: mocks.clearFormData }),
}));

vi.mock('@/router', () => ({
  default: { push: mocks.push },
}));

describe('ClientController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the same singleton', () => {
    expect(ClientController.getInstance()).toBe(ClientController.getInstance());
  });

  it('creates a client inline without navigating away', async () => {
    const params = new AddClientParams({
      name: 'New client',
      phone: '01000000000',
      email: 'client@example.com',
      address: 'Cairo',
      type: ClientTypeEnum.COMPANY,
    });
    vi.spyOn(ClientApiService.getInstance(), 'create').mockResolvedValue({
      statusCode: 200,
      data: {
        status: true,
        data: { id: 44, name: 'New client' },
      },
    });

    const result = await ClientController.getInstance().createInline(params, {
      useStaticData: false,
    });

    expect(result?.data).toEqual(new ClientShowModel({ id: 44, name: 'New client' }));
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.clearFormData).not.toHaveBeenCalled();
  });
});
