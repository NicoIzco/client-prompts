import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TASKS_DIR = "tasks";

export function tasksRoot(): string {
  return path.resolve(process.cwd(), TASKS_DIR);
}

export function templatesDir(): string {
  return path.resolve(__dirname, "..", "..", "templates");
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function datestamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function timestamp(): string {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}

export function taskDir(taskPath: string): string {
  return path.resolve(process.cwd(), taskPath);
}

export function runsDir(taskPath: string): string {
  return path.join(taskDir(taskPath), "runs");
}

export function nextRunNumber(taskPath: string): string {
  const runs = path.join(taskDir(taskPath), "runs");
  if (!fs.existsSync(runs)) return "001";
  const entries = fs.readdirSync(runs).filter((e) => /^\d{3}_/.test(e));
  const max = entries.reduce((n, e) => {
    const num = parseInt(e.slice(0, 3), 10);
    return num > n ? num : n;
  }, 0);
  return String(max + 1).padStart(3, "0");
}

export function findRunDir(
  taskPath: string,
  runId: string
): string | undefined {
  const runs = runsDir(taskPath);
  if (!fs.existsSync(runs)) return undefined;
  const padded = runId.padStart(3, "0");
  const match = fs
    .readdirSync(runs)
    .find((e) => e.startsWith(`${padded}_`));
  return match ? path.join(runs, match) : undefined;
}

export function resolveTaskPath(input: string): string {
  if (fs.existsSync(input)) return input;
  const withPrefix = path.join(TASKS_DIR, input);
  if (fs.existsSync(withPrefix)) return withPrefix;
  return input;
}
