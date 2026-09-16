import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';

export class ProductsApiEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_products');
  readonly show = this.url('show_product');
  readonly store = this.url('store_product');
  readonly update = this.url('update_product');
  readonly delete = this.url('delete_product');

  readonly deleteProductSorting = this.url('delete_product_sorting');
  readonly deleteProductStage = this.url('delete_product_stages');

  readonly storeProductSorting = this.url('store_product_sorting');
  readonly storeProductStage = this.url('store_product_stages');
}
