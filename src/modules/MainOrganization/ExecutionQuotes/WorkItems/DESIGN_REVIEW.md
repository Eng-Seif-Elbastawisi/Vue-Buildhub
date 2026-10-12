# Work Items design review

Work Items extends the existing Quote workspace. The finish review's disposition is **ship**; no material visual fixes remain. Root `DESIGN.md` and `.impeccable/design.json` remain the incumbent system and were preserved.

Verified choices:

- White sections use existing card, ink, slate and border tokens, fine borders and rounded corners (14px). The surrounding warm dashboard and shared app navigation retain their existing identity.
- Forms reuse `input-wrapper`, `UpdatedCustomInputSelect`, PrimeVue `Dialog` and `AppButton`. Date fields use native date-only inputs. Local input focus uses a visible primary outline; invalid fields use the existing danger token.
- Three sections distinguish tasks, daily reports and execution activities. Record metadata keeps creator and assignee separate; activity filters expose selection through `aria-pressed` and a primary border.
- Logical spacing and flexible metadata columns support RTL. Below 600px, page and section padding reduce to 1rem and creation actions use two columns. Desktop, 390px English and 390px Arabic captures show wrapping navigation, records and dialogs.
- This feature introduces no decorative image or animation. Review PNGs are development evidence; no new raster asset ships from the Work Items source.

Evidence inspected: `WorkItemsPage.vue`, all three form dialog components, `presentation/styles/_work-items.scss`, shared `AppButton.vue` and `UpdatedCustomInputSelect.vue`, dashboard shell styles, font registrations, Site & Team styles, incumbent launcher and Schedule shortcut styles, `PRODUCT.md`, root `DESIGN.md`, `.impeccable/design.json`, the Work Items surface contract and detector report. All fifteen captures in `.impeccable/review/work-items/` were visually inspected: page, task, report, meeting and risk, each in desktop, mobile and Arabic variants.

The detector reported advisory font-size differences only. Work Items uses local sizes (1.75rem heading; 1rem record title; 0.9rem metadata; 0.95rem form text) outside the root document's scoped ramp. Existing launcher/shortcut sizes (1.4rem, 1.3rem and 0.75rem) also differ from that ramp. The root system already records green legacy primary-alpha fills alongside copper opaque primary. These differences are reported without changing styles or promoting them into new system tokens; no system change was approved.
