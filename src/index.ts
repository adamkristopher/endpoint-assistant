import "dotenv/config";
import * as fs from "fs/promises";
import * as path from "path";
import { validateSettings } from "./config/settings.js";
import { listEndpoints, getEndpoint, deleteEndpoint, createEndpoint, appendItems } from "./api/endpoints.js";
import { downloadFile } from "./api/files.js";
import { deleteItem } from "./api/items.js";
import { scanText, scanFiles } from "./api/scan.js";
import { getBillingStats } from "./api/billing.js";

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
      console.log(`  File: ${item.filePath || "(text-only)"}`);
      console.log(`  Type: ${item.fileType}`);
      if (item.fileSize) {
        console.log(`  Size: ${(item.fileSize / 1024).toFixed(1)} KB`);
      }
      console.log(`  Summary: ${item.summary}`);
      if (item.entities.length > 0) {
        console.log(`  Entities: ${item.entities.map(e => `${e.name} (${e.type})`).join(", ")}`);
      }
      console.log(`  Text: ${item.originalText.substring(0, 100)}...`);
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
 * Scan text content with AI extraction
 */
export async function scan(
  prompt: string,
  options: { text?: string; file?: string; targetEndpoint?: string }
): Promise<void> {
  if (options.file) {
    // Scan file(s)
    const filePaths = options.file.split(",");
    const files: File[] = [];

    for (const filePath of filePaths) {
      const content = await fs.readFile(filePath.trim());
      const filename = path.basename(filePath.trim());
      files.push(new File([content], filename));
    }

    console.log(`\n🔍 Scanning ${files.length} file(s)...`);
    const result = await scanFiles(prompt, files, { targetEndpoint: options.targetEndpoint });

    console.log(`✓ Endpoint: ${result.endpoint.path}`);
    console.log(`✓ Entries added: ${result.entriesAdded}`);
    console.log(`✓ Total entries: ${result.totalEntries}\n`);
  } else if (options.text) {
    // Scan text
    console.log("\n🔍 Scanning text...");
    const result = await scanText(prompt, options.text, { targetEndpoint: options.targetEndpoint });

    console.log(`✓ Endpoint: ${result.endpoint.path}`);
    console.log(`✓ Entries added: ${result.entriesAdded}`);
    console.log(`✓ Total entries: ${result.totalEntries}\n`);
  } else {
    throw new Error("Either --text or --file must be provided");
  }
}

/**
 * Remove an endpoint and all its data
 */
export async function removeEndpoint(endpointPath: string): Promise<void> {
  console.log(`\n🗑️  Deleting endpoint: ${endpointPath}`);

  const result = await deleteEndpoint(endpointPath);

  console.log(`✓ Deleted ${result.deletedFiles} file(s)`);
  for (const fileResult of result.fileResults) {
    if (fileResult.success) {
      console.log(`  ✓ ${fileResult.key}`);
    } else {
      console.log(`  ✗ ${fileResult.key}: ${fileResult.error}`);
    }
  }
  console.log("");
}

/**
 * Remove a single item from an endpoint
 */
export async function removeItem(itemId: string, endpointPath: string): Promise<void> {
  console.log(`\n🗑️  Deleting item: ${itemId}`);

  const result = await deleteItem(itemId, endpointPath);

  console.log(`✓ Item deleted`);
  if (result.deleted.hadFile) {
    console.log(`  File ${result.deleted.fileDeleted ? "deleted" : "not deleted"}`);
  }
  if (result.endpointDeleted) {
    console.log(`  Endpoint was also deleted (no remaining items)`);
  } else {
    console.log(`  Remaining items: ${result.remainingItems}`);
  }
  console.log("");
}

/**
 * Create a new endpoint
 */
export async function create(
  endpointPath: string,
  options?: { items?: string }
): Promise<void> {
  let items: Array<{ data: Record<string, unknown> }> | undefined;

  if (options?.items) {
    items = JSON.parse(options.items);
  }

  console.log(`\n📝 Creating endpoint: ${endpointPath}`);

  const result = await createEndpoint(endpointPath, { items });

  console.log(`✓ Created: ${result.endpoint.path}`);
  console.log(`  ID: ${result.endpoint.id}`);
  console.log(`  Category: ${result.endpoint.category}`);
  console.log(`  Items added: ${result.itemsAdded}\n`);
}

/**
 * Append items to an existing endpoint
 */
export async function append(endpointPath: string, itemsJson: string): Promise<void> {
  const items = JSON.parse(itemsJson);

  console.log(`\n📎 Appending items to: ${endpointPath}`);

  const result = await appendItems(endpointPath, items);

  console.log(`✓ Items added: ${result.itemsAdded}`);
  console.log(`  Total items: ${result.totalItems}\n`);
}

/**
 * Display billing stats
 */
export async function stats(): Promise<void> {
  const billing = await getBillingStats();

  console.log("\n📊 Billing Stats\n");
  console.log("─".repeat(50));
  console.log(`Tier:           ${billing.tier}`);
  console.log(`Status:         ${billing.status}`);
  console.log(`Parses:         ${billing.parsesThisMonth} / ${billing.monthlyParseLimit}`);
  console.log(`Storage:        ${formatBytes(billing.storageUsed)} / ${formatBytes(Number(billing.storageLimit))}`);
  console.log(`Period ends:    ${new Date(billing.currentPeriodEnd).toLocaleDateString()}`);
  console.log("─".repeat(50));
  console.log("");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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

      case "scan": {
        if (!args[1]) {
          console.error("\nUsage: npm run scan -- \"prompt\" --text \"text\" [--target /path]\n");
          console.error("   or: npm run scan -- \"prompt\" --file path/to/file [--target /path]\n");
          process.exit(1);
        }
        const scanOptions: { text?: string; file?: string; targetEndpoint?: string } = {};
        for (let i = 2; i < args.length; i++) {
          if (args[i] === "--text" && args[i + 1]) {
            scanOptions.text = args[++i];
          } else if (args[i] === "--file" && args[i + 1]) {
            scanOptions.file = args[++i];
          } else if (args[i] === "--target" && args[i + 1]) {
            scanOptions.targetEndpoint = args[++i];
          }
        }
        await scan(args[1], scanOptions);
        break;
      }

      case "delete":
        if (!args[1]) {
          console.error("\nUsage: npm run delete -- /path/to/endpoint\n");
          process.exit(1);
        }
        await removeEndpoint(args[1]);
        break;

      case "delete-item":
        if (!args[1] || !args[2]) {
          console.error("\nUsage: npm run delete-item -- <itemId> /path/to/endpoint\n");
          process.exit(1);
        }
        await removeItem(args[1], args[2]);
        break;

      case "create": {
        if (!args[1]) {
          console.error("\nUsage: npm run create -- /path/to/endpoint [--items '[{\"data\":{}}]']\n");
          process.exit(1);
        }
        const createOptions: { items?: string } = {};
        for (let i = 2; i < args.length; i++) {
          if (args[i] === "--items" && args[i + 1]) {
            createOptions.items = args[++i];
          }
        }
        await create(args[1], createOptions);
        break;
      }

      case "append":
        if (!args[1] || !args[2]) {
          console.error("\nUsage: npm run append -- /path/to/endpoint '[{\"data\":{}}]'\n");
          process.exit(1);
        }
        await append(args[1], args[2]);
        break;

      case "stats":
        await stats();
        break;

      default:
        console.log("\n🔧 Endpoint Assistant\n");
        console.log("Commands:");
        console.log("  npm run overview                           List all endpoints");
        console.log("  npm run inspect -- /path                   Get endpoint details");
        console.log("  npm run download -- key                    Download a file");
        console.log("  npm start export /path                     Export endpoint as JSON");
        console.log("  npm run scan -- \"prompt\" --text \"text\"     Scan text with AI");
        console.log("  npm run scan -- \"prompt\" --file path       Scan file with AI");
        console.log("  npm run delete -- /path                    Delete an endpoint");
        console.log("  npm run delete-item -- <id> /path          Delete a single item");
        console.log("  npm run create -- /path                    Create an endpoint");
        console.log("  npm run append -- /path '[items]'          Append items to endpoint");
        console.log("  npm run stats                              Show billing stats");
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
