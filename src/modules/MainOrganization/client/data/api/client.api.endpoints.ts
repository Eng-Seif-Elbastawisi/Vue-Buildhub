import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class ClientApiEndpoints extends BaseEndpoints {
  protected readonly prefix = "organization/";

  readonly index = this.url("fetch_client");
  readonly show = this.url("show_client");
  readonly store = this.url("add_client");
  readonly update = this.url("update_client");
  readonly delete = this.url("delete_client");
}
