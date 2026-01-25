import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { validateSettings } from "./config/settings.js";
import { listEndpoints, getEndpoint } from "./api/endpoints.js";
import { downloadFile } from "./api/files.js";

/**
 * Display overview of all endpoints
 */
export async function overview(): Promise<void> {
  const categories = await listEndpoints();

  console.log("\n📁 Endpoints Overview\n");
  console.log("─".repeat(50));

  let totalEndpoints = 0;

  for (const category of categories) {
    console.log(`\n${category.name}/`);

    for (const endpoint of category.endpoints) {
      console.log(`  └─ ${endpoint.slug}`);
      totalEndpoints++;
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`Total: ${categories.length} categories, ${totalEndpoints} endpoints\n`);
}

/**
 * Inspect an endpoint and show its metadata
 */
export async function inspect(endpointPath: string): Promise<void> {
  const details = await getEndpoint(endpointPath);

  console.log("\n📋 Endpoint Details\n");
  console.log("─".repeat(50));
  console.log(`Path:     ${details.endpoint.path}`);
  console.log(`Category: ${details.endpoint.category}`);
  console.log(`Slug:     ${details.endpoint.slug}`);
  console.log(`ID:       ${details.endpoint.id}`);
  console.log("─".repeat(50));
  console.log(`Total Items: ${details.totalItems}`);
  console.log(`  Old Metadata: ${details.metadata.oldMetadata.length}`);
  console.log(`  New Metadata: ${details.metadata.newMetadata.length}`);

  if (details.metadata.newMetadata.length > 0) {
    console.log("\n📝 Recent Metadata:\n");
    for (const item of details.metadata.newMetadata.slice(0, 3)) {
      console.log(`  ID: ${item.id}`);
      console.log(`  Created: ${item.createdAt}`);
      console.log(`  Data: ${JSON.stringify(item.data, null, 2).split("\n").join("\n  ")}`);
      console.log("");
    }
  }

  console.log("");
}

/**
 * Download a file by key
 */
export async function download(key: string, outputDir?: string): Promise<string> {
  const filename = path.basename(key);
  const outputPath = outputDir
    ? path.join(outputDir, filename)
    : path.join(process.cwd(), "results", filename);

  console.log(`\n📥 Downloading: ${key}`);

  const savedPath = await downloadFile(key, outputPath);

  console.log(`✓ Saved to: ${savedPath}\n`);

  return savedPath;
}

/**
 * Export endpoint data as JSON
 */
export async function exportEndpoint(endpointPath: string): Promise<string> {
  const details = await getEndpoint(endpointPath);

  const filename = `${details.endpoint.category}-${details.endpoint.slug}.json`;
  const outputPath = path.join(process.cwd(), "results", filename);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(details, null, 2));

  console.log(`\n📤 Exported to: ${outputPath}\n`);

  return outputPath;
}

/**
 * CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // Validate settings before running
  const validation = validateSettings();
  if (!validation.valid) {
    console.error("\n❌ Configuration Error:");
    for (const error of validation.errors) {
      console.error(`   - ${error}`);
    }
    console.error("\nPlease check your .env file.\n");
    process.exit(1);
  }

  try {
    switch (command) {
      case "overview":
        await overview();
        break;

      case "inspect":
        if (!args[1]) {
          console.error("\nUsage: npm run inspect -- /path/to/endpoint\n");
          process.exit(1);
        }
        await inspect(args[1]);
        break;

      case "download":
        if (!args[1]) {
          console.error("\nUsage: npm run download -- file-key\n");
          process.exit(1);
        }
        await download(args[1]);
        break;

      case "export":
        if (!args[1]) {
          console.error("\nUsage: npm start export /path/to/endpoint\n");
          process.exit(1);
        }
        await exportEndpoint(args[1]);
        break;

      default:
        console.log("\n🔧 Endpoint Assistant\n");
        console.log("Commands:");
        console.log("  npm run overview              List all endpoints");
        console.log("  npm run inspect -- /path      Get endpoint details");
        console.log("  npm run download -- key       Download a file");
        console.log("  npm start export /path        Export endpoint as JSON");
        console.log("");
        break;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}\n`);
    } else {
      console.error("\n❌ Unknown error occurred\n");
    }
    process.exit(1);
  }
}

main();
