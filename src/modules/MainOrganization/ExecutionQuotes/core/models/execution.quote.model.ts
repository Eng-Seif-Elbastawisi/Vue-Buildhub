import QuoteTypeModel from '@/modules/MainOrganization/QuoteTypes/core/models/quote.types.model';
import ProjectModel from '@/modules/MainOrganization/Project/core/models/project.model';
import ClientModel from '@/modules/MainOrganization/client/core/models/client.model';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';

import { QuoteSourceEnum } from '../constants/quote.source.enum';

interface ExecutionQuoteJson {
  id?: number;
  quote_source?: QuoteSourceEnum;

  project?: {
    id?: number;
  };

  client?: {
    id?: number;
  };

  quote_type?: {
    id?: number;
  };

  price_employee?: {
    id?: number;
  };
}

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

  static fromJson(json: ExecutionQuoteJson): ExecutionQuoteModel {
    return new ExecutionQuoteModel({
      id: json.id,

      quoteSource: json.quote_source,

      projectId: json.project
        ? new ProjectModel({
            id: json.project.id,
          })
        : undefined,

      clientId: json.client
        ? ClientModel.fromJson({
            id: json.client.id,
          })
        : undefined,

      quoteTypeId: json.quote_type
        ? QuoteTypeModel.fromJson({
            id: json.quote_type.id,
          })
        : undefined,

      priceEmployeeId: json.price_employee
        ? EmployeeModel.fromJson({
            id: json.price_employee.id,
          })
        : undefined,
    });
  }

  static example = new ExecutionQuoteModel({
    id: 1,

    quoteSource: QuoteSourceEnum.EXECUTION_ONLY,

    projectId: new ProjectModel({
      id: 10,
    }),

    clientId: ClientModel.fromJson({
      id: 5,
    }),

    quoteTypeId: QuoteTypeModel.fromJson({
      id: 2,
    }),

    priceEmployeeId: EmployeeModel.fromJson({
      id: 7,
    }),
  });
}
