import { ItemServiceTypeEnum } from '../../core/constant/item.service.type.enum';

export const getItemServiceTypeFromQuery = (
  routeQueryValue: unknown,
): ItemServiceTypeEnum | undefined => {
  const queryValue = Array.isArray(routeQueryValue) ? routeQueryValue[0] : routeQueryValue;
  const serviceType = Number(queryValue);

  return Object.values(ItemServiceTypeEnum).includes(serviceType as ItemServiceTypeEnum)
    ? (serviceType as ItemServiceTypeEnum)
    : undefined;
};

export const getItemServiceTypeQuery = (
  routeQueryValue: unknown,
): Partial<Record<'service_type', string>> => {
  const serviceType = getItemServiceTypeFromQuery(routeQueryValue);

  return serviceType ? { service_type: String(serviceType) } : {};
};
