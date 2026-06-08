import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { websiteMarketReadiness } = await import(pathToFileURL(path.join(root, "src", "websiteMarketReadiness.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  buyerJourneyCount: websiteMarketReadiness.buyerJourneys.length,
  trustSignalCount: websiteMarketReadiness.trustSignals.length,
  conversionActionCount: websiteMarketReadiness.conversionActions.length,
  buyerJourneys: websiteMarketReadiness.buyerJourneys,
  trustSignals: websiteMarketReadiness.trustSignals,
  conversionActions: websiteMarketReadiness.conversionActions,
};

const markdown = `# FCA Website Market-Readiness Report\n\n- Generated at: ${generatedAt}\n- Buyer journeys: ${report.buyerJourneyCount}\n- Trust signals: ${report.trustSignalCount}\n- Conversion actions: ${report.conversionActionCount}\n\n## Buyer Journeys\n${websiteMarketReadiness.buyerJourneys.map((journey) => `- **${journey.title}** (${journey.audience}) → ${journey.route}`).join("\n")}\n\n## Trust Signals\n${websiteMarketReadiness.trustSignals.map((signal) => `- **${signal.title}** — ${signal.detail}`).join("\n")}\n\n## Conversion Actions\n${websiteMarketReadiness.conversionActions.map((action) => `- **${action.title}** → ${action.href}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "website-market-readiness-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "website-market-readiness-report.md"), markdown);

console.log(`Generated website market-readiness report with ${report.buyerJourneyCount} buyer journeys, ${report.trustSignalCount} trust signals, and ${report.conversionActionCount} conversion actions.`);
