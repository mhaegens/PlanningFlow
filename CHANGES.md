# Content update — 12 October 2026

The explorer now distinguishes two supply-planning designs while retaining MTS, MTO and CTO as separate fulfilment choices.

- **IBP supply + S/4 execution:** MTS plans finished variants and lower levels; CTO plans common modules and shared network constraints. The walkthrough hands accepted OBP planned orders to S/4 for scheduling and execution. MTO shows the shared component/capacity outlook without assuming advance stock.
- **S/4-led planning:** the earlier PP/MM-led forecast/PIR/MRP route remains available as a narrower alternative.
- **MTO confirmation:** the sales-order request initiates SBC; PP/DS simulates supply for the new requirement before aATP confirms a feasible quantity/date. The simulation is not a full plant-wide MRP rerun or a physical stock receipt.
- **Planning ownership:** the integrated OBP example leaves additional PIR transfer out. This is an explicit example choice, not a rule that planned orders and PIRs cannot coexist; real demand mapping, netting and ownership must be agreed.
- **Configured products:** explanations cover PPAC/CDP, release-dependent support and the need to validate the selected VC/AVC configuration route.
- Comparison tables, application responsibilities, quantities and SAP Help links reflect these changes. The tool remains an illustrative teaching model without a live SAP connection or a lead-time optimizer.

Outstanding Canon design choices: actual IBP supply scope, system/material/horizon ownership, integration mapping, and the configured-product confirmation route supported by the target SAP release.
