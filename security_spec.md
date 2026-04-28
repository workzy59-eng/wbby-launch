# Firebase Security Specification

## 1. Data Invariants
- **Users**: A user profile can only be created by the authenticated user with the matching UID. Only Admins can change a user's role to 'admin' or 'developer'.
- **Projects**: A project must have a valid `userId`. Only the owner (client) or an admin can access/modify the project. Assigned developers can also access assigned projects.
- **Messages**: Messages must belong to a project or a conversation. The senderId must match the authenticated user.
- **Conversations**: Participants must be listed in the `participants` array. Access is strictly restricted to participants.
- **Meetings**: Scheduled between a client and an admin. Both must be able to view/update status.
- **Leads/Applications**: Strictly for internal use (Sales/Admins).

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: `{"uid": "attacker_id", "email": "victim@example.com"}` written to `/users/victim_id`.
2. **Privilege Escalation**: `{"role": "admin"}` written to `/users/attacker_id` by the attacker.
3. **Ghost Project**: Creating a project with `userId: "other_user_id"`.
4. **Relational Break**: Creating a message for a project the user doesn't belong to.
5. **ID Poisoning**: Document ID `../../bad/path` or a 1MB string as ID.
6. **Immutable Override**: Changing `createdAt` or `userId` on an existing project.
7. **Shadow Field**: Adding `isApproved: true` to a developer application via a client update.
8. **PII Scraping**: Trying to `list` the `/users` collection without being an admin.
9. **Query Scrape**: Querying `/projects` without a `where` clause on `userId` (rules must block).
10. **State Skipping**: Moving a project from "Pending" directly to "Completed" without internal steps (if enforced).
11. **Massive Payload**: Writing a 1MB string into a chat message text field.
12. **Orphaned Message**: Creating a message in a conversation that doesn't exist.

## 3. The Test Runner (firestore.rules.test.ts)
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc, doc, getDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'webbylaunch-test',
    firestore: { rules: await fs.readFile('firestore.rules', 'utf8') },
  });
});

test('Identity Spoofing: should deny writing to other user profile', async () => {
  const alice = testEnv.authenticatedContext('alice');
  await assertFails(setDoc(doc(alice.firestore(), 'users/bob'), { name: 'Alice' }));
});

test('Privilege Escalation: client should not be able to make themselves admin', async () => {
  const alice = testEnv.authenticatedContext('alice');
  await assertFails(setDoc(doc(alice.firestore(), 'users/alice'), { role: 'admin' }, { merge: true }));
});
// ... (additional tests mapping to Dirty Dozen)
```
