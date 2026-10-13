import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class PurchaseRequestEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get index() {
    return this.url('fetch_purchase_requests');
  }
  get create() {
    return this.url('store_purchase_request');
  }
}
