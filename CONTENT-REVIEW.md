# Demand lab correctness review — 14 October 2026

The printer-level arithmetic passed the original 23,064 combinations. The review found misleading states and insufficient separation of module timing; the following corrections are now applied:

1. IBP and S/4 consumption eligibility are independent controls. The shown variant/location and forecast/PIR reference quantities stay fixed for the comparison. Totals without an eligible match span the example horizon and do not imply a common requirement date.
2. Forecast-only IBP has no order input or order-aware total. It is not described as waiting for integration, and its matching control is disabled. Zero-demand cases no longer contain contradictory “10, not 10” text.
3. The separate strategy-70 module example distinguishes configured future need, a production requirement, consumed PIR and residual PIR. Sales-order arrival and IBP integration alone consume no module PIR. An explicitly selected eligible production requirement consumes the matching module PIR; an unmatched requirement does not.
4. The customer cancellation event removes the customer requirement after updates/recalculation. It does not change the independent module production-stage selector. A retained production requirement remains visible until that stage is changed; real linked-order and firm-supply cancellation must be validated separately.
5. The calculation-scope popup states the limits: one order/forecast pool before shipment; no actual dates, daily sequencing, multiple-order allocation, partial-window overlap, physical stock netting or capacity result. OBP assumes forecasts and orders are both selected in the planning run. Other demand selections can behave differently.

Official checks:

- [Time-series consumption profile inputs and outputs](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/feae3cea3cc549aaa9d9de7d363a83e6/6b6f48f2887e4a358242b6a7352441a5.html)
- [OBP consumption/reduction and planning-run demand selections](https://help.sap.com/docs/SAP_INTEGRATED_BUSINESS_PLANNING/c1fb60cb1e9c49d99ada277ae57e9e6c/4d3429bbdaac417dbe16af9886fa15fc.html)
- [Strategy 40](https://help.sap.com/docs/SAP_S4HANA_CLOUD/2bba750d1e124e1ea2a039bb1cd9b6c5/3923bf53d25ab64ce10000000a174cb4.html)
- [Strategy 70](https://help.sap.com/docs/SAP_S4HANA_CLOUD/2bba750d1e124e1ea2a039bb1cd9b6c5/4223bf53d25ab64ce10000000a174cb4.html)

These checks validate the bounded teaching example, not Canon's actual SAP configuration or interfaces.

---

# V5 product checks and reference-design choices

V5 adds useful coverage, but some statements need qualification before appearing in a process reference:

1. **PAL / ABC / BOP are capabilities, not four mandatory order-entry steps.** PAL can restrict allocation, ABC evaluates permitted alternatives and BOP rechecks existing confirmations after demand/supply changes. The diagram separates these optional branches. SBC checking-route restrictions, including ABC with CDP, are noted.
2. **CTP terminology is not a second mandatory S/4 run.** The linked SAP CTP documentation describes SAP APO Global ATP. The modern S/4 aATP example uses SBC + PP/DS and the returned material/resource result. CTO's shown route plans first; ATO needs a validated assembly-processing/confirmation integration.
3. **Finite scope is a design choice.** Both ATO scopes prebuild modules in PP/DS; only the full scope includes final printer assembly and its finite resources. Using PP/DS alone does not make every resource finite. Canon's actual assembly bottleneck and promised lead time remain to be validated.
4. **Capacity Availability Settings is not evidence of finite printer assembly.** The similarly named SAP Help app is documented under Transportation Management. V5's 68A claim is not used as an assembly-capacity substitute.
5. **pMRP follows forecast scope.** The chosen CTO reference prebuilds common modules, so an upstream pMRP simulation can be evaluated too. The MTO teaching example has no advance stock; long-lead/common-part preplanning is a separate valid design.
6. **Delivery creation, PGI and billing differ.** The example's printer stock leaves at PGI. Settlement depends on the cost-object/accounting design; it is not universal financial closure at invoice creation.
7. **AVC tools have a defined role.** Verified modelling, Fiori valuation, simulation and trace functions are shown. No generic configuration-history claim is used as a planning capability.
8. **Previous factual corrections remain.** ATO can overlap CTO; CU80/CBF naming, attachment-rate ownership, PIR versus planned-order integration, safety stock versus demand and configurable MRP horizons remain as clarified below.

## Additional official documentation

- [aATP capabilities](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/00497dff45fa4c50b11be4c653de094d.html)
- [BOP](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/73a1a457ef816b10e10000000a441470.html)
- [SBC supported checking routes and restrictions](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/f132c385e0234fe68ae9ff35b2da178c/95cbb18b60da470cac8d340f0c6f5251.html)
- [CTP in SAP APO](https://help.sap.com/saphelp_scm700_ehp02/helpdata/en/12/42c95360267614e10000000a174cb4/content.htm?no_cache=true)
- [Capacity availability settings in Transportation Management](https://help.sap.com/docs/SAP_S4HANA_CLOUD/61e246f4b34c4e1790d8b7651c0b40a8/d05be7c0ad6d4378bccde8fb8e941abc.html)
- [pMRP](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/21aead0c98bd4755abdacd91c99e3393/61d3f1634dae44608b46b79e36d77dfb.html)
- [Planning assemblies with pMRP](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/feded183701e4ba0b42bc4fc31ad7a12/0e98e873dd4543389a84a7e76138f953.html)
- [AVC tools](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/36802406aebb4b96b1598246e1d316ee/76276945f5d24a119ff4aeaca6ded355.html)
- [AVC model trace](https://help.sap.com/docs/SAP_S4HANA_CLOUD/f369b2eff700401494ba6e7c9a573288/37e5ba48435348d0b42f3b88fcc21fee.html)

---

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
