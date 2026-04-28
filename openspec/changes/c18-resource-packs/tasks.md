## 1. Database and Schema

- [x] 1.1 Create `admin/src/lib/schema/resource-packs.ts` with `resource_packs` and `resource_items` tables.
- [x] 1.2 Export new schemas in `admin/src/lib/schema/index.ts`.
- [x] 1.3 Generate and run database migrations.

## 2. Backend API Implementation

- [x] 2.1 Implement user-facing `GET /api/v1/resource-packs` endpoint.
- [x] 2.2 Implement user-facing `GET /api/v1/resource-packs/:id` endpoint with item lists.
- [x] 2.3 Implement Admin CRUD endpoints for resource packs and items.

## 3. Mini-program Infrastructure

- [x] 3.1 Define `ResourcePack` and `ResourceItem` interfaces in `miniprogram/services/types.ts`.
- [x] 3.2 Create `miniprogram/services/resources.ts` for API interaction.

## 4. Mini-program UI Implementation

- [x] 4.1 Implement `pages/resource-list/` for browsing available packs.
- [x] 4.2 Implement `pages/resource-detail/` for viewing pack contents.
- [x] 4.3 Add entry points to the resource list in the home or profile page.
- [x] 4.4 Register new pages in `miniprogram/app.json`.

## 5. Verification and Seeding

- [x] 5.1 Create a test seed script `admin/scripts/seed-resources.ts`.
- [x] 5.2 Manually verify the end-to-end flow from browsing to item access.
