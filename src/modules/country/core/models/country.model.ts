import TitleModel from '@/base/Core/Models/titleModel';

/**
 * Country model representing a nation's geographical and cultural data
 */
export default class CountryModel extends TitleModel {
  public readonly code: string;
  public readonly flag: string;

  constructor(data: { id: number; title: string; code: string; flag: string }) {
    super(data.title, data.id);
    this.code = data.code;
    this.flag = data.flag;
    Object.freeze(this);
  }

  static fromJson(json: any): CountryModel {
    if (!json) {
      throw new Error('Cannot create CountryModel from null or undefined');
    }

    return new CountryModel({
      id: json.id,
      title: json.title,
      code: json.code,
      flag: json.flag,
    });
  }

  static example: CountryModel = new CountryModel({
    id: 1,
    title: 'Egypt',
    code: 'EG',
    flag: '/src/assets/images/egypt.png',
  });
}
