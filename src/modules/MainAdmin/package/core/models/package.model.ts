export interface PackageModelData {
  id?: number;
  duration: number;
  hasmobild: boolean;
  hasportal: boolean;
  projectnumbers: number;
  employeenumbers: number;
  price: string;
}

const isRecord = (rawValue: unknown): rawValue is Record<string, unknown> => {
  return rawValue !== null && typeof rawValue === 'object';
};

const parseNumber = (rawValue: unknown, fieldName: string): number => {
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Invalid package ${fieldName}`);
  }

  return parsedValue;
};

const parseBoolean = (rawValue: unknown, fieldName: string): boolean => {
  if (rawValue === true || rawValue === 1 || rawValue === '1' || rawValue === 'true') return true;
  if (rawValue === false || rawValue === 0 || rawValue === '0' || rawValue === 'false')
    return false;

  throw new Error(`Invalid package ${fieldName}`);
};

const parsePrice = (rawPrice: unknown): string => {
  if (typeof rawPrice !== 'string' && typeof rawPrice !== 'number') {
    throw new Error('Invalid package price');
  }

  return String(rawPrice);
};

export default class PackageModel {
  public readonly id?: number;
  public readonly duration: number;
  public readonly hasmobild: boolean;
  public readonly hasportal: boolean;
  public readonly projectnumbers: number;
  public readonly employeenumbers: number;
  public readonly price: string;

  constructor(packageData: PackageModelData) {
    this.id = packageData.id;
    this.duration = packageData.duration;
    this.hasmobild = packageData.hasmobild;
    this.hasportal = packageData.hasportal;
    this.projectnumbers = packageData.projectnumbers;
    this.employeenumbers = packageData.employeenumbers;
    this.price = packageData.price;

    Object.freeze(this);
  }

  static fromJson(rawPackage: unknown): PackageModel {
    if (!isRecord(rawPackage)) {
      throw new Error('Cannot create PackageModel from invalid data');
    }

    const rawId = rawPackage.id ?? rawPackage.package_id;

    return new PackageModel({
      id: rawId === undefined ? undefined : parseNumber(rawId, 'id'),
      duration: parseNumber(rawPackage.duration, 'duration'),
      hasmobild: parseBoolean(rawPackage.hasmobild, 'hasmobild'),
      hasportal: parseBoolean(rawPackage.hasportal, 'hasportal'),
      projectnumbers: parseNumber(rawPackage.projectnumbers, 'projectnumbers'),
      employeenumbers: parseNumber(rawPackage.employeenumbers, 'employeenumbers'),
      price: parsePrice(rawPackage.price),
    });
  }

  static readonly example = new PackageModel({
    id: 1,
    duration: 12,
    hasmobild: true,
    hasportal: true,
    projectnumbers: 10,
    employeenumbers: 25,
    price: '999.00',
  });
}
