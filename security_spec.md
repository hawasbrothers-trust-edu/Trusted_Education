# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied for both reads and writes.
2. **CMS Site Content (`/siteContent/{docId}`)**:
   - Only `docId == 'main'` is readable for public landing page rendering (`get` only; `list` denied).
   - Writes (`create`, `update`) are strictly restricted to verified admins (`isAdmin()`), validated against `isValidSiteContent(incoming())` with strict allowlisted keys (`hasAll` / `hasOnly`).
   - Deletes are denied (`allow delete: if false`).
3. **Consultation Orders (`/orders/{orderId}`) — PII Isolation**:
   - Contains PII (`studentName`, `phone`, `email`). Public `get`, `list`, `update`, and `delete` are strictly DENIED.
   - Public visitors may ONLY `create` a valid order with `isValidId(orderId)`, `incoming().id == orderId`, `incoming().status == 'جديد'`, `incoming().submittedAt == request.time`, and strict field type/length limits (no extra shadow fields).
   - Only verified admins (`isAdmin()`) may `get`, `list`, `update`, or `delete` orders.
   - Updates by admin enforce `isValidOrder(incoming())`, immutable `id` and `submittedAt`, and allowlisted `affectedKeys().hasOnly(['status', 'notes', 'deadline', 'specialization'])`.
4. **Admins (`/admins/{uid}`)**:
   - No self-assigned roles: only existing/bootstrapped verified admins (`isAdmin()`) can list, create, update, or delete admin records.
   - A signed-in user may only `get` their own `/admins/{uid}` document (`request.auth.uid == uid`).
   - Admin checks strictly require `request.auth.token.email_verified == true`.
5. **Connection Test (`/test/connection`)**:
   - Read-only `get` on `/test/connection` for boot-time `getDocFromServer` verification; all writes denied.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Order Read**: Anonymous user calls `getDoc(doc(db, 'orders', 'TR-9102'))` -> `PERMISSION_DENIED`.
2. **Unauthenticated Order List (PII Scraping)**: Anonymous user calls `getDocs(collection(db, 'orders'))` -> `PERMISSION_DENIED`.
3. **Non-Admin Signed-In Order List**: Non-admin signed-in Google user calls `getDocs(collection(db, 'orders'))` -> `PERMISSION_DENIED`.
4. **Email Spoofing (Unverified Email)**: User with `email == 'hawasbrothers@gmail.com'` and `email_verified == false` attempts `getDocs(collection(db, 'orders'))` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Order Create**: Anonymous user submits valid order + `{ isAdmin: true }` -> rejected by `keys().hasOnly(...)` -> `PERMISSION_DENIED`.
6. **Status Shortcutting on Order Create**: Anonymous user creates order with `status: 'تم التسليم'` instead of `'جديد'` -> `PERMISSION_DENIED`.
7. **Timestamp Forgery on Order Create**: Anonymous user submits `submittedAt` set to past/future client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
8. **ID Poisoning on Order Create**: Anonymous user submits order at `/orders/bad$id..with.1500.chars` -> rejected by `isValidId(orderId)` -> `PERMISSION_DENIED`.
9. **Resource Poisoning (Oversized String)**: Anonymous user submits `notes` with 50,000 characters (`> 2000`) -> `PERMISSION_DENIED`.
10. **Self-Assigned Admin Privilege Escalation**: Non-admin signed-in user attempts `setDoc(doc(db, 'admins', uid), { uid, email, role: 'admin' })` -> `PERMISSION_DENIED`.
11. **Unauthorized CMS Overwrite**: Non-admin signed-in user attempts `setDoc(doc(db, 'siteContent', 'main'), ...)` -> `PERMISSION_DENIED`.
12. **Immutable Order Field Tampering**: Admin attempts `updateDoc(doc(db, 'orders', 'TR-9102'), { id: 'TR-0000' })` -> rejected by immutability & `affectedKeys().hasOnly(...)` -> `PERMISSION_DENIED`.
