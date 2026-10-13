import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export const positiveId = (value: unknown): boolean =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;
export default class QuoteSiteTeamParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: positiveId },
  });
  public quoteId: number;
  constructor(quoteId: number) {
    this.quoteId = quoteId;
  }
  toMap(): Record<string, unknown> {
    return { quote_id: this.quoteId };
  }
  validate() {
    return QuoteSiteTeamParams.validation.validate(this);
  }
  validateOrThrow() {
    QuoteSiteTeamParams.validation.validateOrThrow(this);
  }
}
