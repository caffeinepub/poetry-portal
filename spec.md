# Specification

## Summary
**Goal:** Add a password-protected admin system to the Gojri Poetry Platform, restricting poem management (add, edit, delete) and collection management to authenticated admins only, while keeping public read/download/reaction features open.

**Planned changes:**
- Add a hardcoded admin password on the backend with a `verifyAdminPassword` function that returns an auth token/boolean
- Add a `deletePoem` backend function that removes a poem and its associated image blob by ID, restricted to authenticated admins
- Guard all existing add, edit, and collection management backend functions with admin authorization checks
- Add an admin login modal/page in the frontend with a password input field and error feedback
- Store admin session state in localStorage/sessionStorage; persist across page refreshes within the session
- Show an admin mode indicator (badge/label) in the header and provide a logout button when admin is active
- Hide Add Poem button, Edit buttons, Collection create/delete controls, and Admin Panel page from non-admin users
- Add a Delete button on each poem card and poem detail page, visible only in admin mode
- Clicking Delete shows a confirmation dialog before calling `deletePoem`; after deletion, poem is removed from the list and user is redirected to home if on the detail page

**User-visible outcome:** The site owner can log in with a password to access admin controls (add, edit, delete poems, manage collections), while public users can only read, download, and react to poems without seeing any admin UI.
