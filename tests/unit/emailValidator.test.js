const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  validateEmail,
  DISPOSABLE_DOMAINS,
  WELL_KNOWN_VALID_DOMAINS
} = require('../../server/src/utils/emailValidator');

describe('Email Validator Unit Tests', () => {
  it('should accept valid standard email addresses', async () => {
    const validEmails = [
      'customer@gmail.com',
      'partner.store@yahoo.com',
      'owner@outlook.com',
      'support@zoho.com',
      'dr.sharma@icloud.com',
      'contact.partner@protonmail.com'
    ];

    for (const email of validEmails) {
      const result = await validateEmail(email);
      assert.strictEqual(result.isValid, true, `Expected ${email} to be valid`);
      assert.strictEqual(result.normalizedEmail, email.toLowerCase());
    }
  });

  it('should reject missing, empty, or non-string inputs', async () => {
    const invalidInputs = ['', null, undefined, 12345, {}, []];

    for (const input of invalidInputs) {
      const result = await validateEmail(input);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.error);
    }
  });

  it('should reject email strings that are too short or too long', async () => {
    const tooShort = 'a@b';
    const tooLong = `${'a'.repeat(250)}@gmail.com`;

    const shortRes = await validateEmail(tooShort);
    assert.strictEqual(shortRes.isValid, false);

    const longRes = await validateEmail(tooLong);
    assert.strictEqual(longRes.isValid, false);
  });

  it('should reject malformed email syntax', async () => {
    const malformed = [
      'plainaddress',
      '@missingusername.com',
      'username@.com',
      'username@domain..com',
      'user name@domain.com',
      'user@domain@domain.com'
    ];

    for (const email of malformed) {
      const result = await validateEmail(email);
      assert.strictEqual(result.isValid, false, `Expected ${email} to fail syntax validation`);
    }
  });

  it('should reject placeholder, dummy, or junk usernames', async () => {
    const junkUsernames = [
      'test@gmail.com',
      'dummy@yahoo.com',
      'fake@outlook.com',
      'temp@gmail.com',
      'admin@gmail.com',
      '12345@gmail.com',
      'qwerty@gmail.com'
    ];

    for (const email of junkUsernames) {
      const result = await validateEmail(email);
      assert.strictEqual(result.isValid, false, `Expected junk username ${email} to be rejected`);
      assert.match(result.error, /not permitted|placeholder/i);
    }
  });

  it('should reject disposable and temporary email domains', async () => {
    const disposableEmails = [
      'user99@tempmail.com',
      'client@guerrillamail.com',
      'shopper@mailinator.com',
      'verify@yopmail.com',
      'fast@10minutemail.com',
      'order@trashmail.com'
    ];

    for (const email of disposableEmails) {
      const result = await validateEmail(email);
      assert.strictEqual(result.isValid, false, `Expected disposable ${email} to be rejected`);
      assert.match(result.error, /temporary|disposable/i);
    }
  });

  it('should normalize valid emails to lowercase trimmed format', async () => {
    const raw = '  User.Test99@GMAIL.COM  ';
    const result = await validateEmail(raw);
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.normalizedEmail, 'user.test99@gmail.com');
  });
});
