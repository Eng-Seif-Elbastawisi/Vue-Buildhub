import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class PurchaseOrderEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get show() {
    return this.url('fetch_purchase_order');
  }
  get create() {
    return this.url('store_purchase_order');
  }
}
