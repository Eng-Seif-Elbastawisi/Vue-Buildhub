import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class BrandApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'dashboard/';

  readonly index = this.url('fetch_brand');
  readonly show = this.url('show_brand');
  readonly store = this.url('store_brand');
  readonly update = this.url('update_brand');
  readonly delete = this.url('delete_brand');
}

//
// import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
// import { useUserStore } from '@/stores/user';
// export class BrandApiEndpoints extends BaseEndpoints {
  
//   protected get prefix(): string {
//     return useUserStore().user?.type === 'supervision' ? 'dashboard/' : 'organization/';
//   }

//   readonly index = this.url('fetch_brand');
//   readonly show = this.url('show_brand');
//   readonly store = this.url('store_brand');
//   readonly update = this.url('update_brand');
//   readonly delete = this.url('delete_brand');
// }
