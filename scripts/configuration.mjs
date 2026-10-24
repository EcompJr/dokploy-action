export class DeploymentConfiguration {
    parse(env) {
        switch (env.SERVICES) {
            case "back":
            case "backend":
                return this.parseBackend(env);
            case "frontend":
                return this.parseFrontend(env);
            case "both":
                return this.parseBoth(env);
            case "fullstack":
                return this.parseFullstack(env);
            default:
                throw new Error("services must be fullstack, both, back, or frontend (backend is an alias for back)");
        }
    }
    parseBackend(env) {
        return { services: ["backend"], webhook: this.parseWebhook(env) };
    }
    parseFrontend(env) {
        return { services: ["frontend"], webhook: this.parseWebhook(env) };
    }
    parseBoth(env) {
        return {
            services: ["backend", "frontend"],
            webhook: this.parseWebhook(env),
        };
    }
    parseFullstack(env) {
        return { services: ["fullstack"], webhook: this.parseWebhook(env) };
    }
    parseWebhook(env) {
        const webhook = env.WEBHOOK_URL;
        if (typeof webhook !== "string")
            throw new Error("Webhook URL must be a string");
        if (env.GITHUB_TOKEN && webhook.includes(env.GITHUB_TOKEN)) {
            throw new Error("Webhook URL must not contain secrets");
        }
        let url;
        try {
            url = new URL(webhook);
        }
        catch {
            throw new Error("Invalid webhook URL");
        }
        if (url.protocol !== "https:")
            throw new Error("Webhook URL must use HTTPS");
        if (url.username || url.password)
            throw new Error("Webhook URL must not contain credentials");
        return webhook;
    }
}
