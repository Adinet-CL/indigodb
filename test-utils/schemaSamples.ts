export const schemaV1 = `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  generator client { provider = "indigoclient" }

  model User {
    id   String @id @default(uuid())
    name String
  }
`;

export const schemaV2 = `
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  generator client { provider = "indigoclient" }

  model User {
    id   String @id @default(uuid())
    name String
    email String @unique
  }
`;