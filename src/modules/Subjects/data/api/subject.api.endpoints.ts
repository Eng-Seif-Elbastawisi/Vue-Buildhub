import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class SubjectEndpoints extends BaseEndpoints {
  protected readonly prefix = "organization/";

  readonly index = this.url("fetch_subjects");
  readonly show = this.url("show_subject");
  readonly store = this.url("store_subject");
  readonly update = this.url("update_subject");
  readonly delete = this.url("delete_subject");
}
