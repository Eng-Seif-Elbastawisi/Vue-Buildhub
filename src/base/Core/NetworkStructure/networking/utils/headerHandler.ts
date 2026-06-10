import { useCountryStore } from '@/stores/country';
import { useUserStore } from '@/stores/user';

class HeaderHandler {
  private static _instance: HeaderHandler;

  private userStore = useUserStore();

  private constructor() {}

  static get Instance(): HeaderHandler {
    if (!this._instance) {
      this._instance = new HeaderHandler();
    }
    return this._instance;
  }

  getHeader(isAuth = false): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    const userStore = this.userStore;
    const CountryStore = useCountryStore();

    const token: string | undefined =
      userStore?.user?.apiToken 
    if (userStore?.user !== null) {
      if (isAuth) {
        headers['Authorization'] = 'Bearer ' + token;
      } else {
        headers['Authorization'] = 'Bearer ' + token;
      }
    }

    const savedLocale = localStorage.getItem('lang') || 'en';
    // console.log(savedLocale , 'savedLocale')
    if (savedLocale) {
      headers['Accept-Language'] = savedLocale;
    }

    // const countryCode = countryStore?.getCountryCode();
    // if (countryCode) {
    //   headers['X-Country-Code'] = countryCode;
    // }

    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
    headers['Authorization'] = 'Bearer ' + token;
    headers['x-country'] = CountryStore.getCountryCode();
    return headers;
  }
}

export default HeaderHandler;
