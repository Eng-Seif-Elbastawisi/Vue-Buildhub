import { AxiosHeaders, type AxiosResponse } from 'axios';

// Opaque HTTP transport probe, deliberately not a proposed Schedule response schema.
export function transportProbe(): AxiosResponse<unknown> {
  return {
    status: 200,
    statusText: 'OK',
    data: { transport_probe: 'opaque' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}
