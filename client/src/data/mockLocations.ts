import type { Floor, Location, LocationCategory, LocationScope, LocationType, Site } from "@/types/index";
import { floorsBySite, siteAccounts } from "@/data/echoConfig";

export const siteNames = ["Noel", "Macias", "Consuelo"] as const;

const siteId = (site: string) => `site-${slug(site)}`;
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const accountFloors: Record<string, string> = {
  Ashley: "2nd Floor",
  "Ashley Support": "3rd Floor",
  Wyze: "3rd Floor",
  Papaya: "3rd Floor",
  "Resident Home": "4th Floor",
  Walmart: "Ground & 5th Floor",
  Bubble: "5th Floor",
  Clearwater: "5th Floor",
  Flex: "6th Floor",
  Earnin: "Ground Floor",
  Homebase: "2nd Floor",
  Minoan: "2nd Floor",
  ILS: "3rd Floor",
};

export const mockSites: Site[] = siteNames.map((site) => ({
  id: siteId(site),
  name: site,
  address: `${site} Campus, Dumaguete, Philippines`,
  floors: floorsBySite[site].map<Floor>((floor, floorIndex) => ({
    id: `${siteId(site)}-${slug(floor)}`,
    name: floor,
    level: floorIndex + 1,
    siteId: siteId(site),
  })),
  isActive: true,
}));

type LocationSeed = {
  name: string;
  site: (typeof siteNames)[number];
  scope: LocationScope;
  floor?: string;
  account?: string;
  type: LocationType;
  category: LocationCategory;
  categoryGroup: string;
  description: string;
};

function location(seed: LocationSeed, index: number): Location {
  return {
    id: `${slug(seed.site)}-${slug(seed.name)}`,
    name: seed.name,
    type: seed.type,
    siteId: siteId(seed.site),
    siteName: seed.site,
    floor: seed.floor ?? (seed.scope === "site-wide" ? "Site-wide" : seed.scope === "department-service" ? "All floors" : "Shared floor"),
    scope: seed.scope,
    account: seed.account,
    category: seed.category,
    categoryGroup: seed.categoryGroup,
    description: seed.description,
    isActive: true,
    kioskIds: [`KSK-${String((index % 50) + 1).padStart(3, "0")}`],
    qrCode: `ECE-${seed.site}-${seed.name}`.replace(/\s+/g, "-").toUpperCase(),
    coordinates: { x: 10 + ((index * 19) % 80), y: 12 + ((index * 23) % 76) },
    alertThreshold: 60,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const noelShared: LocationSeed[] = [
  { name: "Noel Main Elevator", site: "Noel", scope: "site-wide", type: "elevator", category: "Facilities", categoryGroup: "Facilities", description: "Only elevator for the entire Noel site." },
  { name: "Noel Pantry - 5th Floor", site: "Noel", scope: "floor-shared", floor: "5th Floor", type: "pantry", category: "Facilities", categoryGroup: "Facilities", description: "Single pantry area for the Noel site, located on the 5th floor." },
  { name: "Noel IT Helpdesk", site: "Noel", scope: "department-service", type: "helpdesk", category: "IT", categoryGroup: "IT / Technical", description: "Supports all stations, floors, accounts, and departments across ECE." },
  { name: "Noel Security Desk", site: "Noel", scope: "department-service", type: "security-desk", category: "Security", categoryGroup: "Security", description: "Security desk covering the entire Noel site." },
  { name: "Noel Recruitment Area", site: "Noel", scope: "site-wide", type: "recruitment", category: "Recruitment", categoryGroup: "Recruitment / Applicant", description: "Recruitment area serving applicants and hiring operations." },
  { name: "Noel Smoking Area", site: "Noel", scope: "site-wide", type: "smoking-area", category: "Facilities", categoryGroup: "Facilities", description: "Shared smoking area for Noel employees and approved visitors." },
  { name: "Noel Visitor Welcome Area", site: "Noel", scope: "site-wide", type: "visitor-welcome", category: "Visitor", categoryGroup: "Visitor / Client", description: "Reception and welcome touchpoint for clients and visitors." },
  { name: "Noel Training Room", site: "Noel", scope: "floor-shared", floor: "Training Area", type: "training-room", category: "Training", categoryGroup: "Training", description: "Shared training room for onboarding and learning sessions." },
  { name: "Noel WiFi / Internet Service", site: "Noel", scope: "department-service", type: "server-room", category: "IT", categoryGroup: "IT / Technical", description: "Site-level internet, WiFi, VPN, and connectivity feedback channel." },
  { name: "Noel AC / Facilities Service", site: "Noel", scope: "department-service", type: "custom", category: "Facilities", categoryGroup: "Facilities", description: "Site-level AC temperature and facilities service feedback channel." },
];

const noelRestrooms: LocationSeed[] = ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor"].map((floor) => ({
  name: `Noel ${floor} Restroom`,
  site: "Noel" as const,
  scope: "floor-shared" as const,
  floor,
  type: "restroom" as const,
  category: "Facilities" as const,
  categoryGroup: "Facilities",
  description: `Shared restroom feedback for Noel ${floor}.`,
}));

function productionLocations(site: keyof typeof siteAccounts): LocationSeed[] {
  return siteAccounts[site].map((account) => ({
    name: `${account} Production Area`,
    site,
    scope: "account-specific" as const,
    floor: accountFloors[account] ?? "Production Floor",
    account,
    type: "production-floor" as const,
    category: "Operations" as const,
    categoryGroup: "Production Floor",
    description: `${account} account production area only.`,
  }));
}

function sharedSiteLocations(site: "Macias" | "Consuelo"): LocationSeed[] {
  return [
    ["Pantry", "pantry", "Facilities", "Facilities", "Shared pantry area for the site."],
    ["Restrooms", "restroom", "Facilities", "Facilities", "Shared restroom feedback for the site."],
    ["IT Support", "helpdesk", "IT", "IT / Technical", "IT support service for all accounts and floors."],
    ["Security Desk", "security-desk", "Security", "Security", "Security desk and entrance assistance for the full site."],
    ["Recruitment / Visitor Area", "visitor-welcome", "Recruitment", "Recruitment / Applicant", "Shared recruitment, visitor, and client welcome area."],
    ["Training Area", "training-room", "Training", "Training", "Shared training and coaching area."],
    ["Smoking Area", "smoking-area", "Facilities", "Facilities", "Shared smoking area."],
    ["Entrance / Reception", "reception", "Visitor", "Visitor / Client", "Entrance, reception, and first-impression feedback."],
    ["WiFi / Internet Service", "server-room", "IT", "IT / Technical", "Site-wide internet and WiFi service feedback."],
    ["AC / Facilities", "custom", "Facilities", "Facilities", "Site-wide AC comfort and facilities support feedback."],
  ].map(([label, type, category, categoryGroup, description]) => ({
    name: `${site} ${label}`,
    site,
    scope: label.includes("IT") || label.includes("WiFi") || label.includes("AC") ? "department-service" : "site-wide",
    type: type as LocationType,
    category: category as LocationCategory,
    categoryGroup,
    description,
  }));
}

const allSeeds: LocationSeed[] = [
  ...noelShared,
  ...noelRestrooms,
  ...productionLocations("Noel"),
  ...sharedSiteLocations("Macias"),
  ...productionLocations("Macias"),
  ...sharedSiteLocations("Consuelo"),
  ...productionLocations("Consuelo"),
];

export const mockLocations: Location[] = allSeeds.map(location);
