import path from "node:path";
import fs from "fs-extra";
import { tasksRoot } from "../utils/paths.js";
import { info, warn, heading, dim, divider } from "../utils/output.js";

interface Match {
  file: string;
  line: number;
  text: string;
}

async function searchFile(
  filePath: string,
  query: string
): Promise<Match[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const lower = query.toLowerCase();
  const matches: Match[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lower)) {
      matches.push({
        file: filePath,
        line: i + 1,
        text: lines[i].trim(),
      });
    }
  }

  return matches;
}

async function walkFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!(await fs.pathExists(dir))) return results;

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkFiles(full);
      results.push(...sub);
    } else if (
      entry.isFile() &&
      /\.(md|txt|json|log|diff)$/.test(entry.name)
    ) {
      results.push(full);
    }
  }

  return results;
}

export async function searchTasks(query: string): Promise<void> {
  const root = tasksRoot();

  if (!(await fs.pathExists(root))) {
    warn("No tasks/ directory found. Create a task first with `taskpack new`.");
    return;
  }

  heading(`Search: "${query}"`);
  divider();

  const files = await walkFiles(root);
  const allMatches: Match[] = [];

  for (const file of files) {
    const matches = await searchFile(file, query);
    allMatches.push(...matches);
  }

  if (allMatches.length === 0) {
    warn("No matches found.");
    return;
  }

  info(`${allMatches.length} match(es) across ${files.length} file(s)`);
  console.log();

  let currentFile = "";
  for (const m of allMatches) {
    const rel = path.relative(process.cwd(), m.file);
    if (rel !== currentFile) {
      currentFile = rel;
      console.log(`  ${rel}`);
    }
    dim(`    L${m.line}: ${m.text.slice(0, 120)}`);
  }
}
