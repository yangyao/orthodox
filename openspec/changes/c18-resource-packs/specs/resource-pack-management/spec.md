## ADDED Requirements

### Requirement: Manage Resource Pack Metadata
Admins SHALL be able to create, read, update, and delete resource packs, including their title, cover image, and description.

#### Scenario: Creating a new resource pack
- **WHEN** admin submits the resource pack creation form with valid details
- **THEN** the system persists the new resource pack and makes it available for item addition

### Requirement: Manage Resource Items
Admins SHALL be able to add, update, and remove items within a resource pack.

#### Scenario: Adding a file to a pack
- **WHEN** admin uploads a file and provides a title for a resource item
- **THEN** the system associates the file with the resource pack and stores the metadata
