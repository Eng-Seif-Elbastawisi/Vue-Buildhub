import { BaseEndpoints } from '@/base/Data/Endpoints/BaseEndpoints';
import { useUserStore } from '@/stores/user';
export class SiteTeamEndpoints extends BaseEndpoints {
  protected get prefix() {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }
  get engineers() {
    return this.url('fetch_quote_engineers');
  }
  get assignEngineers() {
    return this.url('assign_quote_engineers');
  }
  get siteInfo() {
    return this.url('fetch_project_configuration_site_info');
  }
  get updateSiteInfo() {
    return this.url('update_project_configuration_site_info');
  }
}
