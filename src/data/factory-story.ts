import type { Shot } from "@/components/sim/three/camera-store";
import { SPOTS } from "@/components/sim/three/site";

export interface FactoryStop {
  id: string;
  zone: string;
  title: string;
  purpose: string;
  decision: string;
  spot?: string;
  shot: Shot;
}

const at = (spot: string, zoom = 2.4, az = 0): Shot => ({
  x: SPOTS[spot].x,
  z: SPOTS[spot].z,
  zoom,
  az,
  el: 0.58,
  dur: 2.2,
});

/** A proposed flow, told in the same order a first-time visitor would follow the material. */
export const FACTORY_STOPS: FactoryStop[] = [
  {
    id: "overview",
    zone: "The idea",
    title: "One site. One clear route.",
    purpose: "Used rigid plastic enters at one end. Tested, packed pellets leave at the other.",
    decision: "The layout follows the material, with separate places for incoming scrap, wet work, clean product and truck loading. The water loop runs alongside this route.",
    shot: { x: -8, z: 2, zoom: -1, el: 0.55, dur: 2.5 },
  },
  {
    id: "arrival",
    zone: "Receive",
    title: "Start with a recorded load.",
    purpose: "At the weighbridge, the team records each delivery before it is unloaded.",
    decision: "Putting this at the entry keeps unrecorded material out of the line and gives every future batch a starting point.",
    spot: "weighbridge",
    shot: at("weighbridge", 2.3, -0.2),
  },
  {
    id: "yard",
    zone: "Receive",
    title: "Hold incoming bales apart.",
    purpose: "Bales wait by material type and supplier until they are inspected and released to sorting.",
    decision: "The yard is beside unloading and sorting, so raw plastic need not cross the clean-product area. Its final cover and drainage depend on the site.",
    spot: "baleYard",
    shot: at("baleYard", 2.5, 0.15),
  },
  {
    id: "sorting",
    zone: "Prepare",
    title: "Protect quality before the machines.",
    purpose: "People and simple checks remove the wrong plastics, metal and heavily soiled pieces.",
    decision: "Sorting is first inside the shed. Rejects can leave early instead of using wash water, power and machine time.",
    spot: "sorting",
    shot: at("sorting", 2.9, -0.1),
  },
  {
    id: "shredding",
    zone: "Prepare",
    title: "Make the pieces even.",
    purpose: "The shredder cuts accepted containers into flakes that the wash line can handle consistently.",
    decision: "It sits directly after sorting, with a clear maintenance edge and a short handoff to washing.",
    spot: "shredder",
    shot: at("shredder", 3.6, -0.25),
  },
  {
    id: "washing",
    zone: "Clean",
    title: "Wash away what a buyer cannot use.",
    purpose: "The wash line removes dirt and separates material that behaves differently in water.",
    decision: "Wet work is grouped in one zone so drainage, cleaning and water piping can be designed together.",
    spot: "wash",
    shot: at("wash", 3.1, -0.12),
  },
  {
    id: "water",
    zone: "Clean",
    title: "Treat water as part of the plant.",
    purpose: "Used wash water would be collected, treated and returned where its quality allows.",
    decision: "A separate service yard keeps treatment away from finished pellets. Pipes return usable water to washing; sampled wastewater and permit conditions will set the final design.",
    spot: "etp",
    shot: at("etp", 2.5, 0.2),
  },
  {
    id: "drying",
    zone: "Convert",
    title: "Keep water out of the melt.",
    purpose: "Clean flakes are dried and held briefly before the hot process.",
    decision: "A buffer between washing and melting lets one area pause without immediately stopping the other.",
    spot: "dryer",
    shot: at("dryer", 3, 0.1),
  },
  {
    id: "extrusion",
    zone: "Convert",
    title: "Turn flakes into a steady material.",
    purpose: "The extruder melts and filters the flakes to make a more consistent product.",
    decision: "The hot line follows the dry zone, with room to plan ventilation, electrical service and safe maintenance access.",
    spot: "extruder",
    shot: at("extruder", 3.1, 0.25),
  },
  {
    id: "pellets",
    zone: "Convert",
    title: "Make pellets a factory can use.",
    purpose: "The filtered material is cut into pellets that can be packed and tested.",
    decision: "Pellet making follows extrusion without a long transfer, reducing another chance for mixing or contamination.",
    spot: "pelletizer",
    shot: at("pelletizer", 3.2, 0.35),
  },
  {
    id: "quality",
    zone: "Release",
    title: "Test before anything is sold.",
    purpose: "A sample from each batch is checked against the buyer's agreed material specification.",
    decision: "The quality area sits between production and finished storage, making release a deliberate gate.",
    spot: "qc",
    shot: at("qc", 2.9, 0.25),
  },
  {
    id: "packing",
    zone: "Release",
    title: "Pack with the batch identity attached.",
    purpose: "Accepted pellets are weighed and packed so each bag can be traced to its production batch.",
    decision: "Packing sits between the quality gate and finished storage. Product can move forward only after the result and label agree.",
    spot: "packing",
    shot: at("packing", 2.8, 0.18),
  },
  {
    id: "storage",
    zone: "Release",
    title: "Keep clean product clean.",
    purpose: "Released pellets are labelled, packed and kept apart from incoming scrap.",
    decision: "Finished storage is close to the loading dock and outside the dirty receiving route.",
    spot: "finishedGoods",
    shot: at("finishedGoods", 2.6, 0.1),
  },
  {
    id: "dispatch",
    zone: "Ship",
    title: "Close the record at dispatch.",
    purpose: "The outgoing load links back to its batch, test result and original delivery.",
    decision: "A dedicated loading point keeps the last step short and makes the product's paper trail match the physical flow.",
    spot: "dock",
    shot: at("dock", 2.7, -0.15),
  },
];

export const FACTORY_GATES = [
  {
    number: "01",
    title: "Prove the input and the buyer",
    body: "Collect sample loads, sort and test them, then make trial pellets with a partner. Ask buyers to confirm the quality they would purchase.",
    proof: "Real material tests and written buyer feedback.",
  },
  {
    number: "02",
    title: "Fit the layout to a real site",
    body: "Check truck access, usable floor space, fire access, drainage, power and room for water treatment before choosing a shed.",
    proof: "A site survey and a reviewed layout.",
  },
  {
    number: "03",
    title: "Engineer and permit the plant",
    body: "Turn the concept into equipment, electrical, water, safety and civil drawings. Obtain required approvals before installation.",
    proof: "Vendor drawings, utility balances and applicable consents.",
  },
  {
    number: "04",
    title: "Install and commission",
    body: "Build the wet and dry zones, connect treatment and utilities, then test the line with real feedstock before commercial operation.",
    proof: "Safe trial runs and repeatable product tests.",
  },
  {
    number: "05",
    title: "Ramp with control",
    body: "Increase volume only while quality, water treatment, worker safety and buyer acceptance remain consistent.",
    proof: "Repeat orders and batch records that reconcile.",
  },
] as const;
