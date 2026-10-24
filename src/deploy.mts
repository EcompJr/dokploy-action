import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { DeploymentConfiguration } from "./configuration.mjs";
import type { Environment } from "./contracts.mjs";
import { DokployDeployer } from "./dokploy-deployer.mjs";
import { ImagePlanner } from "./image-planner.mjs";

// Preserve the public function API used by callers and existing tests.
export function configuration(env: Environment) {
  return new DeploymentConfiguration().parse(env);
}

export function plan(env: Environment) {
  return new ImagePlanner().plan(env);
}

export function deploy(env: Environment, request: typeof fetch = fetch) {
  return new DokployDeployer({ request }).deploy(env);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (process.argv[2] === "plan") {
      const outputs = plan(process.env);
      if (!process.env.GITHUB_OUTPUT) throw new Error("Missing GITHUB_OUTPUT");
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        Object.entries(outputs)
          .map(([k, v]) => `${k}=${v}\n`)
          .join(""),
      );
    } else if (process.argv[2] === "deploy") {
      await deploy(process.env);
    } else throw new Error("Expected plan or deploy");
  } catch (error) {
    console.error(
      `::error::${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
