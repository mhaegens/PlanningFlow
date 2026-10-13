# Customer getting-started guide — 13 October 2026

- Added a first-visit invitation and a 14-step customer guide with real control highlights, Next/Back, Skip, Escape and keyboard navigation.
- Covers scenario selection, planning handovers, example inputs, ATO assembly scope, order playback, diagram explanations, comparison underlay, demand versus stock, Demand lab, IBP planning, Compare, Reference and the footer assumptions/disclaimer.
- Getting started remains available in the header and footer; a completed or skipped guide is remembered in this browser. No account record or analytics service is used.
- The guide temporarily shows a standard ATO example and restores the previous view, settings, order position, search, diagram zoom and scroll position when closed. Playback stays paused.
- Existing scenarios, process calculations, disclaimers and server-side password access remain in place.

---

# Footer disclaimer — 13 October 2026

- Added a Disclaimer link beside Model assumptions in the shared footer, using the same accessible popup.
- Adapted the supplied SAP presentation wording for the website: illustrative models and quantities, possible errors or omissions, validation before use, existing agreements, future statements, confidentiality and trademark ownership.
- Included the limits for intentional misconduct, gross negligence and liability that cannot lawfully be excluded. The wording does not guarantee an exemption from liability.
- Linked the official SAP legal notice for materials. This is separate from model assumptions and contains no internal briefing references.

---

# Reader-facing copy cleanup — 13 October 2026

- Removed internal briefing versions, source-document mentions and preparation-session provenance from the explorer, its popups and expandable notes.
- Rewrote the CTP / SBC, module-mix, IBP and example-scope explanations so they stand on their own.
- Removed an unrelated Transportation Management research aside and its link from the reader-facing reference list.
- Kept the applicable official SAP links and the process-model assumptions readers need.
- Audited all five pages, explanation and application-role popups, glossary terms, diagram-node text and scenario-specific steps: 2,756 entries, with no internal-briefing references found.

---

# Password-gate update — 13 October 2026

- Replaced Nginx-only static serving with a small Node.js server. `APP_PASSWORD` is required as a runtime variable in Coolify; missing configuration fails closed.
- Added a Canon-branded login card over a public, pre-blurred synthetic layout image. The real explorer is not loaded underneath the gate.
- Protected all explorer HTML, scripts and assets with expiring server-side sessions. Added sign-out, CSRF/origin checks, attempt limiting, secure cookies and no-store responses.
- Preserved the v5 explorer content, diagrams, interactions and all existing models. The server inserts the sign-out control at render time.
- Removed the Static build-pack alternative. The Dockerfile server is now required for password enforcement.

---

# V5 completeness update — 13 October 2026

The supplied v5 complete reference is incorporated into the existing explorer. ATO remains the opening Canon reference; prior IBP, mix/buffer, supply-ownership and underlay functions remain available.

- All four fulfilment references show the full VC or AVC master-data chain: configurable material/class 300, profile and planning strategy, dependencies, super-BOM/routing and manufacturing source/PDS. AVC modelling/simulation/trace tools are explicit. No operational AVC lanes are replaced with “unchanged” stubs.
- Availability now shows the initial material or supply-creation check, the customer confirmation and optional PAL, ABC and BOP branches. They are deliberately not a compulsory serial pipeline.
- Order-driven routes show an explicit capacity-feasible promise basis. MTO retains SBC + PP/DS; CTO plans before confirming. The older CTP term is explained separately.
- ATO can switch between module-only PP/DS scope and modules plus final assembly. Module-only scope uses basic assembly lead time and does not claim finite final-assembly capacity.
- Outbound delivery creation/picking, PGI and billing are separate playback milestones. Stock and shipped quantities change at PGI, not delivery creation. Accounting/actuals and applicable cost settlement are visible.
- pMRP is an optional upstream simulation for forecast-driven scope, including prebuilt modules in the chosen CTO reference.
- A new coverage matrix describes shared layers, deliberate scenario differences, optional capabilities and the eight complete diagram routes.
- Comparison tables now use equal scenario-column widths.

Product clarifications and sources are recorded in CONTENT-REVIEW.md. Browser checks are in VERIFICATION.md.

---

# Content update — 13 October 2026

The explorer uses the supplied v4 reference and the IBP expert preparation-session transcript. Raw source documents and meeting chatter are not included in the website.

- Assemble-to-Order is the opening Canon reference: common modules in anonymous stock; final assembly after the customer order. A linked assembly-order example is shown and kept distinct from generic order-driven planning.
- All four scenarios (ATO, MTS, MTO and CTO) appear in the overview, comparison and diagram controls. ATO and CTO can overlap; diagrams compare explicit reference routes.
- A comparison underlay shows a selected second scenario washed out in the same application lanes. Matching labels appear once; changed or exclusive steps remain visible and clickable. The user can swap models and adjust visibility.
- IBP steps now cover history, volume, module mix, S&OP, stock policy, supply handover and next-cycle feedback. A dedicated IBP planning view expands those responsibilities.
- Module-mix and extra-stock controls change module targets and actual stock accounting. Shortfalls add the appropriate planning/receipt steps; stock is issued only at the component-issue stage.
- The S/4-supply route is the opening handover, matching the v4 diagram emphasis. IBP order-based supply remains selectable. Both retain upstream planning decisions.
- MTO still shows SBC + PP/DS before confirmation. Configured-product and assembly-processing support must match the selected edition/release and integration.

See CONTENT-REVIEW.md for product terminology corrections and the remaining Canon design choices.
