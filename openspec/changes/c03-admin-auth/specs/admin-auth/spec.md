## ADDED Requirements

### Requirement: Login page with username and password form

The system SHALL provide a login page at `/login` with a form containing username and password fields and a submit button.

#### Scenario: Login page renders

- **WHEN** navigating to `/login` without an active session
- **THEN** the page SHALL display a form with "用户名" input, "密码" input, and a "登录" button, centered on the page without the admin sidebar/top-bar layout

#### Scenario: Successful login

- **WHEN** submitting valid credentials (username: "admin", password: "admin123")
- **THEN** the system SHALL authenticate the user and redirect to `/` (dashboard)

#### Scenario: Failed login with wrong password

- **WHEN** submitting a valid username with an incorrect password
- **THEN** the page SHALL display an error message "用户名或密码错误" and stay on the login page

#### Scenario: Failed login with nonexistent username

- **WHEN** submitting a username that does not exist in the `admins` table
- **THEN** the page SHALL display the same error message "用户名或密码错误" (no user enumeration)

### Requirement: Credentials validation against admins table

The system SHALL validate login credentials by querying the `admins` table and comparing the bcrypt-hashed password.

#### Scenario: Password verification uses bcrypt

- **WHEN** a user submits login credentials
- **THEN** the system SHALL query the `admins` table by username and use bcrypt compare to verify the password hash

### Requirement: JWT session management

The system SHALL use JWT strategy for session management with a 24-hour expiration, stored in an httpOnly cookie.

#### Scenario: Session contains user info

- **WHEN** a user successfully logs in
- **THEN** the JWT session SHALL contain the admin's `id`, `username`, and `role`

#### Scenario: Session expires after 24 hours

- **WHEN** a JWT session is older than 24 hours
- **THEN** the session SHALL be considered expired and the user SHALL be redirected to `/login`

### Requirement: Route protection via middleware

The system SHALL use Next.js middleware to protect all routes except `/login` and `/api/auth/*`. Unauthenticated requests to protected routes SHALL redirect to `/login`.

#### Scenario: Unauthenticated access to protected page

- **WHEN** accessing `/banks` without an active session
- **THEN** the middleware SHALL redirect to `/login`

#### Scenario: Unauthenticated access to protected API

- **WHEN** accessing `/api/admin/v1/banks` without an active session
- **THEN** the API SHALL return HTTP 401 Unauthorized

#### Scenario: Login page accessible without session

- **WHEN** accessing `/login` without an active session
- **THEN** the page SHALL render normally without redirect

#### Scenario: Authenticated user accessing login page

- **WHEN** accessing `/login` with a valid session
- **THEN** the middleware SHALL redirect to `/`

### Requirement: Top bar displays logged-in user with logout

The top bar SHALL display the current admin's username and a logout button that clears the session.

#### Scenario: Top bar shows username

- **WHEN** a logged-in admin views any page
- **THEN** the top bar SHALL display the admin's username instead of the generic "管理员" placeholder

#### Scenario: Logout clears session

- **WHEN** the admin clicks the logout button
- **THEN** the session SHALL be cleared and the browser SHALL redirect to `/login`

### Requirement: Auth configuration uses environment variables

The NextAuth configuration SHALL read `NEXTAUTH_SECRET` and `NEXTAUTH_URL` from environment variables.

#### Scenario: Missing NEXTAUTH_SECRET

- **WHEN** `NEXTAUTH_SECRET` is not set
- **THEN** the application SHALL fail to start with a clear error message
