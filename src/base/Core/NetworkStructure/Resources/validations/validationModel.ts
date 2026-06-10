const ValidationType = {
  cityRequired: "cityRequired",
  countryRequired: "countryRequired",
  dateRequired: "dateRequired",
  dateEqual: "dateEqual",
  unknown: "unknown",
} as const;

class ValidationModel {
  public title: string = "";
  public type: (typeof ValidationType)[keyof typeof ValidationType] = ValidationType.unknown;

  constructor(title: string, type: (typeof ValidationType)[keyof typeof ValidationType]) {
    this.title = title;
    this.type = type;
  }
}

export default ValidationModel;
