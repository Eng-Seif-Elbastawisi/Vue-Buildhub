import BaseController from '@/base/Presentation/Controller/baseController';
import type { ControllerConfig } from '@/base/Presentation/Controller/baseController';
import type AboutModel from '../../core/models/about.model';
import AboutRepository from '../../data/repositories/about.repository';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type Params from '@/base/Core/Params/params';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import type DeleteSocialLinkParams from '../../core/params/delete.social.link.params';

export default class AboutController extends BaseController<AboutModel, AboutModel[]> {
  private static instance: AboutController;

  protected get repository() {
    return AboutRepository.getInstance();
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

  static getInstance(): AboutController {
    if (!AboutController.instance) {
      AboutController.instance = new AboutController();
    }
    return AboutController.instance;
  }
  async create(
    params: Params, 
    options?: ApiCallOptions,
  ): Promise<DataState<AboutModel> | undefined> { 

    return await super.create(params, { ...options, useJson: true });
  }
  async fetchList(params: Params, options?: ApiCallOptions) {
    return super.fetchList(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as any).isLocale ? 'en' : '*',
      },
    });
  }

  async deleteSocialLink(params: DeleteSocialLinkParams) {
    return await this.repository.deleteSocialLink(params);
  }
}
