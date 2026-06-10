import BaseApiService from "@/base/Data/ApiService/baseApiService";
import type {
  ApiEndpoints,
  ApiResponse,
} from "@/base/Data/ApiService/baseApiService";
import type Params from "@/base/Core/Params/params";
import { LoginEndpoints } from "./login.api.endpoints";

export default class LoginApiService extends BaseApiService {
  private static instance: LoginApiService;

  private loginendpoints = new LoginEndpoints();

  /**
   * Singleton instance
   */
  static getInstance(): LoginApiService {
    if (!LoginApiService.instance) {
      LoginApiService.instance = new LoginApiService();
    }
    return LoginApiService.instance;
  }

  protected get endpoints(): Partial<ApiEndpoints> {
    return {
      create: this.loginendpoints.login,
    };
  }

  async login(params: Params): Promise<ApiResponse> {
    return this.customPost(this.loginendpoints.login, params);
  }
}
