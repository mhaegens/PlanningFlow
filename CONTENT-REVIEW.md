# Product checks and reference-design choices

The business concepts from the expert session are incorporated. Some v4 product statements were refined before publication:

1. **ATO and CTO can coexist.** ATO describes the stock point and fulfilment; CTO describes customer configuration. Engineering a new product is not implied by CTO. The illustrated ATO route uses linked assembly supply; the CTO reference uses post-order planning while retaining common-module stock.
2. **CU80 / CBF are not an IBP forecasting transaction.** The supplied CBF link documents SAP APO. CU80 is classic configuration reporting. The explorer describes attachment rates through the agreed IBP planning data and structures, and separately links current IBP characteristics-based planning.
3. **Component availability is not automatically a finite-capacity check.** The documented classic configurable assembly-processing route checks top-level components. The reference adds explicit material/resource-date validation in the agreed PP/DS scope and avoids promising an immediate date for every order.
4. **Assembly type and checking method are separate.** Static assembly processing gives a 1:1 link; dynamic processing allows a looser relationship. Strategy 81/82 alone does not guarantee every AVC/PP/DS/aATP combination.
5. **Safety stock, forecast demand and physical inventory differ.** The extra-stock selector is a manual teaching example. No IBP optimization result, calculated service percentage or safety-time target is fabricated.
6. **PIR versus planned-order handover is explicit.** The S/4 route integrates demand as PIRs and treats stock policy separately. The OBP route hands over supply proposals and leaves additional PIR transfer out of this example. Other real integration designs need aligned demand mapping, netting and ownership.
7. **Planning horizon and migration scope need actual configuration.** There is no universal 16-week MRP limit. The ECC LIS/SOP/BW/Excel discussion is not used to assert that every transaction disappears in every S/4 edition.
8. **Capability scope follows business value.** Inventory optimization, demand sensing, response planning and DDR are choices to assess, rather than an assumed minimum software purchase for Canon.

## Official documentation

- [Settings for assemble-to-order](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/21aead0c98bd4755abdacd91c99e3393/3777b6535fe6b74ce10000000a174cb4.html)
- [Availability check in assembly processing](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/21aead0c98bd4755abdacd91c99e3393/6877b6535fe6b74ce10000000a174cb4.html)
- [Assemble-to-order with variant configuration](https://help.sap.com/docs/SAP_ERP_SPV/a0d3efbac8b14fc89b29bf47a1677c86/b931bf53d25ab64ce10000000a174cb4.html?version=6.17.28)
- [CBF in SAP APO](https://help.sap.com/docs/SAP_ADVANCED_PLANNING_AND_OPTIMIZATION%2C_ON_SAP_ERP/c95f1f0dcd9549628efa8d7d653da63e/efa3b850c418ef5ee10000000a44538d.html)
- [CU80 in classic configuration maintenance](https://help.sap.com/docs/SAP_ERP/666b7ae6edfe4c05a90ac0150637f964/6d76b6535fe6b74ce10000000a174cb4.html?version=6.06.latest)
- [Characteristics-based planning in IBP](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/c1fb60cb1e9c49d99ada277ae57e9e6c/90fa5ebfd90940ddab8dbfab1dc4f4a9.html)
- [IBP inventory optimization](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/8fce80549f42054ee10000000a423f68.html)

Confirm with Canon: actual decoupling point, module segmentation, forecast/PIR mapping, buffer objective, planning ownership/horizon and supported assembly/configuration/confirmation route.
