# Security Specification - WebbyLaunch

## 1. Data Invariants
- A `Project` must have a valid `userId` (owner).
- A `Message` must belong to a `projectId` or a `conversationId` where the user is a participant.
- `SystemSettings` are only writable by Admins.
- Users can only read/write their own `UserProfile`.
- Developers can only access projects where `developerId` or `assignedTo` matches their `uid`.
- Sales users can only access `Leads` where `assignedSalesId` matches their `uid`.

## 2. The "Dirty Dozen" Payloads (Test Scenarios)

| ID | Resource | Actor | Action | Payload | Expected |
|----|----------|-------|--------|---------|----------|
| D1 | /users/admin_uid | Client | Write | { role: 'admin' } | DENIED (Privilege Escalation) |
| D2 | /projects/p1 | Client | Read | N/A | DENIED (Not Owner) |
| D3 | /projects/p1/messages/m1 | Client | Write | { senderId: 'admin_uid' } | DENIED (Identity Spoofing) |
| D4 | /system_settings/main | Client | Write | { baseWebsiteCost: 0 } | DENIED (Admin Only) |
| D5 | /developer_invites/inv1 | Client | Read | N/A | DENIED (Admin Only) |
| D6 | /leads/l1 | Sales B | Read | N/A | DENIED (Not Assigned Sales) |
| D7 | /projects/p1 | Dev B | Read | N/A | DENIED (Not Assigned Dev) |
| D8 | /attendance/att1 | Client | Write | { status: 'present' } | DENIED (Restricted Path) |
| D9 | /users/val_uid | Client | Write | { email: 'spoofed@evil.com' } | DENIED (Immutable Identity) |
| D10| /projects/p1 | Owner | Update | { status: 'Completed' } | DENIED (Terminal State Lock if not Admin) |
| D11| /visit_sessions/s1 | Client | Write | { userId: 'victim_uid' } | DENIED (Orphaned Write) |
| D12| /otps/someone@else.com | Client | Read | N/A | DENIED (Privacy Leak) |

## 3. Relationship Mapping
- **Project Owner**: `resource.data.userId == request.auth.uid`
- **Assigned Developer**: `resource.data.developerId == request.auth.uid || resource.data.assignedTo == request.auth.uid`
- **Assigned Sales**: `resource.data.assignedSalesId == request.auth.uid`
- **Admin**: `request.auth.token.email in ['workzy59@gmail.com', 'sain17296174@gmail.com']` (or `users` lookup)

## 4. Path Rules Definition
- `/users/{userId}`: `isOwner(userId)`
- `/projects/{projectId}`: `isOwner() || isAssignedDeveloper() || isAdmin()`
- `/projects/{projectId}/messages/{messageId}`: `isProjectParticipant(projectId)`
- `/system_settings/{id}`: `isAdmin()` (Write), `isSignedIn()` (Read)
- `/leads/{leadId}`: `isAssignedSales() || isAdmin()`
- `/developer_invites/{id}`: `isAdmin()`
