# Specification

## Summary
**Goal:** Restrict content management (creating, editing, and deleting poems and collections) to the owner only, while allowing all authenticated users to view, download, like, and comment on poems.

**Planned changes:**
- Implement backend admin authorization that registers the owner's Principal ID as the sole admin and validates admin status for all create, update, and delete operations on poems and collections
- Add frontend route guards to all /admin/* routes that check if the authenticated user is admin and redirect non-admin users to the home page with an informative toast message
- Hide admin navigation links (Add Poem, Collections, Admin Panel) in the header for non-admin users
- Ensure public users retain full access to view, download, like, and comment on poems

**User-visible outcome:** Only the owner will see and access admin features (Add Poem, Collections, Admin Panel) in the navigation and be able to create, edit, or delete content. Other authenticated users will only be able to view, download, like, and comment on poems. Non-admin users attempting to access admin routes will be redirected to the home page with a notification explaining they lack admin permissions.
