import { describe, it, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fs from "fs-extra";
import os from "node:os";

describe("taskpack close", () => {
  let tmpDir: string;
  let originalCwd: string;
  let taskPath: string;
  let runDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "taskpack-close-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);

    const { newTask } = await import("../src/commands/new.js");
    taskPath = await newTask("close-test");

    const { runTask } = await import("../src/commands/run.js");
    const result = await runTask(taskPath, "test-model", false);
    runDir = result!;
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  it("fails when artifacts are empty", async () => {
    const { closeRun } = await import("../src/commands/close.js");
    const ok = await closeRun(taskPath, "001");
    expect(ok).toBe(false);
  });

  it("succeeds when all artifacts are filled", async () => {
    const absRunDir = path.resolve(tmpDir, runDir);

    await fs.writeFile(
      path.join(absRunDir, "patch.diff"),
      "--- a/file.ts\n+++ b/file.ts\n@@ -1 +1 @@\n-old\n+new\n"
    );
    await fs.writeFile(
      path.join(absRunDir, "files_changed.txt"),
      "src/file.ts\n"
    );
    await fs.writeFile(
      path.join(absRunDir, "commands.log"),
      "npm test\n"
    );
    await fs.writeFile(
      path.join(absRunDir, "pointers.json"),
      JSON.stringify([
        { type: "commit", value: "abc123", description: "test commit" },
      ])
    );

    const { closeRun } = await import("../src/commands/close.js");
    const ok = await closeRun(taskPath, "001");
    expect(ok).toBe(true);

    const outcomes = await fs.readFile(
      path.join(tmpDir, taskPath, "outcomes.md"),
      "utf-8"
    );
    expect(outcomes).toContain("Run 001");

    const decisions = await fs.readFile(
      path.join(tmpDir, taskPath, "decisions.md"),
      "utf-8"
    );
    expect(decisions).toContain("Run 001");
  });

  it("succeeds when artifacts are marked N/A", async () => {
    const absRunDir = path.resolve(tmpDir, runDir);

    await fs.writeFile(path.join(absRunDir, "patch.diff"), "N/A");
    await fs.writeFile(path.join(absRunDir, "files_changed.txt"), "N/A");
    await fs.writeFile(path.join(absRunDir, "commands.log"), "N/A");
    await fs.writeFile(path.join(absRunDir, "pointers.json"), "N/A");

    const { closeRun } = await import("../src/commands/close.js");
    const ok = await closeRun(taskPath, "001");
    expect(ok).toBe(true);
  });

  it("fails when run does not exist", async () => {
    const { closeRun } = await import("../src/commands/close.js");
    await expect(closeRun(taskPath, "999")).rejects.toThrow("not found");
  });
});
