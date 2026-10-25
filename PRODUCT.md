# Dokploy Offload

**Dokploy Offload ※ Build on GitHub • Keep your VPS serving.**

Dokploy Offload is a composite GitHub Action that builds Docker images on GitHub Actions, publishes them to GHCR, and triggers Dokploy to deploy the finished images. Its purpose is to reduce deployment pressure on the VPS that runs your applications.

## Register

product

## Users

Developers and small teams hosting fullstack applications, APIs, and frontends with Dokploy on their own VPS. They already use Dockerfiles and GitHub and want to deploy without build jobs competing with live traffic, especially when several applications share a small server.

## Problem

Dependency installation, compilation, and frontend bundling compete with live applications for CPU, memory, and disk space when builds run on the production VPS. On smaller servers, this contention can slow requests or exhaust memory.

## Product Purpose

Move application builds to GitHub Actions runners, publish finished images to GHCR, and request deployment through Dokploy. The VPS pulls and runs those images, leaving more capacity available for application workloads.

Success means users can configure a working deployment, selected images build outside the VPS, and the webhook runs only after all selected images publish. Evaluate setup friction and configuration errors alongside build efficiency. Resource savings and deployment speed require workload-specific measurement; no benchmark is established here.

## Brand Personality

Practical, calm, and technically precise. Speak like a developer explaining a useful tool to another developer. Make the benefit visible before describing implementation details.

### Tone

Use short, concrete sentences. Explain acronyms on first use in introductory copy. Describe what runs where and what the user must configure. Keep the slogan exactly as written above.

## Anti-references

- Copy MUST NOT promise zero downtime, guaranteed uptime, automatic rollback, or quantified resource savings without evidence.
- Marketing MUST NOT imply that the VPS performs no deployment work or that a successful webhook confirms application health.
- Examples MUST NOT depend on a particular customer's project.
- Presentation MUST NOT imply this is a hosted deployment platform or an official Dokploy product.

## Accessibility & Inclusion

- Documentation MUST use meaningful headings, descriptive links, and text-based setup instructions.
- Diagrams MUST have an equivalent explanation in prose. Essential information MUST NOT depend on color or decorative symbols.
- Examples SHOULD be copyable and explain required substitutions. Do not assume readers already know GHCR or Dokploy's registry configuration.

## Offer

Dokploy Offload is available under the [BSD 3-Clause License](LICENSE) and is used within the caller's own GitHub Actions workflow and Dokploy deployment. This repository does not define a paid plan, subscription, or usage-based charge for the action. GitHub Actions, registry storage, and VPS hosting may carry separate provider costs. No pricing island is declared because this project has no defined commercial pricing offer.

## Positioning and messaging

Name: **Dokploy Offload**.

Short description: **Keep Docker builds off your VPS. Build on GitHub Actions, publish to GHCR, and deploy with Dokploy.**

Lead with reduced build load and a straightforward deployment workflow. Explain the mechanism: build on GitHub, publish to GHCR, then ask Dokploy to deploy. Use concrete language about dependency installation, compilation, and bundling instead of vague performance claims.

The repository and action identifier are `ecompjr/dokploy-offload-action`. Consumers use `ecompjr/dokploy-offload-action@release` in their workflows.

## Product experience

1. The caller checks out an application containing Dockerfiles and a root `compose.dokploy.yml` or `compose.dokploy.yaml`.
2. The action validates configuration and plans the selected images.
3. GitHub Actions builds and publishes images to GHCR, using Buildx and GitHub Actions caching.
4. After all selected images publish, the action calls one Dokploy webhook.
5. Dokploy pulls and runs the images configured for that deployment.

Support `fullstack`, `both`, `back`, and `frontend`, preserving `backend` as an alias for `back`. Allow service-specific build contexts, Dockerfiles, stages, build arguments, and BuildKit secrets. Publish deployment tags and commit tags, and expose image references and digests.

## Boundaries

The action builds and publishes images and requests deployment. Dokploy manages the server and runtime configuration. Users configure image references, registry access, ports, and runtime environment variables in their deployment.

Image downloads and container startup still consume VPS resources. A successful webhook response means deployment was requested; it does not confirm application health. Publishing several images is not atomic, and a failed build can leave a previously published mutable tag updated. Do not promise zero downtime, guaranteed uptime, automatic rollback, free infrastructure, or quantified resource savings without evidence.

## Delivery principles

- Keep setup understandable: Dockerfiles, the built-in GitHub token, and a deployment webhook.
- Validate inputs before publishing, and trigger deployment only after all selected images publish.
- Keep secrets out of logs and distinguish build secrets from browser-visible build arguments.
- Keep application builds on runners and document how to configure Dokploy to pull images.
- Keep the README, action metadata, examples, and implementation consistent.
- Preserve documented inputs, outputs, aliases, and release usage unless a compatibility change is deliberate and documented.

## Support and data handling

User support is documented in [SUPPORT.md](SUPPORT.md), private reporting in [SECURITY.md](SECURITY.md), and data flows and retention boundaries in [PRIVACY.md](PRIVACY.md). Do not promise response deadlines or an uptime SLA. The BSD-3-Clause [LICENSE](LICENSE) governs end-user use and redistribution. Maintainers must complete the organizational and operational checks in [MAINTENANCE.md](MAINTENANCE.md) before Marketplace publication.

## Evaluating improvements

Prefer changes that make first setup easier, reduce configuration mistakes, clarify deployment failures, or improve build efficiency. Validate technical behavior with appropriate checks and real deployment evidence when available. Treat resource savings and deployment speed as workload-dependent outcomes, not established benchmarks.

## Design Principles

1. Lead with keeping build work off the VPS; explain the mechanism immediately after the benefit.
2. Make the path from configuration to published images to deployment easy to follow.
3. Keep requirements and failure behavior visible beside the instructions they affect.
4. Favor familiar GitHub and Docker conventions and preserve compatibility for existing callers.

## Stack

- [LICENSE](LICENSE): BSD 3-Clause terms and copyright notice.
- [AGENTS.md](AGENTS.md): implementation conventions, validation, and contribution guidance.
- [README.md](README.md): installation, inputs, deployment behavior, and runtime requirements.
- [action.yml](action.yml): executable action interface and build orchestration.
- [Examples](examples/): caller workflows and Compose configurations.

This document follows the [PRODUCT.md standard](https://product.md/), using canonical sections without optional linked-data frontmatter or pricing data.
