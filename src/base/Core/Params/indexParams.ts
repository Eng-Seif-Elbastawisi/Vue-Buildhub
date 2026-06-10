import type Params from "./params";
import { ClassValidation } from "@/base/Presentation/Utils/classValidation";

export default class IndexParams implements Params {
  public word: string;
  public withPage: number = 1;
  public perPage: number = 10;
  public pageNumber: number = 10;

  public static readonly validation = new ClassValidation().setRules({
    pageNumber: { required: true, min: 1 },
    perPage: { required: true, min: 1 },
  });

  constructor(
    word: string,
    pageNumber: number = 1,
    perPage: number = 10,
    withPage: number = 1,
  ) {
    this.word = word;
    this.withPage = withPage;
    this.pageNumber = pageNumber;
    this.perPage = perPage;
  }

  toMap(): Record<string, string | number | number[] | null> {
    const data: Record<string, string | number | number[] | null> = {};
    if (this.word) data["word"] = this.word;
    data["with_pagination"] = this.withPage;
    data["page"] = this.pageNumber;
    data["per_page"] = this.perPage;
    return data;
  }

  validate() {
    return IndexParams.validation.validate(this);
  }

  validateOrThrow() {
    return IndexParams.validation.validateOrThrow(this);
  }
}
