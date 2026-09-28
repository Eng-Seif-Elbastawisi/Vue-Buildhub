import type Params from '@/base/Core/Params/params';
import {
  DataFailed,
  DataSuccess,
  type DataState,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import type { ApiCallOptions } from '@/base/Data/ApiService/baseApiService';
import BaseController, {
  type ControllerConfig,
} from '@/base/Presentation/Controller/baseController';
import { notifyDataMutationSucceeded } from '@/base/Presentation/Controller/dataMutationEvent';
import { translate } from '@/locales/i18n';
import { useFormsStore } from '@/stores/formsStore';

import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
import type DeleteExecutionQuoteItemParams from '../../core/params/delete.execution.quote.item.params';
import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
import type SetExecutionQuoteStagePricingParams from '../../core/params/set.execution.quote.stage.pricing.params';
import type { ExecutionQuoteStagePricingDraft } from '../../core/params/set.execution.quote.stage.pricing.params';
import type UpdateExecutionQuoteItemParams from '../../core/params/update.execution.quote.item.params';
import type SetExecutionQuoteSupervisionPricingParams from '../../core/params/set.execution.quote.supervision.pricing.params';
import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
import ExecutionQuoteRepository from '../../data/repositories/execution.quote.repository';

export interface StoreExecutionQuoteBuilderChangesRequest {
  detailRequests: StoreExecutionQuoteDetailsParams[];
  pricingDrafts: ExecutionQuoteStagePricingDraft[];
  supervisionPricing: SetExecutionQuoteSupervisionPricingParams | null;
  quoteId: number;
  formKey?: string;
}

export default class ExecutionQuoteController extends BaseController<
  ExecutionQuoteShowModel,
  ExecutionQuoteShowModel[]
> {
  private static instance: ExecutionQuoteController;

  protected get repository() {
    return ExecutionQuoteRepository.getInstance();
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

  static getInstance(): ExecutionQuoteController {
    if (!ExecutionQuoteController.instance) {
      ExecutionQuoteController.instance = new ExecutionQuoteController();
    }

    return ExecutionQuoteController.instance;
  }

  /**
   * Step 1: save only the base/header data through store_quote.
   * Important: there is intentionally NO redirect here because the user must
   * continue building the quote after the backend returns the new quote id.
   */
  async createBase(params: AddExecutionQuoteParams, options?: ApiCallOptions) {
    return await super.create(params, { ...options, useJson: true });
  }

  /**
   * Compatibility alias for any existing call sites. It behaves like the new
   * first-step save and no longer redirects.
   */
  async create(params: AddExecutionQuoteParams, options?: ApiCallOptions) {
    return await this.createBase(params, options);
  }

  private completeDetailsStore(formKey?: string) {
    this.showSuccessToast(translate('execution_quote.details_saved'));
    notifyDataMutationSucceeded();

    if (formKey) useFormsStore().clearFormData(formKey);
  }

  private async storeRequestBatch<RequestType>(
    requests: RequestType[],
    storeRequest: (request: RequestType) => Promise<DataState<void>>,
  ): Promise<DataState<void> | undefined> {
    let lastSuccess: DataSuccess<void> | undefined;

    for (const request of requests) {
      const response = await storeRequest(request);
      if (!(response instanceof DataSuccess)) {
        this.handleErrorResponse(response);
        return response;
      }

      lastSuccess = response;
    }

    if (!lastSuccess) return undefined;

    return lastSuccess;
  }

  async storeDetails(requests: StoreExecutionQuoteDetailsParams[], formKey?: string) {
    const response = await this.storeRequestBatch(requests, (request) =>
      this.repository.storeDetails(request),
    );
    if (!(response instanceof DataSuccess)) return response;

    this.completeDetailsStore(formKey);
    return response;
  }

  async updateExecutionQuoteItem(params: UpdateExecutionQuoteItemParams) {
    const response = await this.repository.updateExecutionQuoteItem(params);
    if (!(response instanceof DataSuccess)) {
      this.handleErrorResponse(response);
      return response;
    }

    this.showSuccessToast(
      response.message ?? translate('execution_quote.show.item_updated_successfully'),
    );
    notifyDataMutationSucceeded();
    return response;
  }

  async deleteExecutionQuoteItem(params: DeleteExecutionQuoteItemParams) {
    const response = await this.repository.deleteExecutionQuoteItem(params);
    if (!(response instanceof DataSuccess)) {
      this.handleErrorResponse(response);
      return response;
    }

    this.showSuccessToast(
      response.message ?? translate('execution_quote.show.item_deleted_successfully'),
    );
    notifyDataMutationSucceeded();
    return response;
  }

  private pricingResolutionFailure(error?: ErrorModel) {
    return new DataFailed<SetExecutionQuoteStagePricingParams[]>({
      error:
        error ??
        new ErrorModel(
          translate('execution_quote.stage_pricing.stage_resolution_failed'),
          ErrorType.validation,
        ),
    });
  }

  private async fetchStoredQuoteStages(quoteId: number) {
    const quoteResponse = await this.repository.show(
      new ShowExecutionQuoteParams({ executionQuoteId: quoteId }),
    );

    if (quoteResponse instanceof DataSuccess && quoteResponse.data) {
      return new DataSuccess({ data: quoteResponse.data.quoteStages });
    }

    return this.pricingResolutionFailure(quoteResponse.error ?? undefined);
  }

  private pricingRequestForDraft(
    pricingDraft: ExecutionQuoteStagePricingDraft,
    quoteStages: ExecutionQuoteShowModel['quoteStages'],
  ) {
    const quoteStageId =
      pricingDraft.quoteStageId ??
      quoteStages.find(
        (quoteStage) =>
          quoteStage.stageId === pricingDraft.stageId &&
          quoteStage.subStageId === pricingDraft.subStageId,
      )?.id;

    return quoteStageId ? pricingDraft.toRequest(quoteStageId) : undefined;
  }

  private async resolveStagePricingRequests(
    pricingDrafts: ExecutionQuoteStagePricingDraft[],
    quoteId: number,
  ): Promise<DataState<SetExecutionQuoteStagePricingParams[]>> {
    const needsStageResolution = pricingDrafts.some((pricingDraft) => !pricingDraft.quoteStageId);
    const quoteStagesResponse = needsStageResolution
      ? await this.fetchStoredQuoteStages(quoteId)
      : new DataSuccess({ data: [] });
    if (!(quoteStagesResponse instanceof DataSuccess)) return quoteStagesResponse;

    const pricingRequests = pricingDrafts
      .map((pricingDraft) =>
        this.pricingRequestForDraft(pricingDraft, quoteStagesResponse.data ?? []),
      )
      .filter(
        (pricingRequest): pricingRequest is SetExecutionQuoteStagePricingParams => !!pricingRequest,
      );

    return pricingRequests.length === pricingDrafts.length
      ? new DataSuccess({ data: pricingRequests })
      : this.pricingResolutionFailure();
  }

  async storeBuilderChanges({
    detailRequests,
    pricingDrafts,
    supervisionPricing,
    quoteId,
    formKey,
  }: StoreExecutionQuoteBuilderChangesRequest) {
    const detailsResponse = await this.storeRequestBatch(detailRequests, (request) =>
      this.repository.storeDetails(request),
    );
    if (detailsResponse && !(detailsResponse instanceof DataSuccess)) return detailsResponse;

    const resolvedPricing = await this.resolveStagePricingRequests(pricingDrafts, quoteId);
    if (!(resolvedPricing instanceof DataSuccess)) {
      this.handleErrorResponse(resolvedPricing);
      return resolvedPricing;
    }

    const pricingResponse = await this.storeRequestBatch(resolvedPricing.data ?? [], (request) =>
      this.repository.setStagePricing(request),
    );
    if (pricingResponse && !(pricingResponse instanceof DataSuccess)) return pricingResponse;

    const supervisionResponse = supervisionPricing
      ? await this.repository.setSupervisionPricing(supervisionPricing)
      : undefined;
    if (supervisionResponse && !(supervisionResponse instanceof DataSuccess)) {
      this.handleErrorResponse(supervisionResponse);
      return supervisionResponse;
    }

    const response = supervisionResponse ?? pricingResponse ?? detailsResponse;
    if (!(response instanceof DataSuccess)) return undefined;

    this.completeDetailsStore(formKey);
    return response;
  }

  async fetchList(
    params: Params,
    options?: ApiCallOptions,
  ): Promise<DataState<ExecutionQuoteShowModel[]>> {
    return await super.fetchList(params, { ...options, useJson: true });
  }
}
