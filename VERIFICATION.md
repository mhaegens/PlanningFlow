# Verification — 13 October 2026

- All 12 application files match published source commit `6200002abca334827a347d649c29e1f5c602db02` byte for byte, including the new planning.js.
- All four JavaScript files pass syntax checks; all local asset references resolve.
- Browser model checks: 384 combinations of fulfilment scenario, supply design, configurator, quantity, module selection, attachment rate and buffer setting; 7,788 journey stages checked.
- ATO assembly supply precedes component checking and customer confirmation. Missing module supply is conditional; physical receipt and issue are distinct from forecast consumption and confirmation.
- Demand, PIR and physical quantities remain nonnegative; delivered order quantity clears. Extra stock changes supply targets without inflating the printer forecast.
- All 212 diagram nodes across the eight scenario/planning routes open their detail correctly.
- Underlay controls, faded-node explanations, difference lists, primary-model playback, swapping models and visibility settings pass.
- All 12 ordered scenario pairs checked; connector routing additionally checked against both models' boxes for 48 scenario/supply/quantity combinations, with no crossings through unrelated boxes.
- IBP controls, four-model comparison, reference search and demand-lab regression calculations pass.
- Responsive layout checked at 390, 768 and 1,440 pixels, plus fullscreen. No browser script errors or failed asset requests occurred.
- These checks validate the illustrative explorer, not a configured SAP implementation, optimizer, service target or production lead-time result.
- Docker and Nginx remain unavailable in the preparation environment, so the container build and health check were not executed locally.
- Coolify runs independently of the Sites publication. A source push alone does not verify a successful custom-domain deployment; check the deployed application and health endpoint after rollout.
