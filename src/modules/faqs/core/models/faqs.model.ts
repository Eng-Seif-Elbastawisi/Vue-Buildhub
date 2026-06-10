export default class FaqsModel {
  public readonly id?: number;
  public readonly answer: Record<string, string> | string;
  public readonly question: Record<string, string> | string;

  constructor(
    data: {
      id?: number;
      answer: Record<string, string> | string;
      question: Record<string, string> | string;
    },
  ) {
    this.id = data.id;
    this.answer = data.answer;
    this.question = data.question;

    Object.freeze(this);
  }

  static fromJson(json: any): FaqsModel {
    if (!json) {
      throw new Error('Cannot create FaqsModel from null or undefined');
    }

    return new FaqsModel({
      id: json.id,
      question: typeof json.question === 'string'
        ? json.question
        : FaqsModel.normalizeLocaleField(json.question, 'question'),
      answer: typeof json.answer === 'string'
        ? json.answer
        : FaqsModel.normalizeLocaleField(json.answer, 'answer'),
    });
  }

  private static normalizeLocaleField(raw: unknown, valueKey: string): Record<string, string> {
    if (Array.isArray(raw)) {
      return (raw as Array<Record<string, string>>).reduce(
        (acc, item) => {
          if (item?.locale) acc[item.locale] = item[valueKey] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    if (raw && typeof raw === 'object') return raw as Record<string, string>;
    return {};
  }

  static example: FaqsModel = new FaqsModel({
    id: 1,
    answer: { en: 'answer' },
    question: { en: 'question' },
  });
}
