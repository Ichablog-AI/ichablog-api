# Project Overview

## Introduction
This headless blog API empowers users to create and manage multiple independent blog domains, leveraging modern technologies and AI assistance. It provides a RESTful JSON interface for all content operations, including domain management, articles, SEO metadata, tagging, categorization, and threaded comments.

## Objectives
- **Scalability:** Support multiple blog domains and concurrent users.
- **Flexibility:** Expose granular APIs for CRUD operations, filtering, and search.
- **Performance:** Optimize with MeiliSearch for full-text search and MinIO for media storage.
- **AI Assistance:** Integrate Ollama-js for automated content generation, summaries, and SEO tagging.
- **Developer Experience:** Built on Bun for fast startup, Hono for lightweight routing, TypeORM for ORM layering, and Tsyringe for DI.

## Core Technologies
- **Runtime & Language:** Bun (JavaScript/TypeScript)
- **Web Framework:** Hono
- **ORM:** TypeORM with MariaDB
- **Search:** MeiliSearch
- **Storage:** MinIO (S3-compatible object storage)
- **Dependency Injection:** Tsyringe
- **AI Integration:** Ollama-js module
- **Logging:** Pino
- **Testing:** Bun test runner (`bun test`)
- **Containerization:** Docker & Docker Compose

## Key Features
1. **Multi-Domain Management**: Users and collaborators can create, assign, and manage multiple blog domains.
2. **Article Lifecycle**: Full CRUD for articles with versioning, slug history, excerpts, and AI-assisted drafts.
3. **SEO Metadata**: Meta titles, descriptions, canonical URLs, robots directives, Open Graph & Twitter Cards, JSON-LD.
4. **Taxonomies**: Hierarchical categories and flat tags for robust content organization and navigation.
5. **Comments**: Threaded comments with moderation workflows and status tracking.
6. **Search & Caching**: Fast, full-text search via MeiliSearch and content caching layers.
7. **AI Services**: Endpoints for generating summaries, outlines, meta tags, and more using Ollama.
8. **Authentication**: JWT-based user registration, login, and token validation.

## Architecture Overview
```
Client → [Auth Layer] → Hono API → Services (TypeORM, MeiliSearch, MinIO, Ollama, Tsyringe) → Data Stores
```  
- **API Layer**: Hono routes with middleware for auth, logging, and error handling.
- **Service Layer**: Injected clients and business logic for each domain (articles, comments, AI).
- **Persistence Layer**: MariaDB for relational data, MeiliSearch for search index, MinIO for media.

## Future Enhancements
- Real-time notifications for comments and domain events.
- GraphQL gateway for flexible client queries.
- Webhooks for content updates and external integrations.
- Admin dashboard for domain analytics and AI usage metrics.

