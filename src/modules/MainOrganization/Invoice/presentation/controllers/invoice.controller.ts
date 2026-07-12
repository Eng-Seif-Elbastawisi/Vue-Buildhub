import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import TitleInterface from '@/base/Data/Models/titleInterface';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';
import type InvoiceModel from '../../core/models/invoice.model';
import InvoiceRepository from '../../data/repositories/invoice.repository';

export default class InvoiceController extends BaseController<InvoiceModel, InvoiceModel[]> {
  private static instance: InvoiceController;

  protected get userStore() {
    return useUserStore();
  }

  protected get repository() {
    return InvoiceRepository.getInstance();
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

  static getInstance(): InvoiceController {
    if (!InvoiceController.instance) {
      InvoiceController.instance = new InvoiceController();
    }

    return InvoiceController.instance;
  }

  async create(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.create(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      if (formKey) useFormsStore().clearFormData(formKey);
      await router.push(
        this.userStore.user?.type === 1 ? '/admin/invoice' : '/organization/invoice',
      );
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      if (formKey) useFormsStore().clearFormData(formKey);
      await router.push(
        this.userStore.user?.type === 1 ? '/admin/invoice' : '/organization/invoice',
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

  protected toTitleInterface(invoice: InvoiceModel): TitleInterface<string | number> {
    return new TitleInterface({
      id: invoice.id ?? '',
      title: invoice.invoice_number ?? String(invoice.id ?? ''),
      subtitle: invoice.invoice_date ?? '',
    });
  }
}
