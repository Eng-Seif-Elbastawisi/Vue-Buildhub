import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { isValidEmail } from '@/modules/MainAdmin/auth_admin/core/utils/email.validation';
import type { SystemIdentitySetting } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';

/**
 * Authenticated user data mapped from the admin login response.
 */
export default class UserModel {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly type?: UserType;
  public readonly employeeId?: number;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;
  public readonly apiToken?: string;
  public readonly refreshToken?: string;
  public readonly image?: string;
  public readonly languages?: any[];
  public readonly isMaster?: boolean;
  public readonly setting?: SystemIdentitySetting | null;

  constructor(data: {
    id?: number;
    email: string;
    name: string;
    type?: UserType;
    employeeId?: number;
    createdAt?: string;
    updatedAt?: string;
    apiToken?: string;
    refreshToken?: string;
    image?: string;
    languages?: any[];
    isMaster?: boolean;
    setting?: SystemIdentitySetting | null;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.type = data.type;
    this.employeeId = data.employeeId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.apiToken = data.apiToken;
    this.refreshToken = data.refreshToken;
    this.image = data.image;
    this.languages = data.languages;
    this.isMaster = data.isMaster;
    this.setting = data.setting;
  }

  /**
   * Create UserModel from an API response.
   * @param json - Raw JSON data from API
   * @returns UserModel instance
   * @throws Error if email is invalid
   */
  static fromJson(json: any): UserModel {
    if (!json) {
      throw new Error('Cannot create EmailModel from null or undefined');
    }

    return new UserModel({
      id: json.id,
      email: json.email,
      type: json.type,
      name: json.name,
      employeeId: json.employee_id,
      createdAt: json.created_at,
      updatedAt: json.updated_at,
      apiToken: json.token ?? json.api_token,
      refreshToken: json.refresh_token,
      image: json.image,
      languages: json.languages,
      isMaster: json.is_master,
      setting: json.setting,
    });
  }

  /**
   * Convert to JSON for API requests
   * @returns Plain object with snake_case keys for API
   */
  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      type: this.type,
      employee_id: this.employeeId,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      api_token: this.apiToken,
      refresh_token: this.refreshToken,
      image: this.image,
      setting: this.setting,
    };
  }

  static get example(): UserModel {
    return new UserModel({
      id: 3,
      name: 'Omar Mostafa',
      email: '[EMAIL_ADDRESS]',
      type: UserType.ADMIN,
      employeeId: 3,
      image: 'https://cyber.comolho.com/static/img/avatar.png',
    });
  }

  /**
   * Check if this email is valid
   * @returns true if email passes validation
   */
  isValidEmail(): boolean {
    return isValidEmail(this.email);
  }

  /**
   * Check if the email belongs to a specific employee
   * @param employeeId - Employee ID to check
   * @returns true if email belongs to employee
   */
  belongsToEmployee(employeeId: number): boolean {
    return this.employeeId === employeeId;
  }

  isAdmin(): boolean {
    return this.type === UserType.ADMIN;
  }

  isOrganizationUser(): boolean {
    return this.type === UserType.ORGANIZATION;
  }

  /**
   * Get a display-friendly string representation
   * @returns Formatted string
   */
  toString(): string {
    return `${this.email} (${this.type})`;
  }
}
