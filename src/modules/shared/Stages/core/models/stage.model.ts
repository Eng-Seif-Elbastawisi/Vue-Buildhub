export default class StageModel {
  public readonly id?: number;
  public readonly parentId?: number | null;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };
  public readonly children: StageModel[];
  public readonly status: boolean;
  public readonly stageChildrenCount: number;

  constructor(data: {
    id?: number;
    parentId?: number | null;
    translations?: { title: Record<string, string> };
    title?: string;
    children: StageModel[];
    status?: boolean;
    stageChildrenCount?: number;
  }) {
    this.id = data.id;
    this.parentId = data.parentId;
    this.translations = data.translations ?? {
      title: { en: data.title ?? '' },
    };
    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    this.children = data.children;
    this.status = data.status ?? false;
    this.stageChildrenCount = data.stageChildrenCount ?? 0;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> } | undefined;

      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;

      if (item.locale && item[key]) {
        result[item.locale] = item[key];
      }

      return result;
    }, {});
  }

  static fromJson(json: any): StageModel {
    if (!json) {
      throw new Error('Cannot create StageModel from null or undefined');
    }

    return new StageModel({
      id: json.id,
      parentId:
        json.parent_id === null || json.parent_id === undefined
          ? json.parent_id
          : Number(json.parent_id),
      title: json.title,
      translations: {
        title: StageModel.mapTranslations(json.title),
      },
      children: json.children?.map((child: any) => StageModel.fromJson(child)) ?? [],
      status: json.status,
      stageChildrenCount: json.stage_children_count,
    });
  }

  static example = new StageModel({
    id: 1,
    title: 'Stage',
    translations: { title: { ar: 'مرحلة', en: 'Stage' } },
    children: [],
    status: true,
    stageChildrenCount: 0,
  });
}
