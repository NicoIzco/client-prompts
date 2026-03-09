import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "fs-extra";
import os from "node:os";

describe("taskpack run", () => {
  let tmpDir: string;
  let originalCwd: string;
  let taskPath: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "taskpack-run-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);

    const { newTask } = await import("../src/commands/new.js");
    taskPath = await newTask("run-test");
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it("creates a run directory with all expected files", async () => {
    const { runTask } = await import("../src/commands/run.js");
    const runDirRel = await runTask(taskPath, "opus", false);

    expect(runDirRel).not.toBeNull();
    const absRunDir = path.resolve(tmpDir, runDirRel!);

    const expectedFiles = [
      "transcript.md",
      "patch.diff",
      "files_changed.txt",
      "commands.log",
      "pointers.json",
      "notes.md",
    ];

    for (const file of expectedFiles) {
      expect(await fs.pathExists(path.join(absRunDir, file))).toBe(true);
    }
  });

  it("appends to links.md on run", async () => {
    const { runTask } = await import("../src/commands/run.js");
    await runTask(taskPath, "gpt-4o", false);

    const linksPath = path.join(tmpDir, taskPath, "links.md");
    const content = await fs.readFile(linksPath, "utf-8");
    expect(content).toContain("Run 001");
    expect(content).toContain("gpt-4o");
  });

  it("dry run does not write files", async () => {
    const { runTask } = await import("../src/commands/run.js");
    const result = await runTask(taskPath, "opus", true);

    expect(result).toBeNull();

    const runsPath = path.join(tmpDir, taskPath, "runs");
    const entries = await fs.readdir(runsPath);
    expect(entries.length).toBe(0);
  });
});
