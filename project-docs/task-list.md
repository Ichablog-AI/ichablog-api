# Task List

A breakdown of PR‑sized tasks with purpose, goals, expected files, and subtasks.

---

## 1. Initialize Bun project, directory structure, tooling, test runner, and config/env setup
**completed**

**Purpose:** Scaffold the foundation of the project with all necessary configuration.
**Goals:**
- Initialize a Bun workspace with TypeScript support.
- Install development tools (Biome, Lefthook, Conventional Commits).
- Set up Bun test runner.
- Create environment loading.

**Files Created/Modified:**
- `bunfig.toml`, `tsconfig.json`, `.gitignore`
- `package.json` (via `bun init`)
- `config/index.ts`, `.env.example`
- `tests/` directories

**Subtasks:**
1. Run `bun init` to scaffold project.
2. Install and configure Biome, Lefthook, and Commitlint.
3. Create directory structure (`src/`, `docker/`, `tests/`).
4. Configure Bun test runner (`bun test`) and create `tests/unit`, `tests/integration`, `tests/e2e`, `tests/helpers` directories.
5. Add `src/config/index.ts` to load `.env` and export settings.

---

## 2. Create Pino service logger
**completed**
**Purpose:** Provide a separate logger for business-logic layers.
**Goals:**
- Instantiate a dedicated Pino instance for services.
- Make it injectable via Tsyringe ( in the DI task)

**Files Created/Modified:**
- `src/services/LoggerRegistry.ts`
- `src/utils/logger.ts`

**Subtasks:**
1. Create `logger.ts` exporting a Pino logger.
2. Create `LoggerRegistry.ts` class to manage module level loggers
3. Add tests for `LoggerRegistry` behavior.

---

## 3. Configure Tsyringe dependency injection container
**complete**
**Purpose:** Enable DI for services and controllers.
**Goals:**
- Install Tsyringe.
- Register core classes (clients, services) in the container.

**Files Created/Modified:**
- `src/config/container.ts`
- `package.json`

**Subtasks:**
1. Install `tsyringe`.
2. Create `container.ts` and register bindings.
3. inject LoggerRegistry

---

## 4. Implement generic storage abstraction and register two StorageBase instances

**Purpose:**
Provide a unified storage interface for file operations via a single `StorageBase` class, and configure two distinct instances—one for post images, one for profile images—in the DI container.

**Goals:**
- Define a `StorageConfig` type capturing connection and bucket settings.
- Define a `StorageInterface` for common file operations.
- Implement a `StorageBase` class that instantiates a MinIO client and implements `StorageInterface`.
- Register two named instances of `StorageBase` in Tsyringe, each with its own bucket configuration.
- Write unit tests covering `StorageBase` behavior and DI registration.

**Files Created/Modified:**
- `src/services/storage/interfaces/StorageConfig.ts`
- `src/services/storage/interfaces/StorageInterface.ts`
- `src/services/storage/StorageBase.ts`
- `src/config/container.ts` (register two StorageBase instances: `PostStorage` and `ProfileStorage`)
- Tests:
    - `tests/unit/StorageBase.test.ts`
    - `tests/unit/ContainerStorage.test.ts`

**Subtasks:**
1. **Define `StorageConfig`** in `src/services/storage/interfaces/StorageConfig.ts`:
    - Properties: `endPoint`, `port`, `useSSL`, `accessKey`, `secretKey`, `bucket`.
2. **Define `StorageInterface`** in `src/services/storage/interfaces/StorageInterface.ts`:
    - Methods: `saveFile`, `deleteFile`, `getBuffer`, `getFile`, `getPresignedUrl`, `getImageUrl`.
3. **Implement `StorageBase`** in `src/services/storage/StorageBase.ts`:
    - Constructor should accept a pre-configured `Minio.Client` instance and a `bucket` string, rather than instantiating the client.
    - Assign the injected client and bucket to protected fields.
    - Implement all methods from `StorageInterface`, handling both buffer and file sources using the injected client.

4. **Register `Minio.Client` and `StorageBase` instances in `src/config/container.ts`:**
    - Create and configure a single `Minio.Client` for posts (`postClient`) using `postConfig`, and register: `container.registerInstance<Minio.Client>('PostMinioClient', postClient)`.
    - Create and configure another `Minio.Client` for profiles (`profileClient`) using `profileConfig`, and register: `container.registerInstance<Minio.Client>('ProfileMinioClient', profileClient)`.
    - Register storage instances by injecting each client and its bucket:
      ```ts
      container.registerInstance<StorageInterface>(
        'PostStorage',
        new StorageBase(postClient, postConfig.bucket)
      )
      container.registerInstance<StorageInterface>(
        'ProfileStorage',
        new StorageBase(profileClient, profileConfig.bucket)
      )
      ```

5. **Write unit tests** for `StorageBase`:
    - Mock `Minio.Client` to verify each method delegates to the correct bucket.
6. **Write unit tests** for DI registration:
    - Resolve both `PostStorage` and `ProfileStorage` from the container and assert their `bucket` property matches expected values.
___
## 5. Create MinIO client service with logging and tests
**Purpose:** Wrap MinIO SDK for object storage operations.
**Goals:**
- Configure MinIO client using env settings.
- Integrate service-level logging.

**Files Created/Modified:**
- `src/services/minioClient.ts`
- `src/config/index.ts`
- `src/config/container.ts`
- Tests in `tests/unit/minioClient.test.ts`

**Subtasks:**
1. Install `minio` SDK.
2. Implement `minioClient.ts` with basic `putObject`/`getObject` methods.
3. Inject `serviceLogger` and log operations.
4. Register in container.
5. Write unit tests mocking MinIO.

---

## 6. Create MeiliSearch client service with logging and tests
**Purpose:** Provide full-text search indexing and querying.
**Goals:**
- Configure MeiliSearch client.
- Expose methods for indexing and search.

**Files Created/Modified:**
- `src/services/meiliClient.ts`
- `src/config/index.ts`
- `src/config/container.ts`
- Tests in `tests/unit/meiliClient.test.ts`

**Subtasks:**
1. Install `meilisearch` SDK.
2. Implement `meiliClient.ts` with `indexDocument` and `search`.
3. Inject `serviceLogger`.
4. Register in container.
5. Write unit tests mocking MeiliSearch.

---

## 7. Create Ollama-js client service with logging and tests
**Purpose:** Wrap Ollama-js for AI-powered content generation.
**Goals:**
- Expose methods for summaries, meta-tags, outlines.
- Log each AI call.

**Files Created/Modified:**
- `src/services/ollamaClient.ts`
- `src/config/index.ts`
- `src/config/container.ts`
- Tests in `tests/unit/ollamaClient.test.ts`

**Subtasks:**
1. Install `ollama-js`.
2. Implement `ollamaClient.ts` with `generateSummary()`, `generateMetaTags()`, etc.
3. Inject `serviceLogger`.
4. Register in container.
5. Write unit tests with stubs for AI responses.

---

## 8. Define core TypeORM entities
**Purpose:** Model database tables for domain logic.
**Goals:**
- Create entities per design: User, BlogDomain, Article, ArchivedSlug, Tag, Category, Comment.

**Files Created/Modified:**
- `src/entities/*.ts`
- `src/config/database.ts`

**Subtasks:**
1. Configure `data-source.ts` for MariaDB.
2. Create `UserEntity.ts` through `CommentEntity.ts` with all fields and decorators.
3. Add `@VersionColumn` and `@Tree()` strategies.
4. Write integration tests for schema sync.

---

## 9. Scaffold Hono server with middleware and base routing
**Purpose:** Set up the HTTP server and attach core routes.
**Goals:**
- Initialize Hono app.
- Mount health, auth, and stub routers.

**Files Created/Modified:**
- `src/server.ts`
- `src/routes/health.ts`, `auth.ts`, `index.ts`
- `src/middleware/logger.ts`
- `package.json` (dependencies)

**Subtasks:**
1. Install `hono`.
2. Create `server.ts` and import routers.
3. Scaffold empty route files under `src/routes`.
4. Write a smoke test hitting `/health`.

---

## 10. Implement authentication and user profile endpoints
**Purpose:** Enable user registration, login, token validation, and profile management.
**Goals:**
- JWT-based auth.
- CRUD for user profiles.

**Files Created/Modified:**
- `src/routes/auth.ts`, `src/routes/users.ts`
- `src/services/authService.ts`, `userService.ts`
- `src/schemas/authSchemas.ts`, `userSchemas.ts`

**Subtasks:**
1. Install `jsonwebtoken`.
2. Implement `authService` for `register`, `login`, and `verifyToken`.
3. Create `auth` and `users` routers with Zod validation.
4. Add integration tests covering auth flows.

---

## 11. Develop blog domain management API
**Purpose:** CRUD operations for blog domains.
**Goals:**
- Ensure only owners/collaborators can modify.

**Files Created/Modified:**
- `src/routes/blogDomains.ts`
- `src/services/blogDomainService.ts`
- `src/schemas/domainSchemas.ts`

**Subtasks:**
1. Implement `blogDomainService` methods: `list`, `create`, `update`, `delete`.
2. Wire up `blogDomains` router with DI and auth guard.
3. Write unit and integration tests.

---

## 12. Develop article management API with SEO support
**Purpose:** Manage articles with full SEO metadata.
**Goals:**
- Full CRUD with slug and versioning.

**Files Created/Modified:**
- `src/routes/articles.ts`
- `src/services/articleService.ts`
- `src/schemas/articleSchemas.ts`

**Subtasks:**
1. Implement `articleService` for create, update (with version check), delete.
2. Add SEO fields handling in service and router.
3. Write integration tests for SEO metadata flows.

---

## 13. Build tag and category management API
**Purpose:** Manage taxonomies for content organization.
**Goals:**
- CRUD for tags and categories with tree support.

**Files Created/Modified:**
- `src/routes/tags.ts`, `categories.ts`
- `src/services/tagService.ts`, `categoryService.ts`
- `src/schemas/tagSchemas.ts`, `categorySchemas.ts`

**Subtasks:**
1. Implement services for tags and categories.
2. Scaffold routers with validation.
3. Test hierarchical queries for categories.

---

## 14. Implement threaded comments and moderation API
**Purpose:** Enable nested comments with moderation.
**Goals:**
- Post, list, and moderate comments.

**Files Created/Modified:**
- `src/routes/comments.ts`
- `src/services/commentService.ts`
- `src/schemas/commentSchemas.ts`

**Subtasks:**
1. Implement CRUD and status update in `commentService`.
2. Wire up comments router with tree loading.
3. Write integration tests covering threading and moderation.

---

## 15. Add AI‑assisted content endpoints
**Purpose:** Expose AI capabilities for content generation.
**Goals:**
- Summary, outline, and meta‑tag generation.

**Files Created/Modified:**
- `src/routes/ai.ts`
- `src/services/aiService.ts`
- `src/schemas/aiSchemas.ts`

**Subtasks:**
1. Implement `aiService` using `ollamaClient`.
2. Create router endpoints with Zod schemas.
3. Write unit tests mocking AI responses.

---

## 16. Add sitemap.xml and robots.txt endpoints
**Purpose:** Serve SEO‑critical files.
**Goals:**
- Dynamic sitemap generation.

**Files Created/Modified:**
- `src/routes/seo.ts`

**Subtasks:**
1. Implement `/sitemap.xml` route gathering published articles.
2. Add `/robots.txt` static handler.
3. Test XML output for correctness.

---

## 17. Configure Docker environment for local and production
**Purpose:** Containerize the application and dependencies.
**Goals:**
- Multi‑stage build, Compose for dev.

**Files Created/Modified:**
- `docker/Dockerfile`, `docker/docker-compose.yml`, `docker/.env`

**Subtasks:**
1. Write multi‑stage Dockerfile for Bun app.
2. Define Compose services: app, MariaDB, MinIO, MeiliSearch.
3. Test local bring-up and teardown.

