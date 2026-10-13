import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import { positiveId } from '../constants/work-items.constants';
export function responseObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error('work_items.invalid_response');
  return payload as Record<string, unknown>;
}
export function responseId(id: unknown): number {
  if (!positiveId(id)) throw new Error('work_items.invalid_response');
  return id as number;
}
export function responseText(text: unknown): string {
  if (typeof text !== 'string') throw new Error('work_items.invalid_response');
  return text;
}
export function nullableText(text: unknown): string | null {
  return text === null || text === undefined ? null : responseText(text);
}
export function employeeReference(payload: unknown): EmployeeModel {
  const employee = responseObject(payload);
  responseId(employee.id);
  responseText(employee.name);
  if (typeof employee.type !== 'number') throw new Error('work_items.invalid_response');
  return EmployeeModel.fromJson(employee);
}
export function optionalEmployee(payload: unknown): EmployeeModel | null {
  return payload === null || payload === undefined ? null : employeeReference(payload);
}
