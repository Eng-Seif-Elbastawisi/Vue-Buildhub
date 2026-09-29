import type Params from '@/base/Core/Params/params';
import {
  ClassValidation,
  type ValidationResult,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import { type QuoteStatusEnum } from '../constants/quote.status.enum';

export default class ChangeQuoteStatusParams implements Params {
  public quoteId: number;
  public status: QuoteStatusEnum;
  public notes?: string;

  public static readonly validation = new ClassValidation().setRules({
    quoteId: {
      required: true,
      custom: (val?: number) => Boolean(val && val > 0) || 'Quote ID is required',
    },
    status: { required: true },
  });

  constructor(data: {
    quoteId: number;
    status: QuoteStatusEnum;
    notes?: string;
  }) {
    this.quoteId = data.quoteId;
    this.status = data.status;
    this.notes = data.notes;
  }

  toMap(): Record<string, unknown> {
    return {
      quote_id: this.quoteId,
      status: this.status,
      notes: this.notes,
    };
  }

  validate(): ValidationResult {
    return ChangeQuoteStatusParams.validation.validate(this);
  }

  validateOrThrow(): void {
    const validation = this.validate();
    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
