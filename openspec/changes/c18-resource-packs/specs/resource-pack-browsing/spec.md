## ADDED Requirements

### Requirement: Browse Resource Packs
The system SHALL provide a list of resource packs available to the user, including title, cover image, and description.

#### Scenario: Viewing the resource list
- **WHEN** user navigates to the "Resource Packs" page
- **THEN** the system displays a list of all accessible resource packs

### Requirement: View Resource Pack Detail
The system SHALL allow users to view the details of a specific resource pack, including its list of items (files, links).

#### Scenario: Accessing pack details
- **WHEN** user selects a resource pack from the list
- **THEN** the system displays the pack's description and the list of items it contains

### Requirement: Access Resource Items
The system SHALL allow users to open or download items within a resource pack (e.g., open a PDF, copy a link).

#### Scenario: Opening a PDF resource
- **WHEN** user taps on a PDF item in the pack detail view
- **THEN** the system opens the PDF using the native file viewer or provides a download link
