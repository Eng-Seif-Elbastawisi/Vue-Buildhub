import { AxiosHeaders, type AxiosResponse } from 'axios';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import NetworkService from '@/base/Core/NetworkStructure/networking/networkService';
export function response(data: unknown, status = 200): AxiosResponse<unknown> {
  return { status, statusText: 'OK', data, headers: {}, config: { headers: new AxiosHeaders() } };
}
export function mockNetwork() {
  vi.restoreAllMocks();
  setActivePinia(createPinia());
  return vi.spyOn(NetworkService.instance, 'post').mockResolvedValue(response({ status: true }));
}
