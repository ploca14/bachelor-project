import type { DB } from "./types";
import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";

export type KyselyClient = Kysely<DB>;

const kyselyClient = () => {
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    }),
  });

  const kysely = new Kysely<DB>({
    dialect,
  });

  return kysely;
};

export const useKyselyClient = singletonScope(() => {
  return kyselyClient();
});
