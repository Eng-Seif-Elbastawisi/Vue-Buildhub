export default interface GetParams {
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  isAuth?: boolean;
}
