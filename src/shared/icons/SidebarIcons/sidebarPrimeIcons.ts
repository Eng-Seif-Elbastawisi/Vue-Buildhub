import { defineComponent, h } from 'vue';

const createPrimeSidebarIcon = (iconClass: string) =>
  defineComponent({
    name: iconClass
      .split(' ')
      .filter((part) => part !== 'pi')
      .map((part) =>
        part
          .replace(/^pi-/, '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(''),
      )
      .join(''),
    setup(_, { attrs }) {
      return () =>
        h('i', {
          ...attrs,
          class: [iconClass, attrs.class],
          'aria-hidden': 'true',
        });
    },
  });

export const SidebarAdminIcon = createPrimeSidebarIcon('pi pi-shield');
export const SidebarAddRequestIcon = createPrimeSidebarIcon('pi pi-plus-circle');
export const SidebarBrandTagIcon = createPrimeSidebarIcon('pi pi-tag');
export const SidebarCityIcon = createPrimeSidebarIcon('pi pi-building');
export const SidebarClientIcon = createPrimeSidebarIcon('pi pi-users');
export const SidebarClientSourceIcon = createPrimeSidebarIcon('pi pi-share-alt');
export const SidebarCountryIcon = createPrimeSidebarIcon('pi pi-map');
export const SidebarDepartmentIcon = createPrimeSidebarIcon('pi pi-briefcase');
export const SidebarEmployeeIcon = createPrimeSidebarIcon('pi pi-user-edit');
export const SidebarFinanceIcon = createPrimeSidebarIcon('pi pi-wallet');
export const SidebarGovernorateIcon = createPrimeSidebarIcon('pi pi-map-marker');
export const SidebarInvoiceIcon = createPrimeSidebarIcon('pi pi-receipt');
export const SidebarItemIcon = createPrimeSidebarIcon('pi pi-box');
export const SidebarMaterialIcon = createPrimeSidebarIcon('pi pi-box');
export const SidebarMeasurementIcon = createPrimeSidebarIcon('pi pi-chart-line');
export const SidebarOrganizationIcon = createPrimeSidebarIcon('pi pi-building');
export const SidebarProjectIcon = createPrimeSidebarIcon('pi pi-building');
export const SidebarProjectTypeIcon = createPrimeSidebarIcon('pi pi-sitemap');
export const SidebarRequestIcon = createPrimeSidebarIcon('pi pi-clipboard');
export const SidebarSettingsPrimeIcon = createPrimeSidebarIcon('pi pi-sliders-h');
export const SidebarSpaceIcon = createPrimeSidebarIcon('pi pi-th-large');
export const SidebarSpecializationIcon = createPrimeSidebarIcon('pi pi-id-card');
export const SidebarStageIcon = createPrimeSidebarIcon('pi pi-sitemap');
export const SidebarSupplierIcon = createPrimeSidebarIcon('pi pi-briefcase');
export const SidebarSupplyIcon = createPrimeSidebarIcon('pi pi-box');
export const SidebarSystemIcon = createPrimeSidebarIcon('pi pi-cog');
export const SidebarTermIcon = createPrimeSidebarIcon('pi pi-file-edit');
export const SidebarToggleIcon = createPrimeSidebarIcon('pi pi-sync');
