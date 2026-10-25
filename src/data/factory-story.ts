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
    purpose: "Used hard plastic containers enter at one end. Small grains of recycled plastic, called pellets, leave at the other.",
    decision: "The layout follows the plastic from arrival to shipping. Dirty containers, washing, clean pellets and trucks each have their own space. Water cleaning sits beside the wash area.",
    shot: { x: -8, z: 2, zoom: -1, el: 0.55, dur: 2.5 },
  },
  {
    id: "arrival",
    zone: "Arrivals",
    title: "Weigh and record every arrival.",
    purpose: "A truck drives onto a weighbridge (a large weighing scale built into the ground). The team records the weight of each load before unloading.",
    decision: "The scale sits at the entrance so every delivery has a recorded starting point. That record later connects the incoming plastic to the pellets made from it.",
    spot: "weighbridge",
    shot: at("weighbridge", 2.3, -0.2),
  },
  {
    id: "yard",
    zone: "Arrivals",
    title: "Hold incoming plastic separately.",
    purpose: "Plastic arrives in compressed bundles called bales (tightly packed blocks wrapped in wire). The team keeps bales from different suppliers and plastic types apart until they are checked.",
    decision: "Storage sits beside unloading and sorting. Incoming, dirty plastic does not have to cross the clean-product area. A real site will determine its cover and drainage needs.",
    spot: "baleYard",
    shot: at("baleYard", 2.5, 0.15),
  },
  {
    id: "sorting",
    zone: "Sort & clean",
    title: "Protect quality before the machines.",
    purpose: "People and simple checks remove the wrong plastics, metal and heavily soiled pieces.",
    decision: "Sorting comes first inside the building. Wrong material can leave early instead of wasting water, electricity and machine time.",
    spot: "sorting",
    shot: at("sorting", 2.9, -0.1),
  },
  {
    id: "shredding",
    zone: "Sort & clean",
    title: "Cut containers into even pieces.",
    purpose: "A shredder (cutting machine) turns accepted containers into small pieces called flakes — roughly the size of a fingernail. Similar-sized pieces are easier and more uniform to wash.",
    decision: "Shredding follows sorting so only accepted plastic reaches the machine. Its edge stays accessible for cleaning and repairs, with washing next door.",
    spot: "shredder",
    shot: at("shredder", 3.6, -0.25),
  },
  {
    id: "washing",
    zone: "Sort & clean",
    title: "Wash dirt away before melting.",
    purpose: "The wash machines clean the flakes and help remove material that does not belong in the final product.",
    decision: "All water-using machines sit together. That makes it easier to collect used water, clean the floor and return treated water to washing.",
    spot: "wash",
    shot: at("wash", 3.1, -0.12),
  },
  {
    id: "water",
    zone: "Sort & clean",
    title: "Clean and reuse wash water.",
    purpose: "Used wash water goes through an ETP (Effluent Treatment Plant) — a system that cleans the dirty water so it can be safely reused or released. Water that passes the required checks returns to the wash line.",
    decision: "The ETP (water cleaning system) has its own service space beside the wash area, away from finished pellets. Tests of the real wastewater and local permissions will determine the exact equipment needed.",
    spot: "etp",
    shot: at("etp", 2.5, 0.2),
  },
  {
    id: "drying",
    zone: "Make pellets",
    title: "Dry the clean pieces.",
    purpose: "The washed flakes must be dried before they are melted, so water does not damage the final plastic.",
    decision: "A small holding space after drying lets washing or melting pause briefly without immediately stopping the whole plant.",
    spot: "dryer",
    shot: at("dryer", 3, 0.1),
  },
  {
    id: "extrusion",
    zone: "Make pellets",
    title: "Melt and filter the plastic.",
    purpose: "An extruder (a machine that melts plastic and pushes it through a filter like a very slow, powerful press) melts the dry flakes and forces the plastic through a screen to remove any remaining unwanted pieces.",
    decision: "This hot machine follows drying. The final layout must leave room for ventilation (air flow), electrical equipment and safe access for repairs.",
    spot: "extruder",
    shot: at("extruder", 3.1, 0.25),
  },
  {
    id: "pellets",
    zone: "Make pellets",
    title: "Make small, reusable plastic grains.",
    purpose: "The melted, filtered plastic is cut into pellets — small uniform grains, roughly the size of a lentil. These are the finished product: manufacturers buy pellets and melt them to make new plastic products.",
    decision: "Pellet making follows the melting machine directly. A short transfer reduces the chance that dirt or a different plastic mixes in.",
    spot: "pelletizer",
    shot: at("pelletizer", 3.2, 0.35),
  },
  {
    id: "quality",
    zone: "Check & pack",
    title: "Test each production lot.",
    purpose: "A production lot (a batch of pellets made together in one run under a single record) is tested against the quality specification (the exact properties the buyer agreed to accept — such as strength and purity).",
    decision: "Testing sits between production and storage. A lot moves into finished storage only after the team confirms it meets the agreed checks.",
    spot: "qc",
    shot: at("qc", 2.9, 0.25),
  },
  {
    id: "packing",
    zone: "Check & pack",
    title: "Label every accepted bag.",
    purpose: "Accepted pellets are weighed and packed into bags. Each bag is labelled with its lot number (a unique batch ID), so its origin, test result and the incoming plastic it came from can all be traced.",
    decision: "Packing is beside testing and storage. Bags move forward only when the test result and the label match.",
    spot: "packing",
    shot: at("packing", 2.8, 0.18),
  },
  {
    id: "storage",
    zone: "Check & pack",
    title: "Store finished bags away from scrap.",
    purpose: "Tested, labelled bags wait in a clean area until a buyer's truck collects them.",
    decision: "Finished storage sits near outgoing trucks and away from dirty arrivals, reducing unnecessary handling and mixing.",
    spot: "finishedGoods",
    shot: at("finishedGoods", 2.6, 0.1),
  },
  {
    id: "dispatch",
    zone: "Shipping",
    title: "Load the buyer's truck.",
    purpose: "Before shipping, the team creates a dispatch record — a list matching which tested, labelled bags are on the truck and which incoming deliveries (and production lots) they were made from. This is what makes our product fully traceable.",
    decision: "A separate outgoing loading point keeps clean bags away from incoming scrap. The shipping record matches the bags that physically leave.",
    spot: "dock",
    shot: at("dock", 2.7, -0.15),
  },
];

export const FACTORY_GATES = [
  {
    number: "01",
    title: "Prove the input and the buyer",
    body: "Collect real sample loads, sort and test them, then make sample pellets with an existing recycler. Ask buyers if they can use those pellets.",
    proof: "Test results for real plastic and written responses from buyers.",
  },
  {
    number: "02",
    title: "Fit the layout to a real site",
    body: "Before choosing a building, check whether trucks can enter, people can work safely, and there is enough floor space, water drainage, electricity and room for water cleaning.",
    proof: "Measurements of the site and a layout checked by qualified designers.",
  },
  {
    number: "03",
    title: "Turn the idea into a buildable design",
    body: "Engineers and equipment suppliers must draw the machines, building, electricity, water pipes and safety systems in detail. Obtain the required official permissions before installation.",
    proof: "Supplier drawings, water and power needs, and official permissions.",
  },
  {
    number: "04",
    title: "Install and test the plant",
    body: "Install machines, electricity and water treatment. Run real used plastic through the full line before selling any pellets.",
    proof: "Safe trial runs and repeated tests showing the pellets meet buyer needs.",
  },
  {
    number: "05",
    title: "Increase production carefully",
    body: "Make more pellets only while quality, cleaned water, worker safety and buyer acceptance stay consistent.",
    proof: "Repeat orders and records that link each bag to its tested production lot.",
  },
] as const;
