# Site & Team contracts

Quote owns site information and engineer assignment (`quote_id`). Floors use only
`ExecutionQuoteShowModel.project.id`, sent through the existing
`IndexProjectFloorParams` as `project_id`. A missing linked Project disables floor
selection; it never substitutes the Quote ID. Space additions send only
`project_floor_id` and named space subparams.

## Confirmed requests

All five new operations use authenticated JSON POST without automatic retries:

- `fetch_quote_engineers`: `quote_id`.
- `assign_quote_engineers`: `quote_id`, primitive `engineer_ids` array.
- `fetch_project_configuration_site_info`: `quote_id`.
- `update_project_configuration_site_info`: `quote_id`, date-only `delivery_date`, `site_condition`.
- `add_project_floor_spaces` in ProjectFloor: `project_floor_id`, `spaces`, each containing `space_id`, `length`, `width`, `height`, `notes`.

Existing `fetch_project_floors` and `fetch_spaces` are reused. Employee lookup uses
the existing Employee repository without a role filter. The selectable options
retain selected records outside the visible lookup page. Lookup pagination uses
the existing nested `data.data` / `data.meta` repository contract.

## Response gaps and safeguards

The supplied site-information response is confirmed as
`{ status: true, message, data: { delivery_date, site_condition } }`. Missing and
null field values remain missing and null in `ProjectSiteInfoModel`.

The assigned collection is described as `employee: EmployeeModel[]`, but its
location in the HTTP body is unverified. The provisional parser accepts an
explicit `employee` collection at the body root or inside `data`, only with
`status === true` and a successful HTTP status. It rejects missing, null and
malformed collections instead of showing an invented empty list. A real backend
fixture is required to finalize that wrapper. Employee entries use the existing
`EmployeeModel.fromJson` mapper.

Success/error bodies for assignment, site update and space addition are not
supplied. Following existing BuildHub envelopes, these operations require an
explicit boolean `status: true` and an HTTP 2xx status. An empty response or an
unknown envelope fails verification; it does not simulate a successful write.
The backend must confirm the acknowledgement shape, validation-error keys and
whether an empty successful response is possible. A verification failure after a
write does not prove the write failed: refresh before submitting again.

Assignment replace-versus-append behavior and empty-array clearing are unverified.
The UI restores all existing assignments and blocks saves that remove them. It
supports selecting multiple additional employees and removing unsaved selections.
It sends the complete unique selected ID list. The backend still needs to confirm
how already-assigned IDs in that list behave under append semantics. Empty arrays
are rejected. There is no engineer eligibility rule beyond existing employees.

Duplicate spaces on a floor, dimension units, and a dimension maximum are not
confirmed. Repeated Space IDs are permitted; no deduplication, replacement rule,
maximum or unit label is invented. Positive finite decimal dimensions are accepted.

After acknowledged saves, the controller refreshes the relevant read endpoint.
A failed refresh displays the read error rather than replacing data with form
values. No approval, acceptance/rejection, completion status, attachment upload,
floor creation/deletion, or space update/removal operation is introduced here.

## Execution boundaries

Implementation and automated tests use mocked network responses. No live backend
calls are required or authorized for validation. Tests that exercise the unresolved
employee envelope variants are compatibility probes, not verified backend fixtures.
