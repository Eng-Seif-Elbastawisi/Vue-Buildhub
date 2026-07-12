import type Params from '@/base/Core/Params/params';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import router from '@/router';
import { useFormsStore } from '@/stores/formsStore';
import { useUserStore } from '@/stores/user';
import type InvoicePaymentModel from '../../core/models/invoice.payment.model';
import AddInvoicePaymentParams from '../../core/params/add.invoice.payment.params';
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
        this.userStore.user?.type === 1
          ? '/admin/invoice-payment'
          : '/organization/invoice-payment',
      );
    }

    return result;
  }

  async update(params: Params, options?: ApiCallOptions, formKey?: string) {
    const result = await super.update(params, { ...options, useJson: true });

    if (result instanceof DataSuccess) {
      if (formKey) useFormsStore().clearFormData(formKey);
      await router.push(
        this.userStore.user?.type === 1
          ? '/admin/invoice-payment'
          : '/organization/invoice-payment',
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

  async createInvoicePayment(
    invoiceId: number,
    params: AddInvoicePaymentParams,
    options?: ApiCallOptions,
  ) {
    const data = params.toMap();
    const payload = new AddInvoicePaymentParams({
      invoice_id: invoiceId,
      payment_amount: data.payment_amount as number | undefined,
      payment_date: data.payment_date as string | undefined,
      payment_method: data.payment_method as number | undefined,
      notes: data.notes as string | null | undefined,
    });

    return await super.create(payload, { ...options, useJson: true });
  }
}
