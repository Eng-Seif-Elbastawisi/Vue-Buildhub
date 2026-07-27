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

const emptyValue = '';

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toNumber = (value: unknown): number | undefined => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getPlainTitle = (value: unknown): string => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    const localizedTitle =
      value.find((item) => toRecord(item)?.locale === 'en') ??
      value.find((item) => toRecord(item)?.locale === 'ar') ??
      value[0];
    const titleRecord = toRecord(localizedTitle);

    return String(titleRecord?.title ?? titleRecord?.name ?? emptyValue);
  }

  const record = toRecord(value);

  if (!record) return emptyValue;

  return String(record.name ?? getPlainTitle(record.title) ?? record.label ?? emptyValue);
};

const getNamedValue = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);

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

const firstString = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }

  return emptyValue;
};

const mapEmployees = (source: Record<string, unknown>): TaskAssignmentTaskEmployee[] => {
  const employeeCollections = [
    source.employees,
    source.assigned_employees,
    source.employee_ids,
  ].filter(Array.isArray) as unknown[][];
  const rows = employeeCollections.flat();

  const singleEmployee = source.employee ?? source.assigned_employee;
  if (singleEmployee) rows.push(singleEmployee);

  return rows
    .map((item): TaskAssignmentTaskEmployee | null => {
      if (typeof item === 'number' || typeof item === 'string') {
        const id = toNumber(item);

        return id ? { id, name: `#${id}` } : null;
      }

      const employee = toRecord(item);
      if (!employee) return null;

      const id = toNumber(employee.id ?? employee.employee_id);

      return {
        id,
        name: getNamedValue(employee) || (id ? `#${id}` : emptyValue),
      };
    })
    .filter(
      (employee): employee is TaskAssignmentTaskEmployee =>
        employee !== null && employee.name.trim().length > 0,
    );
};

const mapStatusOptions = (value: unknown): TaskAssignmentTaskStatusOption[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): TaskAssignmentTaskStatusOption | null => {
      const record = toRecord(item);

      if (!record) {
        if (typeof item === 'string' || typeof item === 'number') {
          return { id: item, title: String(item) };
        }

        return null;
      }

      const id = record.id ?? record.status ?? record.value ?? record.key;
      const title = getNamedValue(record) || String(id ?? emptyValue);

      if (id === undefined || id === null || !title) return null;

      return { id: id as string | number, title };
    })
    .filter((option): option is TaskAssignmentTaskStatusOption => option !== null);
};

const mapAvailableActions = (value: unknown): TaskAssignmentTaskAvailableAction[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): TaskAssignmentTaskAvailableAction | null => {
      const record = toRecord(item);
      if (!record) return null;

      return {
        action:
          typeof record.action === 'string'
            ? record.action
            : typeof record.endpoint === 'string'
              ? record.endpoint
              : undefined,
        label: getNamedValue(record.label ?? record.title ?? record.name),
        status: (record.status ?? record.value) as string | number | undefined,
        payload: toRecord(record.payload) ?? undefined,
        destructive: Boolean(record.destructive),
      };
    })
    .filter((action): action is TaskAssignmentTaskAvailableAction => action !== null);
};

export default class TaskAssignmentEmployeeTaskModel {
  public readonly raw: Record<string, unknown>;
  public readonly id?: number;
  public readonly title: string;
  public readonly projectName: string;
  public readonly departmentItemName: string;
  public readonly assignedEmployees: TaskAssignmentTaskEmployee[];
  public readonly notes: string;
  public readonly status?: string | number | null;
  public readonly statusLabel: string;
  public readonly createdAt: string;
  public readonly dueDate: string;
  public readonly availableStatuses: TaskAssignmentTaskStatusOption[];
  public readonly availableActions: TaskAssignmentTaskAvailableAction[];
  public readonly statusUpdateAction?: string;

  constructor(data: {
    raw: Record<string, unknown>;
    id?: number;
    title: string;
    projectName: string;
    departmentItemName: string;
    assignedEmployees: TaskAssignmentTaskEmployee[];
    notes: string;
    status?: string | number | null;
    statusLabel: string;
    createdAt: string;
    dueDate: string;
    availableStatuses: TaskAssignmentTaskStatusOption[];
    availableActions: TaskAssignmentTaskAvailableAction[];
    statusUpdateAction?: string;
  }) {
    this.raw = data.raw;
    this.id = data.id;
    this.title = data.title;
    this.projectName = data.projectName;
    this.departmentItemName = data.departmentItemName;
    this.assignedEmployees = data.assignedEmployees;
    this.notes = data.notes;
    this.status = data.status;
    this.statusLabel = data.statusLabel;
    this.createdAt = data.createdAt;
    this.dueDate = data.dueDate;
    this.availableStatuses = data.availableStatuses;
    this.availableActions = data.availableActions;
    this.statusUpdateAction = data.statusUpdateAction;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): TaskAssignmentEmployeeTaskModel {
    if (!json) {
      throw new Error('Cannot create TaskAssignmentEmployeeTaskModel from null or undefined');
    }

    const projectDepartmentItem = toRecord(
      json.project_department_item ?? json.department_item ?? json.item,
    );
    const project = toRecord(json.project);
    const rawStatus = json.status ?? json.task_status ?? null;
    const statusLabel =
      firstString(json, ['status_label', 'status_name']) || getNamedValue(rawStatus) || emptyValue;
    const availableActions = mapAvailableActions(json.available_actions ?? json.actions);

    return new TaskAssignmentEmployeeTaskModel({
      raw: json,
      id: toNumber(json.id ?? json.task_id),
      title:
        firstString(json, ['task_name', 'task_title', 'title', 'name']) ||
        getNamedValue(projectDepartmentItem) ||
        (json.id ? `#${json.id}` : emptyValue),
      projectName:
        firstString(json, ['project_name', 'project_title']) ||
        getNamedValue(project) ||
        emptyValue,
      departmentItemName: getNamedValue(projectDepartmentItem),
      assignedEmployees: mapEmployees(json),
      notes: firstString(json, ['notes', 'assignment_notes', 'description']),
      status: rawStatus as string | number | null,
      statusLabel,
      createdAt: firstString(json, ['created_at', 'createdAt']),
      dueDate: firstString(json, ['due_date', 'dueDate', 'deadline']),
      availableStatuses: mapStatusOptions(
        json.available_statuses ?? json.statuses ?? json.status_options,
      ),
      availableActions,
      statusUpdateAction:
        firstString(json, [
          'status_update_action',
          'update_status_action',
          'change_status_action',
          'status_action',
        ]) || availableActions.find((action) => action.status !== undefined)?.action,
    });
  }

  static example = new TaskAssignmentEmployeeTaskModel({
    raw: {
      id: 1,
      task_name: 'Design review',
      status: 'pending',
    },
    id: 1,
    title: 'Design review',
    projectName: 'Commercial project',
    departmentItemName: 'Layout plan',
    assignedEmployees: [{ id: 16, name: 'Mohamed Saad' }],
    notes: 'Review before delivery',
    status: 'pending',
    statusLabel: 'Pending',
    createdAt: '2026-07-26',
    dueDate: '',
    availableStatuses: [],
    availableActions: [],
  });
}
