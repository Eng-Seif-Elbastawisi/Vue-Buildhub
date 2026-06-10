import { EmailType } from '../constants/emailType.enum';
import { isValidEmail } from '../utils/email.validation';

/**
 * Email model representing employee email data
 *
 * This model handles email information for employees including
 * validation, type categorization, and API serialization.
 */
export default class UserModel {
  public readonly id?: number;
  public readonly name: string;
  public readonly email: string;
  public readonly type: EmailType;
  public readonly employeeId?: number;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;
  public readonly apiToken?: string;
  public readonly refreshToken?: string;
  public readonly image?: string;
  public readonly languages?: any[];
  public readonly isMaster?: boolean;

  constructor(data: {
    id?: number;
    email: string;
    name: string;
    type?: EmailType;
    employeeId?: number;
    createdAt?: string;
    updatedAt?: string;
    apiToken?: string;
    refreshToken?: string;
    image?: string;
    languages?: any[];
    isMaster?: boolean;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.type = data.type || EmailType.EMPLOYEE;
    this.employeeId = data.employeeId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.apiToken = data.apiToken;
    this.refreshToken = data.refreshToken;
    this.image = data.image;
    this.languages = data.languages;
    this.isMaster = data.isMaster;
  }

  /**
   * Create EmailModel from API response
   * @param json - Raw JSON data from API
   * @returns EmailModel instance
   * @throws Error if email is invalid
   */
  static fromJson(json: any): UserModel {
    if (!json) {
      throw new Error('Cannot create EmailModel from null or undefined');
    }

    return new UserModel({
      id: json.id,
      email: json.email,
      type: json.type || EmailType.EMPLOYEE,
      name: json.name,
      employeeId: json.employee_id,
      createdAt: json.created_at,
      updatedAt: json.updated_at,
      apiToken: json.token,
      refreshToken: json.refresh_token,
      image: json.image,
      languages: json.languages,
      isMaster: json.is_master,
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
    };
  }

  static get example(): UserModel {
    return new UserModel({
      id: 3,
      name: 'Omar Mostafa',
      email: '[EMAIL_ADDRESS]',
      type: EmailType.EMPLOYEE,
      employeeId: 3,
      apiToken:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vZmFrZS1kZXYuZWR1aHViLmFwcy9hcGkvYXV0aGVudGljYXRlIiwiaWF0IjoxNzUxMzM5MTYyLCJleHAiOjE3NTE0MjU1NjIsIm5iZiI6MTc1MTMzOTE2MiwianRpIjoiWkM1RmNTS1BWMVpuWUtQZSIsInN1YiI6IjMiLCJwcnYiOiIyM2JlNWM4ZmQ5MjI5NTY2MzA4NmY5NWE1Y2Y2Yjg0OTI3ZGU2ZDMwIiwidHlwZSI6M30.g2Yj4pWlD67e6JmY7l6fQ2k6n8y6JmY7l6fQ2k6n8y6',
      refreshToken: '',
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

  /**
   * Check if this is a work email
   * @returns true if email type is WORK
   */
  isWorkEmail(): boolean {
    return this.type === EmailType.WORK;
  }

  /**
   * Check if this is a personal email
   * @returns true if email type is PERSONAL
   */
  isPersonalEmail(): boolean {
    return this.type === EmailType.PERSONAL;
  }

  /**
   * Get a display-friendly string representation
   * @returns Formatted string
   */
  toString(): string {
    return `${this.email} (${this.type})`;
  }
}
