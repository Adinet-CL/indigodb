# IndigoDB 2.0 🚀

**IndigoDB** is a schema‑first, TypeScript ORM with optional realtime sockets.

*Adapters available*: **PostgreSQL** · **MongoDB** (extensible)

---

## ✨ Key features

| Feature | Details |
|---------|---------|
| **Schema‑first** | Define models in a single `indigodb.schema` file using a clean, declarative DSL (see example below). |
| **Optional realtime** | Turn on WebSocket events with one flag; auto‑emit `create / update / delete` to subscribed clients. |
| **Powerful CLI** | `indigodb init`, `dev`, `diff`, `migrate`, `rollback`, `generate`. |
| **Modular architecture** | Clean separation of **core**, **runtime**, **adapters**, **socket** & **cli** packages. |
| **SOLID‑driven codebase** | Each concern lives in its own provider; easy to extend or replace. |

---

## 🛠️ Install

```bash
pnpm add -D @adinet/indigodb
```

> IndigoDB is distributed as a monorepo; installing the root package pulls only what you need. Use `--filter` flags for custom builds.

---

## ⚡ Quick start

```bash
npx indigodb init   # interactive wizard
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/mydb" > .env
npx indigodb dev    # watches schema & generates client
```

**Example `indigodb.schema`**
```speciesql
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  published Boolean  @default(false)
}
```

**Client usage (Node.js)**
```ts
import { IndigoDBClient } from './generated/client'

const db = new IndigoDBClient({ realtime: true })

await db.user.create({
  data: { email: 'alice@example.com', name: 'Alice' }
})

const posts = await db.post.findMany({ where: { published: true } })
```

---

## 🛣️ Roadmap (extract)

- MySQL & SQLite adapters
- Schema decorators (alternative to DSL)
- Frontend auto‑refresh library
- Diff viewer UX polish

---

## 🤝 Contributing

1. Fork & clone
2. `pnpm i`
3. `pnpm dev` – watches packages
4. Run all tests with `pnpm turbo run test`

Please follow the conventional commit spec; commit linting is enforced in CI.

---

## 📝 License

MIT © Adinet‑CL
