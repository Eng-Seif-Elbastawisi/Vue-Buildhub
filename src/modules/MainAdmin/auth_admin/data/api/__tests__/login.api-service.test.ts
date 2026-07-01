import { describe, expect, it, vi } from 'vitest';
import LoginParams from '../../../core/params/login.params';
import LoginApiService from '../login.api-service';

describe('LoginApiService', () => {
  it('returns a singleton instance', () => {
    expect(LoginApiService.getInstance()).toBe(LoginApiService.getInstance());
  });

  it('posts login params to the login endpoint', async () => {
    const service = LoginApiService.getInstance();
    const params = new LoginParams('admin@example.com', 'secret123');
    const customPost = vi
      .spyOn(
        service as unknown as { customPost: (url: string, params: LoginParams) => unknown },
        'customPost',
      )
      .mockResolvedValue({ data: { ok: true } });

    await service.login(params);

    expect(customPost).toHaveBeenCalledWith(expect.stringContaining('mainportal/login'), params);
    customPost.mockRestore();
  });
});
