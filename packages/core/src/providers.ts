import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const providers = {
  laya: {
    label: "Local Laya",
    baseURL: "http://127.0.0.1:8000/v1",
    model: "multilingual",
  },
} as const;

export type ProviderId = keyof typeof providers;

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && Object.hasOwn(providers, value);
}

/** Keep source retrieval on this machine even when the endpoint is overridden. */
export function layaBaseURL(): string {
  let saved = "";
  try {
    saved = readFileSync(join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "layagrep", "server-url"), "utf8").trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const raw = process.env.LAYAGREP_LAYA_URL || saved || providers.laya.baseURL;
  const url = new URL(raw);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
    || url.username || url.password || url.search || url.hash || url.pathname !== "/v1")
    throw new Error("LAYAGREP_LAYA_URL must be a loopback HTTP URL ending in /v1.");
  return url.href.replace(/\/$/, "");
}
