export type TaskAssignmentTaskEmployee = {
  id?: number;
  name: string;
};

export type TaskAssignmentTaskStatusOption = {
  id: string | number;
  title: string;
};

export type TaskAssignmentTaskAvailableAction = {
  action?: string;
  label?: string;
  status?: string | number;
  payload?: Record<string, unknown>;
  destructive?: boolean;
};

export type TaskAssignmentAttachment = {
  id?: number;
  file: string;
  fileSize: string;
  alt: string;
  type?: number;
  link: string | null;
  status?: string | number | null;
  statusName: string;
  createdAt: string;
};

const emptyValue = '';

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes'].includes(value.toLowerCase());
  }

  return false;
};

const getPlainTitle = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const localizedTitle =
      value.find((item) => toRecord(item)?.locale === 'en') ??
      value.find((item) => toRecord(item)?.locale === 'ar') ??
      value[0];

    const titleRecord = toRecord(localizedTitle);

    if (!titleRecord) return emptyValue;

    return (
      getPlainTitle(titleRecord.title) ||
      getPlainTitle(titleRecord.name) ||
      getPlainTitle(titleRecord.label)
    );
  }

  const record = toRecord(value);

  if (!record) return emptyValue;

  return (
    getPlainTitle(record.name) ||
    getPlainTitle(record.title) ||
    getPlainTitle(record.label)
  );
};

const getNamedValue = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  const record = toRecord(value);

  if (!record) return emptyValue;

  return (
    getPlainTitle(record.name) ||
    getPlainTitle(record.title) ||
    getPlainTitle(record.label) ||
    getPlainTitle(record.text) ||
    (record.id !== undefined ? `#${record.id}` : emptyValue)
  );
};

const firstString = (
  source: Record<string, unknown> | null,
  keys: string[],
): string => {
  if (!source) return emptyValue;

  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return emptyValue;
};

const mapPerson = (
  value: unknown,
): TaskAssignmentTaskEmployee | undefined => {
  const record = toRecord(value);

  if (!record) return undefined;

  const id = toNumber(record.id ?? record.employee_id);
  const name = getNamedValue(record);

  if (!name && !id) return undefined;

  return {
    id,
    name: name || `#${id}`,
  };
};

const mapEmployees = (
  source: Record<string, unknown>,
): TaskAssignmentTaskEmployee[] => {
  const rows: unknown[] = [];

  const collections = [
    source.employees,
    source.assigned_employees,
    source.employee_ids,
  ];

  collections.forEach((collection) => {
    if (Array.isArray(collection)) {
      rows.push(...collection);
    }
  });

  const singleEmployees = [
    source.employee,
    source.assigned_employee,
    source.task_employee,
  ];

  singleEmployees.forEach((employee) => {
    if (employee !== null && employee !== undefined) {
      rows.push(employee);
    }
  });

  const employees = rows
    .map((item): TaskAssignmentTaskEmployee | null => {
      if (typeof item === 'number' || typeof item === 'string') {
        const id = toNumber(item);

        return id
          ? {
              id,
              name: `#${id}`,
            }
          : null;
      }

      return mapPerson(item) ?? null;
    })
    .filter(
      (employee): employee is TaskAssignmentTaskEmployee =>
        employee !== null && employee.name.trim().length > 0,
    );

  const uniqueEmployees = new Map<string, TaskAssignmentTaskEmployee>();

  employees.forEach((employee) => {
    const key = employee.id
      ? String(employee.id)
      : employee.name.toLowerCase();

    uniqueEmployees.set(key, employee);
  });

  return Array.from(uniqueEmployees.values());
};

const mapAttachments = (
  value: unknown,
): TaskAssignmentAttachment[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): TaskAssignmentAttachment | null => {
      const attachment = toRecord(item);

      if (!attachment) return null;

      const file = firstString(attachment, ['file', 'url']);

      if (!file) return null;

      return {
        id: toNumber(attachment.id),
        file,
        fileSize: firstString(attachment, [
          'file_size',
          'fileSize',
        ]),
        alt: firstString(attachment, [
          'alt',
          'title',
          'name',
        ]),
        type: toNumber(attachment.type),
        link:
          typeof attachment.link === 'string'
            ? attachment.link
            : null,
        status: attachment.status as
          | string
          | number
          | null
          | undefined,
        statusName: firstString(attachment, [
          'status_name',
          'statusName',
        ]),
        createdAt: firstString(attachment, [
          'created_at',
          'createdAt',
        ]),
      };
    })
    .filter(
      (
        attachment,
      ): attachment is TaskAssignmentAttachment =>
        attachment !== null,
    );
};

const mapStatusOptions = (
  value: unknown,
): TaskAssignmentTaskStatusOption[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): TaskAssignmentTaskStatusOption | null => {
      const record = toRecord(item);

      if (!record) {
        if (
          typeof item === 'string' ||
          typeof item === 'number'
        ) {
          return {
            id: item,
            title: String(item),
          };
        }

        return null;
      }

      const id =
        record.id ??
        record.status ??
        record.value ??
        record.key;

      const title =
        getNamedValue(record) ||
        String(id ?? emptyValue);

      if (
        id === undefined ||
        id === null ||
        !title
      ) {
        return null;
      }

      return {
        id: id as string | number,
        title,
      };
    })
    .filter(
      (
        option,
      ): option is TaskAssignmentTaskStatusOption =>
        option !== null,
    );
};

const mapAvailableActions = (
  value: unknown,
): TaskAssignmentTaskAvailableAction[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map(
      (
        item,
      ): TaskAssignmentTaskAvailableAction | null => {
        const record = toRecord(item);

        if (!record) return null;

        return {
          action:
            typeof record.action === 'string'
              ? record.action
              : typeof record.endpoint === 'string'
                ? record.endpoint
                : undefined,

          label: getNamedValue(
            record.label ??
              record.title ??
              record.name,
          ),

          status: (
            record.status ??
            record.value
          ) as string | number | undefined,

          payload:
            toRecord(record.payload) ?? undefined,

          destructive: toBoolean(
            record.destructive,
          ),
        };
      },
    )
    .filter(
      (
        action,
      ): action is TaskAssignmentTaskAvailableAction =>
        action !== null,
    );
};

export default class TaskAssignmentEmployeeTaskModel {
  public readonly raw: Record<string, unknown>;

  // data.id = 5
  public readonly id?: number;

  // project_department_item.id = 44
  public readonly projectDepartmentItemId?: number;

  // project_department_item.uuid
  public readonly uuid: string;

  public readonly title: string;
  public readonly projectName: string;
  public readonly departmentName: string;
  public readonly departmentItemName: string;

  public readonly projectId?: number;
  public readonly departmentId?: number;
  public readonly itemId?: number;

  public readonly assignedBy?: TaskAssignmentTaskEmployee;
  public readonly taskEmployee?: TaskAssignmentTaskEmployee;
  public readonly assignedEmployees: TaskAssignmentTaskEmployee[];

  public readonly notes: string;

  public readonly status?: string | number | null;
  public readonly statusLabel: string;
  public readonly insideStatus?: string | number | null;

  public readonly createdAt: string;
  public readonly dueDate: string;

  public readonly pricingMethod?: number;
  public readonly quantity?: number;
  public readonly price?: number;
  public readonly finalPrice?: number;

  public readonly duration?: number;
  public readonly durationType?: string | number | null;

  public readonly projectFloorId?: number;
  public readonly projectFloorNumber?: number;

  public readonly hasAttached: boolean;
  public readonly attachments: TaskAssignmentAttachment[];

  public readonly availableStatuses: TaskAssignmentTaskStatusOption[];
  public readonly availableActions: TaskAssignmentTaskAvailableAction[];
  public readonly statusUpdateAction?: string;

  constructor(data: {
    raw: Record<string, unknown>;
    id?: number;
    projectDepartmentItemId?: number;
    uuid: string;
    title: string;
    projectName: string;
    departmentName: string;
    departmentItemName: string;
    projectId?: number;
    departmentId?: number;
    itemId?: number;
    assignedBy?: TaskAssignmentTaskEmployee;
    taskEmployee?: TaskAssignmentTaskEmployee;
    assignedEmployees: TaskAssignmentTaskEmployee[];
    notes: string;
    status?: string | number | null;
    statusLabel: string;
    insideStatus?: string | number | null;
    createdAt: string;
    dueDate: string;
    pricingMethod?: number;
    quantity?: number;
    price?: number;
    finalPrice?: number;
    duration?: number;
    durationType?: string | number | null;
    projectFloorId?: number;
    projectFloorNumber?: number;
    hasAttached: boolean;
    attachments: TaskAssignmentAttachment[];
    availableStatuses: TaskAssignmentTaskStatusOption[];
    availableActions: TaskAssignmentTaskAvailableAction[];
    statusUpdateAction?: string;
  }) {
    this.raw = data.raw;

    this.id = data.id;
    this.projectDepartmentItemId =
      data.projectDepartmentItemId;
    this.uuid = data.uuid;

    this.title = data.title;
    this.projectName = data.projectName;
    this.departmentName = data.departmentName;
    this.departmentItemName =
      data.departmentItemName;

    this.projectId = data.projectId;
    this.departmentId = data.departmentId;
    this.itemId = data.itemId;

    this.assignedBy = data.assignedBy;
    this.taskEmployee = data.taskEmployee;
    this.assignedEmployees =
      data.assignedEmployees;

    this.notes = data.notes;

    this.status = data.status;
    this.statusLabel = data.statusLabel;
    this.insideStatus = data.insideStatus;

    this.createdAt = data.createdAt;
    this.dueDate = data.dueDate;

    this.pricingMethod = data.pricingMethod;
    this.quantity = data.quantity;
    this.price = data.price;
    this.finalPrice = data.finalPrice;

    this.duration = data.duration;
    this.durationType = data.durationType;

    this.projectFloorId = data.projectFloorId;
    this.projectFloorNumber =
      data.projectFloorNumber;

    this.hasAttached = data.hasAttached;
    this.attachments = data.attachments;

    this.availableStatuses =
      data.availableStatuses;
    this.availableActions =
      data.availableActions;
    this.statusUpdateAction =
      data.statusUpdateAction;

    Object.freeze(this);
  }

  static fromJson(
    json: Record<string, unknown>,
  ): TaskAssignmentEmployeeTaskModel {
    if (!json) {
      throw new Error(
        'Cannot create TaskAssignmentEmployeeTaskModel from null or undefined',
      );
    }

    const projectDepartmentItem = toRecord(
      json.project_department_item ??
        json.department_item,
    );

    const project = toRecord(
      projectDepartmentItem?.project ??
        json.project,
    );

    const department = toRecord(
      projectDepartmentItem?.department ??
        json.department,
    );

    const item = toRecord(
      projectDepartmentItem?.item ??
        json.item,
    );

    const projectFloor = toRecord(
      projectDepartmentItem?.project_floor ??
        json.project_floor,
    );

    const assignedBy = mapPerson(
      json.assigned_by,
    );

    const taskEmployee = mapPerson(
      json.task_employee ??
        json.employee ??
        json.assigned_employee,
    );

    const rawStatus =
      json.status ??
      json.task_status ??
      null;

    const insideStatus =
      projectDepartmentItem?.inside_status ??
      json.inside_status ??
      null;

    const availableActions = mapAvailableActions(
      json.available_actions ??
        json.actions,
    );

    const assignedEmployees =
      mapEmployees(json);

    const itemName = getNamedValue(item);

    return new TaskAssignmentEmployeeTaskModel({
      raw: json,

      id: toNumber(
        json.id ??
          json.task_id,
      ),

      projectDepartmentItemId: toNumber(
        projectDepartmentItem?.id,
      ),

      uuid:
        firstString(projectDepartmentItem, [
          'uuid',
        ]) ||
        firstString(json, [
          'uuid',
          'project_department_item_uuid',
        ]),

      title:
        firstString(json, [
          'task_name',
          'task_title',
          'title',
          'name',
        ]) ||
        itemName ||
        getNamedValue(projectDepartmentItem),

      projectName:
        getNamedValue(project) ||
        firstString(json, [
          'project_name',
          'project_title',
        ]),

      departmentName:
        getNamedValue(department) ||
        firstString(json, [
          'department_name',
          'department_title',
        ]),

      departmentItemName: itemName,

      projectId: toNumber(project?.id),
      departmentId: toNumber(
        department?.id,
      ),
      itemId: toNumber(item?.id),

      assignedBy,
      taskEmployee,

      assignedEmployees:
        assignedEmployees.length > 0
          ? assignedEmployees
          : taskEmployee
            ? [taskEmployee]
            : [],

      notes: firstString(json, [
        'notes',
        'assignment_notes',
        'description',
      ]),

      status:
        rawStatus as string | number | null,

      statusLabel:
        firstString(json, [
          'status_label',
          'status_name',
        ]) ||
        getNamedValue(rawStatus),

      insideStatus:
        insideStatus as
          | string
          | number
          | null,

      createdAt: firstString(json, [
        'created_at',
        'createdAt',
      ]),

      dueDate: firstString(json, [
        'due_date',
        'dueDate',
        'deadline',
      ]),

      pricingMethod: toNumber(
        projectDepartmentItem?.pricing_method ??
          json.pricing_method,
      ),

      quantity: toNumber(
        projectDepartmentItem?.quantity ??
          json.quantity,
      ),

      price: toNumber(
        projectDepartmentItem?.price ??
          json.price,
      ),

      finalPrice: toNumber(
        projectDepartmentItem?.final_price ??
          json.final_price,
      ),

      duration: toNumber(
        projectDepartmentItem?.duration ??
          json.duration,
      ),

      durationType: (
        projectDepartmentItem?.duration_type ??
        json.duration_type ??
        null
      ) as string | number | null,

      projectFloorId: toNumber(
        projectFloor?.id,
      ),

      projectFloorNumber: toNumber(
        projectFloor?.floor_number,
      ),

      hasAttached: toBoolean(
        projectDepartmentItem?.has_attached ??
          json.has_attached,
      ),

      attachments: mapAttachments(
        projectDepartmentItem?.attachments ??
          json.attachments,
      ),

      availableStatuses: mapStatusOptions(
        json.available_statuses ??
          json.statuses ??
          json.status_options,
      ),

      availableActions,

      statusUpdateAction:
        firstString(json, [
          'status_update_action',
          'update_status_action',
          'change_status_action',
          'status_action',
        ]) ||
        availableActions.find(
          (action) =>
            action.status !== undefined,
        )?.action,
    });
  }

  static example =
    new TaskAssignmentEmployeeTaskModel({
      raw: {
        id: 5,
        project_department_item: {
          id: 44,
          uuid:
            '46e10f7b-8dda-4df5-b036-143e2f51e98e',
        },
      },

      id: 5,
      projectDepartmentItemId: 44,
      uuid:
        '46e10f7b-8dda-4df5-b036-143e2f51e98e',

      title: 'حمحم',
      projectName: 'uhgyu',
      departmentName: 'asdasd',
      departmentItemName: 'حمحم',

      projectId: 70,
      departmentId: 30,
      itemId: 12,

      assignedBy: {
        id: 1,
        name: 'Techlab Employee',
      },

      taskEmployee: {
        id: 1,
        name: 'Techlab Employee',
      },

      assignedEmployees: [
        {
          id: 1,
          name: 'Techlab Employee',
        },
      ],

      notes: '',

      status: null,
      statusLabel: '',
      insideStatus: 1,

      createdAt: '2026-07-26 12:55:21',
      dueDate: '',

      pricingMethod: 3,
      quantity: 1,
      price: 20,
      finalPrice: 20,

      duration: undefined,
      durationType: null,

      projectFloorId: 64,
      projectFloorNumber: 2,

      hasAttached: true,

      attachments: [
        {
          id: 2,
          file: 'https://api.buildhub.techlabeg.com/attachments/task_assignments/example.png',
          fileSize: '15.36 KB',
          alt: 'FFFFF',
          type: 1,
          link: null,
          status: 1,
          statusName: 'ASSIGN',
          createdAt:
            '2026-07-26 12:55:21',
        },
      ],

      availableStatuses: [],
      availableActions: [],
    });
}