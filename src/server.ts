#!/usr/bin/env node

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { composeRepository } from "./core/ingest/compose.ts";
import { parseRepository } from "./core/ingest/parse.ts";
import { rankRecommendedNextWork } from "./core/recommendation/engine.ts";
import { validateRepository } from "./core/validation/engine.ts";
import type { RepositoryAdapterOptions, SpecDiscoveryAdapterProfile } from "./core/model/types.ts";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4311;

type ApiCommand = "parse" | "compose" | "validate" | "recommend";
type ApiHandler = (repoPath: string, options: RepositoryAdapterOptions) => Promise<unknown>;

export interface ApiServerOptions {
  host?: string;
  port?: number;
  defaultRepoPath?: string;
}

export interface ApiServerHandle {
  server: Server;
  host: string;
  port: number;
  url: string;
  close(): Promise<void>;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function sendError(response: ServerResponse, statusCode: number, code: string, message: string): void {
  sendJson(response, statusCode, {
    error: {
      code,
      message,
      status: statusCode,
    },
  });
}

async function readRequestBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readRequestPayload(request: IncomingMessage): Promise<{ repoPath: string; adapterOptions: RepositoryAdapterOptions }> {
  const rawBody = await readRequestBody(request);

  if (!rawBody.trim()) {
    throw new Error("Request body must be JSON with a repoPath string.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Request body must be a JSON object with a repoPath string.");
  }

  const { repoPath, adapterProfile } = payload as { repoPath?: unknown; adapterProfile?: unknown };
  if (typeof repoPath !== "string" || repoPath.trim().length === 0) {
    throw new Error("Request body must include a non-empty repoPath string.");
  }

  if (adapterProfile !== undefined && adapterProfile !== "canonical" && adapterProfile !== "bitbetmatic2") {
    throw new Error("adapterProfile must be either canonical or bitbetmatic2.");
  }

  const adapterOptions: RepositoryAdapterOptions = typeof adapterProfile === "string"
    ? { adapterProfile: adapterProfile as SpecDiscoveryAdapterProfile }
    : {};

  return { repoPath: path.resolve(repoPath), adapterOptions };
}

function mapErrorStatus(error: unknown): { statusCode: number; code: string; message: string } {
  const message = error instanceof Error ? error.message : String(error);
  const errnoCode = typeof error === "object" && error && "code" in error ? String(error.code) : undefined;

  if (errnoCode && ["ENOENT", "ENOTDIR", "EACCES", "EPERM"].includes(errnoCode)) {
    return {
      statusCode: 400,
      code: "invalid-repository",
      message,
    };
  }

  if (
    message.includes("specs") ||
    message.includes("repo") ||
    message.includes("repository") ||
    message.includes("overlay")
  ) {
    return {
      statusCode: 400,
      code: "invalid-repository",
      message,
    };
  }

  return {
    statusCode: 500,
    code: "server-error",
    message,
  };
}

function getHandler(command: ApiCommand): ApiHandler {
  if (command === "parse") {
    return (repoPath, options) => parseRepository(repoPath, options);
  }

  if (command === "compose") {
    return (repoPath, options) => composeRepository(repoPath, options);
  }

  if (command === "recommend") {
    return async (repoPath: string, options: RepositoryAdapterOptions) => {
      const composeResult = await composeRepository(repoPath, options);
      const validationResult = await validateRepository(repoPath, options);
      return rankRecommendedNextWork(composeResult.composedNodes, validationResult.findings);
    };
  }

  return (repoPath, options) => validateRepository(repoPath, options);
}

async function handleCommandRequest(
  request: IncomingMessage,
  response: ServerResponse,
  command: ApiCommand,
): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    sendError(response, 405, "method-not-allowed", "This endpoint only supports POST requests.");
    return;
  }

  let repoPath: string;
  let adapterOptions: RepositoryAdapterOptions = {};
  try {
    const payload = await readRequestPayload(request);
    repoPath = payload.repoPath;
    adapterOptions = payload.adapterOptions;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendError(response, 400, "invalid-request", message);
    return;
  }

  try {
    const result = await getHandler(command)(repoPath, adapterOptions);
    sendJson(response, 200, result);
  } catch (error) {
    const mapped = mapErrorStatus(error);
    sendError(response, mapped.statusCode, mapped.code, mapped.message);
  }
}

export function createSpecForgeApiServer(options: ApiServerOptions = {}): Server {
  const defaultRepoPath = options.defaultRepoPath ?? process.cwd();

  return createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (!request.url) {
      sendError(response, 400, "invalid-request", "Request URL is missing.");
      return;
    }

    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      response.end();
      return;
    }

    const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${DEFAULT_HOST}:${DEFAULT_PORT}`}`);

    if (requestUrl.pathname === "/api/context") {
      if (request.method !== "GET") {
        response.setHeader("Allow", "GET, OPTIONS");
        sendError(response, 405, "method-not-allowed", "This endpoint only supports GET requests.");
        return;
      }

      sendJson(response, 200, {
        defaultRepoPath,
      });
      return;
    }

    if (requestUrl.pathname === "/api/parse") {
      await handleCommandRequest(request, response, "parse");
      return;
    }

    if (requestUrl.pathname === "/api/compose") {
      await handleCommandRequest(request, response, "compose");
      return;
    }

    if (requestUrl.pathname === "/api/validate") {
      await handleCommandRequest(request, response, "validate");
      return;
    }

    if (requestUrl.pathname === "/api/recommend") {
      await handleCommandRequest(request, response, "recommend");
      return;
    }

    sendError(response, 404, "not-found", `No API route matches ${requestUrl.pathname}.`);
  });
}

export async function startSpecForgeApiServer(options: ApiServerOptions = {}): Promise<ApiServerHandle> {
  const host = options.host ?? DEFAULT_HOST;
  const port = options.port ?? DEFAULT_PORT;
  const server = createSpecForgeApiServer(options);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("SpecForge API server did not expose a TCP address.");
  }

  const resolvedAddress = address as AddressInfo;
  const url = `http://${host}:${resolvedAddress.port}`;

  return {
    server,
    host,
    port: resolvedAddress.port,
    url,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
  };
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  startSpecForgeApiServer().then(
    (handle) => {
      console.log(`SpecForge API server listening on ${handle.url}`);
    },
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`specforge ui server failed: ${message}`);
      process.exitCode = 2;
    },
  );
}
