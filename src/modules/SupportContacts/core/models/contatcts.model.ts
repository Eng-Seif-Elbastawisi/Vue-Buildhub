/**
 * Employee model representing an employee entity
 */
export default class ContactsModel {
  public readonly id?: number;
  public readonly key?: string;
  public readonly type: string;
  public readonly value: string;

  constructor(data: { id?: number; key?: string; type: string; value: string }) {
    this.id = data.id;
    this.key = data.key;
    this.type = data.type;
    this.value = data.value;

    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: any): ContactsModel {
    if (!json) {
      throw new Error('Cannot create EmployeeModel from null or undefined');
    }

    return new ContactsModel({
      id: json.id,
      key: json.key,
      type: json.type,
      value: json.value,
    });
  }

  static example: ContactsModel = new ContactsModel({
    id: 1,
    type: '',
    value: '',
  });

  static example2: ContactsModel = new ContactsModel({
    id: 1,
    type: '',
    value: '',
  });
}
