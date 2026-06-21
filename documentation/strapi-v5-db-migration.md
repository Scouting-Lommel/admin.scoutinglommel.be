# v4 → v5 Database Migration

One-time migration of all content from the pre-v4 Strapi database into the v5 schema.

## Overview

All collection types, single types, and components were migrated from the v4 MySQL dump into the current v5 schema, preserving IDs and content. System tables (users, roles, permissions, uploads) were excluded and recreated by Strapi v5 on startup.

## What Was Migrated

- **Collection types**: activities, leaders, members, groups, events, faq-items, manuals, year-themes, tarifs, social-items, group-functions
- **Single types**: home-page, contact-page, info-page, groups-page, rental-page, privacy-policy-page, cookie-policy-page, drugs-alcohol-policy-page, register-page, manuals-overview-page, general-data
- **Components**: all content-blocks and general components
- **Relations**: activity ↔ group, leader ↔ group, leader ↔ group-function, general-data ↔ year-theme/socials
- **Media**: **not migrated** — images, files, and uploads must be re-uploaded manually

## Key Challenges & Fixes

### 1. Schema Differences (v4 → v5)

| v4 Pattern | v5 Equivalent |
|---|---|
| `id` primary key | `id` + `document_id` (26-char random string) |
| Relation link tables (`_links`) | FK columns or `_lnk` tables |
| Component join tables (`_components`) | `_cmps` tables with `cmp_id` |
| Component relation link tables | v5 uses different storage — skipped |
| `faq_item_order`, `file_order`, etc. | Removed (not in v5 schema) |

### 2. Missing Tables

Several v4 tables no longer exist in v5 and were skipped:
- `components_content_blocks_faq_blocks_faq_items_links`
- `components_content_blocks_hero_blocks_year_theme_links`
- `components_content_blocks_tarifs_blocks_tarifs_links`
- `components_general_footer_navs` / `components_general_navigation_items`
- `files`, `files_related_morphs`, `google_maps_configs`

### 3. Draft & Publish

All types with `draftAndPublish: true` require **two rows per document** in v5:
- One draft (`published_at IS NULL`) — what the admin displays
- One published (`published_at IS NOT NULL`) — what the API returns

The migration only created published rows. Draft versions and component links (`_cmps`) had to be fixed afterwards so the admin panel could display content correctly.

### 4. Required Fields

v5 added new required fields to single types (`title`, `slug`) that didn't exist in v4. These were populated with sensible defaults after import.

## Migration Steps

1. **Import content** from v4 dump into v5 tables (`INSERT IGNORE`)
2. **Populate required fields** (titles, slugs on single types)
3. **Create draft versions** for all `draftAndPublish` types
4. **Update component links** (`_cmps.entity_id`) to point to draft rows
5. **Restart Strapi** to re-index the document API

## Verification

After migration, verify in the Strapi admin:
- Collection types show all entries
- Single types show all fields (title, slug, pageMeta, blocks)
- Component data renders correctly in dynamic zones
- Relations are linked (e.g., activities show their group)

## Notes

- This was a **one-time migration**. The v4 database is no longer the source of truth.
- All new content should be created/edited directly in Strapi v5.
- System tables (users, permissions, uploads) were **not migrated** — they were recreated by v5.
- **Media was not migrated** — images, files, and uploads must be re-uploaded manually via the Strapi admin or a separate import process.
