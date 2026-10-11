---
name: api-integration
description: Integrates backend APIs into the layered architecture following existing patterns.
---

Before implementation, read and apply [BuildHub design-system defaults](../buildhub-design-system/SKILL.md). These defaults apply to forms, filters and other selects/inputs, buttons, CRUD cards and page headers. Use the current `src/modules/MainOrganization/employee/` module as the reference; prioritize inherited base methods and thin `super` overrides over custom CRUD orchestration. For API-only work, apply the architecture rules without adding UI.

You are an API Integration Engineer specializing in wiring backend endpoints into this Vue 3 frontend's layered architecture.

## Workflow

1. **Analyze the API Contract**
   - Identify endpoint URLs, HTTP methods, request/response payloads.
   - Map response structures to `core/` models.

2. **Create/Update Core Layer**
   - Apply the model rules below before adding models in the module's `core/models/`.
   - Follow the module's mapping convention (`fromJson()` for new models where used); reuse existing models through their actual mapper, such as `fromMap()`.
   - Apply the params rules below before adding request payload params in `core/params/`.
   - Add enums in `core/` if needed.

3. **Create/Update Data Layer**
   - **API Service**: Create `data/api/<feature>.api-service.ts` extending `BaseApiService`.
     - Use singleton pattern with `getInstance()`.
     - Define endpoints in `data/api/<feature>.api.endpoints.ts`.
   - **Repository**: Create `data/repositories/<feature>.repository.ts` extending `BaseRepository`.
     - Implement `parseItem()` and `parseList()` using the model's mapping method.
     - Set `config` for pagination/data keys if applicable.

4. **Create/Update Presentation Layer**
   - **Controller**: Create `presentation/controllers/<feature>.controller.ts` extending `BaseController`.
     - Inherit CRUD by default. Override `create()`, `update()`, `delete()` only for required behavior, delegating to the corresponding `super` method before post-success navigation or cleanup.
   - **Components**: Build Vue components in `presentation/components/`.
     - Import controller via `getInstance()`.
     - Never call API services directly from components.

5. **Wire to Router/Views**
   - Add route in `src/router/routes/` if needed.
   - Create thin page wrapper in `src/views/` that mounts the module component.

6. **Export from Module Index**
   - Update `src/modules/<feature>/index.ts` to export public API.

## Model Rules

- Keep primitive fields as primitive types. Map each nested object into a named submodel, including small values such as `{ id: number, count: number }`. Map arrays of objects into arrays of submodels; arrays of primitives remain primitive arrays.
- Before creating a submodel, search `src/base/Core/Models/` and models under `src/modules/` for an existing model with compatible fields, domain meaning, and mapping behavior. Reuse it when compatible. For example, inspect the shared `TitleModel` in `src/base/Core/Models/titleModel.ts` for `{ id, title }` values. Matching `id` alone does not make it suitable for `{ id, count }`.
- When no compatible model exists, create a small submodel in the owning module's `core/models/`, named for the nested value's domain meaning. Keep it local until actual reuse warrants sharing it.
- The parent model types its nested field with that submodel and calls its mapper when parsing the response. For example, an admin response field containing `{ id, count }` needs a submodel with those fields and a direct mapping call from the admin model; an inline object type alone does not satisfy this rule.
- Preserve the API contract's optional and nullable values. Map nested objects only when present, and apply the same rules recursively to their object fields.
- Keep submodels minimal: typed fields, the existing constructor pattern, and one mapping method are enough unless the module's base class requires more. Add helpers or additional methods only for concrete behavior required by the integration.

## Params Rules

- Keep primitive request fields and arrays of primitives as their native types. Represent each nested payload object with a named subparams class, including small values such as `{ id: number, count: number }`; use arrays of subparams for arrays of objects. Apply this recursively to nested payload fields. Keep transport values such as `File`, `Blob`, and `FormData` in their native types.
- Before creating subparams, search `src/base/Core/Params/` and params under `src/modules/` for compatible fields, domain meaning, and serialization behavior. Reuse compatible params; reuse a response model only if its existing serializer matches the request contract.
- If none exists, create minimal subparams in the owning module's `core/params/`. Keep it local until actual reuse warrants sharing it. Follow the existing constructor and `toMap()` convention, adding validation or other methods only when required by the contract or module conventions.
- The parent params types the nested field with the subparams class and serializes it through `toMap()`; serialize object arrays by calling each element's `toMap()`. For example, an admin payload field containing `{ id, count }` needs subparams with those fields and a direct serialization call from the admin params; an inline object type alone does not satisfy this rule.
- Preserve request key names and the contract's distinction between omitted, null, and empty values. Serialize optional nested values only when present and keep explicit nulls when the API expects them.

## Validation

- `npm run type-check`
- `npm run test:run`
- Verify no network calls exist outside `data/` layer.
- Confirm all API responses are typed (no `any`).
- Confirm every nested object and object-array element uses a mapped submodel, and that existing shared/module models were checked before introducing new ones.
- Confirm nested request objects and object-array elements use subparams serialization, and that existing shared/module params were checked before introducing new ones.

## Example Reference

The `employee` module (`src/modules/MainOrganization/employee/`) is the canonical CRUD implementation.
