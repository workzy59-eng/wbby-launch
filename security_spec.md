# Firebase Security Specification - WebbyLaunch SaaS

## 1. Data Invariants
- A **User** profile must exist for every authenticated user.
- A **Project** must have a `userId` (client).
- A **Project** can optionally have a `developerId` (once assigned).
- A **Message** in a project must belong to a project that exists.
- A **Message** can only be sent if the developer is assigned to the project.
- **Roles** are strictly: `client`, `developer`, `admin`.

## 2. Access Control Matrix
| Collection | Path | Read | Create | Update | Delete |
|------------|------|------|--------|--------|--------|
| users | `/users/{uid}` | Signed In | Owner | Owner (Filtered) | Admin |
| projects | `/projects/{pid}` | Owner / Assigned Dev / Admin | Signed In (initially as client) | Owner / Assigned Dev / Admin | Admin |
| messages | `/projects/{pid}/messages/{mid}` | Owner / Assigned Dev | Owner / Assigned Dev | None (Immutable) | None |

## 3. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than `request.auth.uid`.
2. **Role Escalation**: Attempt to update own role to `admin`.
3. **Project Hijack**: Attempt to assign self as `developerId` to a project already assigned to someone else.
4. **Unauthorized Read**: Client trying to read messages of a project they don't own.
5. **Unauthorized Write**: Developer trying to send a message to a project they are not assigned to.
6. **Orphaned Message**: Create a message in a non-existent project ID.
7. **Bypass Assignment**: Send message to a project where `developerId` is null.
8. **Shadow Field Injection**: Update project with `extraField: "hack"`.
9. **Timestamp Spoofing**: Provide a future/past `createdAt` instead of `request.time`.
10. **Admin Infiltration**: Admin trying to read messages (if strictly blocked as per user request).
11. **PII Leak**: Non-admin reading list of all users' private details.
12. **Denial of Wallet**: Sending a 1MB string message.

## 4. Test Runner Plan
- Implement `firestore.rules.test.ts` (conceptual).
- Verify all payloads above result in `PERMISSION_DENIED`.
