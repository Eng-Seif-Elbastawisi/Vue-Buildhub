import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import {
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type OrganizationShowModel from '../../core/models/organization.show.model';
import type ShowOrganizationParams from '../../core/params/show.organization.params';
import type OrganizationModel from '../../core/models/organization.model';
import OrganizationRepository from '../../data/repositories/organization.repository';
import { useUserStore } from '@/stores/user';

const { user } = useUserStore();
export default class OrganizationController extends BaseController<
  OrganizationShowModel,
  OrganizationModel[]
> {
  private static instance: OrganizationController;

  protected get repository() {
    return OrganizationRepository.getInstance();
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

  static getInstance(): OrganizationController {
    if (!OrganizationController.instance) {
      OrganizationController.instance = new OrganizationController();
    }
    return OrganizationController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Organization' });
      router.push(user?.isMaster ? '/admin/organization' : '/organization/organization');
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Organization' });
      router.push(user?.isMaster ? '/admin/organization' : '/organization/organization');
      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<OrganizationModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowOrganizationParams).allLocales ? '*' : 'en',
      },
    });
  }
}
