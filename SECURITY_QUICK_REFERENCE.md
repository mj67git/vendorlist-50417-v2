# Security Patch - Quick Reference Card

## 🚨 CRITICAL: First Startup Actions

### Step 1: Start Server & Capture Passwords
```bash
npm start | tee startup.log
```
**Watch for these lines in console:**
```
[SECURITY] Default password detected for user 'admin'.
[SECURITY] New secure password generated: Xy9$mK2pL#4nQ8rT
[SECURITY] User MUST change this password on first login.
```

### Step 2: Save Passwords Immediately
Copy all generated passwords to a secure location. **They will NOT be shown again!**

### Step 3: Verify Old Credentials Don't Work
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123"}'
```
**Expected**: `401 Unauthorized`

---

## 🔐 Password Requirements

| Requirement | Value |
|------------|-------|
| Minimum Length | 8 characters |
| Complexity | Letters + Numbers |
| Forbidden | 123, 123456, password, admin, qwerty, etc. |
| Reuse | Cannot reuse current password |

---

## 🛡️ Security Controls Active

### ✅ Password Randomization
- All default passwords replaced with 16-char random passwords
- Automatic on first startup
- Logged to console once

### ✅ Forced Password Change
- Users with default passwords CANNOT access APIs
- Only allowed: change-password, auth/me, logout
- Admin endpoints completely blocked until password changed

### ✅ Password Validation
- Weak passwords rejected
- Complexity enforced
- Reuse prevented

### ✅ Audit Logging
- All login attempts logged
- Password changes logged
- Failed attempts tracked

---

## 📋 User Accounts & Default Roles

| Username | Role | Access Level |
|----------|------|--------------|
| admin | admin | Full system access, audit logs |
| commercial | commercial | Commercial operations |
| qa | qa | Quality assurance |
| planning | planning | Planning & warehouse |
| finance | finance | Financial operations |

---

## 🔧 Common Operations

### Create New User (Auto-generates password)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "name": "New User",
    "role": "commercial"
  }'
```
**Check console for generated password!**

### Change Password
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewSecure456"
  }'
```

### Check User Status
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

## 🚑 Troubleshooting

### Problem: Lost Generated Password
**Solution**: 
```bash
rm database/.users_initialized
rm database/users.json
npm start
```
New passwords will be generated.

### Problem: User Locked Out
**Solution**: Admin can reset by deleting user entry and recreating.

### Problem: Can't Access Admin Endpoints
**Cause**: `mustChangePassword` is still true  
**Solution**: User must change password first

---

## 📊 Monitoring

### Check Audit Logs (Admin Only)
```bash
curl http://localhost:5000/api/audit-logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Watch for Security Events
- Failed login attempts (severity: Warning)
- Logins with default passwords (severity: Warning)
- Password changes (severity: Warning)

---

## 📞 Emergency Contacts

| Issue | Action |
|-------|--------|
| Security breach suspected | Check audit logs immediately |
| Multiple failed logins | Review `/api/audit-logs` for IP patterns |
| User can't login | Verify password was changed |
| Lost all passwords | Restore from backup or regenerate |

---

## ✅ Post-Deployment Checklist

- [ ] Server started successfully
- [ ] All generated passwords captured and saved
- [ ] Old credentials (123, 123456) confirmed rejected
- [ ] Test user can login with generated password
- [ ] Test user CANNOT access admin endpoints before password change
- [ ] Test user CAN change password
- [ ] Test user CAN access admin endpoints after password change
- [ ] Audit logs showing all events
- [ ] All users notified to change passwords
- [ ] Backup of users.json created

---

## 🔒 Security Best Practices

1. **Never share passwords** via insecure channels
2. **Change passwords immediately** after first login
3. **Monitor audit logs** regularly
4. **Use strong passwords** (8+ chars, letters + numbers)
5. **Don't reuse passwords** across systems
6. **Report suspicious activity** immediately

---

## 📚 Documentation References

- **Full Setup Guide**: `SECURITY_SETUP.md`
- **Technical Details**: `SECURITY_PATCH_SUMMARY.md`
- **Testing Procedures**: `SECURITY_TESTING.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready
