import type { FieldError } from "@/base/Presentation/Utils/classValidation";

export default interface Params {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toMap(): { [key: string]: any };
  validate(): { isValid: boolean; errors: FieldError[] };
  validateOrThrow(): void;
}
