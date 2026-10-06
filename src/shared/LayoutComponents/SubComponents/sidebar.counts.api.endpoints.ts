import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';

export class SidebarCountsApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'organization/';

  readonly organizationSidebarCounts = this.url('organization_sidebar_counts');
}

export class AdminSidebarCountsApiEndpoints extends BaseEndpoints {
  protected readonly prefix = 'mainportal/';

  readonly adminSidebarCounts = this.url('main_portal_sidebar_counts');
}
