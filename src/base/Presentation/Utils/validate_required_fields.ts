export function validateRequiredFields(params: any): Record<string, string> {
  const requiredFields = params.requiredFields;
  const missingFields: Record<string, string> = {};

  requiredFields.forEach((fieldObj: { field: string; message: string }) => {
    const value = params[fieldObj.field];
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value.length === 0
    ) {
      missingFields[fieldObj.field] = fieldObj.message;
    }
  });

  return missingFields;
}
