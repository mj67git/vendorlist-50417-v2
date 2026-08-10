# Security Setup Guide

## Default Credentials Security Enhancement

This application has been hardened to prevent unauthorized access via default credentials.

### What Changed?

1. **Automatic Password Randomization**: On first startup, all default user accounts receive cryptographically secure random passwords (16 characters with letters, numbers, and special characters).

2. **Mandatory Password Change**: All users with default or weak passwords MUST change their password before accessing any system functionality.

3. **Enhanced Password Requirements**:
   - Minimum 8 characters (increased from 6)
   - Must contain at least one letter and one number
   - Cannot be a known weak password (123, 123456, password, admin, etc.)
   - Cannot reuse the current password

4. **Enforced Access Control**: Users with `mustChangePassword=true` can only access:
   - `/api/auth/change-password` - To change their password
   - `/api/auth/me` - To check their profile status
   - `/api/auth/logout` - To log out

   All other API endpoints (including admin endpoints like `/api/audit-logs`) are blocked until the password is changed.

### First-Time Setup

When you start the server for the first time after this security update:

1. The server will detect default passwords in `database/users.json`
2. It will generate secure random passwords for each user
3. **IMPORTANT**: These passwords will be printed to the console/logs ONCE:

```
[SECURITY] Default password detected for user 'admin'.
[SECURITY] New secure password generated: Xy9$mK2pL#4nQ8rT
[SECURITY] User MUST change this password on first login.
[SECURITY] This password will not be displayed again. Please save it securely.
```

4. **Save these passwords immediately** - they will not be shown again
5. A marker file `.users_initialized` is created to prevent regenerating passwords on restart

### For Administrators

1. **On first startup**: Check the server console/logs for the generated passwords
2. **Save the passwords securely** in a password manager or secure location
3. **Distribute passwords** to the appropriate users via secure channels
4. **Instruct users** to change their password immediately upon first login
5. **Monitor audit logs** for login attempts and password changes

### For Users

When you first log in with your generated password:

1. You will receive a JWT token but with limited access
2. The UI should prompt you to change your password
3. You MUST change your password to access any system functionality
4. Choose a strong password that meets the requirements:
   - At least 8 characters
   - Contains letters and numbers
   - Not a common weak password

### Security Benefits

- **No more default credentials**: The well-known "123" and "123456" passwords are eliminated
- **Forced password rotation**: Users cannot skip password changes
- **Defense in depth**: Multiple layers of protection:
  - Random password generation
  - Password complexity requirements
  - Middleware enforcement of password change requirement
  - Audit logging of all authentication events

### Troubleshooting

**Q: I lost the generated password before changing it**
A: Delete the `database/.users_initialized` marker file and restart the server. New passwords will be generated and displayed in the console.

**Q: A user is locked out**
A: As an administrator with database access, you can manually set `mustChangePassword: true` and reset their password hash, or delete the user entry to trigger regeneration.

**Q: The system won't let me access any APIs**
A: This is expected if `mustChangePassword` is true. Use the change password endpoint first, then you'll have full access.

### Migration from Existing Installations

If you're upgrading an existing installation:

1. **Backup** your `database/users.json` file
2. The system will detect plaintext passwords (123, 123456, etc.)
3. It will automatically generate new secure passwords
4. Check the console for the new passwords
5. All users will be required to change their password on next login

### Audit Trail

All authentication events are logged:
- Failed login attempts (wrong username or password)
- Successful logins with default passwords (marked as Warning severity)
- Password changes (marked as Warning severity)
- Access denied due to password change requirement

Review `/api/audit-logs` (admin only) to monitor security events.
