import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "fs-extra";
import os from "node:os";

const EXPECTED_FILES = [
  "prompt.md",
  "context.md",
  "outcomes.md",
  "decisions.md",
  "links.md",
  "run.md",
];

const EXPECTED_DIRS = ["assets", "runs"];

describe("taskpack new", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "taskpack-test-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it("creates a task directory with all expected files", async () => {
    const { newTask } = await import("../src/commands/new.js");
    const relPath = await newTask("test-task");

    const taskDir = path.resolve(tmpDir, relPath);
    expect(await fs.pathExists(taskDir)).toBe(true);

    for (const file of EXPECTED_FILES) {
      const filePath = path.join(taskDir, file);
      expect(await fs.pathExists(filePath)).toBe(true);
      const content = await fs.readFile(filePath, "utf-8");
      expect(content.length).toBeGreaterThan(0);
    }

    for (const dir of EXPECTED_DIRS) {
      const dirPath = path.join(taskDir, dir);
      expect(await fs.pathExists(dirPath)).toBe(true);
      const stat = await fs.stat(dirPath);
      expect(stat.isDirectory()).toBe(true);
    }
  });

  it("slugifies the task name correctly", async () => {
    const { newTask } = await import("../src/commands/new.js");
    const relPath = await newTask("My Cool Task!!!");

    expect(relPath).toContain("my-cool-task");
    expect(relPath).not.toContain("!");
  });

  it("throws if the task already exists", async () => {
    const { newTask } = await import("../src/commands/new.js");
    await newTask("dupe-task");

    await expect(newTask("dupe-task")).rejects.toThrow("already exists");
  });
});
