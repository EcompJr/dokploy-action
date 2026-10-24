import { statSync } from "node:fs";
import { join } from "node:path";
export class ComposeProject {
    stat;
    constructor({ stat = statSync } = {}) {
        this.stat = stat;
    }
    validate(workspace) {
        const hasCompose = ["compose.dokploy.yml", "compose.dokploy.yaml"].some((name) => {
            try {
                return this.stat(join(workspace, name)).isFile();
            }
            catch (error) {
                if (["ENOENT", "ENOTDIR"].includes(error.code ?? ""))
                    return false;
                throw error;
            }
        });
        if (!hasCompose) {
            throw new Error("Missing compose.dokploy.yml or compose.dokploy.yaml in the calling project root. Check out the project before running this action.");
        }
    }
}
