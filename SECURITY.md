# Security policy

## Reporting a vulnerability

Do not post vulnerabilities, tokens, webhook URLs, or confidential logs in public issues. Use [GitHub's private vulnerability reporting page](https://github.com/ecompjr/dokploy-offload-action/security/advisories/new) if private reporting is enabled for this repository.

If private reporting is unavailable, open an issue asking maintainers to arrange a private security contact, without describing the vulnerability or including sensitive information. Wait for a private channel before sending details.

In the private report, include the affected action commit, impact, reproduction steps, and sanitized evidence. EcompJr maintainers will assess reports and coordinate remediation and disclosure as availability allows; no response deadline is guaranteed. If a credential has been exposed, revoke or rotate it through the issuing service rather than waiting for a fix.

## Supported distribution

Security maintenance focuses on the current `release` branch. Historical commits have no separate backport commitment. Consumers using `ecompjr/dokploy-offload-action@release` receive subsequent release commits; consumers pinned to a commit must update their workflows to receive fixes.

## Secure use

Run deployment workflows only for trusted code. Use the documented token permissions, store webhook URLs in Actions secrets, and use HTTPS endpoints under your control. BuildKit secrets still require Dockerfiles that handle them safely. Review runner access, image visibility, build logs, caches, and artifacts for sensitive content.

The action requires HTTPS webhook URLs, rejects redirects, applies a request timeout, and avoids logging webhook URLs, response bodies, and underlying request errors. These measures do not secure other workflow steps or the deployed application. See [PRIVACY.md](PRIVACY.md) for the data flow.
