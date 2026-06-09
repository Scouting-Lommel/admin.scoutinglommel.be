# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-12
**Commit:** d881638
**Branch:** main

## OVERVIEW
Scouting Lommel website backend — Strapi v5 CMS with MySQL, deployed on Heroku. 25 content-type API modules with dynamic page-building via content blocks.

## STRUCTURE
```
./
├── config/           # Strapi config (6 files: server, database, admin, api, plugins, middlewares)
├── database/         # DB migrations
├── documentation/    # Project + deployment docs
├── public/           # Static uploads
├── src/
│   ├── admin/        # Admin panel (Dutch locale only)
│   ├── api/          # 25 content-type modules ← MAIN CODE
│   ├── components/   # 29 reusable component schemas
│   ├── extensions/   # Plugin overrides (users-permissions)
│   └── index.ts      # Bootstrap file (empty)
├── .github/workflows/  # CI pipeline
├── package.json
├── tsconfig.json     # TypeScript configuration
└── README.md
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Content model (what data exists) | `src/api/*/content-types/*/schema.json` | 25 types |
| Page structure (dynamic zones) | `src/components/content-blocks/` | 16 block types |
| Admin customization | `src/admin/app.ts` | Locales, bootstrap |
| Plugin config | `config/plugins.ts` | Cloudinary + Google Maps |
| Security/CSP headers | `config/middlewares.ts` | Custom CSP for external services |
| User schema extension | `src/extensions/users-permissions/` | Leader relation added |
| CI/CD | `.github/workflows/ci.yml` | pnpm, Node 22 |

## CONVENTIONS
- All controllers/services/routes use Strapi v5 `factories` boilerplate (no custom logic)
- Content-type names: kebab-case in API dirs, camelCase in collectionName
- Components organized by category: `content-blocks/`, `general/`, `shared/`
- Page single-types use `blocks` dynamic zone + `pageMeta` component pattern
- Dutch-only admin locale (`nl`)
- pnpm package manager, frozen lockfile in CI
- Node >=20.0.0 <=24.x.x
- TypeScript for all source files (src/, config/)

## ANTI-PATTERNS (THIS PROJECT)
- No custom controllers/services beyond factory boilerplate — all business logic is in the frontend
- No test files — no unit/integration tests exist

## COMMANDS
```bash
pnpm build    # strapi build
pnpm dev      # strapi develop
pnpm start    # strapi start
pnpm strapi   # strapi CLI
```

## NOTES
- All 25 API modules follow identical structure: schema.json + factory controller/service/routes
- Google Maps plugin (`@amicaldo/strapi-google-maps`) + Cloudinary upload configured
- GraphQL plugin installed but no custom resolvers
- Strapi uuid: `b7ca386d-29d3-4bee-a89d-bcc53a30cb7e`
