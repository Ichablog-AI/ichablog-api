# Directory Structure

A proposed layout for the headless blog API project:

```
project-root/
├─ docker/                  # Docker-related files and configs
│  ├─ Dockerfile            # Multi-stage build for Bun app
│  ├─ docker-compose.yml    # Local stack: app, MariaDB, MinIO, MeiliSearch
│  └─ .env                  # Environment variables for local Docker
├─ src/                     # Application source code
│  ├─ index.ts              # Entrypoint: import and start the server
│  ├─ server.ts             # Hono app setup and route mounting
│  ├─ config/               # Environment and client configuration
│  │  ├─ index.ts           # Load and export env variables
│  │  ├─ database.ts        # TypeORM (MariaDB) config
│  │  └─ meilisearch.ts     # MeiliSearch client setup
│  ├─ middleware/           # Reusable Hono middlewares
│  │  ├─ auth.ts            # Authentication guard
│  │  ├─ errorHandler.ts    # JSON error formatting
│  │  └─ logger.ts          # Pino-based request logging
│  ├─ routes/               # Hono routers for API endpoints
│  │  ├─ health.ts          # Health-check
│  │  ├─ blogDomains.ts     # CRUD for blog domains
│  │  ├─ articles.ts        # CRUD for articles
│  │  ├─ comments.ts        # Comment endpoints
│  │  └─ ai.ts              # AI-assisted actions (summaries, drafts)
│  ├─ entities/             # TypeORM entity definitions
│  │  ├─ UserEntity.ts
│  │  ├─ BlogDomainEntity.ts
│  │  ├─ ArticleEntity.ts
│  │  ├─ ArchivedSlugEntity.ts
│  │  ├─ TagEntity.ts
│  │  ├─ CategoryEntity.ts
│  │  └─ CommentEntity.ts
│  ├─ schemas/              # Zod input/output schemas
│  ├─ services/             # External-service clients & wrappers
│  │  ├─ minioClient.ts     # MinIO SDK wrapper
│  │  ├─ cacheClient.ts     # Generic cache interface
│  │  └─ ollamaClient.ts    # Ollama-js wrapper
├─ tests/                   # Test suites organized by type
│  ├─ unit/                 # unit tests
│  ├─ integration/          # integration tests
│  ├─ e2e/                  # end-to-end tests
│  └─ helpers/              # shared test utilities and helpers
├─ tsconfig.json            # TypeScript compiler options
├─ bunfig.toml              # Bun configuration (if using bunfig)
├─ project-docs/            # project development documentation
├─ .gitignore
├─ .env                     # project env vars
├─ .env.example             # sample project env vars
└─ README.md
```

