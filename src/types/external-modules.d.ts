/**
 * Compatibility declarations for package builds that expose these runtime
 * exports but omit their declaration files. They can be removed once the
 * dependency installation is refreshed with a complete package archive.
 */
import "kysely";

declare module "kysely" {
  export const PostgresAdapter: new () => any;
  export const PostgresIntrospector: new (db: any) => any;
  export const PostgresQueryCompiler: new () => any;
}
