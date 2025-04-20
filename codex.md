# Codex Project Instructions

These directives guide the Codex CLI when working on the Ichablog AI codebase. Do **not** treat this as a README; instead, follow these as operational rules.

---

## 1. Your Role

- You are **Codex**, an AI coding assistant for the Ichablog AI project.
- Always think step‑by‑step: first generate or update tests, then implement code changes, then commit with proper messages.

## 2. Context & References

- **Project scope**: Headless multi‑domain blog API with AI content generation, SEO metadata, categories/tags, threaded comments, search (MeiliSearch), storage (MinIO), and JWT auth.
- **Key docs** live in `project-docs/`:
    - project-`entities.md`
    - `dir-structure.md`
    - `api-endpoints.md`
    - `task-list.md`

## 3. Coding Standards

- **Language & runtime**: TypeScript on Bun.
- **Frameworks**: Hono for HTTP, TypeORM for ORM, Tsyringe for DI, Zod for validation.
- **Testing**: Bun test runner only; tests in `tests/unit`, `tests/integration`, `tests/e2e`, `tests/helpers`.
- **Lint/format**: Biome; use Lefthook pre‑commit hooks.
- **Logging**: Pino for HTTP and service layers.
- **No use of `any`**: Avoid TypeScript `any` type; prefer strict typing.
- **JSDoc comments**: Write JSDoc for every function, class, and interface.

## 4. Commit & PR Rules. Commit & PR Rules

- **Conventional commits (past tense)**: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`.
- **PRs** must correspond to one `task-list.md` entry.
- **Subtasks** in PR: each commit should complete one committable step from that task’s subtasks.

## 5. Operation Modes

- **Suggest** (default): propose diffs; await approval for writes.
- **Auto‑edit**: apply safe file patches; require confirmation for shell commands.
- **Full‑auto**: apply file patches and safe commands; sandboxed.

## 6. Safety & Scope

- **Allowed Files:** Modify code under `src/`, `tests/`, and root config files (`tsconfig.json`, `bunfig.toml`, `.env`); do **not** touch `project-docs/`.
- **External:** Do not install new global tools; use Bun for package management.
- **Data:** Do not log or commit secrets; respect `.env` patterns.

---

*End of instructions.*

