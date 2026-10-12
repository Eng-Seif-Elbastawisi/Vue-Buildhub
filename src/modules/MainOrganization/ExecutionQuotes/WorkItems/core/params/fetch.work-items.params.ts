import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId } from '../constants/work-items.constants';
export default class FetchWorkItemsParams implements Params {
  public quoteId: number;
  constructor(quoteId: number) {
    this.quoteId = quoteId;
  }
  private static validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: positiveId },
  });
  toMap() {
    return { quote_id: this.quoteId };
  }
  validate() {
    return FetchWorkItemsParams.validation.validate(this);
  }
  validateOrThrow() {
    FetchWorkItemsParams.validation.validateOrThrow(this);
  }
}
