# API Endpoints

A reference for all RESTful API endpoints exposed by the headless blog service.

---

## 1. Health Check

| Method | Path      | Description            |
| ------ | --------- | ---------------------- |
| GET    | `/health` | Returns server status. |

**Response**:
```json
{ "status": "ok" }
```

---

## 2. Authentication

| Method | Path             | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| POST   | `/auth/register` | Register a new user account.               |
| POST   | `/auth/login`    | Obtain JWT for protected APIs.             |
| GET    | `/auth/identify` | Validate JWT and return current user info. |

**Request** (login):
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response**:
```json
{ "token": "<jwt>" }
```

---

## 3. User Profiles

| Method | Path          | Description                    |
| ------ | ------------- | ------------------------------ |
| GET    | `/users/:id`  | Fetch user profile.            |
| PATCH  | `/users/:id`  | Update user profile fields.    |

## 4. Blog Domains

| Method | Path              | Description                                 |
| ------ | ----------------- | ------------------------------------------- |
| GET    | `/domains`        | List all domains for authenticated user.    |
| POST   | `/domains`        | Create a new blog domain.                   |
| GET    | `/domains/:id`    | Retrieve details of one domain.             |
| PATCH  | `/domains/:id`    | Update domain metadata.                     |
| DELETE | `/domains/:id`    | Delete a domain (cascade articles).         |

**Request** (create):
```json
{ "name": "My Blog", "domain": "blog.example.com" }
```

---

## 5. Articles

| Method | Path               | Description                                           |
| ------ | ------------------ | ----------------------------------------------------- |
| GET    | `/articles`        | List all articles (supports filters).                 |
| POST   | `/articles`        | Create a new article.                                 |
| GET    | `/articles/:id`    | Retrieve a single article by ID.                      |
| PATCH  | `/articles/:id`    | Update article (optimistic lock via `version`).       |
| DELETE | `/articles/:id`    | Delete an article (cascade comments, archive slug).   |

**Query parameters** for GET `/articles`:
- `domainId`: filter by domain ID
- `category`: filter by category slug
- `tag`: filter by tag slug
- `published=true|false`: filter by publication status
- `page`, `limit`: pagination

**Request** (create/update):
```json
{
  "domainId": 1,
  "title": "My First Post",
  "slug": "my-first-post",
  "excerpt": "A short summary...",
  "content": "# Heading\nFull content...",
  "publishedAt": "2025-04-21T12:00:00Z",
  "imageKey": "path/to/image.png",
  "metaTitle": "My First Post – Blog",
  "metaDescription": "An introduction to...",
  "canonicalUrl": "https://blog.example.com/my-first-post",
  "robots": "index,follow",
  "ogTitle": "My First Post",
  "ogDescription": "An intro...",
  "ogImageKey": "path/to/og-image.png",
  "twitterTitle": "My First Post",
  "twitterDescription": "An intro for Twitter...",
  "twitterImageKey": "path/to/twitter-image.png",
  "structuredData": "{...}"
}
```

---

## 6. Comments

| Method | Path                                          | Description                                  |
| ------ | --------------------------------------------- | -------------------------------------------- |
| GET    | `/articles/:articleId/comments`               | List approved comments (threaded).           |
| POST   | `/articles/:articleId/comments`               | Submit a new comment (status=`pending`).    |
| PATCH  | `/articles/:articleId/comments/:commentId`    | Moderate comment (`status` → `approved`/`rejected`). |

---

## 7. Tags

| Method | Path        | Description                          |
| ------ | ----------- | ------------------------------------ |
| GET    | `/tags`     | List all tags.                       |
| POST   | `/tags`     | Create a new tag.                    |
| GET    | `/tags/:id` | Retrieve tag details.                |
| PATCH  | `/tags/:id` | Update tag metadata.                 |
| DELETE | `/tags/:id` | Delete a tag (remove associations).  |

---

## 8. Categories

| Method | Path               | Description                            |
| ------ | ------------------ | -------------------------------------- |
| GET    | `/categories`      | List all categories (hierarchical).    |
| POST   | `/categories`      | Create a new category.                 |
| GET    | `/categories/:id`  | Retrieve category details.             |
| PATCH  | `/categories/:id`  | Update category metadata.              |
| DELETE | `/categories/:id`  | Delete a category (cascade or reassign).|

---

## 9. AI Endpoints

| Method | Path                       | Description                                  |
| ------ | -------------------------- | -------------------------------------------- |
| POST   | `/ai/generate-summary`     | Generate or refine summary from content.     |
| POST   | `/ai/generate-headings`    | Suggest headings/outline based on content.   |
| POST   | `/ai/generate-meta-tags`   | Generate SEO `metaTitle` & `metaDescription`.|

---

## 10. SEO & Sitemap

| Method | Path           | Description                                 |
| ------ | -------------- | ------------------------------------------- |
| GET    | `/sitemap.xml` | XML sitemap of all published articles.      |
| GET    | `/robots.txt`  | Robots exclusion directive file.            |

---

*All protected routes require `Authorization: Bearer <token>`.*

