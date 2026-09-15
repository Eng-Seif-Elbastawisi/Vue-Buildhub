import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class ChangeStatusApiEndpoints extends BaseEndpoints {
  protected readonly prefix = "organization/";

  readonly changeStatus = this.url("change_active");

}
