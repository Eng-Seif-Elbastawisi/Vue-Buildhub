import QuoteTypeModel from '@/modules/MainOrganization/QuoteTypes/core/models/quote.types.model';
import ProjectModel from '@/modules/MainOrganization/Project/core/models/project.model';
import ClientModel from '@/modules/MainOrganization/client/core/models/client.model';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';

import { QuoteSourceEnum } from '../constants/quote.source.enum';
import type { ExecutionQuoteType } from '../constants/execution.quote.type.enum';
import type {
  ExecutionQuoteItemRequest,
  ExecutionQuoteStageRequest,
} from '../params/add.execution.quote.params';

export default class ExecutionQuoteModel {
  public readonly id?: number;
  public readonly quoteSource?: QuoteSourceEnum;
  public readonly quoteType?: ExecutionQuoteType;

  public readonly projectId?: ProjectModel | number;
  public readonly clientId?: ClientModel | number;
  public readonly quoteTypeId?: QuoteTypeModel | number;
  public readonly priceEmployeeId?: EmployeeModel | number;
  public readonly stages: ExecutionQuoteStageRequest[];
  public readonly itemsCount?: number;
  public readonly internalCost?: number;
  public readonly clientTotal?: number;
  public readonly expectedMargin?: number;
  public readonly code?: string;
  public readonly status?: string | number;

  get client(): ClientModel | number | undefined {
    return this.clientId;
  }

  get project(): ProjectModel | number | undefined {
    return this.projectId;
  }

  constructor(data: {
    id?: number;
    quoteSource?: QuoteSourceEnum;
    quoteType?: ExecutionQuoteType;

    projectId?: ProjectModel | number;
    clientId?: ClientModel | number;
    quoteTypeId?: QuoteTypeModel | number;
    priceEmployeeId?: EmployeeModel | number;
    stages?: ExecutionQuoteStageRequest[];
    itemsCount?: number;
    internalCost?: number;
    clientTotal?: number;
    expectedMargin?: number;
    code?: string;
    status?: string | number;
  }) {
    this.id = data.id;
    this.quoteSource = data.quoteSource;
    this.quoteType = data.quoteType;

    this.projectId = data.projectId;
    this.clientId = data.clientId;
    this.quoteTypeId = data.quoteTypeId;
    this.priceEmployeeId = data.priceEmployeeId;
    this.stages = data.stages ?? [];
    this.itemsCount = data.itemsCount;
    this.internalCost = data.internalCost;
    this.clientTotal = data.clientTotal;
    this.expectedMargin = data.expectedMargin;
    this.code = data.code;
    this.status = data.status;

    Object.freeze(this);
  }

  static fromJson(json: any): ExecutionQuoteModel {
    const projectRelation =
      json.project && typeof json.project === 'object'
        ? ProjectModel.fromJson(json.project)
        : undefined;
    const clientRelation =
      json.client && typeof json.client === 'object'
        ? ClientModel.fromJson(json.client)
        : undefined;
    const quoteTypeRelation =
      json.quote_type && typeof json.quote_type === 'object'
        ? QuoteTypeModel.fromJson(json.quote_type)
        : undefined;
    const priceEmployeeRelation =
      json.price_employee && typeof json.price_employee === 'object'
        ? EmployeeModel.fromJson(json.price_employee)
        : undefined;

    const mapItems = (items: unknown): ExecutionQuoteItemRequest[] =>
      Array.isArray(items)
        ? items.map((item) => {
            const value = item as Record<string, unknown>;

            return {
              sub_stage_id: (value.sub_stage_id ?? value.subStageId) as number | string,
              source_type: value.source_type as ExecutionQuoteItemRequest['source_type'],
              source_id: (value.source_id ?? value.sourceId) as number | string,
              quantity: Number(value.quantity ?? 0),
              unit_price: Number(value.unit_price ?? value.unitPrice ?? 0),
            };
          })
        : [];

    const stages = Array.isArray(json.stages)
      ? json.stages.map((stage: Record<string, unknown>) => ({
          stage_id: (stage.stage_id ?? stage.stageId) as number | string,
          client_price:
            stage.client_price === null || stage.client_price === undefined
              ? null
              : Number(stage.client_price),
          items: mapItems(stage.items),
        }))
      : [];

    return new ExecutionQuoteModel({
      id: json.id,

      quoteSource: json.quote_source,
      quoteType:
        typeof json.quote_type === 'string'
          ? (json.quote_type as ExecutionQuoteType)
          : (json.execution_quote_type as ExecutionQuoteType | undefined),

      projectId: projectRelation ?? (json.project_id as number | undefined),

      clientId: clientRelation ?? (json.client_id as number | undefined),

      quoteTypeId: quoteTypeRelation ?? (json.quote_type_id as number | undefined),

      priceEmployeeId: priceEmployeeRelation ?? (json.price_employee_id as number | undefined),
      stages,
      itemsCount: json.items_count === undefined ? undefined : Number(json.items_count),
      internalCost: json.internal_cost === undefined ? undefined : Number(json.internal_cost),
      clientTotal: json.client_total === undefined ? undefined : Number(json.client_total),
      expectedMargin: json.expected_margin === undefined ? undefined : Number(json.expected_margin),
      code: json.code,
      status: json.status,
    });
  }

  static example = new ExecutionQuoteModel({
    id: 1,

    quoteSource: QuoteSourceEnum.EXECUTION_ONLY,

    projectId: ProjectModel.example,

    clientId: ClientModel.example,

    quoteTypeId: QuoteTypeModel.example,

    priceEmployeeId: EmployeeModel.example,
  });
}
