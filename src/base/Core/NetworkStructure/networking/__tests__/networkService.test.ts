import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NetworkService from '../networkService';
import UserModel from '@/modules/auth/core/models/user.model';
import { UserType } from '@/modules/auth/core/constants/userType.enum';
import { useUserStore } from '@/stores/user';
import router from '@/router';
import { handleUnauthorizedResponse } from '../utils/unauthorizedHandler';

const axiosInstance = NetworkService.instance.getAxiosInstance();
const originalAdapter = axiosInstance.defaults.adapter;
NetworkService.instance.setUnauthorizedHandler(() => handleUnauthorizedResponse(router));

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter;
});

describe('NetworkService response handling', () => {
  it('clears the session and redirects when the backend returns 401', async () => {
    const userStore = useUserStore();
    userStore.setUser(
      new UserModel({
        name: 'Organization User',
        email: 'user@example.com',
        type: UserType.ORGANIZATION,
        apiToken: 'test-token',
      }),
    );
    localStorage.setItem('locale', 'ar');
    await router.push('/organization');

    axiosInstance.defaults.adapter = (async (config) => {
      const requestConfig = config as InternalAxiosRequestConfig;
      const response = {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: requestConfig,
      };

      throw new AxiosError(
        'Unauthorized',
        AxiosError.ERR_BAD_REQUEST,
        requestConfig,
        undefined,
        response,
      );
    }) as AxiosAdapter;

    await expect(axiosInstance.get('/protected')).rejects.toBeInstanceOf(axios.AxiosError);
    expect(userStore.user).toBeNull();
    expect(userStore.isAuth).toBe(false);
    expect(localStorage.getItem('locale')).toBe('ar');
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/login-organization'));
  });
});
