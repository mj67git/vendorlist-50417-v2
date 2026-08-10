# Security Patch Testing Guide

## Overview
This document provides comprehensive testing procedures to verify the security fixes for the default credentials vulnerability.

## Pre-Test Setup

1. **Backup existing data**:
   ```bash
   cp database/users.json database/users.json.backup
   cp database/.users_initialized database/.users_initialized.backup 2>/dev/null || true
   ```

2. **Clean slate test** (optional - for testing first-run behavior):
   ```bash
   rm database/users.json
   rm database/.users_initialized
   ```

## Test Cases

### Test 1: Default Password Randomization

**Objective**: Verify that default passwords are automatically randomized on first startup.

**Steps**:
1. Delete `database/users.json` and `database/.users_initialized`
2. Start the server
3. Check console output for generated passwords

**Expected Results**:
- Console displays messages like:
  ```
  [SECURITY] Default password detected for user 'admin'.
  [SECURITY] New secure password generated: Xy9$mK2pL#4nQ8rT
  [SECURITY] User MUST change this password on first login.
  [SECURITY] This password will not be displayed again. Please save it securely.
  ```
- Passwords are 16 characters with letters, numbers, and special characters
- File `database/.users_initialized` is created
- File `database/users.json` contains hashed passwords (not plaintext)

**Pass Criteria**: ✅ All default accounts receive unique random passwords

---

### Test 2: Old Default Credentials Rejected

**Objective**: Verify that old default credentials (123, 123456) no longer work.

**Steps**:
1. Attempt to login with `admin:123`
2. Attempt to login with `admin:123456`

**Expected Results**:
- Both login attempts fail with 401 status
- Error message: "Incorrect username or password. Please try again."
- Audit log records failed login attempts

**Pass Criteria**: ✅ Old default credentials are rejected

---

### Test 3: Password Change Enforcement - API Access Blocked

**Objective**: Verify that users with `mustChangePassword=true` cannot access protected APIs.

**Steps**:
1. Login with a generated password (capture JWT token)
2. Attempt to access `/api/audit-logs` with the token
3. Attempt to access `/api/vendors` with the token
4. Attempt to access `/api/users` with the token

**Expected Results**:
- All API calls return 403 status
- Error response includes:
  ```json
  {
    "error": "Password change required: You must change your password before accessing the system",
    "mustChangePassword": true,
    "code": "PASSWORD_CHANGE_REQUIRED"
  }
  ```

**Pass Criteria**: ✅ All protected endpoints are blocked until password is changed

---

### Test 4: Password Change Enforcement - Allowed Endpoints

**Objective**: Verify that users can still access password change and profile endpoints.

**Steps**:
1. Login with a generated password (capture JWT token)
2. Access `/api/auth/me` with the token
3. Access `/api/auth/change-password` with the token
4. Access `/api/auth/logout` with the token

**Expected Results**:
- `/api/auth/me` returns 200 with user profile including `mustChangePassword: true`
- `/api/auth/change-password` accepts the request (if valid password provided)
- `/api/auth/logout` returns 200

**Pass Criteria**: ✅ Essential endpoints remain accessible

---

### Test 5: Weak Password Rejection

**Objective**: Verify that weak passwords are rejected during password change.

**Steps**:
1. Login with generated password
2. Attempt to change password to each of these:
   - `123`
   - `123456`
   - `password`
   - `admin`
   - `12345678`
   - `qwerty`
   - `abc` (too short)
   - `abcdefgh` (no numbers)
   - `12345678` (no letters)

**Expected Results**:
- All attempts fail with 400 status
- Appropriate error messages:
  - "کلمه عبور جدید نمی‌تواند رمز پیش‌فرض یا ضعیف باشد" (for weak passwords)
  - "کلمه عبور جدید باید حداقل ۸ کاراکتر باشد" (for short passwords)
  - "کلمه عبور جدید باید شامل حداقل یک حرف و یک عدد باشد" (for no complexity)

**Pass Criteria**: ✅ All weak passwords are rejected with appropriate messages

---

### Test 6: Strong Password Acceptance

**Objective**: Verify that strong passwords are accepted.

**Steps**:
1. Login with generated password
2. Change password to: `SecurePass123!`
3. Verify password change succeeds
4. Logout
5. Login with new password
6. Attempt to access `/api/audit-logs` (admin only)

**Expected Results**:
- Password change returns 200 with success message
- Response includes `mustChangePassword: false`
- New login succeeds with new password
- API access is now granted (no more 403 PASSWORD_CHANGE_REQUIRED)

**Pass Criteria**: ✅ Strong password accepted and full access granted

---

### Test 7: Password Reuse Prevention

**Objective**: Verify that users cannot reuse their current password.

**Steps**:
1. Login with a known password
2. Attempt to change password to the same password

**Expected Results**:
- Request fails with 400 status
- Error message: "کلمه عبور جدید نمی‌تواند با کلمه عبور فعلی یکسان باشد"

**Pass Criteria**: ✅ Password reuse is prevented

---

### Test 8: New User Creation with Secure Passwords

**Objective**: Verify that newly created users receive secure random passwords.

**Steps**:
1. Login as admin with changed password
2. Create a new user via `/api/users` POST without providing a password
3. Check console output

**Expected Results**:
- Console displays:
  ```
  [SECURITY] New user 'testuser' created with auto-generated password.
  [SECURITY] Generated password: Xy9$mK2pL#4nQ8rT
  [SECURITY] User MUST change this password on first login.
  [SECURITY] This password will not be displayed again. Please save it securely.
  ```
- New user has `mustChangePassword: true`
- Password is 16 characters with complexity

**Pass Criteria**: ✅ New users receive secure random passwords

---

### Test 9: Audit Logging

**Objective**: Verify that all authentication events are properly logged.

**Steps**:
1. Perform various authentication actions:
   - Failed login (wrong password)
   - Successful login with default password
   - Password change
   - Successful login with new password
2. Access `/api/audit-logs` as admin
3. Review audit entries

**Expected Results**:
- Failed login logged with severity "Warning"
- Login with default password logged with severity "Warning" and description mentions "رمز عبور پیش‌فرض"
- Password change logged with severity "Warning"
- Login with changed password logged with severity "Information"
- All entries include IP address, user agent, and relevant context

**Pass Criteria**: ✅ All authentication events are comprehensively logged

---

### Test 10: Restart Persistence

**Objective**: Verify that password changes persist across server restarts.

**Steps**:
1. Change password for admin user
2. Stop the server
3. Start the server
4. Login with the new password
5. Verify full API access

**Expected Results**:
- New password works after restart
- No regeneration of passwords (`.users_initialized` marker prevents this)
- Full API access granted

**Pass Criteria**: ✅ Password changes persist correctly

---

## Security Verification Checklist

After completing all tests, verify:

- [ ] No default credentials exist in codebase
- [ ] All default accounts have unique random passwords
- [ ] Old credentials (123, 123456) are rejected
- [ ] `mustChangePassword` flag is enforced at middleware level
- [ ] Admin endpoints are inaccessible until password is changed
- [ ] Password complexity requirements are enforced (8+ chars, letters + numbers)
- [ ] Weak passwords are rejected
- [ ] Password reuse is prevented
- [ ] New user creation uses secure random passwords
- [ ] All authentication events are logged
- [ ] Changes persist across restarts

## Rollback Procedure

If issues are found:

1. Stop the server
2. Restore backups:
   ```bash
   cp database/users.json.backup database/users.json
   cp database/.users_initialized.backup database/.users_initialized 2>/dev/null || true
   ```
3. Restart the server

## Success Criteria

All 10 test cases must pass for the security patch to be considered successful.

## Notes

- Save all generated passwords immediately when displayed in console
- Test with multiple user roles (admin, commercial, qa, planning, finance)
- Verify frontend UI properly handles `mustChangePassword` flag
- Monitor server logs for any unexpected errors during testing
