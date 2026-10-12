import QuoteSiteTeamParams, { positiveId } from './quote.site-team.params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class AssignQuoteEngineersParams extends QuoteSiteTeamParams {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: positiveId },
    engineerIds: {
      required: true,
      custom: (value: unknown) =>
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(positiveId) &&
        new Set(value).size === value.length,
    },
  });
  public engineerIds: number[];
  constructor(quoteId: number, engineerIds: number[]) {
    super(quoteId);

    this.engineerIds = engineerIds;
  }
  toMap() {
    return { quote_id: this.quoteId, engineer_ids: this.engineerIds };
  }
  validate() {
    return AssignQuoteEngineersParams.validation.validate(this);
  }
  validateOrThrow() {
    AssignQuoteEngineersParams.validation.validateOrThrow(this);
  }
}
