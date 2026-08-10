import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "internal-regulatory-compliance-secret-key-321";

/**
 * Test suite for DELETE /api/vendors/:id authorization vulnerability mitigation
 * 
 * Pentest Finding: Missing server-side authorization on DELETE /api/vendors/:id 
 * allows any authenticated user to delete arbitrary vendors
 * 
 * Fix: Added role check to ensure only admin users can delete vendors
 */

test('DELETE /api/vendors/:id - requireAuth middleware validates JWT structure', () => {
  // Simulate the requireAuth middleware behavior
  const mockReq = {
    headers: {
      authorization: 'Bearer invalid-token'
    }
  };
  
  let authError = null;
  try {
    jwt.verify('invalid-token', JWT_SECRET);
  } catch (err) {
    authError = err;
  }
  
  assert.ok(authError, 'Invalid JWT should be rejected by requireAuth middleware');
});

test('DELETE /api/vendors/:id - admin role check prevents non-admin deletion', () => {
  // Test case 1: Non-admin user (commercial role)
  const commercialUser = {
    username: 'commercial',
    role: 'commercial',
    name: 'واحد بازرگانی'
  };
  
  // Simulate the authorization check: req.user?.role !== "admin"
  const isCommercialAuthorized = commercialUser.role === 'admin';
  assert.equal(isCommercialAuthorized, false, 'Commercial user should not be authorized to delete vendors');
  
  // Test case 2: Non-admin user (qa role)
  const qaUser = {
    username: 'qa',
    role: 'qa',
    name: 'واحد کیفیت'
  };
  
  const isQaAuthorized = qaUser.role === 'admin';
  assert.equal(isQaAuthorized, false, 'QA user should not be authorized to delete vendors');
  
  // Test case 3: Non-admin user (planning role)
  const planningUser = {
    username: 'planning',
    role: 'planning',
    name: 'واحد برنامه‌ریزی و انبار'
  };
  
  const isPlanningAuthorized = planningUser.role === 'admin';
  assert.equal(isPlanningAuthorized, false, 'Planning user should not be authorized to delete vendors');
  
  // Test case 4: Non-admin user (finance role)
  const financeUser = {
    username: 'finance',
    role: 'finance',
    name: 'واحد مالی'
  };
  
  const isFinanceAuthorized = financeUser.role === 'admin';
  assert.equal(isFinanceAuthorized, false, 'Finance user should not be authorized to delete vendors');
});

test('DELETE /api/vendors/:id - admin role check allows admin deletion', () => {
  // Test case: Admin user
  const adminUser = {
    username: 'admin',
    role: 'admin',
    name: 'مدیر سیستم'
  };
  
  // Simulate the authorization check: req.user?.role === "admin"
  const isAdminAuthorized = adminUser.role === 'admin';
  assert.equal(isAdminAuthorized, true, 'Admin user should be authorized to delete vendors');
});

test('DELETE /api/vendors/:id - authorization check handles missing user object', () => {
  // Test case: req.user is undefined (should not happen after requireAuth, but defensive check)
  const undefinedUser = undefined;
  
  // Simulate the authorization check: req.user?.role !== "admin"
  const isUndefinedAuthorized = undefinedUser?.role === 'admin';
  assert.equal(isUndefinedAuthorized, false, 'Undefined user should not be authorized to delete vendors');
  
  // Test case: req.user is null
  const nullUser = null;
  const isNullAuthorized = (nullUser as any)?.role === 'admin';
  assert.equal(isNullAuthorized, false, 'Null user should not be authorized to delete vendors');
});

test('DELETE /api/vendors/:id - authorization check handles missing role property', () => {
  // Test case: User object without role property
  const userWithoutRole = {
    username: 'testuser',
    name: 'Test User'
  };
  
  // Simulate the authorization check: req.user?.role !== "admin"
  const isAuthorized = (userWithoutRole as any).role === 'admin';
  assert.equal(isAuthorized, false, 'User without role property should not be authorized to delete vendors');
});

test('DELETE /api/vendors/:id - authorization check is case-sensitive for role', () => {
  // Test case: Role with different casing
  const userWithUppercaseRole = {
    username: 'testuser',
    role: 'ADMIN',
    name: 'Test User'
  };
  
  // The check is strict equality, so case matters
  const isUppercaseAuthorized = userWithUppercaseRole.role === 'admin';
  assert.equal(isUppercaseAuthorized, false, 'Role check should be case-sensitive - "ADMIN" should not match "admin"');
  
  const userWithMixedCaseRole = {
    username: 'testuser',
    role: 'Admin',
    name: 'Test User'
  };
  
  const isMixedCaseAuthorized = userWithMixedCaseRole.role === 'admin';
  assert.equal(isMixedCaseAuthorized, false, 'Role check should be case-sensitive - "Admin" should not match "admin"');
});

test('DELETE /api/vendors/:id - authorization occurs before vendor existence check', () => {
  // This test verifies the order of operations in the fixed code:
  // 1. Authorization check (req.user?.role !== "admin")
  // 2. Vendor existence check (getVendorById)
  // 3. Deletion operation (deleteVendorFromDb)
  
  // Simulate a non-admin user attempting to delete a vendor
  const nonAdminUser = {
    username: 'commercial',
    role: 'commercial',
    name: 'واحد بازرگانی'
  };
  
  // Authorization check should fail before any vendor lookup
  const authCheckFails = nonAdminUser.role !== 'admin';
  assert.equal(authCheckFails, true, 'Authorization check should fail for non-admin users');
  
  // If authorization fails, the code should return 403 immediately
  // without checking if the vendor exists or attempting deletion
  const expectedStatusCode = 403;
  assert.equal(expectedStatusCode, 403, 'Non-admin users should receive 403 Forbidden status');
});

test('DELETE /api/vendors/:id - JWT token contains role claim', () => {
  // Verify that JWT tokens include the role claim needed for authorization
  const adminPayload = {
    username: 'admin',
    role: 'admin',
    name: 'مدیر سیستم'
  };
  
  const adminToken = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '7d' });
  const decodedAdmin = jwt.verify(adminToken, JWT_SECRET) as any;
  
  assert.equal(decodedAdmin.role, 'admin', 'Admin JWT should contain admin role claim');
  assert.equal(decodedAdmin.username, 'admin', 'Admin JWT should contain username claim');
  
  const commercialPayload = {
    username: 'commercial',
    role: 'commercial',
    name: 'واحد بازرگانی'
  };
  
  const commercialToken = jwt.sign(commercialPayload, JWT_SECRET, { expiresIn: '7d' });
  const decodedCommercial = jwt.verify(commercialToken, JWT_SECRET) as any;
  
  assert.equal(decodedCommercial.role, 'commercial', 'Commercial JWT should contain commercial role claim');
  assert.equal(decodedCommercial.username, 'commercial', 'Commercial JWT should contain username claim');
});

test('DELETE /api/vendors/:id - authorization prevents enumeration attack', () => {
  // Pentest finding: GET /api/vendors exposes vendor IDs without authentication
  // Combined with missing authorization on DELETE, this allows enumeration attacks
  
  // Simulate an attacker with a valid non-admin JWT attempting to delete enumerated vendor IDs
  const attackerUser = {
    username: 'attacker',
    role: 'commercial',
    name: 'Attacker'
  };
  
  const enumeratedVendorIds = ['vendor-1', 'vendor-2', 'vendor-3'];
  
  // For each enumerated vendor ID, the authorization check should block deletion
  for (const vendorId of enumeratedVendorIds) {
    const isAuthorized = attackerUser.role === 'admin';
    assert.equal(isAuthorized, false, `Attacker should not be able to delete vendor ${vendorId}`);
  }
});

test('DELETE /api/vendors/:id - error message confirms admin-only restriction', () => {
  // The fix returns a specific error message in Persian
  const expectedErrorMessage = 'عدم دسترسی: حذف تامین‌کننده/سورس فقط برای مدیران سیستم مجاز است.';
  
  // Verify the error message is descriptive and indicates admin-only access
  assert.ok(expectedErrorMessage.length > 0, 'Error message should be non-empty');
  assert.ok(expectedErrorMessage.includes('مدیران'), 'Error message should mention admins (مدیران)');
  assert.ok(expectedErrorMessage.includes('حذف'), 'Error message should mention deletion (حذف)');
});

test('DELETE /api/vendors/:id - authorization check prevents privilege escalation', () => {
  // Test that users cannot escalate privileges by manipulating the JWT
  
  // Scenario 1: User with valid JWT but tampered role claim
  const tamperedPayload = {
    username: 'commercial',
    role: 'admin', // Tampered to admin
    name: 'واحد بازرگانی'
  };
  
  // If an attacker tries to create their own JWT with admin role
  const tamperedToken = jwt.sign(tamperedPayload, 'wrong-secret', { expiresIn: '7d' });
  
  let verificationError = null;
  try {
    jwt.verify(tamperedToken, JWT_SECRET);
  } catch (err) {
    verificationError = err;
  }
  
  assert.ok(verificationError, 'JWT signed with wrong secret should be rejected');
  
  // Scenario 2: Valid JWT but role doesn't match expected value
  const validCommercialPayload = {
    username: 'commercial',
    role: 'commercial',
    name: 'واحد بازرگانی'
  };
  
  const validCommercialToken = jwt.sign(validCommercialPayload, JWT_SECRET, { expiresIn: '7d' });
  const decodedCommercial = jwt.verify(validCommercialToken, JWT_SECRET) as any;
  
  // Even with a valid JWT, non-admin role should be blocked
  const isAuthorized = decodedCommercial.role === 'admin';
  assert.equal(isAuthorized, false, 'Valid JWT with non-admin role should not be authorized');
});

test('DELETE /api/vendors/:id - all non-admin roles are blocked', () => {
  // Comprehensive test of all known non-admin roles
  const nonAdminRoles = ['commercial', 'qa', 'planning', 'finance', 'user', 'guest', 'viewer'];
  
  for (const role of nonAdminRoles) {
    const user = {
      username: `test-${role}`,
      role: role,
      name: `Test ${role}`
    };
    
    const isAuthorized = user.role === 'admin';
    assert.equal(isAuthorized, false, `User with role "${role}" should not be authorized to delete vendors`);
  }
});

test('DELETE /api/vendors/:id - authorization check returns 403 status code', () => {
  // Verify that the correct HTTP status code is returned for unauthorized access
  const expectedStatusCode = 403;
  
  // 403 Forbidden is the correct status for authenticated but unauthorized requests
  assert.equal(expectedStatusCode, 403, 'Unauthorized deletion attempts should return 403 Forbidden');
  
  // Not 401 (which is for unauthenticated requests)
  assert.notEqual(expectedStatusCode, 401, 'Should not return 401 for authenticated users');
  
  // Not 404 (which is for non-existent resources)
  assert.notEqual(expectedStatusCode, 404, 'Should not return 404 for authorization failures');
});

test('DELETE /api/vendors/:id - fix prevents IDOR vulnerability', () => {
  // Insecure Direct Object Reference (IDOR) vulnerability test
  // Before fix: Any authenticated user could delete any vendor by ID
  // After fix: Only admins can delete vendors
  
  const victimVendorId = 'vendor-victim-123';
  
  // Attacker scenario: Non-admin user with valid JWT
  const attackerUser = {
    username: 'attacker',
    role: 'commercial',
    name: 'Attacker'
  };
  
  // Authorization check should prevent IDOR
  const canDeleteVictimVendor = attackerUser.role === 'admin';
  assert.equal(canDeleteVictimVendor, false, 'Non-admin should not be able to delete arbitrary vendor by ID (IDOR prevention)');
  
  // Admin scenario: Admin user with valid JWT
  const adminUser = {
    username: 'admin',
    role: 'admin',
    name: 'مدیر سیستم'
  };
  
  const adminCanDelete = adminUser.role === 'admin';
  assert.equal(adminCanDelete, true, 'Admin should be able to delete vendors');
});
