import TitleInterface from '@/base/Data/Models/titleInterface';
import EmployeeModel from '@/modules/MainOrganization/employee/core/models/employee.model';
import OrganizationShowModel from '@/modules/shared/Organization/core/models/organization.show.model';

export default class ExecutionQuoteClientModel {
  public readonly id?: number;
  public readonly organization?: OrganizationShowModel;
  public readonly employee?: EmployeeModel;
  public readonly name?: string;
  public readonly phone?: string;
  public readonly email?: string;
  public readonly address?: string;
  public readonly type?: number;
  public readonly clientSource?: TitleInterface<number> | null;
  public readonly status?: number;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    organization?: OrganizationShowModel;
    employee?: EmployeeModel;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    type?: number;
    clientSource?: TitleInterface<number> | null;
    status?: number;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.organization = data.organization;
    this.employee = data.employee;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.address = data.address;
    this.type = data.type;
    this.clientSource = data.clientSource;
    this.status = data.status;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteClientModel {
    const organization = json.organization as Record<string, unknown> | undefined;
    const employee = json.employee as Record<string, unknown> | undefined;
    const clientSource = json.client_source as Record<string, unknown> | null | undefined;

    return new ExecutionQuoteClientModel({
      id: json.id as number | undefined,
      organization: organization ? OrganizationShowModel.fromJson(organization) : undefined,
      employee: employee ? EmployeeModel.fromJson(employee) : undefined,
      name: json.name as string | undefined,
      phone: json.phone as string | undefined,
      email: json.email as string | undefined,
      address: json.address as string | undefined,
      type: json.type == null ? undefined : Number(json.type),
      clientSource: clientSource
        ? new TitleInterface<number>({
            id: Number(clientSource.id),
            title: clientSource.title as string | undefined,
          })
        : clientSource,
      status: json.status == null ? undefined : Number(json.status),
      createdAt: json.created_at as string | undefined,
    });
  }
}
