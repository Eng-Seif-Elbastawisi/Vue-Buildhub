import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, { type ControllerConfig } from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';
import type InvoicePaymentModel from '../../core/models/invoice.payment.model';
import InvoicePaymentRepository from '../../data/repositories/invoice.payment.repository';

export default class InvoicePaymentController extends BaseController<
  InvoicePaymentModel,
  InvoicePaymentModel[]
> {
  private static instance: InvoicePaymentController;

  protected get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return InvoicePaymentRepository.getInstance();
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

  static getInstance(): InvoicePaymentController {
    if (!InvoicePaymentController.instance) {
      InvoicePaymentController.instance = new InvoicePaymentController();
    }

    return InvoicePaymentController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      if (formKey) useFormsStore().clearFormData(formKey);
      await router.push(
        this.userStore.user?.type === 1 ? '/admin/invoice-payment' : '/organization/invoice-payment',
      );
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      if (formKey) useFormsStore().clearFormData(formKey);
      await router.push(
        this.userStore.user?.type === 1 ? '/admin/invoice-payment' : '/organization/invoice-payment',
      );
    }

    return result;
  }

  async fetchList(params: Params, options?: ApiCallOptions) {
    return await super.fetchList(params, { ...options, useJson: true });
  }

  async fetchOne(params: Params, options?: ApiCallOptions) {
    return await super.fetchOne(params, { ...options, useJson: true });
  }
}
