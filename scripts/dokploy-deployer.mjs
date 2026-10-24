import { DeploymentConfiguration } from "./configuration.mjs";
export class DokployDeployer {
    configuration;
    request;
    logger;
    constructor({ configuration = new DeploymentConfiguration(), request = fetch, logger = console, } = {}) {
        this.configuration = configuration;
        this.request = request;
        this.logger = logger;
    }
    async deploy(env) {
        const { webhook } = this.configuration.parse(env);
        const payload = JSON.stringify({
            ref: env.GITHUB_REF,
            branch: env.GITHUB_REF_NAME,
            after: env.GITHUB_SHA,
            head_commit: {
                id: env.GITHUB_SHA,
                message: `deploy ${env.GITHUB_SHA?.slice(0, 7)}`,
            },
        });
        // Do not log URLs, response bodies, or fetch errors: they may contain secrets.
        try {
            const response = await this.request(webhook, {
                method: "POST",
                redirect: "manual",
                signal: AbortSignal.timeout(120_000),
                headers: {
                    "Content-Type": "application/json",
                    "X-GitHub-Event": "push",
                },
                body: payload,
            });
            await response.body?.cancel();
            if (response.status < 200 || response.status >= 300) {
                throw new Error("Webhook rejected");
            }
            this.logger.log("Dokploy webhook accepted the deployment request.");
        }
        catch {
            throw new Error("Dokploy webhook failed or rejected the request. Check Dokploy deployment logs.");
        }
    }
}
