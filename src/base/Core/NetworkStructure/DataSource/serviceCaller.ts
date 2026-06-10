import type Params from "@/base/Core/Params/params";
import type { CrudType } from "@/base/Data/ApiService/apiServiceInterface";

export interface ServiceCaller {
  call(
    url: string,
    type: CrudType,
    auth: boolean,
    forceRefresh: boolean,
    showLoadingDialog: boolean,
    headers?: Record<string, string>,
    params?: Params,
    details?: Record<string, any>,
  ): Promise<{ data: any; statusCode: number }>;
}
