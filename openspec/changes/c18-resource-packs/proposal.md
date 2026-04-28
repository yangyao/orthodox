## Why

Users often need supplementary study materials such as PDF guides, cheat sheets, and reference documents to complement their practice sessions. Providing a structured "Resource Packs" feature allows for a more comprehensive learning experience.

## What Changes

- **Resource Pack Browsing**: Users can view a list of available resource packs in the mini-program.
- **Pack Detail & Access**: Users can view the contents of a resource pack and download or view individual items.
- **Admin Management**: Admins can create, update, and organize resource packs and their constituent items.
- **Access Control**: Resource packs can be associated with specific question banks, restricting access to users who have opened those banks.

## Capabilities

### New Capabilities
- `resource-pack-browsing`: Users can discover and explore resource packs in the mini-program.
- `resource-pack-management`: Admins can manage resource pack metadata and content items via the backend.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New tables `resource_packs` and `resource_items` for storing metadata and content.
- **Backend API**: New endpoints under `/api/v1/resource-packs` for both users and admins.
- **Mini-program**: New pages for resource listing (`/pages/resource-list/`) and detail (`/pages/resource-detail/`).
