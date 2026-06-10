export const mapLocales = (
  data: any[],
  keyField: string,
  valueField: string
) => {
  return data.reduce((acc, item) => {
    acc[item[keyField]] = item[valueField];
    return acc;
  }, {});
};