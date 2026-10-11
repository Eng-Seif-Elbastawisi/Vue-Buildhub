import TitleInterface from '@/base/Data/Models/titleInterface';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import OrganizationShowModel from '@/modules/shared/Organization/core/models/organization.show.model';

import { QuoteSourceEnum } from '../constants/quote.source.enum';
import { QuoteStatusEnum } from '../constants/quote.status.enum';
import ExecutionQuoteAttachmentModel from './execution.quote.attachment.model';
import ExecutionQuoteClientModel from './execution.quote.client.model';
import ExecutionQuoteProjectModel from './execution.quote.project.model';
import ExecutionQuoteStageModel from './execution.quote.stage.model';

export default class ExecutionQuoteShowModel {
  public readonly id?: number;
  public readonly organization?: OrganizationShowModel;
  public readonly employee?: EmployeeModel;
  public readonly quoteSource?: QuoteSourceEnum;
  public readonly project?: ExecutionQuoteProjectModel;
  public readonly client?: ExecutionQuoteClientModel;
  public readonly quoteType?: TitleInterface<number>;
  public readonly priceEmployee?: EmployeeModel;
  public readonly quoteStages: ExecutionQuoteStageModel[];
  public readonly quoteStagesCount: number;
  public readonly quoteItemsCount: number;
  public readonly attachments: ExecutionQuoteAttachmentModel[];
  public readonly totalQuotePrice?: number;
  public readonly clientQuotePrice?: number;
  public readonly supervisionPercentage?: number;
  public readonly supervisionFee?: number;
  public readonly createdAt?: string;
  public readonly quoteStatus?: QuoteStatusEnum;

  constructor(data: {
    id?: number;
    organization?: OrganizationShowModel;
    employee?: EmployeeModel;
    quoteSource?: QuoteSourceEnum;
    project?: ExecutionQuoteProjectModel;
    client?: ExecutionQuoteClientModel;
    quoteType?: TitleInterface<number>;
    priceEmployee?: EmployeeModel;
    quoteStages?: ExecutionQuoteStageModel[];
    attachments?: ExecutionQuoteAttachmentModel[];
    totalQuotePrice?: number;
    clientQuotePrice?: number;
    supervisionPercentage?: number;
    supervisionFee?: number;
    createdAt?: string;
    quoteStatus?: QuoteStatusEnum;
  }) {
    this.id = data.id;
    this.organization = data.organization;
    this.employee = data.employee;
    this.quoteSource = data.quoteSource;
    this.project = data.project;
    this.client = data.client;
    this.quoteType = data.quoteType;
    this.priceEmployee = data.priceEmployee;
    this.quoteStages = data.quoteStages ?? [];
    const mainStageIds = new Set(
      this.quoteStages
        .map((quoteStage) => quoteStage.stageId)
        .filter((stageId): stageId is number => stageId !== undefined),
    );
    this.quoteStagesCount = mainStageIds.size || this.quoteStages.length;
    this.quoteItemsCount = 0;
    this.attachments = data.attachments ?? [];
    this.totalQuotePrice = data.totalQuotePrice;
    this.clientQuotePrice = data.clientQuotePrice;
    this.supervisionPercentage = data.supervisionPercentage;
    this.supervisionFee = data.supervisionFee;
    this.createdAt = data.createdAt;
    this.quoteStatus = data.quoteStatus;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown | null | undefined>): ExecutionQuoteShowModel {
    const rawQuoteType = json.quote_type;
    const quoteType =
      typeof rawQuoteType === 'object' && rawQuoteType !== null
        ? (rawQuoteType as Record<string, unknown>)
        : undefined;
    const quoteTypeId = Number(quoteType?.id ?? rawQuoteType ?? json.quote_type_id);
    const quoteSource = Number(json.quote_source) as QuoteSourceEnum;
    const quoteStatus = Number(json.quote_status) as QuoteStatusEnum;
    const clientQuotePrice = json.client_quote_price ?? json.total_client_price;
    const supervisionPercentage =
      json.supervision_value ?? json.supervision_percentage ?? json.percentage;
    const supervisionFee = json.supervision_price ?? json.supervision_fee;

    return new ExecutionQuoteShowModel({
      id: json.id as number | undefined,
      organization: json.organization
        ? OrganizationShowModel.fromJson(json.organization as Record<string, unknown>)
        : undefined,
      employee: json.employee
        ? EmployeeModel.fromJson(json.employee as Record<string, unknown>)
        : undefined,
      quoteSource: Object.values(QuoteSourceEnum).includes(quoteSource) ? quoteSource : undefined,
      project: json.project
        ? ExecutionQuoteProjectModel.fromJson(json.project as Record<string, unknown>)
        : undefined,
      client: json.client
        ? ExecutionQuoteClientModel.fromJson(json.client as Record<string, unknown>)
        : undefined,
      quoteType: Number.isFinite(quoteTypeId)
        ? new TitleInterface<number>({
          id: quoteTypeId,
          title: quoteType?.title as string | undefined,
        })
        : undefined,
      priceEmployee: json.price_employee
        ? EmployeeModel.fromJson(json.price_employee as Record<string, unknown>)
        : undefined,
      quoteStages: json.quote_stages
        ? (json.quote_stages as Record<string, unknown>[]).map((quoteStage) =>
          ExecutionQuoteStageModel.fromJson(quoteStage),
        )
        : [],
      attachments: Array.isArray(json.attachments)
        ? (json.attachments as Record<string, unknown>[]).map(
          ExecutionQuoteAttachmentModel.fromJson,
        )
        : [],
      totalQuotePrice: json.total_quote_price == null ? undefined : Number(json.total_quote_price),
      clientQuotePrice: clientQuotePrice == null ? undefined : Number(clientQuotePrice),
      supervisionPercentage:
        supervisionPercentage == null ? undefined : Number(supervisionPercentage),
      supervisionFee: supervisionFee == null ? undefined : Number(supervisionFee),
      createdAt: json.created_at as string | undefined,
      quoteStatus: Object.values(QuoteStatusEnum).includes(quoteStatus) ? quoteStatus : undefined,
    });
  }

  static example = new ExecutionQuoteShowModel({
    id: 1,
    organization: new OrganizationShowModel({ id: 1, name: 'BuildHub' }),
    employee: new EmployeeModel({ id: 1, name: 'Employee', email: '', phone: '' }),
    quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
    project: new ExecutionQuoteProjectModel({ id: 1, title: 'Project' }),
    client: new ExecutionQuoteClientModel({ id: 1, name: 'Client' }),
    quoteType: new TitleInterface<number>({ id: 1, title: 'Lump_SUM' }),
    priceEmployee: new EmployeeModel({
      id: 2,
      name: 'Pricing employee',
      email: '',
      phone: '',
    }),
    quoteStages: [],
    attachments: [],
  });
}
