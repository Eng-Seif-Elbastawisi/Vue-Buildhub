// import { ArticleGeneratedByEnum } from '../constant/Article.generatedby.enum';
// import ArticleSubjectModel from './Subject.model';

export default class PackageModel {
  public readonly id?: number;
  public readonly packageName: string;
  public readonly educationType: string;
  public readonly type: string;
  public readonly contant: number;
  public readonly price: number;
  public readonly status: string;
  public readonly createdBy: string;

  constructor(data: {
    id?: number;
    packageName?: string;
    educationType?: string;
    type?: string;
    contant?: number;
    price?: number;
    status?: string;
    createdBy?: string;
  }) {
    this.id = data.id;
    this.packageName = data.packageName || '';
    this.educationType = data.educationType || '';
    this.type = data.type || '';
    this.contant = data.contant || 0;
    this.price = data.price || 0;
    this.status = data.status || '';
    this.createdBy = data.createdBy || '';

    Object.freeze(this);
  }

  static fromJson(json: any): PackageModel {
    if (!json) throw new Error('Cannot create PackageModel from null or undefined');

    return new PackageModel({
      id: json.id,
      packageName: json.package_name,
      educationType: json.education_type,
      type: json.type,
      contant: json.contant,
      price: json.price,
      status: json.status,
      createdBy: json.created_by,
    });
  }

  static example: PackageModel = new PackageModel({
    id: 1,
    packageName: 'What is the capital of Egypt?',
    educationType: 'secondary',
    type: 'free',
    contant: 10,
    price: 0,
    status: 'active',
    createdBy: 'John Doe',
  });
}
