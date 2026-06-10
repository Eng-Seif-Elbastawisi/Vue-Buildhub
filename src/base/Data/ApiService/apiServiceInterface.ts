import type Params from "@/base/Core/Params/params";
import axios from "axios";
import type { AxiosResponse } from "axios";
import NetworkService, {
  type NetworkRequestConfig,
} from "@/base/Core/NetworkStructure/networking/networkService";
import type ServiceCallParams from "@/base/Core/Params/callParamsInterface";
import { dialogManager } from "@/base/Presentation/Dialogs/dialog.manager";
import { env } from "@/base/Core/Config";
import ErrorHandler from "@/base/Core/NetworkStructure/errors/errorHandler";
import {
  CancelledRequestException,
  NetworkDisconnectException,
  RequestTimeoutException,
} from "@/base/Core/Constants/exceptionConstants";

/**
 * HTTP method types for API calls
 */
export const CrudType = {
  FormData: "formData",
  POST: "post",
  GET: "get",
  DELETE: "delete",
  PUT: "put",
  PATCH: "patch",
} as const;

export type CrudType = (typeof CrudType)[keyof typeof CrudType];

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: {
  loaded: number;
  total?: number;
  progress: number;
}) => void;

/**
 * Extended call options
 */
export interface ExtendedCallOptions extends Omit<
  ServiceCallParams,
  "url" | "type"
> {
  /** Request timeout override */
  timeout?: number;

  /** AbortSignal for cancellation */
  signal?: AbortSignal;

  /** Upload progress callback */
  onUploadProgress?: ProgressCallback;

  /** Download progress callback */
  onDownloadProgress?: ProgressCallback;

  /** Enable retry for this request */
  enableRetry?: boolean;

  /** Show error dialog on failure */
  showErrorDialog?: boolean;
}

/**
 * API Response structure
 */
export interface ApiResponse<T = any> {
  data: T;
  statusCode: number;
  headers?: Record<string, string>;
}

/**
 * ServicesInterface - Abstract base class for API services
 * Provides unified HTTP request handling with error handling, dialogs, and progress
 */
export default abstract class ServicesInterface {
  private networkService = NetworkService.instance;

  /**
   * Execute an API call with full configuration
   */
  async call({
    url,
    type,
    auth = false,
    showLoadingDialog = false,
    showErrorDialog = false,
    headers,
    params,
    details,
    timeout,
    signal,
    onUploadProgress,
    onDownloadProgress,
    enableRetry = true,
  }: ServiceCallParams & ExtendedCallOptions): Promise<ApiResponse> {
    let response: AxiosResponse | undefined;

    // Show loading dialog if requested
    if (showLoadingDialog) {
      dialogManager.loading("Processing...");
    }

    // Build network config
    const networkConfig: NetworkRequestConfig = {
      timeout,
      signal,
      onUploadProgress,
      onDownloadProgress,
      enableRetry,
    };

    try {
      // Log request if enabled
      if (env.isLoggingEnabled) {
        // console.log(`[ApiService] ${type.toUpperCase()} ${url}`, {
        //   params: params?.toMap(),
        //   details,
        // });
      }

      switch (type) {
        case CrudType.POST:
          response = await this.networkService.post(
            {
              url,
              data: params?.toMap() ?? {},
              headers,
              queryParams: details ?? {},
              isAuth: auth,
            },
            networkConfig,
          );
          break;

        case CrudType.GET:
          response = await this.networkService.get(
            {
              url,
              headers,
              queryParams: details,
              isAuth: auth,
            },
            networkConfig,
          );
          break;

        case CrudType.FormData:
          response = await this.networkService.postFormData(
            {
              url,
              data: params?.toMap() ?? {},
              headers,
              queryParams: details ?? {},
              isAuth: auth,
            },
            networkConfig,
          );
          break;

        case CrudType.DELETE:
          response = await this.networkService.delete(
            {
              url,
              headers,
              queryParams: details,
              isAuth: auth,
            },
            networkConfig,
          );
          break;

        case CrudType.PUT:
          response = await this.networkService.put(
            {
              url,
              data: params?.toMap() ?? {},
              headers,
              queryParams: details,
              isAuth: auth,
            },
            networkConfig,
          );

          break;

        case CrudType.PATCH:
          response = await this.networkService.patch(
            {
              url,
              data: params?.toMap() ?? {},
              headers,
              queryParams: details,
              isAuth: auth,
            },
            networkConfig,
          );
          break;

        default:
          throw new Error(`Unsupported HTTP method: ${type}`);
      }
    } catch (error) {
      // Hide loading dialog
      if (showLoadingDialog) {
        dialogManager.hideLoading();
      }

      // Convert to typed exception
      const apiError = ErrorHandler.normalize(error);

      // Log error
      if (env.isLoggingEnabled) {
        console.error(`[ApiService] Error:`, apiError.toJSON());
      }

      // Show error dialog if requested
      if (showErrorDialog) {
        dialogManager.error(ErrorHandler.getUserMessage(apiError));
      }

      // Handle special cases
      if (axios.isCancel(error)) {
        throw new CancelledRequestException("Request was cancelled");
      }

      if (ErrorHandler.isNetworkError(error)) {
        throw new NetworkDisconnectException("Network connection failed");
      }

      if (ErrorHandler.isTimeout(error)) {
        throw new RequestTimeoutException("Request timed out");
      }

      throw apiError;
    } finally {
      // Always hide loading dialog
      if (showLoadingDialog) {
        dialogManager.hideLoading();
      }
    }

    if (response) {
      return {
        data: response.data,
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
      };
    }

    throw new Error("No response received");
  }

  /**
   * Abstract method to implement service-specific logic
   * @deprecated Use specific CRUD methods from BaseApiService instead
   */
  abstract applyService(params: Params): Promise<ApiResponse>;
}

// Re-export CrudType from call_params_interface for backwards compatibility
export { CrudType as HttpMethod };
