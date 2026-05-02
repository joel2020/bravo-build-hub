import { readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

const checks = [
  {
    route: "/services/ac-repair-westchester-county-ny",
    expected: [
      "<h1",
      "AC Repair",
      'rel="canonical"',
      "application/ld+json",
    ],
  },
  {
    route: "/services/boiler-repair-westchester-county-ny",
    expected: ["<h1", "Boiler", 'rel="canonical"', "application/ld+json"],
  },
  {
    route: "/services/emergency-hvac-repair-westchester-county-ny",
    expected: ["<h1", "Emergency HVAC", 'rel="canonical"', "application/ld+json"],
  },
  {
    route: "/contact",
    expected: ["<h1", "Contact", 'rel="canonical"', "application/ld+json"],
  },
  {
    route: "/company-facts",
    expected: ["<h1", "Company", 'rel="canonical"', "application/ld+json"],
  },
];

function routeToFilePath(route) {
  if (route === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, route.replace(/^\//, ""), "index.html");
}

async function main() {
  let hasErrors = false;

  for (const check of checks) {
    const filePath = routeToFilePath(check.route);
    let html;
    let checkFailed = false;

    try {
      html = await readFile(filePath, "utf8");
    } catch (error) {
      hasErrors = true;
      console.error(`❌ Missing prerendered file for route ${check.route}: ${filePath}`);
      continue;
    }

    for (const token of check.expected) {
      if (!html.includes(token)) {
        hasErrors = true;
        checkFailed = true;
        console.error(`❌ Route ${check.route} missing expected content: ${token}`);
      }
    }

    if (!checkFailed) {
      console.log(`✅ ${check.route} passed`);
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
    return;
  }

  console.log("✅ Prerender validation completed successfully.");
}

main().catch((error) => {
  console.error("❌ Validation failed:", error);
  process.exitCode = 1;
});
