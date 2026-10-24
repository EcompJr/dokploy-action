import { ComposeProject } from "./compose-project.mjs";
import { DeploymentConfiguration } from "./configuration.mjs";
export class ImagePlanner {
    configuration;
    project;
    constructor({ configuration = new DeploymentConfiguration(), project = new ComposeProject(), } = {}) {
        this.configuration = configuration;
        this.project = project;
    }
    plan(env) {
        const { services } = this.configuration.parse(env);
        this.project.validate(env.GITHUB_WORKSPACE || process.cwd());
        const prefix = (env.IMAGE_PREFIX ||
            env.GITHUB_REPOSITORY ||
            "").toLowerCase();
        if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*\/[a-z0-9]+(?:[._/-][a-z0-9]+)*$/.test(prefix)) {
            throw new Error("image-prefix must be an owner/image path without registry or tag");
        }
        const tag = env.IMAGE_TAG || "latest";
        if (!/^[\w][\w.-]{0,127}$/.test(tag))
            throw new Error("Invalid Docker tag");
        if (!/^[a-f0-9]{40,64}$/.test(env.GITHUB_SHA || ""))
            throw new Error("Invalid commit SHA");
        if (tag === `sha-${env.GITHUB_SHA}`)
            throw new Error("Deployment tag must differ from the commit tag");
        const outputs = {};
        for (const service of ["backend", "frontend", "fullstack"]) {
            outputs[service] = String(services.includes(service));
            if (!services.includes(service))
                continue;
            const image = `ghcr.io/${prefix}-${service}`;
            outputs[`${service}-image`] = `${image}:${tag}`;
            outputs[`${service}-sha-image`] = `${image}:sha-${env.GITHUB_SHA}`;
            outputs[`${service}-cache`] =
                `${prefix.replaceAll("/", "-")}-${service}-${tag}`;
        }
        return outputs;
    }
}
