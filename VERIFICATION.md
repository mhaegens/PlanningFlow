# Demand lab verification — 14 October 2026

- Original printer arithmetic: 23,064 combinations pass.
- Revised independent IBP/S/4 matching: 46,128 combinations across every integer forecast/order value from 0 to 30, all three modes, both eligibility settings in each system, and all four events.
- Module arithmetic: 253,704 combinations across every forecast/order value, eleven attachment rates, both module choices, three production-requirement stages and four events. Conservation, nonnegative residuals, matching-only consumption, module selection and explicit cancellation retention pass.
- 240 rendered browser states checked through the actual inputs/events. Presets, zero inputs, forecast-only display, independent matching and module-stage results pass; no script errors occur.
- Customer-guide replay preserves the new matching and production-stage controls. The calculation-scope popup resolves four official SAP sources.
- Desktop/tablet/phone layouts checked at 1,440, 768 and 390 pixels. Module columns scroll within their panel; there is no page overflow.
- Source and changed scripts pass syntax/diff checks. Existing password-gate server code is unchanged.
- The checks cover the explicitly bounded teaching model. Actual SAP master data, integration timing, daily consumption windows, multi-order allocation, supply and capacity are outside this lab.

---

# Getting-started guide verification — 13 October 2026

- All 14 guided steps checked at 390, 768 and 1,440 pixels. Highlight and card remain inside the viewport without overlapping or page overflow.
- First-visit invitation, remembered completion/skip, header/footer replay, Back/Next, arrow keys, Escape and focus containment pass.
- Non-default scenario/configurator/supply/underlay/order and Demand lab settings, reference search and scroll position survive a replay and early dismissal. Guide navigation does not advance order playback.
- Guide works when browser preference storage is unavailable. Existing disclaimer popup remains functional. No browser script errors occurred.
- Reviewed desktop, tablet and phone screenshots. Guide and app scripts pass syntax checks.
- Guide scripts/styles return HTTP 401 before login. The guide appears only after authentication; the header fits at 390 × 844 pixels with both Getting started and Sign out.

---

# Footer disclaimer verification — 13 October 2026

- Disclaimer opens from the footer on all five pages in the existing native dialog.
- Escape and the close button dismiss the popup; keyboard focus returns to the footer trigger. Model assumptions still opens correctly.
- The SAP legal source link and errors/omissions wording are present; long text scrolls within the popup.
- Footer and popup layouts checked at 390, 768 and 1,440 pixels, with no page overflow or browser script errors.
- Only frontend copy, footer styling and documentation changed. The server-side password gate and proxy handling remain unchanged.

---

# Reader-facing content audit — 13 October 2026

- Reviewed 2,756 rendered or generated content entries, including all five pages, 24 explanation definitions, application-role popups, glossary, diagram-node explanations and step text across scenario/configurator/planning/scope variants.
- No internal briefing versions, transcript/session provenance, source-document references or named feedback contributors remain in the served explorer copy.
- All five application scripts pass syntax checks. Browser audit reported no script errors.
- Official SAP documentation links and the explicit illustrative assumptions remain available.
- This update changes explanatory copy; the password-gate implementation remains in place.

---

# Password-gate verification — 13 October 2026

- Eight automated server tests pass: required password / fail-closed startup; anonymous file denial; CSRF/origin checks and safe errors; login/session creation and redirect validation; logout revocation; idle/absolute expiry; attempt limits; production HTTPS and Secure host-bound cookies.
- Browser checks pass: real app absent before login; incorrect-password feedback; Show password; returning to the requested section; HttpOnly session; authenticated diagram popups and underlays; sign-out; direct file denial; browser-history return to the gate.
- Login and authenticated layouts checked at 390, 768 and 1440 pixels with no page overflow or browser script errors.
- Public preview PNG was created from a synthetic layout without private diagram or order data. Real explorer files are served only after server authorization.
- The five v5 browser application scripts remain unchanged. Server and gate scripts pass syntax checks.
- Docker is unavailable locally, so the revised container build and Coolify rollout have not been executed here. The server itself was tested using Node.js 24.
- Activation requires setting `APP_PASSWORD` as a Coolify runtime secret and deploying with the Dockerfile build pack.

---

# Verification — v5, 13 October 2026

- All 13 application files match published source commit `54cfae67607e2aef2d76c08aaa38ed6ffe2bd83f` byte for byte, including completeness.js.
- All five JavaScript files pass syntax checks; local asset references resolve.
- Model checks cover 768 combinations of scenario, assembly scope, supply design, configurator, quantity, module selection, attachment rate and extra stock: 17,208 journey stages.
- Definitions and diagram coverage are complete; demand/PIR/physical quantities remain nonnegative. IBP supply handover does not invent an additional S/4 PIR.
- ATO final-assembly scope changes the promise basis. Module-only scope has basic assembly dates and no finite assembly-capacity result. MTO simulation precedes confirmation.
- Physical stock is not issued on confirmation. Delivery creation does not ship stock; PGI records the shipment and clears the example order quantity.
- 532 diagram-node interactions across both configuration engines and both supply designs open valid explanations. Optional capability popups do not advance the order or alter stock.
- Underlay controls, faded-node explanations, difference lists, primary playback, swapping and visibility settings pass. Connector routing was checked against both models for 192 comparison/scope/engine/supply/quantity combinations with no crossings through unrelated nodes.
- IBP controls, comparison route links, reference search, demand-lab calculations and fullscreen pass. Both tables have equal scenario-column widths; node text does not clip.
- Responsive layouts checked at 390, 768 and 1,440 pixels. No browser script errors or failed local asset requests occurred.
- These checks validate the illustrative explorer, not a configured SAP implementation, optimizer, service target or production lead-time result.
- Docker and Nginx are unavailable in this preparation environment, so the unchanged container build/health check were not executed locally.
- Sites publication succeeded. A Coolify source push does not independently verify custom-domain rollout; check the deployed application and /healthz after deployment.
