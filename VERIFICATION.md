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
