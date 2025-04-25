import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { MongoDBContainer }    from "@testcontainers/mongodb";

export interface StartedDB {
  url: string;
  stop(): Promise<void>;
}

// PostgreSQL helper
export async function postgresContainer(): Promise<StartedDB> {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withUsername("postgres")
    .withPassword("test")
    .withDatabase("postgres")
    .start();

  return {
    url: container.getConnectionUri(),
    stop: async () => {
      await container.stop();
    },
  };
}

// MongoDB helper
export async function mongoContainer(): Promise<StartedDB> {
  const container = await new MongoDBContainer("mongo:7").start();

  return {
    url: container.getConnectionString(),
    stop: async () => {
      await container.stop();
    },
  };
}
