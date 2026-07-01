export interface SystemIdentityData {
  id?: number;
  name?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  extractedColors: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const toColorList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((color): color is string => typeof color === 'string');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((color): color is string => typeof color === 'string')
        : [];
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
};

export default class SystemIdentityModel {
  public readonly id?: number;
  public readonly name?: string;
  public readonly logo?: string;
  public readonly primaryColor: string;
  public readonly secondaryColor: string;
  public readonly accentColor: string;
  public readonly extractedColors: string[];
  public readonly isActive: boolean;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(data: SystemIdentityData) {
    this.id = data.id;
    this.name = data.name;
    this.logo = data.logo;
    this.primaryColor = data.primaryColor;
    this.secondaryColor = data.secondaryColor;
    this.accentColor = data.accentColor;
    this.extractedColors = data.extractedColors;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    Object.freeze(this);
  }

  static fromJson(json: unknown): SystemIdentityModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create SystemIdentityModel from null or undefined');
    }

    const source = json as Record<string, unknown>;

    return new SystemIdentityModel({
      id: typeof source.id === 'number' ? source.id : undefined,
      name: typeof source.name === 'string' ? source.name : undefined,
      logo: typeof source.logo === 'string' ? source.logo : undefined,
      primaryColor:
        typeof source.primary_color === 'string'
          ? source.primary_color
          : SystemIdentityModel.example.primaryColor,
      secondaryColor:
        typeof source.secondary_color === 'string'
          ? source.secondary_color
          : SystemIdentityModel.example.secondaryColor,
      accentColor:
        typeof source.accent_color === 'string'
          ? source.accent_color
          : SystemIdentityModel.example.accentColor,
      extractedColors: toColorList(source.extracted_colors),
      isActive: Boolean(source.is_active),
      createdAt: typeof source.created_at === 'string' ? source.created_at : undefined,
      updatedAt: typeof source.updated_at === 'string' ? source.updated_at : undefined,
    });
  }

  static example: SystemIdentityModel = new SystemIdentityModel({
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
