# Finzoop Project: Frontend & CMS Integration

This repository contains the complete Finzoop static website and the Strapi v4 CMS backend. It was built to completely replace hardcoded content and emoji icons with a dynamic CMS system and Lucide SVG icons.

## 1. Project Overview
Finzoop is an Indian financial services distribution platform. The new architecture is a hybrid decoupled model:
- **Frontend**: Pure HTML/CSS/JS (vanilla) leveraging progressive enhancement. No node_modules or build step required.
- **Backend**: Strapi v4 (headless CMS) using SQLite for development and PostgreSQL for production. REST APIs serve JSON to the vanilla frontend.

## 2. Folder Structure
```
finzoop-vanilla-master/
├── index.html, about.html, etc... (29 Static Pages)
├── style.css (Core styles + Skeleton Loaders)
├── main.js (UI Logic)
├── cms.js (Global CMS Client)
├── cms-preview.js (Inline Edit / Preview Mode)
├── publish-control.js (Draft/Publish toggling)
├── blog.js (Strapi Blog Render Logic)
├── wordpress-blog.js (WordPress alternative)
└── finzoop-cms/ (Strapi Backend)
    ├── package.json
    ├── .env.example
    ├── config/
    └── src/
        ├── index.js (Seeder)
        ├── admin/
        └── api/ (12 Content Types)
```

## 3. Local Development Setup

### Frontend Setup
No build server required! Simply open `index.html` in your web browser. 
*(For optimal behavior, use Live Server in VS Code to avoid any CORS or file:// protocol restrictions while fetching from local CMS)*

### CMS Setup
1. `cd finzoop-cms`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in necessary keys if missing.
4. `npm run develop`
5. The admin panel will start at: http://localhost:1337/admin
6. On the first launch, create your Super Admin user. The bootstrap script `src/index.js` will automatically seed the initial content.

## 4. Environment Variables
Inside `finzoop-cms`, use `.env`:
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2
API_TOKEN_SALT=salt
ADMIN_JWT_SECRET=adminSecret
JWT_SECRET=jwtSecret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
STRAPI_URL=http://localhost:1337
FRONTEND_URL=http://localhost:3000
```
*(See `.env.example` for details).*

## 5. Connecting Frontend to CMS
- The frontend looks for `window.CMS_URL`. It defaults to `http://localhost:1337`.
- **Authentication**: Generate a Public REST API token in Strapi Admin -> Settings -> API Tokens.
- Set it in the HTML head or via a build step:
  ```javascript
  window.CMS_URL = 'http://localhost:1337';
  window.CMS_TOKEN = 'YOUR_GENERATED_TOKEN';
  ```

## 6. Blog Setup — Strapi vs WordPress
Both implementations share the same UI signature. By default, `blog.html` uses Strapi.
To switch to WordPress:
1. Open `blog.html`.
2. Locate `<script src="/blog.js"></script>`.
3. Change it to `<script src="/wordpress-blog.js"></script>`.

## 7. Production Deployment
- **Frontend**: Deploy the root folder (`/`) to Vercel, Netlify, or Cloudflare Pages.
- **CMS**: Deploy `finzoop-cms/` to Render, Railway, or DigitalOcean App Platform.
- Set `DATABASE_CLIENT=postgres` and provide `DATABASE_URL` in your production environments.
- Be sure to update `FRONTEND_URL` in the CMS `.env` to prevent CORS issues.

## 8. Content Management Workflow
- **Add Blog Post**: Strapi Admin -> Content Manager -> Blog Post -> Create new entry. Set `PublishedAt` and toggle `IsPublished`.
- **Edit Hero**: Content Manager -> Hero Banner -> Select Page Hero -> Edit content.
- **Navigation/Maintenance**: Content Manager -> Global Settings / Navigation.
- **Preview Mode**: Append `?preview=true` to any frontend URL (e.g., `index.html?preview=true`) to show inline edit badges linking directly to the CMS.

## 9. Icon Reference (Lucide)
All emoji icons have been replaced with the matching Lucide tags (e.g. `<i data-lucide="..."></i>`).
- **Nav**: `menu`, `x`, `chevron-down`, `arrow-left`, `arrow-right`, `search`, `settings`, etc.
- **Products**: `banknote`, `credit-card`, `shield-check`, `trending-up`, `landmark`, `house`, `car`
- **Features**: `check-circle`, `star`, `lock-keyhole`, `globe`, `zap`
- **Calculators**: `calculator`, `calendar-days`, `coins`, `refresh-cw`

## 10. Publish Control
- **`isPublished`**: Boolean added to every schema. Any entry where `isPublished: false` will NOT be fetched by the frontend frontend APIs (`filters[isPublished][$eq]=true`).
- **`publishedAt`**: Strapi's built-in draft/publish feature. Entries only appear when `publishedAt` is completely validated by the backend.
