# Verification — 12 October 2026

- All 11 application files match published source commit `fb5a912a8b02cab3cc8481780d07051a373126c3` byte for byte.
- All three JavaScript files pass syntax checks; the source diff has no whitespace errors.
- Browser model checks: 72 combinations of fulfilment scenario, supply-planning design, configurator, order quantity and module selection; 1,068 journey stages checked.
- Quantities remain nonnegative; MTO simulation precedes confirmation and physical receipt; the IBP handover example has no extra S/4 PIR transfer; delivered orders have no open quantity.
- All 123 diagram nodes across the six fulfilment/planning routes open their explanation correctly.
- Playback, pausing for explanations, route reset, comparison, reference search and demand-lab calculations pass.
- No connector crosses an unrelated node; no node text overflows. Layout checked at 390, 768 and 1,440 pixels, including zoom and fullscreen.
- No browser script errors or failed asset requests occurred.
- These checks validate the illustrative website, not a configured SAP implementation or optimizer.
- Docker and Nginx are not installed in the preparation environment. The container build and health check remain untested here; use README.md or the first Coolify deployment to verify them.
- Coolify runs independently of the Sites publication. A source push or this package alone does not verify a successful deployment at cpp.haegens.be; check the deployed application and health endpoint after rollout.
