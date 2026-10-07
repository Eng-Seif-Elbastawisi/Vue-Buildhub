import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ContractorModel from '../../core/models/contractor.model';
import type DeleteContractorStageParams from '../../core/params/delete.contractor.stage.params';
import ContractorRepository from '../../data/repositories/contractor.repository';

export default class ContractorController extends BaseController<
  ContractorModel,
  ContractorModel[]
> {
  private static instance: ContractorController;

  protected get repository() {
    return ContractorRepository.getInstance();
  }

  protected get config(): ControllerConfig {
    return {
      showLoadingDialog: false,
      showSuccessDialog: false,
      showErrorDialog: false,
      showErrorTosat: true,
      showSuccessTosat: true,
      autoRetry: false,
      maxAutoRetries: 1,
    };
  }

  private constructor() {
    super();
  }

  static getInstance(): ContractorController {
    if (!ContractorController.instance) {
      ContractorController.instance = new ContractorController();
    }
    return ContractorController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      await router.push('/organization/contractors');
      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      await router.push('/organization/contractors');
      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ContractorModel[]>> {
    return super.fetchList(params, { ...options, useJson: true });
  }

  async deleteStage(params: DeleteContractorStageParams): Promise<DataState<void>> {
    params.validateOrThrow();
    const deletionState = await this.repository.deleteStage(params);
    if (deletionState instanceof DataSuccess) {
      this.showSuccessToast(deletionState.message || 'construction_states.delete_success');
      return deletionState;
    }

    this.handleErrorResponse(deletionState);
    return deletionState instanceof DataFailed
      ? deletionState
      : new DataFailed<void>({
          error: deletionState.error ?? new ErrorModel('error.unexpected', ErrorType.unknown),
        });
  }
}
