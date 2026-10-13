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
