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

  constructor(data: {
    id?: number;
    quoteSource?: QuoteSourceEnum;

    projectId?: ProjectModel;
    clientId?: ClientModel;
    quoteTypeId?: QuoteTypeModel;
    priceEmployeeId?: EmployeeModel;
  }) {
    this.id = data.id;
    this.quoteSource = data.quoteSource;

    this.projectId = data.projectId;
    this.clientId = data.clientId;
    this.quoteTypeId = data.quoteTypeId;
    this.priceEmployeeId = data.priceEmployeeId;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteModel {
    if (!json) {
      throw new Error('Cannot create ExecutionQuoteModel from null or undefined');
    }

    const projectJson =
      json.project_id && typeof json.project_id === 'object' && !Array.isArray(json.project_id)
        ? (json.project_id as Record<string, unknown>)
        : undefined;

    const clientJson =
      json.client_id && typeof json.client_id === 'object' && !Array.isArray(json.client_id)
        ? (json.client_id as Record<string, unknown>)
        : undefined;

    const quoteTypeJson =
      json.quote_type_id &&
      typeof json.quote_type_id === 'object' &&
      !Array.isArray(json.quote_type_id)
        ? (json.quote_type_id as Record<string, unknown>)
        : undefined;

    const priceEmployeeJson =
      json.price_employee_id &&
      typeof json.price_employee_id === 'object' &&
      !Array.isArray(json.price_employee_id)
        ? (json.price_employee_id as Record<string, unknown>)
        : undefined;

    return new ExecutionQuoteModel({
      id: typeof json.id === 'number' ? json.id : undefined,

      quoteSource:
        typeof json.quote_source === 'number' ? (json.quote_source as QuoteSourceEnum) : undefined,

      projectId: projectJson ? ProjectModel.fromJson(projectJson) : undefined,

      clientId: clientJson ? ClientModel.fromJson(clientJson) : undefined,

      quoteTypeId: quoteTypeJson ? QuoteTypeModel.fromJson(quoteTypeJson) : undefined,

      priceEmployeeId: priceEmployeeJson ? EmployeeModel.fromJson(priceEmployeeJson) : undefined,
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
