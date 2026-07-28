export interface ApprovedTaskNamedItem {
  id: number;
  title: string | null;
}

const toRecord = (rawRecord: unknown): Record<string, unknown> | null => {
  if (!rawRecord || typeof rawRecord !== 'object' || Array.isArray(rawRecord)) {
    return null;
  }

  return rawRecord as Record<string, unknown>;
};

const toNumber = (rawNumber: unknown): number | null => {
  if (rawNumber === null || rawNumber === undefined || rawNumber === '') {
    return null;
  }

  const numberValue = Number(rawNumber);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const toTitle = (rawTitle: unknown): string | null => {
  if (typeof rawTitle === 'string' || typeof rawTitle === 'number') {
    const title = String(rawTitle).trim();

    return title || null;
  }

  if (Array.isArray(rawTitle)) {
    const localizedTitle =
      rawTitle.find((item) => toRecord(item)?.locale === 'en') ??
      rawTitle.find((item) => toRecord(item)?.locale === 'ar') ??
      rawTitle[0];

    return toTitle(localizedTitle);
  }

  const record = toRecord(rawTitle);

  if (!record) {
    return null;
  }

  return (
    toTitle(record.title) ?? toTitle(record.name) ?? toTitle(record.label) ?? toTitle(record.text)
  );
};

const mapNamedItem = (rawItem: unknown): ApprovedTaskNamedItem | null => {
  const record = toRecord(rawItem);

  if (!record) {
    return null;
  }

  const id = toNumber(record.id);

  if (id === null) {
    return null;
  }

  return {
    id,
    title: toTitle(record.title ?? record.name ?? record.label) ?? `#${id}`,
  };
};

const toBoolean = (rawFlag: unknown): boolean => {
  return rawFlag === true || rawFlag === 1 || rawFlag === '1' || rawFlag === 'true';
};

const toInsideStatus = (rawStatus: unknown): number | string | null => {
  const numericStatus = toNumber(rawStatus);

  if (numericStatus !== null) {
    return numericStatus;
  }

  return typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : null;
};

export default class TaskAssignmentApprovedTaskModel {
  public readonly id: number;
  public readonly uuid: string;

  public readonly project: ApprovedTaskNamedItem | null;
  public readonly department: ApprovedTaskNamedItem | null;
  public readonly item: ApprovedTaskNamedItem | null;

  public readonly pricingMethod: number;

  public readonly projectFloor: unknown | null;
  public readonly projectFloorSpace: unknown | null;

  public readonly quantity: number;
  public readonly price: number;
  public readonly finalPrice: number;

  public readonly duration: number | null;
  public readonly durationType: number | null;
  public readonly insideStatus: number | string | null;

  public readonly isAssign: boolean;

  public readonly reviewer: unknown | null;

  public readonly hasAttached: boolean;
  public readonly attachments: unknown[];

  constructor(data: {
    id: number;
    uuid: string;

    project: ApprovedTaskNamedItem | null;
    department: ApprovedTaskNamedItem | null;
    item: ApprovedTaskNamedItem | null;

    pricingMethod: number;

    projectFloor: unknown | null;
    projectFloorSpace: unknown | null;

    quantity: number;
    price: number;
    finalPrice: number;

    duration: number | null;
    durationType: number | null;
    insideStatus: number | string | null;

    isAssign: boolean;

    reviewer: unknown | null;

    hasAttached: boolean;
    attachments: unknown[];
  }) {
    this.id = data.id;
    this.uuid = data.uuid;

    this.project = data.project;
    this.department = data.department;
    this.item = data.item;

    this.pricingMethod = data.pricingMethod;

    this.projectFloor = data.projectFloor;
    this.projectFloorSpace = data.projectFloorSpace;

    this.quantity = data.quantity;
    this.price = data.price;
    this.finalPrice = data.finalPrice;

    this.duration = data.duration;
    this.durationType = data.durationType;
    this.insideStatus = data.insideStatus;

    this.isAssign = data.isAssign;

    this.reviewer = data.reviewer;

    this.hasAttached = data.hasAttached;
    this.attachments = data.attachments;

    Object.freeze(this);
  }

  public get projectName(): string {
    return this.project?.title ?? '-';
  }

  public get departmentName(): string {
    return this.department?.title ?? '-';
  }

  public get itemName(): string {
    return this.item?.title ?? '-';
  }

  public get departmentItemName(): string {
    return this.itemName;
  }

  static fromJson(json: Record<string, unknown>): TaskAssignmentApprovedTaskModel {
    const attachments = Array.isArray(json.attachments) ? json.attachments : [];

    return new TaskAssignmentApprovedTaskModel({
      id: toNumber(json.id) ?? 0,
      uuid: typeof json.uuid === 'string' ? json.uuid : '',

      project: mapNamedItem(json.project),

      department: mapNamedItem(json.department),

      item: mapNamedItem(json.item ?? json.department_item ?? json.project_department_item),

      pricingMethod: toNumber(json.pricing_method) ?? 0,

      projectFloor: json.project_floor ?? null,
      projectFloorSpace: json.project_floor_space ?? null,

      quantity: toNumber(json.quantity) ?? 0,
      price: toNumber(json.price) ?? 0,
      finalPrice: toNumber(json.final_price) ?? 0,

      duration: toNumber(json.duration),
      durationType: toNumber(json.duration_type),
      insideStatus: toInsideStatus(json.inside_status),

      isAssign: toBoolean(json.is_assign),

      reviewer: json.reviewer ?? null,

      hasAttached: toBoolean(json.has_attached) || attachments.length > 0,
      attachments,
    });
  }
}
