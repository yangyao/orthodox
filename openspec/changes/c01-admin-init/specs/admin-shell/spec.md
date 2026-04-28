## ADDED Requirements

### Requirement: Next.js project initialized in admin directory

The system SHALL have a Next.js project initialized in the `admin/` directory using App Router with TypeScript and strict mode enabled.

#### Scenario: Project structure is valid

- **WHEN** navigating to the `admin/` directory
- **THEN** the directory SHALL contain `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, and `app/` directory with `layout.tsx` and `page.tsx`

#### Scenario: Dev server starts successfully

- **WHEN** running `pnpm dev` in the `admin/` directory
- **THEN** the Next.js dev server SHALL start without errors and serve the default page on localhost

### Requirement: shadcn/ui integrated with Tailwind CSS

The system SHALL have shadcn/ui configured with Tailwind CSS v4, providing a `components/ui/` directory and a `lib/utils.ts` utility file.

#### Scenario: shadcn/ui is functional

- **WHEN** running `npx shadcn add button` in the `admin/` directory
- **THEN** a `components/ui/button.tsx` file SHALL be created and importable without errors

#### Scenario: Tailwind CSS utility classes work

- **WHEN** using Tailwind CSS classes (e.g., `flex`, `bg-blue-500`, `text-lg`) in a component
- **THEN** the styles SHALL be applied correctly in the rendered output

### Requirement: Admin layout with sidebar navigation

The system SHALL provide a layout component with a left sidebar for navigation, a top bar for user info, and a main content area.

#### Scenario: Sidebar displays navigation items

- **WHEN** loading any page under the admin layout
- **THEN** the sidebar SHALL display navigation menu items: 仪表盘、题库管理、题目管理、模考管理、商品管理、订单管理、用户管理、统计看板

#### Scenario: Sidebar navigation links route correctly

- **WHEN** clicking a navigation item in the sidebar
- **THEN** the browser SHALL navigate to the corresponding route (e.g., `/banks`, `/questions`, `/users`)

#### Scenario: Top bar displays user area

- **WHEN** loading any page under the admin layout
- **THEN** the top bar SHALL display a placeholder user avatar and a logout button

#### Scenario: Content area renders page content

- **WHEN** navigating to any admin page
- **THEN** the main content area SHALL render the page-specific content between the top bar and sidebar

### Requirement: EdgeOne Pages deployment configuration

The Next.js project SHALL be configured for deployment on EdgeOne Pages with `output: 'standalone'` in `next.config.ts`.

#### Scenario: Build produces standalone output

- **WHEN** running `pnpm build` in the `admin/` directory
- **THEN** the build SHALL complete successfully and produce a `.next/standalone` directory

### Requirement: Environment variable template

The system SHALL provide a `.env.example` file documenting all required environment variables.

#### Scenario: Env template lists all variables

- **WHEN** reading `.env.example`
- **THEN** it SHALL list the following variables with placeholder values: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `WECHAT_APPID`, `WECHAT_SECRET`

### Requirement: Landing page placeholder

The admin root page (`/`) SHALL display a simple dashboard placeholder with the app name and a welcome message.

#### Scenario: Root page loads

- **WHEN** navigating to `/` in the admin app
- **THEN** the page SHALL display "刷题管理后台" as the title and a welcome message inside the layout shell
