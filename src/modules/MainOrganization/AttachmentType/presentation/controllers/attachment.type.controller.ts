import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';
import type AttachmentTypeModel from '../../core/models/attachment.type.model';
import type AttachmentTypeShowModel from '../../core/models/attachment.type.show.model';
import AttachmentTypeRepository from '../../data/repositories/attachment.type.repository';
import type ShowAttachmentTypeParams from '../../core/params/show.attachment.type.params';

export default class AttachmentTypeController extends BaseController<
  AttachmentTypeShowModel,
  AttachmentTypeModel[]
> {
  private static instance: AttachmentTypeController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return AttachmentTypeRepository.getInstance();
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

  static getInstance(): AttachmentTypeController {
    if (!AttachmentTypeController.instance) {
      AttachmentTypeController.instance = new AttachmentTypeController();
    }
    return AttachmentTypeController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1
          ? '/admin/attachment-types'
          : '/organization/attachment-types',
      );
      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      router.push(
        this.userStore.user?.type === 1
          ? '/admin/attachment-types'
          : '/organization/attachment-types',
      );
      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<AttachmentTypeModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowAttachmentTypeParams).allLocales ? '*' : 'en',
      },
    });
  }
}
