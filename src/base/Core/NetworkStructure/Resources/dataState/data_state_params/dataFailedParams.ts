import type { ErrorModel } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';

export default interface DataFailedParams {
  error?: ErrorModel | null;
}
