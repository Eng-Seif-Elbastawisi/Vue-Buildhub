import SystemIdentityModel, { type SystemIdentityData } from './system.identity.model';

export default class SystemIdentityShowModel extends SystemIdentityModel {
  constructor(data: SystemIdentityData) {
    super(data);
  }

  static fromJson(json: unknown): SystemIdentityShowModel {
    const model = SystemIdentityModel.fromJson(json);

    return new SystemIdentityShowModel({
      id: model.id,
      name: model.name,
      logo: model.logo,
      primaryColor: model.primaryColor,
      secondaryColor: model.secondaryColor,
      accentColor: model.accentColor,
      extractedColors: model.extractedColors,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static example: SystemIdentityShowModel = new SystemIdentityShowModel({
    id: 1,
    name: 'BuildHub Copper',
    logo: '',
    primaryColor: '#B87333',
    secondaryColor: '#101418',
    accentColor: '#C47A35',
    extractedColors: ['#B87333', '#101418', '#C47A35'],
    isActive: true,
  });
}
