import type TitleInterface from '@/base/Data/Models/titleInterface';

export default class SuppliersModel {
  public readonly id?: number;
  public readonly Suppliers: string;
  public readonly Specialization: string;
  public readonly phone: string;
  public readonly materials: string;
  constructor(data: {
    id?: number;
    Suppliers: string;
    Specialization: string;
    phone: string;
    materials: string;
  }) {
    this.id = data.id;
    this.Suppliers = data.Suppliers;
    this.Specialization = data.Specialization;
    this.phone = data.phone;
    this.materials = data.materials;

    Object.freeze(this);
  }

  static fromJson(json: any): SuppliersModel {
    if (!json) {
      throw new Error('Cannot create SuppliersModel from null or undefined');
    }

    return new SuppliersModel({
      id: json.id,
      Suppliers: json.Suppliers,
      Specialization: json.Specialization,
      phone: json.phone,
      materials: json.materials,
    });
  }

  static example: SuppliersModel = new SuppliersModel({
    id: 10,
    Suppliers: 'Geberit',
    Specialization: ' سباكة ',
    phone: '01112',
    materials: 'القطاع المدنى-القطاع الصحى-القطاع الصناعى',
  });
}
