export default class PackageDetailsModel {
  public readonly id: number;
  public readonly createdBy: string;
  public readonly packageName: string;
  public readonly educationType: string;
  public readonly type: string;
  public readonly contant: number;
  public readonly price: number;
  public readonly status: string;

  constructor(data: {
    id: number;
    createdBy: string;
    packageName: string;
    educationType: string;
    type: string;
    contant: number;
    price: number;
    status: string;
  }) {
    this.id = data.id;
    this.createdBy = data.createdBy;
    this.packageName = data.packageName;
    this.educationType = data.educationType;
    this.type = data.type;
    this.contant = data.contant;
    this.price = data.price;
    this.status = data.status;
  }

  static fromJson(json: any): PackageDetailsModel {
    if (!json) {
      throw new Error('Cannot create PackageDetailsModel from null or undefined');
    }
    return new PackageDetailsModel({
      id: json.id ?? json.id ?? 0,
      createdBy: json.createdBy ?? json.createdBy ?? '',
      packageName: json.packageName ?? json.packageName ?? '',
      educationType: json.educationType ?? json.educationType ?? '',
      type: json.type ?? json.type ?? '',
      contant: json.contant ?? json.contant ?? 0,
      price: json.price ?? json.price ?? 0,
      status: json.status ?? json.status ?? '',
    });
  }

  static example = new PackageDetailsModel({
    id: 1,
    createdBy: 'John Doe',
    packageName: 'Package 1',
    educationType: 'secondary',
    type: 'free',
    contant: 10,
    price: 0,
    status: 'active',
  });
}
