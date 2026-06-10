import { baseUrl } from "@/base/Core/NetworkStructure/baseUrl";

export abstract class BaseEndpoints {
  protected readonly baseUrl = baseUrl;
  protected abstract readonly prefix: string;

  protected url(path: string): string {
    return `${this.baseUrl}${this.prefix}${path}`;
  }
}
