import type TitleInterface from '@/base/Data/Models/titleInterface';

export default class SuppliersModel {
  public readonly id?: number;
  public readonly name: string;
  public readonly Specialization: string;
  public readonly phone: string;
  public readonly materials: string;
  constructor(data: {
    id?: number;
    name: string;
    Specialization: string;
    phone: string;
    materials: string;
  }) {
    this.id = data.id;
    this.name = data.name;
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
      name: json.name,
      Specialization: json.Specialization,
      phone: json.phone,
      materials: json.materials,
    });
  }

  static example: SuppliersModel = new SuppliersModel({
    id: 10,
    name: 'Geberit',
    Specialization: ' سباكة ',
    phone: '01112',
    materials: 'القطاع المدنى-القطاع الصحى-القطاع الصناعى',
  });
}
