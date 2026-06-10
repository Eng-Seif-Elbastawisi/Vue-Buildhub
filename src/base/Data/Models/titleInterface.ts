export default class TitleInterface<T extends string | number> {
  id: number;
  title?: string;
  subtitle?: T;
  kpi?: string;
  decodedData?: string = "";
  text?: string;
  children?: TitleInterface<T>[];
  full_title?: string;

  constructor({
    id,
    title,
    subtitle,
    kpi,
    decodedData = "",
    text = "",
    children,
    full_title,
  }: {
    id: number;
    title?: string;
    subtitle?: T;
    kpi?: string;
    decodedData?: string;
    text?: string;
    children?: TitleInterface<T>[];
    full_title?: string;
  }) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.kpi = kpi;
    this.decodedData = decodedData;
    this.text = text;
    this.children = children;
    this.full_title = full_title;
  }
}
