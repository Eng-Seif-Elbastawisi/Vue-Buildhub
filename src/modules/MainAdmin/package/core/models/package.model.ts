import { FeaturesKEY } from '../constants/features.enum';
import PackageFeatureModel from '../models/package.features.model';

export default class PackageModel {
  public readonly id?: number;
  public readonly duration: number;
  public readonly hasmobild: boolean;
  public readonly hasportal: boolean;
  public readonly projectnumbers: number;
  public readonly employeenumbers: number;
  public readonly title: string;
  public readonly price: string;
  public readonly features: PackageFeatureModel[];

  constructor(data: {
    id?: number;
    duration: number;
    hasmobild: boolean;
    hasportal: boolean;
    projectnumbers: number;
    employeenumbers: number;
    title: string;
    price: string;
    features: PackageFeatureModel[];
  }) {
    this.id = data.id;
    this.duration = data.duration;
    this.hasmobild = data.hasmobild;
    this.hasportal = data.hasportal;
    this.projectnumbers = data.projectnumbers;
    this.employeenumbers = data.employeenumbers;
    this.title = data.title;
    this.price = data.price;
    this.features = data.features;

    Object.freeze(this.features);
    Object.freeze(this);
  }

  static fromJson(data: Record<string, unknown>): PackageModel {
    return new PackageModel({
      id: data.id as number,
      duration: data.duration as number,
      hasmobild: data.hasmobild as boolean,
      hasportal: data.hasportal as boolean,
      projectnumbers: data.projectnumbers as number,
      employeenumbers: data.employeenumbers as number,
      title: data.title as string,
      price: data.price as string,

      features: Array.isArray(data.features)
        ? data.features.map((feature) => PackageFeatureModel.fromJson(feature))
        : [],
    });
  }

  static readonly example = new PackageModel({
    id: 1,
    duration: 1,
    hasmobild: true,
    hasportal: true,
    projectnumbers: 1,
    employeenumbers: 1,
    title: 'title',
    price: '1',

    features: [
      new PackageFeatureModel({
        id: 1,
        key: FeaturesKEY.NUMBER_OF_EMPLOYEES,
        keyName: 'NUMBER_OF_EMPLOYEES',
        value: 1,
      }),

      new PackageFeatureModel({
        id: 2,
        key: FeaturesKEY.HAS_MOBILE,
        keyName: 'HAS_MOBILE',
        value: true,
      }),

      new PackageFeatureModel({
        id: 3,
        key: FeaturesKEY.HAS_PORTAL,
        keyName: 'HAS_PORTAL',
        value: true,
      }),

      new PackageFeatureModel({
        id: 4,
        key: FeaturesKEY.NUMBER_OF_PROJECTS,
        keyName: 'NUMBER_OF_PROJECTS',
        value: 1,
      }),
    ],
  });
}
