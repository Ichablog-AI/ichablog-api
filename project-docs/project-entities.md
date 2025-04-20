# Project Entities

A summary of all core entities, their fields, and relations for the headless blog API.

---

## 1. UserEntity

- **Purpose**: Authors and collaborators with access to one or more blog domains.
- **Fields:**
    - `id: number` (Primary Key)
    - `name: string` (full name)
    - `email: string` (unique)
    - `passwordHash: string`
    - `url: string` (profile or personal website)
    - `role: string` (e.g., "admin", "editor", "author")
    - `imageKey: string` (MinIO object key for profile image)
    - `bio: text` (short biography)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Many‑to‑many** ↔ **BlogDomainEntity** (collaborators on multiple domains)

---

## 2. BlogDomainEntity

- **Purpose**: A namespace (e.g., "myblog.example.com") under which articles are grouped.
- **Fields:**
    - `id: number` (PK)
    - `name: string` (display name)
    - `domain: string` (DNS‑style string)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Many‑to‑many** ↔ **UserEntity** (domain owners and collaborators)
    - **One‑to‑many** → **ArticleEntity**

---

## 3. ArticleEntity

- **Purpose**: Represents a single blog post.
- **Fields:**
    - `id: number` (PK)
    - `articleUid: string` (UUIDv7 or generated UUID, indexed)
    - `title: string`
    - `slug: string` (current slug; not unique, managed in service layer)
    - `excerpt: text` (short summary)
    - `content: text` (full body in markdown or HTML)
    - `publishedAt: Date` (nullable)
    - `imageKey: string` (MinIO object key for featured image; nullable)
    - **SEO fields:**
        - `metaTitle: string`
        - `metaDescription: text`
        - `canonicalUrl: string` (optional)
        - `robots: string` (e.g., "index,follow" or "noindex,nofollow")
        - `ogTitle: string` (optional)
        - `ogDescription: text` (optional)
        - `ogImageKey: string` (MinIO key; optional)
        - `twitterTitle: string` (optional)
        - `twitterDescription: text` (optional)
        - `twitterImageKey: string` (MinIO key; optional)
        - `structuredData: text` (JSON-LD; optional)
    - `version: number` via `@VersionColumn` (optimistic locking)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Many‑to‑one** → **BlogDomainEntity**
    - **One‑to‑many** → **CommentEntity**
    - **One‑to‑many** → **ArchivedSlugEntity**
    - **Many‑to‑many** ↔ **TagEntity**
    - **Many‑to‑many** ↔ **CategoryEntity**

---

## 4. ArchivedSlugEntity

- **Purpose**: Stores historical slugs for articles, tags, or categories when they change.
- **Fields:**
    - `id: number` (PK)
    - `slug: string`
    - `type: enum` (`article` | `tag` | `category`)
    - `foreignEntityId: number` (ID of the original entity)
    - `createdAt: Date` via `CreateDateColumn`

---

## 5. TagEntity

- **Purpose**: Flat labels for filtering and related-post recommendations.
- **Fields:**
    - `id: number` (PK)
    - `name: string` (unique)
    - `slug: string` (unique)
    - `description: text` (optional)
    - **SEO fields:**
        - `metaTitle: string` (optional)
        - `metaDescription: text` (optional)
        - `canonicalUrl: string` (optional)
        - `ogImageKey: string` (MinIO key; optional)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Many‑to‑many** ↔ **ArticleEntity**

---

## 6. CategoryEntity

- **Purpose**: Hierarchical buckets for broad topic organization.
- **Fields:**
    - `id: number` (PK)
    - `name: string` (unique)
    - `slug: string` (unique)
    - `description: text` (optional)
    - **SEO fields:**
        - `metaTitle: string` (optional)
        - `metaDescription: text` (optional)
        - `canonicalUrl: string` (optional)
        - `ogImageKey: string` (MinIO key; optional)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Tree** structure (`@Tree()`, strategy configurable)
    - **Many‑to‑many** ↔ **ArticleEntity**

---

## 7. CommentEntity

- **Purpose**: Threaded comments on articles, with moderation statuses.
- **Fields:**
    - `id: number` (PK)
    - `content: text`
    - `authorName: string`
    - `authorEmail: string` (nullable)
    - `status: enum` (`pending` | `approved` | `rejected`)
    - `createdAt: Date` via `CreateDateColumn`
    - `updatedAt: Date` via `UpdateDateColumn`
- **Relations:**
    - **Tree** structure (`@Tree()`, strategy configurable)
    - **Many‑to‑one** → **ArticleEntity**

---

*Additional SEO metadata for ArticleEntity includes canonical URLs, robots directives, Open Graph and Twitter Card fields, and optional JSON-LD structured data.*

