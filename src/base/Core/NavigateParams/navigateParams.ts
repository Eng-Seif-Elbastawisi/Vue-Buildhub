abstract class NavigateParams<T> {
  // setHotel(data: string | null): void;
  // clear(): void;

  protected saveToLocalStorage(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  protected getFromLocalStorage(key: string): any {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  }
}

export { NavigateParams };
