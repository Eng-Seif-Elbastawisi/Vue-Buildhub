import { BaseEndpoints } from "@/base/Data/Endpoints/BaseEndpoints";

export class PrivacyEndpoints extends BaseEndpoints {
  protected readonly prefix = "dashboard/";

  readonly index = this.url("fetch_privacy");
  readonly show = this.url("show_privacy");
  readonly store = this.url("store_privacy");
  readonly update = this.url("update_privacy");
  readonly delete = this.url("delete_privacy");
}
