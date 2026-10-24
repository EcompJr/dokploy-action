import { statSync } from "node:fs";
import { join } from "node:path";
import type { ProjectValidator } from "./contracts.mjs";

export class ComposeProject implements ProjectValidator {
  private readonly stat: typeof statSync;

  constructor({ stat = statSync }: { stat?: typeof statSync } = {}) {
    this.stat = stat;
  }

  validate(workspace: string): void {
    const hasCompose = ["compose.dokploy.yml", "compose.dokploy.yaml"].some(
      (name) => {
        try {
          return this.stat(join(workspace, name)).isFile();
        } catch (error) {
          if (
            ["ENOENT", "ENOTDIR"].includes(
              (error as NodeJS.ErrnoException).code ?? "",
            )
          )
            return false;
          throw error;
        }
      },
    );
    if (!hasCompose) {
      throw new Error(
        "Missing compose.dokploy.yml or compose.dokploy.yaml in the calling project root. Check out the project before running this action.",
      );
    }
  }
}
