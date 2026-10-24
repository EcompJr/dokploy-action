import assert from "node:assert/strict";
import { test } from "node:test";
import { ComposeProject } from "../scripts/compose-project.mjs";
import { DokployDeployer } from "../scripts/dokploy-deployer.mjs";
import { ImagePlanner } from "../scripts/image-planner.mjs";

const env = {
  GITHUB_WORKSPACE: "/project",
  GITHUB_REPOSITORY: "Owner/App",
  GITHUB_SHA: "a".repeat(40),
  GITHUB_REF: "refs/heads/main",
  GITHUB_REF_NAME: "main",
};

test("compose validation propagates filesystem permission failures", () => {
  const denied = Object.assign(new Error("Permission denied"), {
    code: "EACCES",
  });

  const project = new ComposeProject({
    stat() {
      throw denied;
    },
  });

  assert.throws(
    () => project.validate("/project"),
    (error) => error === denied,
  );
});

test("planner accepts configuration and project implementations without filesystem access", () => {
  const planner = new ImagePlanner({
    configuration: { parse: () => ({ services: ["frontend"] }) },
    project: {
      validate(workspace) {
        assert.equal(workspace, "/project");
      },
    },
  });

  const outputs = planner.plan(env);

  assert.equal(outputs.backend, "false");
  assert.equal(outputs["frontend-image"], "ghcr.io/owner/app-frontend:latest");
});

test("failed project validation prevents image planning", () => {
  const planner = new ImagePlanner({
    configuration: { parse: () => ({ services: ["frontend"] }) },
    project: {
      validate() {
        throw new Error("Invalid project");
      },
    },
  });

  assert.throws(() => planner.plan({}), /Invalid project/);
});

test("deployer cancels the response body and reports acceptance through its logger", async () => {
  let cancelled = false;
  const messages = [];
  const deployer = new DokployDeployer({
    configuration: { parse: () => ({ webhook: "https://example.com/secret" }) },
    request: async (url, options) => {
      assert.equal(url, "https://example.com/secret");
      assert.deepEqual(JSON.parse(options.body), {
        ref: env.GITHUB_REF,
        branch: "main",
        after: env.GITHUB_SHA,
        head_commit: { id: env.GITHUB_SHA, message: "deploy aaaaaaa" },
      });
      assert.equal(options.method, "POST");
      assert.ok(options.signal instanceof AbortSignal);
      return {
        status: 204,
        body: {
          async cancel() {
            cancelled = true;
          },
        },
      };
    },
    logger: {
      log(message) {
        assert.ok(cancelled);
        messages.push(message);
      },
    },
  });

  await deployer.deploy(env);

  assert.deepEqual(messages, [
    "Dokploy webhook accepted the deployment request.",
  ]);
});

test("deployer hides transport secrets and never reports failed requests as accepted", async () => {
  const messages = [];

  const deployer = new DokployDeployer({
    configuration: { parse: () => ({ webhook: "https://example.com/secret" }) },
    request: async () => {
      throw new Error("https://example.com/secret");
    },
    logger: {
      log(message) {
        messages.push(message);
      },
    },
  });

  await assert.rejects(deployer.deploy(env), {
    message:
      "Dokploy webhook failed or rejected the request. Check Dokploy deployment logs.",
  });

  assert.deepEqual(messages, []);
});
