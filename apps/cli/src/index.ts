#!/usr/bin/env node
import { authenticate, loadApiKey } from "./auth";
import { checkGateway } from "@repo/core";

const args = process.argv.slice(2);
try {
  if (args.length === 0 || (args.length === 1 && ["--help", "-h"].includes(args[0]!))) {
    console.log(`jevgrep — context retrieval for coding agents (scaffold)

Commands:
  auth [--stdin]   Save a Vercel AI Gateway key; interactive input is hidden
  doctor          Verify Jev access with a synthetic evaluation

Repository search is not implemented yet.`);
  } else if (
    args[0] === "auth" &&
    (args.length === 1 || (args.length === 2 && args[1] === "--stdin"))
  ) {
    await authenticate(args[1] === "--stdin");
  } else if (args[0] === "doctor" && args.length === 1) {
    const apiKey = await loadApiKey();
    try {
      console.log(JSON.stringify(await checkGateway(apiKey), null, 2));
    } catch {
      // SDK errors can contain request metadata; never print them alongside credentials.
      throw new Error(
        "Jev connection check failed. Check your AI Gateway key, model access, and network.",
      );
    }
  } else {
    throw new Error("Unknown command or options. Run jevgrep --help.");
  }
} catch (error) {
  console.error(
    error instanceof SyntaxError
      ? "Invalid credentials file. Run jevgrep auth again."
      : error instanceof Error
        ? error.message
        : "Command failed.",
  );
  process.exitCode = 1;
}
