export default class ProjectSiteInfoModel {
  public readonly deliveryDate?: string | null;
  public readonly siteCondition?: string | null;
  constructor(deliveryDate?: string | null, siteCondition?: string | null) {
    this.deliveryDate = deliveryDate;
    this.siteCondition = siteCondition;
  }
  static fromJson(value: unknown): ProjectSiteInfoModel {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('site_team.invalid_response');
    const data = value as Record<string, unknown>;
    for (const key of ['delivery_date', 'site_condition']) {
      if (data[key] !== undefined && data[key] !== null && typeof data[key] !== 'string')
        throw new Error('site_team.invalid_response');
    }
    return new ProjectSiteInfoModel(
      data.delivery_date as string | null | undefined,
      data.site_condition as string | null | undefined,
    );
  }
}
