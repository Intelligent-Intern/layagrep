#!/usr/bin/env node
import { authenticate, configDirectory, loadApiKey } from "./auth";
import { help, parseCommand } from "./args";
import { CliError } from "./errors";
import { renderResult } from "./render";
import { homedir } from "node:os";
import { join } from "node:path";
import { version } from "../package.json";
import skill from "../../../skills/jevgrep/SKILL.md" with { type: "text" };

globalThis.AI_SDK_LOG_WARNINGS = false;

const controller = new AbortController();
let pipeClosed = false;
let interrupted = false;
process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  pipeClosed = true;
  controller.abort();
  process.exitCode = error.code === "EPIPE" ? 0 : 1;
});
const interrupt = () => {
  interrupted = true;
  controller.abort();
};
process.on("SIGINT", interrupt);

async function write(text: string) {
  if (pipeClosed) return;
  await new Promise<void>((resolve, reject) => {
    process.stdout.write(text, (error) => (error ? reject(error) : resolve()));
  });
}

function cacheDirectory() {
  return join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "jevgrep");
}

async function main() {
  const command = parseCommand(process.argv.slice(2));
  switch (command.kind) {
    case "help":
      return write(help);
    case "version":
      return write(`${version}\n`);
    case "skill":
      return write(skill);
    case "auth":
      return authenticate(command.fromStdin, controller.signal);
    case "cache-clear": {
      const { createEvaluationCache } = await import("@repo/core");
      const cache = createEvaluationCache({ directory: cacheDirectory() });
      await cache.clear();
      if (cache.stats().issues.length)
        throw new CliError("Could not completely clear the cache. Check its permissions.");
      return write("Cache cleared.\n");
    }
    case "doctor": {
      const apiKey = await loadApiKey();
      const { createEvaluator } = await import("@repo/core");
      const evaluator = createEvaluator({
        apiKey,
        signal: controller.signal,
        baseURL: process.env.AI_GATEWAY_BASE_URL,
      });
      try {
        const answers = await evaluator.evaluate({
          state: { source: "export function recordEvent(event) { events.push(event); }" },
          questions: {
            relevant: {
              type: "boolean",
              instructions: "Does this source implement recording an event?",
            },
          },
        });
        if (!(answers.relevant! > 0.5))
          throw new CliError("Jev returned an unexpected answer to the connection check.");
        await write("Jev connection verified.\n");
      } catch (error) {
        if (error instanceof CliError) throw error;
        throw new CliError(
          "Jev connection check failed. Check your Gateway key, model access, and network.",
        );
      }
      return;
    }
    case "search": {
      const apiKey = await loadApiKey();
      const { retrieve, createEvaluator, createEvaluationCache } = await import("@repo/core");
      const cache = createEvaluationCache({
        directory: cacheDirectory(),
        enabled: !command.noCache,
      });
      const evaluator = createEvaluator({
        cache,
        policyVersion: JSON.stringify(command.policy),
        apiKey,
        signal: controller.signal,
        baseURL: process.env.AI_GATEWAY_BASE_URL,
      });
      const result = await retrieve(
        {
          root: command.root,
          query: command.query,
          policy: command.policy,
          signal: controller.signal,
          protectedPaths: [configDirectory(), cacheDirectory()],
        },
        evaluator,
      );
      if (pipeClosed) return;
      await write(renderResult(result, command.maxSourceBytes));
      process.exitCode =
        result.status === "interrupted" ? 130 : result.status === "incomplete" ? 2 : 0;
    }
  }
}

try {
  await main();
} catch (error) {
  if (!pipeClosed) {
    const aborted = interrupted || (error instanceof Error && error.name === "AbortError");
    process.exitCode = aborted ? 130 : 1;
    const message = aborted
      ? "Interrupted."
      : error instanceof CliError
        ? error.message
        : "Command failed. Check the root, permissions, credentials, and network.";
    await write(`${message}\n`).catch(() => {});
  }
} finally {
  process.removeListener("SIGINT", interrupt);
  if (interrupted && !pipeClosed) process.exitCode = 130;
}
