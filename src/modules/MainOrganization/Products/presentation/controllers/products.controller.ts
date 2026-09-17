import type Params from '@/base/Core/Params/params';
import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import type ProductsModel from '../../core/models/products.model';
import type ProductsShowModel from '../../core/models/products.show.model';
import ProductsRepository from '../../data/repositories/products.repository';
import { useUserStore } from '@/stores/user';
import type ShowProductsParams from '../../core/params/show.products.params';
import type DeleteProductsSortingParams from '../../core/params/delete.products.sorting.params';
import type DeleteProductsStageParams from '../../core/params/delete.products.stage.params';
import type StoreProductsSortingParams from '../../core/params/store.products.sorting.params';
import type StoreProductsStageParams from '../../core/params/store.products.stage.params';
import { notifyDataMutationSucceeded } from '@/base/Presentation/Controller/dataMutationEvent';

export default class ProductsController extends BaseController<ProductsShowModel, ProductsModel[]> {
  private static instance: ProductsController;

  private get userStore() {
    return useUserStore();
  }
  protected get repository() {
    return ProductsRepository.getInstance();
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
  static getInstance(): ProductsController {
    if (!ProductsController.instance) ProductsController.instance = new ProductsController();
    return ProductsController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/products' : '/organization/products',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });
    if (result instanceof DataSuccess) {
      // await router.push({ name: 'Projects' });
      router.push(
        this.userStore.user?.type === 1 ? '/mainportal/products' : '/organization/products',
      );

      if (formKey) useFormsStore().clearFormData(formKey);
    }
    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions): Promise<DataState<ProductsModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, {
      ...options,
      useJson: true,
      headers: {
        'Accept-Language': (params as ShowProductsParams).allLocales ? '*' : 'en',
      },
    });
  }

  async deleteProductSorting(params?: DeleteProductsSortingParams) {
    const result = await this.repository.deleteProductSorting(params);



    if (result.data?.status === true) {
      notifyDataMutationSucceeded();
    } else {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async deleteProductStage(params?: DeleteProductsStageParams) {
    const result = await this.repository.deleteProductStage(params);



    if (result.data?.status === true) {
      notifyDataMutationSucceeded();
    } else {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async storeProductSorting(params?: StoreProductsSortingParams) {
    const result = await this.repository.storeProductSorting(params);


    if (result.data?.status === true) {
      notifyDataMutationSucceeded();
    } else {
      this.handleErrorResponse(result);
    }

    return result;
  }

  async storeProductStage(params?: StoreProductsStageParams) {
    const result = await this.repository.storeProductStage(params);



    if (result.data?.status === true) {
      notifyDataMutationSucceeded();
    } else {
      this.handleErrorResponse(result);
    }

    return result;
  }
}
