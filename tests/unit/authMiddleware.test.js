const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const jwt = (() => {
  try { return require('jsonwebtoken'); } catch { return require('../../server/node_modules/jsonwebtoken'); }
})();
const prisma = require('../../server/src/lib/prisma');
const { authenticate, optionalAuth, authorize } = require('../../server/src/middleware/auth');

const JWT_SECRET = process.env.JWT_KEY || process.env.JWT_SECRET || 'secret';

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

describe('Auth Middleware Unit Tests', () => {
  const activeUser = {
    id: 101,
    name: 'Rahul Partner',
    email: 'rahul@example.com',
    role: 'ADMIN',
    status: 'active',
    password: 'hashed_secret_password'
  };

  const inactiveUser = {
    id: 102,
    name: 'Deactivated User',
    email: 'inactive@example.com',
    role: 'USER',
    status: 'inactive',
    password: 'hashed_secret_password'
  };

  it('authenticate: should return 401 when no token is present in cookie or headers', async () => {
    const req = { cookies: {}, headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.error, /Authentication required/i);
  });

  it('authenticate: should return 401 for an invalid or tampered JWT token', async () => {
    const req = {
      cookies: {},
      headers: { authorization: 'Bearer invalid_tampered_token_string' }
    };
    const res = createMockRes();
    let nextCalled = false;

    await authenticate(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 401);
    assert.match(res.body.error, /Invalid or expired session/i);
  });

  it('authenticate: should successfully authenticate valid token and attach safe user (without password)', async () => {
    const validToken = jwt.sign({ id: activeUser.id }, JWT_SECRET, { expiresIn: '1h' });

    // Mock prisma user lookup
    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === activeUser.id) return { ...activeUser };
      return null;
    };

    try {
      const req = {
        cookies: { token: validToken },
        headers: {}
      };
      const res = createMockRes();
      let nextCalled = false;

      await authenticate(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(req.user);
      assert.strictEqual(req.user.id, activeUser.id);
      assert.strictEqual(req.user.email, activeUser.email);
      assert.strictEqual(req.user.role, activeUser.role);
      assert.strictEqual(req.user.password, undefined, 'Password must be omitted from safeUser');
    } finally {
      prisma.user.findUnique = originalFindUnique;
    }
  });

  it('authenticate: should return 401 if user account status is inactive', async () => {
    const inactiveToken = jwt.sign({ id: inactiveUser.id }, JWT_SECRET, { expiresIn: '1h' });

    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === inactiveUser.id) return { ...inactiveUser };
      return null;
    };

    try {
      const req = {
        cookies: {},
        headers: { authorization: `Bearer ${inactiveToken}` }
      };
      const res = createMockRes();
      let nextCalled = false;

      await authenticate(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.error, /deactivated/i);
    } finally {
      prisma.user.findUnique = originalFindUnique;
    }
  });

  it('optionalAuth: should proceed cleanly to next() without error when no token is passed', async () => {
    const req = { cookies: {}, headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await optionalAuth(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user, undefined);
    assert.strictEqual(res.statusCode, 200);
  });

  it('optionalAuth: should attach safe user when a valid token is provided', async () => {
    const validToken = jwt.sign({ id: activeUser.id }, JWT_SECRET, { expiresIn: '1h' });

    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === activeUser.id) return { ...activeUser };
      return null;
    };

    try {
      const req = {
        cookies: { token: validToken },
        headers: {}
      };
      const res = createMockRes();
      let nextCalled = false;

      await optionalAuth(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true);
      assert.ok(req.user);
      assert.strictEqual(req.user.id, activeUser.id);
      assert.strictEqual(req.user.password, undefined);
    } finally {
      prisma.user.findUnique = originalFindUnique;
    }
  });

  it('authorize: should allow users with permitted role', () => {
    const superadminReq = { user: { role: 'SUPERADMIN' } };
    const adminReq = { user: { role: 'ADMIN' } };
    const res = createMockRes();

    let superadminPassed = false;
    authorize('SUPERADMIN', 'ADMIN')(superadminReq, res, () => { superadminPassed = true; });
    assert.strictEqual(superadminPassed, true);

    let adminPassed = false;
    authorize('ADMIN')(adminReq, res, () => { adminPassed = true; });
    assert.strictEqual(adminPassed, true);
  });

  it('authorize: should deny users with forbidden role with 403', () => {
    const customerReq = { user: { role: 'USER' } };
    const res = createMockRes();
    let nextCalled = false;

    authorize('SUPERADMIN', 'ADMIN')(customerReq, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.statusCode, 403);
    assert.match(res.body.error, /Forbidden/i);
  });
});
