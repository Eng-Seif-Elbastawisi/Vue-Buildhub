import { useCountryStore } from '@/stores/country';
import { useUserStore } from '@/stores/user';
import { getUsableAuthToken } from '@/modules/auth/core/utils/authToken';

class HeaderHandler {
  private static _instance: HeaderHandler;

  private constructor() {}

  static get Instance(): HeaderHandler {
    if (!this._instance) {
      this._instance = new HeaderHandler();
    }
    return this._instance;
  }

  getHeader(isAuth = false): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    const userStore = useUserStore();
    const countryStore = useCountryStore();
    const token = getUsableAuthToken(userStore.user?.apiToken);

    if (isAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const savedLocale = localStorage.getItem('locale') || 'en';
    // console.log(savedLocale , 'savedLocale')
    if (savedLocale) {
      headers['Accept-Language'] = savedLocale;
    }

    // const countryCode = countryStore?.getCountryCode();
    // if (countryCode) {
    //   headers['X-Country-Code'] = countryCode;
    // }

    headers['Content-Type'] = 'application/json';
    headers.Accept = 'application/json';
    headers['x-country'] = countryStore.getCountryCode();
    return headers;
  }
}

export default HeaderHandler;
