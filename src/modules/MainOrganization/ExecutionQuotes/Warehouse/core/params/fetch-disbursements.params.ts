import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';

export default class FetchDisbursementsParams implements Params {
  readonly quoteId: number;

  constructor(quoteId: number) {
    this.quoteId = quoteId;
  }

  private static validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
  });

  toMap() {
    return { quote_id: this.quoteId };
  }

  validate() {
    return FetchDisbursementsParams.validation.validate(this);
  }

  validateOrThrow() {
    FetchDisbursementsParams.validation.validateOrThrow(this);
  }
}
