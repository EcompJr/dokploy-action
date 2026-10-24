export type Environment = Readonly<Record<string, string | undefined>>;
export type Service = "backend" | "frontend" | "fullstack";

export interface ParsedConfiguration {
  services: Service[];
  webhook: string;
}

export interface ConfigurationParser {
  parse(env: Environment): ParsedConfiguration;
}

export interface ProjectValidator {
  validate(workspace: string): void;
}
