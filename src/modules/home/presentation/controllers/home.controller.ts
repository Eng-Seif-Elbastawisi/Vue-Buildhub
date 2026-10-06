import SidebarCountsApiService from '@/shared/LayoutComponents/SubComponents/sidebar.counts.api-service';
import type {
  SidebarCountsPayload,
  SidebarRole,
} from '@/shared/LayoutComponents/SubComponents/sidebar.config';

export type HomeWorkspace = SidebarRole;

export default class HomeController {
  private static instance: HomeController;

  static getInstance(): HomeController {
    if (!HomeController.instance) HomeController.instance = new HomeController();
    return HomeController.instance;
  }

  async fetchCounts(workspace: HomeWorkspace): Promise<SidebarCountsPayload | null> {
    const response = await SidebarCountsApiService.getInstance().fetchSidebarCounts(workspace);
    return response.data.status ? response.data.data : null;
  }
}
