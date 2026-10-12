import QuoteSiteTeamParams, { positiveId } from './quote.site-team.params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
function dateOnly(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export default class UpdateProjectSiteInfoParams extends QuoteSiteTeamParams {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: positiveId },
    deliveryDate: { required: true, custom: dateOnly },
    siteCondition: {
      required: true,
      custom: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
    },
  });
  public deliveryDate: string;
  public siteCondition: string;
  constructor(quoteId: number, deliveryDate: string, siteCondition: string) {
    super(quoteId);

    this.deliveryDate = deliveryDate;
    this.siteCondition = siteCondition;
  }
  toMap() {
    return {
      quote_id: this.quoteId,
      delivery_date: this.deliveryDate,
      site_condition: this.siteCondition,
    };
  }
  validate() {
    return UpdateProjectSiteInfoParams.validation.validate(this);
  }
  validateOrThrow() {
    UpdateProjectSiteInfoParams.validation.validateOrThrow(this);
  }
}
