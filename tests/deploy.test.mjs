import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { configuration, deploy, plan } from "../scripts/deploy.mjs";

const workspace = mkdtempSync(join(tmpdir(), "dokploy-action-"));

after(() => rmSync(workspace, { recursive: true, force: true }));
writeFileSync(join(workspace, "compose.dokploy.yml"), "services: {}\n");

const env = {
  GITHUB_WORKSPACE: workspace,
  SERVICES: "both",
  GITHUB_REPOSITORY: "EcompJr/Example",
  GITHUB_SHA: "a".repeat(40),
  GITHUB_REF: "refs/heads/main",
  GITHUB_REF_NAME: "main",
  WEBHOOK_URL: "https://dokploy.example/api/deploy/secret",
};


test("either compose extension is accepted in the calling project", () => {
  for (const name of ["compose.dokploy.yml", "compose.dokploy.yaml"]) {
    const project = mkdtempSync(join(workspace, "project-"));
    writeFileSync(join(project, name), "services: {}\n");
    assert.doesNotThrow(() => plan({ ...env, GITHUB_WORKSPACE: project }));
  }
});


test("missing compose files and directories named like compose files fail before publishing", () => {
  const project = mkdtempSync(join(workspace, "missing-"));

  assert.throws(
    () => plan({ ...env, GITHUB_WORKSPACE: project }),
    /Missing compose\.dokploy/,
  );

  mkdirSync(join(project, "compose.dokploy.yml"));
  mkdirSync(join(project, "compose.dokploy.yaml"));

  assert.throws(
    () => plan({ ...env, GITHUB_WORKSPACE: project }),
    /Missing compose\.dokploy/,
  );
});


test("both services publish lowercase GHCR names and commit tags", () => {
  const p = plan(env);

  assert.equal(p["backend-image"], "ghcr.io/ecompjr/example-backend:latest");
  assert.equal(
    p["frontend-sha-image"],
    `ghcr.io/ecompjr/example-frontend:sha-${env.GITHUB_SHA}`,
  );
  assert.equal(configuration(env).webhook, env.WEBHOOK_URL);
});


for (const service of ["backend", "frontend"]) {
  test(`${service} uses the single deployment webhook`, () => {
    const p = plan({ ...env, SERVICES: service });
    assert.equal(p[service], "true");
    assert.equal(p[service === "backend" ? "frontend" : "backend"], "false");
  });
}


test("invalid configuration fails before publishing", () => {
  const changes = [
    { SERVICES: "unknown" },
    { WEBHOOK_URL: "" },
    { IMAGE_TAG: "bad\ntag" },
    { WEBHOOK_URL: "file:///secret" },
    { IMAGE_PREFIX: "bad\noutput=oops" },
  ];

  for (const change of changes) {
    assert.throws(() => plan({ ...env, ...change }));
  }
});


test("deployment webhook is called once with the GitHub push payload", async () => {
  const calls = [];

  await deploy(env, async (...args) => {
    calls.push(args);
    return new Response("{}");
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], env.WEBHOOK_URL);
  assert.equal(calls[0][1].headers["X-GitHub-Event"], "push");
  assert.equal(JSON.parse(calls[0][1].body).after, env.GITHUB_SHA);
  assert.equal(calls[0][1].redirect, "manual");
});


test("HTTP failures and network errors fail deployment", async () => {
  await assert.rejects(
    deploy(env, async () => new Response(null, { status: 301 })),
  );

  await assert.rejects(
    deploy(env, async () => { throw new Error("sensitive URL"); }),
  );
});

for (const [mode, selected] of Object.entries({
  fullstack: ["fullstack"],
  both: ["backend", "frontend"],
  back: ["backend"],
  frontend: ["frontend"],
  backend: ["backend"],
})) {
  test(`${mode} plans exactly the selected images and triggers one webhook`, async () => {
    const modeEnv = {
      ...env,
      SERVICES: mode,
      IMAGE_PREFIX: "Owner/Custom",
      IMAGE_TAG: "production",
    };

    const outputs = plan(modeEnv);
    assert.deepEqual(configuration(modeEnv).services, selected);

    for (const service of ["fullstack", "backend", "frontend"]) {
      assert.equal(outputs[service], String(selected.includes(service)));

      if (selected.includes(service)) {

        assert.equal(
          outputs[`${service}-image`],
          `ghcr.io/owner/custom-${service}:production`,
        );

        assert.equal(
          outputs[`${service}-sha-image`],
          `ghcr.io/owner/custom-${service}:sha-${env.GITHUB_SHA}`,
        );

        assert.equal(
          outputs[`${service}-cache`],
          `owner-custom-${service}-production`,
        );

      } else {
        assert.equal(outputs[`${service}-image`], undefined);
      }
    }

    let calls = 0;

    await deploy(modeEnv, async () => {
      calls++;
      return new Response(null, { status: 204 });
    });

    assert.equal(calls, 1);
  });
}
