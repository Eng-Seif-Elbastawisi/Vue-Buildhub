const POSITIVE_PHONE_DIGITS_PATTERN = /^\d+$/;

export const isValidSupplierPhone = (phone?: string): boolean =>
  phone === undefined || phone === '' || POSITIVE_PHONE_DIGITS_PATTERN.test(phone);
