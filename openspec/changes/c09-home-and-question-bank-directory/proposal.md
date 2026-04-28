## Why

Users need a central entry point to the application to discover content and navigate to specific question banks. A structured catalog is essential for browsing and searching through the available educational resources efficiently.

## What Changes

- **Home Page Implementation**: Redesign and implement the home page (`miniprogram/pages/index/`) with banners, quick entry icons, and featured question bank lists.
- **Question Bank Catalog**: Create a new catalog/directory page to allow users to browse question banks by category, use search functionality, and view bank details.
- **Data Integration**: Connect UI components to services for fetching dynamic content from the backend.

## Capabilities

### New Capabilities
- `home-page`: The main entry point of the mini-program, providing navigation, highlights, and promotional content.
- `question-bank-catalog`: A directory system for browsing, searching, and filtering question banks by categories and tags.

### Modified Capabilities
<!-- No existing capabilities to modify as openspec/specs/ is currently empty. -->

## Impact

- **Mini-program Pages**: Updates to `miniprogram/pages/index/` and creation of a new catalog page.
- **Services**: New methods in `miniprogram/services/` for fetching catalog and home page data.
- **Assets**: Introduction of new icons and images for the home page and catalog UI.
