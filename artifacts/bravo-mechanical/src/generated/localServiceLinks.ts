// Generated from src/content/localLandingPages.json. Keep this compact index in
// runtime parent pages so they do not import the full local editorial dataset.
export type LocalServiceLink = {
  parentServicePath: string;
  path: string;
  label: string;
};

export const LOCAL_SERVICE_LINKS: readonly LocalServiceLink[] = [
  { parentServicePath: "/services", path: "/services/hvac-installation/yonkers", label: "HVAC Installation in Yonkers" },
  { parentServicePath: "/services", path: "/services/hvac-installation/white-plains", label: "HVAC Installation in White Plains" },
  { parentServicePath: "/services", path: "/services/hvac-installation/new-rochelle", label: "HVAC Installation in New Rochelle" },
  { parentServicePath: "/services", path: "/services/hvac-installation/mount-vernon", label: "HVAC Installation in Mount Vernon" },
  { parentServicePath: "/services", path: "/services/hvac-installation/scarsdale", label: "HVAC Installation in Scarsdale" },
  { parentServicePath: "/services", path: "/services/hvac-repair/yonkers", label: "HVAC Repair in Yonkers" },
  { parentServicePath: "/services", path: "/services/hvac-repair/white-plains", label: "HVAC Repair in White Plains" },
  { parentServicePath: "/services", path: "/services/hvac-repair/new-rochelle", label: "HVAC Repair in New Rochelle" },
  { parentServicePath: "/services", path: "/services/hvac-repair/mount-vernon", label: "HVAC Repair in Mount Vernon" },
  { parentServicePath: "/services", path: "/services/hvac-repair/scarsdale", label: "HVAC Repair in Scarsdale" },
  { parentServicePath: "/services/hvac-maintenance-westchester-county-ny", path: "/services/preventive-maintenance/yonkers", label: "HVAC Maintenance in Yonkers" },
  { parentServicePath: "/services/hvac-maintenance-westchester-county-ny", path: "/services/preventive-maintenance/white-plains", label: "HVAC Maintenance in White Plains" },
  { parentServicePath: "/services/hvac-maintenance-westchester-county-ny", path: "/services/preventive-maintenance/new-rochelle", label: "HVAC Maintenance in New Rochelle" },
  { parentServicePath: "/services/hvac-maintenance-westchester-county-ny", path: "/services/preventive-maintenance/mount-vernon", label: "HVAC Maintenance in Mount Vernon" },
  { parentServicePath: "/services/hvac-maintenance-westchester-county-ny", path: "/services/preventive-maintenance/scarsdale", label: "HVAC Maintenance in Scarsdale" },
  { parentServicePath: "/services/indoor-air-quality-westchester-county-ny", path: "/services/indoor-air-quality/yonkers", label: "Indoor Air Quality in Yonkers" },
  { parentServicePath: "/services/indoor-air-quality-westchester-county-ny", path: "/services/indoor-air-quality/white-plains", label: "Indoor Air Quality in White Plains" },
  { parentServicePath: "/services/indoor-air-quality-westchester-county-ny", path: "/services/indoor-air-quality/new-rochelle", label: "Indoor Air Quality in New Rochelle" },
  { parentServicePath: "/services/indoor-air-quality-westchester-county-ny", path: "/services/indoor-air-quality/mount-vernon", label: "Indoor Air Quality in Mount Vernon" },
  { parentServicePath: "/services/indoor-air-quality-westchester-county-ny", path: "/services/indoor-air-quality/scarsdale", label: "Indoor Air Quality in Scarsdale" },
];

export const getLocalServiceLinksForParent = (parentServicePath: string) =>
  LOCAL_SERVICE_LINKS.filter((link) => link.parentServicePath === parentServicePath);
