export interface PricePercentageEntry {
  title: string;
  percentage: number;
}

const parseEntry = (payload: unknown): PricePercentageEntry | null => {
  if (!payload || typeof payload !== 'object') return null;

  const entry = payload as Record<string, unknown>;
  const title = typeof entry.title === 'string' ? entry.title.trim() : '';
  const percentage =
    typeof entry.percentage === 'number' ? entry.percentage : Number(entry.percentage);

  if (!title || !Number.isFinite(percentage)) return null;

  return { title, percentage };
};

export default class PricePercentageModel {
  public readonly percentages: PricePercentageEntry[];

  constructor(percentages: PricePercentageEntry[]) {
    this.percentages = percentages;
  }

  static fromJson(payload: unknown): PricePercentageModel {
    const response = payload as Record<string, unknown> | null;
    const entries = Array.isArray(payload)
      ? payload
      : Array.isArray(response?.percentages)
        ? response.percentages
        : [];

    return new PricePercentageModel(
      entries.flatMap((entry) => {
        const parsedEntry = parseEntry(entry);
        return parsedEntry ? [parsedEntry] : [];
      }),
    );
  }

  static readonly example = new PricePercentageModel([{ title: 'Tax', percentage: 15 }]);
}
