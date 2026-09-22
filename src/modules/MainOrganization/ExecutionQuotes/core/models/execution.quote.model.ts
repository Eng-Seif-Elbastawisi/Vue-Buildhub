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

  static fromJson(json: any): ExecutionQuoteModel {
    return new ExecutionQuoteModel({
      id: json.id,

      quoteSource: json.quote_source,

      projectId: json.project?.id ? ProjectModel.fromJson(json.project) : undefined,

      clientId: json.client ? ClientModel.fromJson(json.client) : undefined,

      quoteTypeId: json.quote_type ? QuoteTypeModel.fromJson(json.quote_type) : undefined,

      priceEmployeeId: json.price_employee
        ? EmployeeModel.fromJson(json.price_employee)
        : undefined,
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
