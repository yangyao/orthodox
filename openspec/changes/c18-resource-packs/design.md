## Context

Currently, the application focuses on question-based practice. Users need a way to access high-quality study materials like PDF guides, which are currently not supported in a structured way.

## Goals / Non-Goals

**Goals:**
- Define a schema for resource packs and their constituent items.
- Implement RESTful APIs for managing and retrieving resource packs.
- Build a user-friendly browsing interface in the WeChat mini-program.
- Link resource packs to question banks for access control.

**Non-Goals:**
- In-app PDF editor.
- Video streaming (out of scope for now).
- Social sharing of resources.

## Decisions

- **Schema Design**:
  - `resource_packs`: Stores the container metadata (title, cover image, description, associated `bank_id`).
  - `resource_items`: Stores individual items (title, type: `pdf|link|image`, URL, display order).
- **API Structure**:
  - `GET /api/v1/resource-packs`: List packs (optionally filtered by `bankId`).
  - `GET /api/v1/resource-packs/:id`: Detailed view of a pack and its items.
  - `POST/PATCH/DELETE /api/v1/admin/resource-packs`: Admin CRUD operations.
- **Access Control**:
  - If a resource pack is linked to a `bank_id`, the API SHALL verify that the user has access to that bank before returning item URLs.
- **Mini-program UI**:
  - Use a card-based layout for the resource list.
  - Use `wx.openDocument` for PDF viewing and `wx.setClipboardData` for links.

## Risks / Trade-offs

- **[Risk] File Storage Costs** → We will use external storage (COS/OSS) and store only the URLs in the database to keep the DB lean.
- **[Risk] Large File Downloads** → The UI will display file sizes to inform users before they initiate a download.
