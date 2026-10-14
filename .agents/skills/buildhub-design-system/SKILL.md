---
name: buildhub-design-system
description: Apply BuildHub's default field-group, FieldHelpIcon, select, input, button, form-card and header design when building or changing forms, filters, feature screens or API-connected UI. Use employee as the module reference and prefer inherited base CRUD methods.
---

# BuildHub defaults

Apply these defaults to new or changed UI in this repository, including forms, filters and dialogs. Explicit task requirements take precedence. Extend the existing feature; this skill does not authorize redesigning unrelated screens.

## Selects

Use `src/shared/FormInputs/UpdatedCustomInputSelect.vue` as the default select everywhere. Do not introduce native selects, direct PrimeVue Select/MultiSelect usage or another select wrapper when this component supports the required behavior.

Read the component and `src/modules/MainOrganization/employee/presentation/components/EmployeeForm.vue` before wiring it:

- Bind an option object or `null` for single selection, and an array of option objects for multiple selection. Its public option shape is `TitleInterface` from `src/base/Data/Models/titleInterface.ts`; labels use `title`.
- Use `:type="1"` for single selection (the default) and `:type="2"` for multiple selection. The current implementation determines multiselect with `Number(type) === 2`; string `"multiselect"` does not activate it.
- Provide translated `label` and the required `placeholder`, plus a unique `id`. Verify the rendered control's accessible name; the wrapper's `id` prop alone does not establish a label association on the inner PrimeVue control.
- For local options, use `static-options`. For fetched options, supply a controller with `fetchAsOptions(params)`, `isListFailed()` and `isListSuccess()`, and compatible params. Do not fetch directly in the component's caller or bypass the controller.
- Enable `paginated` only when the controller supplies supported pagination. Use `selection-limit`, `disabled` and select-all behavior only when appropriate to the contract; confirm selected items remain deselectable at a limit.
- Translate option labels reactively. Retain saved selections absent from the current lookup page; preserve failed-form values.
- Convert selected option IDs to the endpoint's params at the form boundary. Do not send option objects, labels or a nested master-record ID in place of the required association ID. Preserve empty, omitted and null values according to the contract.

If the wrapper cannot represent a required control or accessible interaction, inspect its extension points and make the smallest compatible improvement. Explain any necessary exception rather than adding a parallel design system.

## Field groups and help

Wrap each editable field in `field-group`, including fields in dialogs and filters. For ordinary inputs and textareas, also use `input-wrapper`. Put the translated label and `src/shared/components/form/FieldHelpIcon.vue` beside each other in a span:

```vue
<div class="field-group input-wrapper">
  <span class="field-help-label-row field-help-label-row--block">
    <label class="field-label label" for="supplier-phone">{{ $t('supplier.phone') }}</label>
    <FieldHelpIcon
      :label="$t('supplier.phone')"
      field-name="phone"
      field-id="supplier-phone"
    />
  </span>
  <input id="supplier-phone" v-model="phone" class="input" type="tel" />
</div>
```

Import the help component explicitly. Keep its button beside the label, outside the label element. Match `field-id` to the control ID and use a stable semantic `field-name`. Include a row key in repeated control IDs.

For `UpdatedCustomInputSelect`, retain its own label and insert the help span through `#LabelHeader` inside the select. Keep the select inside `field-group`; preserve its required marker and accessible name. For radio and checkbox groups, put help beside the group legend or heading rather than inside option labels.

Check `src/shared/formHelp/fieldHelpRegistry.ts` for a suitable registered field name. Unregistered fields render no icon without explicit content: provide translated `:help-text` for those fields and for specialized guidance, with keys in both EN/AR locales. Execution Quotes examples use `field_help.execution_fields.*`. Verify help opens without submitting the form or changing the selected value, and retain existing errors, help descriptions and disabled states.

## Inputs and buttons

- Use `input-wrapper` for ordinary inputs with the existing `label` and `input` classes. See `src/styles/utils/_app_input.scss`. Choose the native input type for the value; associate the label's `for` with a unique input `id` and connect field errors/help text accessibly.
- Keep specialized controls for dates, files and other native values when needed; do not force them into a select. Reuse existing compatible shared controls.
- Use `btn btn-primary` for primary actions. Prefer `src/shared/HelpersComponents/AppButton.vue` with `theme="primary"` (its default), which emits those classes and handles loading/disabled state. Native buttons may use the same classes as in EmployeeAdd/EmployeeEdit.
- Set button type explicitly for form actions: `submit` for save, `button` for cancel/filter actions. Disable duplicate submissions while saving. Keep secondary and destructive actions in their existing semantic themes.

## Form cards and page headers

- Use `standard-crud-page` on the Add/Edit page root or thin view wrapper. Follow `src/views/MainOrganization/employee/AddEmployee.vue` and `EditEmployee.vue`.
- Reuse the employee form card structure: `document-form-card`, `document-form-header`, `form-fields` and `field-group`. Apply the default `input-wrapper` treatment inside fields, even where older employee markup uses `input-wrap`. Do not copy older markup over this explicit default.
- Inspect `src/styles/standard-crud-form.scss` for the card/layout selectors; it is imported by `src/main.ts`. Reuse its spacing, borders and tokens instead of copying its global CSS into a module.
- Use the existing `src/shared/FeatureHeader/FeatureHeader.vue` and its `feature-header-container` design. Check the owning layout before rendering a header so the page does not duplicate the shell's header/breadcrumbs. Extend existing header configuration for genuinely missing routes instead of building another banner.
- Keep filters/dialogs within their existing containers; they still use the default controls but do not need a full CRUD page wrapper.
- Preserve responsive layouts, focus states and Arabic/RTL. Add labels and errors to both EN/AR locales. Do not rebuild the application shell.

## Employee reference and base methods — high priority

Employee is the canonical module reference for **every feature and API integration**:

- `src/modules/MainOrganization/employee/data/api/employee.api-service.ts`
- `src/modules/MainOrganization/employee/data/repositories/employee.repository.ts`
- `src/modules/MainOrganization/employee/presentation/controllers/employee.controller.ts`
- `src/modules/MainOrganization/employee/presentation/components/EmployeeForm.vue`

Read the actual base signatures before implementing CRUD:

- `src/base/Data/ApiService/baseApiService.ts`
- `src/base/Domain/Repositories/baseRepository.ts`
- `src/base/Presentation/Controller/baseController.ts`

Use inherited methods first. If no additional behavior is required, inherit without an override. If an override is necessary, delegate supported CRUD to `super.index/show/create/update/delete` where that method exists, preserving its arguments and return type. Use the base method's actual name in each layer; controller read methods may differ from repository/service methods.

The API service usually needs only endpoints and `getInstance()`. The repository usually needs its service, verified envelope configuration and model mappers. The controller usually needs its repository, configuration and small post-success hooks. Do not recreate base loading, transport, validation, DataState, feedback or CRUD orchestration in custom `mutate`, `blocked`, dispatcher or generic wrapper methods.

Add focused custom methods only for behavior the base does not cover, such as a non-CRUD endpoint or a distinct response schema. Keep owner/stale-response protections and duplicate-submit guards when required. Confirm that inherited state assignment is safe before reusing it; simplicity must not remove authorization, error handling or owner isolation.

Keep the flow `component -> controller -> repository -> API service -> backend`, singleton `getInstance()` conventions and the existing model/params mapping rules. Employee is a structure reference, not permission to copy its legacy `any`, mock defaults or swallowed parsing errors into new code.

## Before delivery

Check changed UI uses these defaults, request params contain contract IDs rather than display objects, no component calls the network, and custom CRUD methods are justified. Run the relevant existing tests, type-check and focused lint/style checks for code changes. For instruction-only edits, validate the skill and verify source paths and linked skills instead of adding application tests.
