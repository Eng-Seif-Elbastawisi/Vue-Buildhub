export type TaskAssignmentApprovedTaskNamedItem = {
  id: number;
  title: string;
};

export type TaskAssignmentApprovedTaskReviewer = {
  id?: number;
  title: string;
};

export type TaskAssignmentApprovedTaskAttachment = {
  file: string;
  alt: string;
  link: string | null;
};

const emptyValue = '';

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const toNullableNumber = (value: unknown): number | null => {
  return toNumber(value) ?? null;
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return String(value);
};

const getPlainTitle = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const localizedTitle =
      value.find((item) => toRecord(item)?.locale === 'en') ??
      value.find((item) => toRecord(item)?.locale === 'ar') ??
      value[0];

    return getPlainTitle(localizedTitle);
  }

  const record = toRecord(value);

  if (!record) {
    return emptyValue;
  }

  return (
    getPlainTitle(record.title) ||
    getPlainTitle(record.name) ||
    getPlainTitle(record.label) ||
    getPlainTitle(record.text) ||
    emptyValue
  );
};

const mapNamedItem = (value: unknown): TaskAssignmentApprovedTaskNamedItem | null => {
  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const id = toNumber(record.id);

  if (id === undefined) {
    return null;
  }

  return {
    id,
    title:
      getPlainTitle(record.title) ||
      getPlainTitle(record.name) ||
      getPlainTitle(record.label) ||
      `#${id}`,
  };
};

const mapReviewer = (value: unknown): TaskAssignmentApprovedTaskReviewer | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const id = toNumber(value);

    return {
      id,
      title: id !== undefined ? `#${id}` : String(value),
    };
  }

  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const id = toNumber(record.id ?? record.employee_id ?? record.reviewer_id);

  const title =
    getPlainTitle(record.title) ||
    getPlainTitle(record.name) ||
    getPlainTitle(record.full_name) ||
    getPlainTitle(record.employee_name) ||
    (id !== undefined ? `#${id}` : emptyValue);

  if (!title) {
    return null;
  }

  return {
    id,
    title,
  };
};

const mapAttachments = (value: unknown): TaskAssignmentApprovedTaskAttachment[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): TaskAssignmentApprovedTaskAttachment | null => {
      const record = toRecord(item);

      if (!record) {
        return null;
      }

      const file = typeof record.file === 'string' ? record.file : '';

      if (!file) {
        return null;
      }

      const alt = typeof record.alt === 'string' ? record.alt : '';

      const link = typeof record.link === 'string' && record.link.trim() ? record.link : null;

      return {
        file,
        alt,
        link,
      };
    })
    .filter(
      (attachment): attachment is TaskAssignmentApprovedTaskAttachment => attachment !== null,
    );
};

export default class TaskAssignmentApprovedTaskModel {
  public readonly raw: Record<string, unknown>;

  public readonly id: number;

  public readonly uuid: string;

  public readonly project: TaskAssignmentApprovedTaskNamedItem | null;

  public readonly department: TaskAssignmentApprovedTaskNamedItem | null;

  public readonly item: TaskAssignmentApprovedTaskNamedItem | null;

  public readonly pricingMethod: number | null;

  public readonly projectFloor: string | number | null;

  public readonly projectFloorSpace: number | null;

  public readonly quantity: number | null;

  public readonly price: number | null;

  public readonly finalPrice: number | null;

  public readonly duration: number | null;

  public readonly durationType: number | null;

  public readonly insideStatus: string | number | null;

  public readonly reviewer: TaskAssignmentApprovedTaskReviewer | null;

  public readonly hasAttached: boolean;

  public readonly attachments: TaskAssignmentApprovedTaskAttachment[];

  constructor(data: {
    raw: Record<string, unknown>;
    id: number;
    uuid: string;

    project: TaskAssignmentApprovedTaskNamedItem | null;

    department: TaskAssignmentApprovedTaskNamedItem | null;

    item: TaskAssignmentApprovedTaskNamedItem | null;

    pricingMethod: number | null;

    projectFloor: string | number | null;

    projectFloorSpace: number | null;

    quantity: number | null;
    price: number | null;
    finalPrice: number | null;
    duration: number | null;
    durationType: number | null;

    insideStatus: string | number | null;

    reviewer: TaskAssignmentApprovedTaskReviewer | null;

    hasAttached: boolean;

    attachments: TaskAssignmentApprovedTaskAttachment[];
  }) {
    this.raw = data.raw;
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

    this.reviewer = data.reviewer;

    this.hasAttached = data.hasAttached;

    this.attachments = data.attachments;

    Object.freeze(this);
  }

  public get title(): string {
    return this.item?.title || `#${this.id}`;
  }

  public get projectId(): number | undefined {
    return this.project?.id;
  }

  public get projectName(): string {
    return this.project?.title || emptyValue;
  }

  public get departmentId(): number | undefined {
    return this.department?.id;
  }

  public get departmentName(): string {
    return this.department?.title || emptyValue;
  }

  public get departmentItemId(): number | undefined {
    return this.item?.id;
  }

  public get departmentItemName(): string {
    return this.item?.title || emptyValue;
  }

  public get reviewerId(): number | undefined {
    return this.reviewer?.id;
  }

  public get reviewerName(): string {
    return this.reviewer?.title || emptyValue;
  }

  public get attachmentsCount(): number {
    return this.attachments.length;
  }

  public get hasAttachments(): boolean {
    return this.hasAttached && this.attachments.length > 0;
  }

  public get durationDisplay(): string {
    if (this.duration === null) {
      return emptyValue;
    }

    return String(this.duration);
  }

  public get statusLabel(): string {
    if (this.insideStatus === null || this.insideStatus === undefined) {
      return emptyValue;
    }

    return String(this.insideStatus);
  }

  static fromJson(json: Record<string, unknown>): TaskAssignmentApprovedTaskModel {
    if (!json) {
      throw new Error('Cannot create TaskAssignmentApprovedTaskModel from null or undefined');
    }

    const id = toNumber(json.id);

    if (id === undefined) {
      throw new Error('Approved task ID is missing or invalid');
    }

    const project = mapNamedItem(json.project);

    const department = mapNamedItem(json.department);

    const item = mapNamedItem(json.item ?? json.department_item ?? json.project_department_item);

    const attachments = mapAttachments(json.attachments);

    const hasAttached = Boolean(json.has_attached) || attachments.length > 0;

    return new TaskAssignmentApprovedTaskModel({
      raw: json,

      id,

      uuid: typeof json.uuid === 'string' ? json.uuid : '',

      project,

      department,

      item,

      pricingMethod: toNullableNumber(json.pricing_method),

      projectFloor: toNullableNumber(json.project_floor) ?? toNullableString(json.project_floor),

      projectFloorSpace: toNullableNumber(json.project_floor_space),

      quantity: toNullableNumber(json.quantity),

      price: toNullableNumber(json.price),

      finalPrice: toNullableNumber(json.final_price),

      duration: toNullableNumber(json.duration),

      durationType: toNullableNumber(json.duration_type),

      insideStatus: toNullableNumber(json.inside_status) ?? toNullableString(json.inside_status),

      reviewer: mapReviewer(json.reviewer),

      hasAttached,

      attachments,
    });
  }

  static example = new TaskAssignmentApprovedTaskModel({
    raw: {
      id: 45,
      uuid: 'ff6acc0a-777d-4016-b47b-9b6ba2d1520f',

      project: {
        id: 71,
        title: 'xxxxxx',
      },

      department: {
        id: 26,
        title: '3D MAX',
      },

      item: {
        id: 12,
        title: 'حمحم',
      },

      pricing_method: 1,
      quantity: 1,
      price: 500000,
      final_price: 500000,
      has_attached: false,
      attachments: [],
    },

    id: 45,

    uuid: 'ff6acc0a-777d-4016-b47b-9b6ba2d1520f',

    project: {
      id: 71,
      title: 'xxxxxx',
    },

    department: {
      id: 26,
      title: '3D MAX',
    },

    item: {
      id: 12,
      title: 'حمحم',
    },

    pricingMethod: 1,
    projectFloor: null,
    projectFloorSpace: null,
    quantity: 1,
    price: 500000,
    finalPrice: 500000,
    duration: null,
    durationType: null,
    insideStatus: null,
    reviewer: null,
    hasAttached: false,
    attachments: [],
  });
}
