# Components summary

[Documentation home](../README.md) · [Complete component documentation](../COMPONENTS_DOCUMENTATION.md)

## Inventory

The reusable non-icon catalog documents **63 components**.

| Source area                     |  Count | Included scope                                                          |
| ------------------------------- | -----: | ----------------------------------------------------------------------- |
| `src/shared`                    |     53 | Layout, forms, data states, helpers, dialogs, exports, language, panels |
| `src/base/Presentation/Dialogs` |      5 | Managed/legacy dialog and toast renderers                               |
| `src/components`                |      3 | Retained Vue starter components, excluding icons                        |
| Application shells              |      2 | `src/views/AppLayout.vue` and `src/modules/auth/.../AuthShell.vue`      |
| **Total**                       | **63** | SVG/icon-only components excluded                                       |

## Component families

| Family              | Components                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application/layout  | `AppLayout`, `AuthShell`, `DashboardLayout`, `BreadCrumb`, `ChangeLanguage`, `MobileSidebarDrawer`, `MobileTopBar`, `Navbar`, `SidebarNavigation`, `NavigationBarMobile`                           |
| Core table/action   | `AppButton`, `AppInput`, `AppTable`, `CustomCheckbox`, `DropList`, `EmptyDataState`, `PagesHeader`, `Pagination`, `PermissionBuilder`, `ComponentDemoPanel`, `PanelContainer`                      |
| Form/input          | `CheckBoxButton`, `HandleFilesUpload`, `OtpInput`, `SwitchInput`, `TablePopover`, `UpdatedCustomInputSelect`, `RadioSection`, `LangInput`, `MultiLangInput`, `LangTitleInput`, `FieldHelpIcon`     |
| Data status/loading | `DataStatusBuilder`, `DataEmpty`, `DataFailed`, `NoNetworkState`, `TimeoutState`, `ProgressState`, `MainLoader`, `TableLoader`, `CardLoader`, `FormLoader`, `TableSkelaton`, `TableDialogSkelaton` |
| Dialog/export       | `FilterDialog`, two `DeleteDialog` implementations, `MultiImagesDialog`, `ValidationDialog`, `UnifiedDialog`, `ToastContainer`, `LoaderDialog`, `MainDialog`, `ExportExcel`, `ExportPdf`           |
| Specialized/legacy  | `CustomAccordion`, `FeatureHeader`, `TimeLine`, `TreeItem`, `TreeView`                                                                                                                             |
| Vue starter         | `HelloWorld`, `TheWelcome`, `WelcomeItem`                                                                                                                                                          |

## Important caveats

- `PermissionBuilder` is not an effective permission boundary because the authenticated user response model contains no permission collection; backend authorization remains required.
- `TimeLine`, `LoaderDialog`, and `MainDialog` are placeholders/inactive implementations.
- `TreeView` uses hard-coded data; its external prop contract is commented out.
- `OtpInput` does not expose its internal value.
- `NavigationBarMobile` is not used by the active layout and contains legacy navigation.
- `ExportPdf` captures the first `.table-responsive` in the DOM.

Props, emits, slots, exposed methods, dependencies, paths, and usage examples for every entry are in [Components documentation](../COMPONENTS_DOCUMENTATION.md).
