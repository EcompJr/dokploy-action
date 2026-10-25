# Privacy notice

Dokploy Offload is maintained by EcompJr - UEFS. This notice describes the action's data flow and how to contact the maintainers. The action runs in your GitHub Actions job; it does not send deployment data to an EcompJr-operated backend or add its own analytics.

## Data used and destinations

| Data | Purpose and destination |
| --- | --- |
| Checked-out application files, Dockerfiles, build arguments, and BuildKit secrets | Processed by Docker build tools on your runner to build the selected images. Dockerfiles can access external services during a build. |
| GitHub token and GitHub actor | Used by the Docker login action to authenticate to GHCR and publish images. |
| Built images, image names, repository URL, and commit SHA | Published to GHCR, including source and revision labels. Contents depend on your Dockerfiles and build context. |
| Build cache, build output, and build records or artifacts produced by Docker actions | Processed or stored through GitHub Actions and its build tooling. Build output and metadata can contain information from your application. |
| Deployment webhook URL | Used on the runner to contact your configured Dokploy endpoint over HTTPS. The URL may contain a deployment secret. |
| Git ref, branch name, and commit SHA | Sent to that endpoint in a push-shaped JSON payload after all selected images publish. The commit message is generated from the SHA; the action does not forward the original commit message or commit author details. |

Repository files, identifiers, logs, images, and metadata may contain personal or confidential information. The action accesses and transmits the data needed for the build and deployment request; it does not require application user records for its own functionality. GitHub, registry services, your runner infrastructure, your Dokploy host, and any services contacted by your Dockerfiles process data according to their own configurations and terms.

## Storage, location, and deletion

The action does not create an EcompJr-operated deployment database. Runner files, logs, caches, artifacts, registry images, and Dokploy logs have separate retention settings. Self-hosted runners may retain files after a job. Removing the action from a workflow does not delete these records or images.

Storage countries depend on your GitHub services, runner, registry, Dokploy hosting, and build destinations; the action does not select a storage country. Review those providers and configurations before processing data subject to location or transfer restrictions. Manage deletion and retention through the relevant provider or infrastructure administrator.

## Your configuration

Limit build contexts with `.dockerignore`, keep personal data out of build inputs where possible, and review package visibility before publishing. Use GitHub Actions secrets and BuildKit secret mounts for confidential credentials; build arguments can appear in images, metadata, or browser bundles. Dockerfiles must not copy secrets into image layers or print them to build output. Obtain any required permissions and consent for data you include or send to your deployment infrastructure.

The webhook implementation does not log its URL, response body, or underlying fetch errors. This does not prevent your Dockerfiles, other workflow steps, or destination services from logging data.

## Contact and support information

EcompJr - UEFS maintains this project and handles information you submit to its maintainers through support channels. GitHub stores those submissions under its own terms and retention policies. Public issues and their contents are visible to others; share only the information necessary to resolve your request.

For general privacy questions, use the [support channel](SUPPORT.md). For confidential concerns, follow the [private reporting instructions](SECURITY.md); do not include personal data or secrets in a public issue. Maintainers can address information within their control; requests concerning workflow logs, images, or deployment records may need to go to your repository or infrastructure administrator.
