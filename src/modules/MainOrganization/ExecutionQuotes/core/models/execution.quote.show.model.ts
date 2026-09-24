import { QuoteSourceEnum } from '../constants/quote.source.enum';

export interface ExecutionQuoteOrganizationSummary {
  id?: number;
  name?: string;
  address?: string;
}

export interface ExecutionQuoteEmployeeSummary {
  id?: number;
  name?: string;
}

export interface ExecutionQuoteTitledResourceSummary {
  id?: number;
  title?: string;
}

export interface ExecutionQuoteProjectSummary {
  id?: number;
  client?: { id?: number; title?: string };
  title?: string;
  description?: string | null;
  date?: string;
  createdAt?: string;
}

export interface ExecutionQuoteClientSummary {
  id?: number;
  organization?: ExecutionQuoteOrganizationSummary;
  employee?: ExecutionQuoteEmployeeSummary;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: number;
  clientSource?: ExecutionQuoteTitledResourceSummary | null;
  status?: number;
  createdAt?: string;
}

export interface ExecutionQuoteTypeSummary {
  id?: number;
  title?: string;
}

export interface ExecutionQuoteStageItemSummary {
  id?: number;
  itemType?: number;
  itemableId?: number;
  itemableType?: string;
  itemable?: ExecutionQuoteTitledResourceSummary;
  expectedPrice?: number;
  quantity?: number;
}

export interface ExecutionQuoteStageSummary {
  id?: number;
  quoteId?: number;
  projectId?: number;
  stageId?: number;
  subStageId?: number;
  stage?: ExecutionQuoteTitledResourceSummary;
  subStage?: ExecutionQuoteTitledResourceSummary;
  items: ExecutionQuoteStageItemSummary[];
  totalPrice?: number;
  createdAt?: string;
}

const objectValue = (rawRelation: unknown): Record<string, unknown> | undefined =>
  rawRelation && typeof rawRelation === 'object' && !Array.isArray(rawRelation)
    ? (rawRelation as Record<string, unknown>)
    : undefined;

const numberValue = (rawNumber: unknown): number | undefined =>
  typeof rawNumber === 'number' ? rawNumber : undefined;

const decimalNumberValue = (rawNumber: unknown): number | undefined => {
  if (typeof rawNumber === 'number') return Number.isFinite(rawNumber) ? rawNumber : undefined;
  if (typeof rawNumber !== 'string' || rawNumber.trim() === '') return undefined;

  const parsedNumber = Number(rawNumber);
  return Number.isFinite(parsedNumber) ? parsedNumber : undefined;
};

const stringValue = (rawText: unknown): string | undefined =>
  typeof rawText === 'string' ? rawText : undefined;

const nullableStringValue = (rawText: unknown): string | null | undefined =>
  rawText === null ? null : stringValue(rawText);

const quoteSourceValue = (rawSource: unknown): QuoteSourceEnum | undefined => {
  const source = numberValue(rawSource) as QuoteSourceEnum | undefined;
  return source && Object.values(QuoteSourceEnum).includes(source) ? source : undefined;
};

const organizationSummary = (
  rawOrganization: unknown,
): ExecutionQuoteOrganizationSummary | undefined => {
  const organization = objectValue(rawOrganization);
  if (!organization) return undefined;

  return {
    id: numberValue(organization.id),
    name: stringValue(organization.name),
    address: stringValue(organization.address),
  };
};

const employeeSummary = (rawEmployee: unknown): ExecutionQuoteEmployeeSummary | undefined => {
  const employee = objectValue(rawEmployee);
  if (!employee) return undefined;

  return {
    id: numberValue(employee.id),
    name: stringValue(employee.name),
  };
};

const titledResourceSummary = (
  rawResource: unknown,
): ExecutionQuoteTitledResourceSummary | undefined => {
  const resource = objectValue(rawResource);
  if (!resource) return undefined;

  return {
    id: numberValue(resource.id),
    title: stringValue(resource.title),
  };
};

const projectClientSummary = (rawClient: unknown) => {
  const client = objectValue(rawClient);
  if (!client) return undefined;

  return {
    id: numberValue(client.id),
    title: stringValue(client.title),
  };
};

const projectSummary = (rawProject: unknown): ExecutionQuoteProjectSummary | undefined => {
  const project = objectValue(rawProject);
  if (!project) return undefined;

  return {
    id: numberValue(project.id),
    client: projectClientSummary(project.client),
    title: stringValue(project.title),
    description: nullableStringValue(project.description),
    date: stringValue(project.date),
    createdAt: stringValue(project.created_at),
  };
};

const clientSummary = (rawClient: unknown): ExecutionQuoteClientSummary | undefined => {
  const client = objectValue(rawClient);
  if (!client) return undefined;

  return {
    id: numberValue(client.id),
    organization: organizationSummary(client.organization),
    employee: employeeSummary(client.employee),
    name: stringValue(client.name),
    phone: stringValue(client.phone),
    email: stringValue(client.email),
    address: stringValue(client.address),
    type: numberValue(client.type),
    clientSource:
      client.client_source === null ? null : titledResourceSummary(client.client_source),
    status: numberValue(client.status),
    createdAt: stringValue(client.created_at),
  };
};

const quoteTypeSummary = (rawQuoteType: unknown): ExecutionQuoteTypeSummary | undefined => {
  const quoteType = objectValue(rawQuoteType);
  if (!quoteType) return undefined;

  return {
    id: numberValue(quoteType.id),
    title: stringValue(quoteType.title),
  };
};

const stageItemSummary = (rawItem: unknown): ExecutionQuoteStageItemSummary | undefined => {
  const stageItem = objectValue(rawItem);
  if (!stageItem) return undefined;

  return {
    id: numberValue(stageItem.id),
    itemType: numberValue(stageItem.item_type),
    itemableId: numberValue(stageItem.itemable_id),
    itemableType: stringValue(stageItem.itemable_type),
    itemable: titledResourceSummary(stageItem.itemable),
    expectedPrice: decimalNumberValue(stageItem.expected_price),
    quantity: decimalNumberValue(stageItem.quantity),
  };
};

const quoteStageSummary = (rawStage: unknown): ExecutionQuoteStageSummary | undefined => {
  const quoteStage = objectValue(rawStage);
  if (!quoteStage) return undefined;

  const stage = titledResourceSummary(quoteStage.stage);
  const subStage = titledResourceSummary(quoteStage.sub_stage);

  const stageItems = Array.isArray(quoteStage.items)
    ? quoteStage.items
        .map(stageItemSummary)
        .filter((stageItem): stageItem is ExecutionQuoteStageItemSummary => !!stageItem)
    : [];

  return {
    id: numberValue(quoteStage.id),
    quoteId: numberValue(quoteStage.quote_id),
    projectId: numberValue(quoteStage.project_id),
    stageId: stage?.id ?? numberValue(quoteStage.stage_id),
    subStageId: subStage?.id ?? numberValue(quoteStage.sub_stage_id),
    stage,
    subStage,
    items: stageItems,
    totalPrice: decimalNumberValue(quoteStage.total_price),
    createdAt: stringValue(quoteStage.created_at),
  };
};

const quoteStageSummaries = (rawStages: unknown): ExecutionQuoteStageSummary[] => {
  if (!Array.isArray(rawStages)) return [];

  return rawStages
    .map(quoteStageSummary)
    .filter((quoteStage): quoteStage is ExecutionQuoteStageSummary => !!quoteStage);
};

export default class ExecutionQuoteShowModel {
  public readonly id?: number;
  public readonly organization?: ExecutionQuoteOrganizationSummary;
  public readonly employee?: ExecutionQuoteEmployeeSummary;
  public readonly quoteSource?: QuoteSourceEnum;
  public readonly project?: ExecutionQuoteProjectSummary;
  public readonly client?: ExecutionQuoteClientSummary;
  public readonly quoteType?: ExecutionQuoteTypeSummary;
  public readonly priceEmployee?: ExecutionQuoteEmployeeSummary;
  public readonly quoteStages: ExecutionQuoteStageSummary[];
  public readonly quoteStagesCount: number;
  public readonly quoteItemsCount: number;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    organization?: ExecutionQuoteOrganizationSummary;
    employee?: ExecutionQuoteEmployeeSummary;
    quoteSource?: QuoteSourceEnum;
    project?: ExecutionQuoteProjectSummary;
    client?: ExecutionQuoteClientSummary;
    quoteType?: ExecutionQuoteTypeSummary;
    priceEmployee?: ExecutionQuoteEmployeeSummary;
    quoteStages?: ExecutionQuoteStageSummary[];
    createdAt?: string;
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
    this.quoteStagesCount = this.quoteStages.length;
    this.quoteItemsCount = this.quoteStages.reduce(
      (itemsTotal, quoteStage) => itemsTotal + quoteStage.items.length,
      0,
    );
    this.createdAt = data.createdAt;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteShowModel {
    return new ExecutionQuoteShowModel({
      id: numberValue(json.id),
      organization: organizationSummary(json.organization),
      employee: employeeSummary(json.employee),
      quoteSource: quoteSourceValue(json.quote_source),
      project: projectSummary(json.project),
      client: clientSummary(json.client),
      quoteType: quoteTypeSummary(json.quote_type),
      priceEmployee: employeeSummary(json.price_employee),
      quoteStages: quoteStageSummaries(json.quote_stages),
      createdAt: stringValue(json.created_at),
    });
  }

  static example = new ExecutionQuoteShowModel({
    id: 1,
    organization: { id: 1, name: 'BuildHub' },
    employee: { id: 1, name: 'Employee' },
    quoteSource: QuoteSourceEnum.EXECUTION_ONLY,
    project: { id: 1, title: 'Project' },
    client: { id: 1, name: 'Client' },
    quoteType: { id: 1, title: 'Lump_SUM' },
    priceEmployee: { id: 2, name: 'Pricing employee' },
    quoteStages: [],
  });
}
