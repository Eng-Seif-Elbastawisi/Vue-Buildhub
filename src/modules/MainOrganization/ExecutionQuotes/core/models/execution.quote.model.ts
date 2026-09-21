import QuoteTypeModel from '@/modules/MainOrganization/QuoteTypes/core/models/quote.types.model';
import ProjectModel from '@/modules/MainOrganization/Project/core/models/project.model';
import ClientModel from '@/modules/MainOrganization/client/core/models/client.model';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';

import { QuoteSourceEnum } from '../constants/quote.source.enum';

export default class ExecutionQuoteModel {
  public readonly id?: number;

  public readonly quoteSource?: QuoteSourceEnum;

  public readonly projectId?: ProjectModel;
  public readonly clientId?: ClientModel;
  public readonly quoteTypeId?: QuoteTypeModel;
  public readonly priceEmployeeId?: EmployeeModel;

  constructor(modelData: {
    id?: number;
    quoteSource?: QuoteSourceEnum;

    projectId?: ProjectModel;
    clientId?: ClientModel;
    quoteTypeId?: QuoteTypeModel;
    priceEmployeeId?: EmployeeModel;
  }) {
    this.id = modelData.id;

    this.quoteSource = modelData.quoteSource;

    this.projectId = modelData.projectId;
    this.clientId = modelData.clientId;
    this.quoteTypeId = modelData.quoteTypeId;
    this.priceEmployeeId = modelData.priceEmployeeId;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteModel {
    if (!json) {
      throw new Error('Cannot create ExecutionQuoteModel from null or undefined');
    }

    return new ExecutionQuoteModel({
      id: ExecutionQuoteModel.toNumber(json.id),

      quoteSource: ExecutionQuoteModel.toQuoteSource(json.quote_source ?? json.quoteSource),

      projectId: ExecutionQuoteModel.toProjectModel(json.project_id ?? json.projectId),

      clientId: ExecutionQuoteModel.toClientModel(json.client_id ?? json.clientId),

      quoteTypeId: ExecutionQuoteModel.toQuoteTypeModel(json.quote_type_id ?? json.quoteTypeId),

      priceEmployeeId: ExecutionQuoteModel.toEmployeeModel(
        json.price_employee_id ?? json.priceEmployeeId,
      ),
    });
  }

  private static toNumber(rawValue: unknown): number | undefined {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return undefined;
    }

    const value = Number(rawValue);

    return Number.isFinite(value) ? value : undefined;
  }

  private static toQuoteSource(rawValue: unknown): QuoteSourceEnum | undefined {
    const value = ExecutionQuoteModel.toNumber(rawValue);

    if (value === undefined) {
      return undefined;
    }

    if (
      value === QuoteSourceEnum.EXECUTION_ONLY ||
      value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE
    ) {
      return value;
    }

    return undefined;
  }

  private static toProjectModel(rawValue: unknown): ProjectModel | undefined {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return undefined;
    }

    return ProjectModel.fromJson(rawValue as Record<string, unknown>);
  }

  private static toClientModel(rawValue: unknown): ClientModel | undefined {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return undefined;
    }

    return ClientModel.fromJson(rawValue as Record<string, unknown>);
  }

  private static toQuoteTypeModel(rawValue: unknown): QuoteTypeModel | undefined {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return undefined;
    }

    return QuoteTypeModel.fromJson(rawValue as Record<string, unknown>);
  }

  private static toEmployeeModel(rawValue: unknown): EmployeeModel | undefined {
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return undefined;
    }

    return EmployeeModel.fromJson(rawValue as Record<string, unknown>);
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
