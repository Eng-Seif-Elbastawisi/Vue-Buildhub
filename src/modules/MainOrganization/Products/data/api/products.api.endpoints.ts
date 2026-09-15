import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProductsApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  readonly index = this.url('fetch_productss');
  readonly show = this.url('show_products');
  readonly store = this.url('store_product');
  readonly update = this.url('update_products');
  readonly delete = this.url('delete_products');
}
