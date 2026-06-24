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
import type LocationShowModel from '../../core/models/location.show.model';
import type LocationModel from '../../core/models/location.model';
import type ShowLocationParams from '../../core/params/show.location.params';
import LocationRepository from '../../data/repositories/location.repository';
import { useUserStore } from '@/stores/user';

export default class LocationController extends BaseController<LocationShowModel, LocationModel[]> {
  private static instance: LocationController;

  private get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return LocationRepository.getInstance();
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

  static getInstance(): LocationController {
    if (!LocationController.instance) {
      LocationController.instance = new LocationController();
    }
    return LocationController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Location' }); 

      router.push(this.userStore.user?.type === 1 ? '/mainportal/location' : '/organization/location');

      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const FormStore = useFormsStore();

    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      // router.push({ name: 'Location' });
      router.push(this.userStore.user?.type === 1 ? '/mainportal/location' : '/organization/location');

      if (formKey) FormStore.clearFormData(formKey);
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<LocationModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowLocationParams).allLocales ? '*' : 'en',
      },
    });
  }
}
