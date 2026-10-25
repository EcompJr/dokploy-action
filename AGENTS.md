# Repository guidance

## Product intent

This project is **Dokploy Offload**: a composite GitHub Action that builds Docker images on GitHub Actions, publishes them to GHCR, and triggers Dokploy. Read [PRODUCT.md](PRODUCT.md) for positioning and product boundaries. The central benefit is keeping resource-intensive builds off the production VPS.

Keep the public action reference `ecompjr/dokploy-offload-action@release` consistent throughout documentation and examples. The display name and repository identifier serve different purposes.

## Implementation and compatibility

- Preserve the root BSD 3-Clause LICENSE, including its copyright notice, conditions, and disclaimer, in source and published distributions. Use the SPDX identifier `BSD-3-Clause` in package metadata and keep license references consistent.
- Edit TypeScript source in `src/*.mts`. Generated `scripts/*.mjs` files are ignored locally and published by CI; do not hand-edit or commit them to the source branch.
- Keep responsibilities separated across configuration, Compose validation, image planning, and webhook delivery. Preserve the small dependency interfaces used for testing.
- Preserve `fullstack`, `both`, `back`, and `frontend` modes and the `backend` alias.
- Preserve documented inputs, outputs, defaults, and the exported deployment entry points unless a requested change requires otherwise.
- Require the caller's root Compose file before publishing. Call the webhook once, only after every selected image publishes successfully.
- Keep webhook URLs and credentials out of logs. Preserve timeout handling, HTTP 2xx acceptance, and redirect rejection.
- Keep runtime dependencies and compilation off consumer workflows. Consumers run the compiled action from `release`.

## Validation

Use Bun 1.3.12 and the committed lockfile. Install dependencies with `bun install --frozen-lockfile` when needed.

- Run `bun run typecheck` for TypeScript changes.
- Run `bun run test` for behavior changes; it builds the source and runs the tests.
- Use actionlint for workflow and action syntax changes, following the CI configuration in `.github/workflows/ci.yml`.
- For documentation-only changes, check accuracy, local links, and consistency with `action.yml` and examples. Tests are unnecessary unless behavior changes.

CI also tests compiled code on Node.js 22. Do not claim a live deployment was verified unless it actually was.

## Documentation and marketing

Lead with the benefit: **Dokploy Offload ※ Build on GitHub • Keep your VPS serving.** Explain the build → GHCR → Dokploy flow in plain language. Connect features to practical user needs and keep setup instructions concrete.

Describe reduced build pressure without promising zero downtime, guaranteed uptime, automatic rollback, or measured savings. A webhook accepted by Dokploy is a deployment request, not an application health check. Keep prerequisites and limitations discoverable.

Use generic application examples. Keep product copy independent of any particular customer project. Update README, action metadata, examples, and PRODUCT.md together when a change affects their claims or instructions.
