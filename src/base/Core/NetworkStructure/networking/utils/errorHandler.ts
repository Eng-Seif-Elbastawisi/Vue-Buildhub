import { DataFailed } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';

class ErrorHandler {
  static handleError<T>(e: any) {
    let errorMessage: string | null = null;
    if (e.response != null) {
      if (e.response.data != null) {
        errorMessage = e.response.data.message ?? null;
      }
      if (e.response.status == 400) {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.check_input', ErrorType.dataDirty),
        });
      } else if (e.response.status == 401) {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.login_again', ErrorType.unknown),
        });
      } else if (e.response.status == 302) {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.login_again', ErrorType.unknown),
        });
      } else if (e.response.status == 500) {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.retry_later', ErrorType.serviceSide),
        });
      } else if (e.response.status == 404) {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.route_not_found', ErrorType.unknown),
        });
      } else {
        return new DataFailed<T>({
          error: new ErrorModel(errorMessage ?? 'error.retry_later', ErrorType.unknown),
        });
      }
    }
    return new DataFailed<T>({
      error: new ErrorModel(errorMessage ?? 'error.retry_later', ErrorType.serviceSide),
    });
  }
}

export { ErrorHandler };
