## Context

The project is a WeChat mini-program for exam preparation. The current home page is using the default template and does not provide any functional value. This change aims to implement the primary navigation and discovery interface for the application, based on the provided UI screenshots.

## Goals / Non-Goals

**Goals:**
- Implement a responsive and visually consistent home page with banners, navigation grid, and featured content.
- Create a question bank catalog page with category sidebar and search functionality.
- Ensure smooth navigation between the home page and the catalog.
- Modularize UI components (e.g., Question Bank Cards) for reuse across different views.

**Non-Goals:**
- Backend API implementation (assume mock data or existing endpoints).
- User authentication logic (handled in C08).
- Detailed question practice logic (handled in subsequent changes).

## Decisions

- **Component-Based UI**: Extract the "Question Bank Card" into a reusable component to ensure consistency between the Home and Catalog pages.
- **Navigation Structure**: Use `wx.navigateTo` for moving from Home to Catalog/Search results.
- **Search Implementation**: Use a local filter for small datasets, but architect for server-side search if the catalog grows.
- **Category Navigation**: Use a vertical `scroll-view` for the category sidebar in the catalog page to support many categories.
- **Styling**: Use `rpx` for all layout and typography to ensure cross-device compatibility.

## Risks / Trade-offs

- **[Risk] Rendering Performance** → Large lists of question banks may cause lag. **Mitigation**: Use `scroll-view` with `type="list"` or implement simple pagination if the number of items exceeds 50.
- **[Risk] Asset Management** → Banners and icons can increase package size. **Mitigation**: Host large images on a CDN and use remote URLs.
