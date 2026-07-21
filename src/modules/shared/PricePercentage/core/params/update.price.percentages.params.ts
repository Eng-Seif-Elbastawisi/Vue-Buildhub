import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';
import type { PricePercentageEntry } from '../models/price.percentage.model';

export const MIN_PERCENTAGE = 1;
export const MAX_PERCENTAGE = 100;
export const REQUIRED_PERCENTAGE_TOTAL = 100;

export const calculatePercentageTotal = (percentages: number[]): number =>
  Math.round(percentages.reduce((total, percentage) => total + percentage, 0) * 100) / 100;

const isValidEntry = (entry: unknown): entry is PricePercentageEntry => {
  if (!entry || typeof entry !== 'object') return false;

  const percentageEntry = entry as Record<string, unknown>;

  return (
    typeof percentageEntry.title === 'string' &&
    percentageEntry.title.trim().length > 0 &&
    typeof percentageEntry.percentage === 'number' &&
    Number.isFinite(percentageEntry.percentage) &&
    percentageEntry.percentage >= MIN_PERCENTAGE &&
    percentageEntry.percentage <= MAX_PERCENTAGE
  );
};

const validateEntries = (entries: unknown): boolean | string => {
  if (!Array.isArray(entries) || !entries.every((entry) => isValidEntry(entry))) {
    return translate('price_percentage.validation_invalid_rows');
  }

  const total = calculatePercentageTotal(entries.map((entry) => entry.percentage));

  return total === REQUIRED_PERCENTAGE_TOTAL
    ? true
    : translate('price_percentage.validation_total');
};

export default class UpdatePricePercentagesParams implements Params {
  public readonly projectId: number;
  public readonly percentages: PricePercentageEntry[];

  public static readonly validation = new ClassValidation().setRules({
    projectId: {
      required: true,
      custom: (value) => Number.isInteger(value) && value > 0,
    },
    percentages: {
      required: true,
      custom: validateEntries,
    },
  });

  constructor(payload: { projectId: number; percentages: PricePercentageEntry[] }) {
    this.projectId = payload.projectId;
    this.percentages = payload.percentages.map((entry) => ({
      title: entry.title.trim(),
      percentage: entry.percentage,
    }));
  }

  toMap(): { project_id: number; percentages: PricePercentageEntry[] } {
    return { project_id: this.projectId, percentages: this.percentages };
  }

  validate() {
    return UpdatePricePercentagesParams.validation.validate(this);
  }

  validateOrThrow() {
    return UpdatePricePercentagesParams.validation.validateOrThrow(this);
  }
}
