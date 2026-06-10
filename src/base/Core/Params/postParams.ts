export default interface PostParams {
  url: string;
  data: object;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  isAuth?: boolean;
}
