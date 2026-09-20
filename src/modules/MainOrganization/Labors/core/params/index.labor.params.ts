import IndexParams from '@/base/Core/Params/indexParams';
import type { LaborPricingMode } from '../models/labor.model';

interface IndexLaborOptions {
  word?: string;
  pageNumber?: number;
  perPage?: number;
  withPage?: number;
  active?: 0 | 1;
  itemTypeIds?: number[];
  measurementUnitIds?: number[];
  defaultPricingMode?: LaborPricingMode;
  mappingReadiness?: 0 | 1;
}

export default class IndexLaborParams extends IndexParams {
  public active?: 0 | 1;
  public itemTypeIds: number[];
  public measurementUnitIds: number[];
  public defaultPricingMode?: LaborPricingMode;
  public mappingReadiness?: 0 | 1;

  constructor(options: IndexLaborOptions = {}) {
    super(
      options.word ?? '',
      options.pageNumber ?? 1,
      options.perPage ?? 10,
      options.withPage ?? 1,
    );
    this.active = options.active;
    this.itemTypeIds = [...(options.itemTypeIds ?? [])];
    this.measurementUnitIds = [...(options.measurementUnitIds ?? [])];
    this.defaultPricingMode = options.defaultPricingMode;
    this.mappingReadiness = options.mappingReadiness;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const query = super.toMap();
    if (this.active !== undefined) query.active = this.active;
    if (this.itemTypeIds.length) query.item_type_ids = this.itemTypeIds;
    if (this.measurementUnitIds.length) query.measurement_unit_ids = this.measurementUnitIds;
    if (this.defaultPricingMode !== undefined) {
      query.default_pricing_mode = this.defaultPricingMode;
    }
    if (this.mappingReadiness !== undefined) query.mapping_readiness = this.mappingReadiness;
    return query;
  }
}
