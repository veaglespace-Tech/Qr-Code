const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { generatePayUHash, verifyPayUHash } = require('../../server/src/lib/payu');

describe('PayU Gateway Hash & Security Unit Tests', () => {
  const testKey = 'test_merchant_key';
  const testSalt = 'test_salt_secret';

  it('should generate accurate SHA-512 PayU request hash matching the standard formula', () => {
    const payload = {
      key: testKey,
      txnid: 'TXN_2026_0001_8888',
      amount: '799.00',
      productinfo: 'Custom NFC Review Stand',
      firstname: 'Rahul',
      email: 'rahul.sharma@example.com',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      salt: testSalt
    };

    const calculatedHash = generatePayUHash(payload);

    // Exact string expected by PayU
    const expectedHashString = `${payload.key}|${payload.txnid}|${payload.amount}|${payload.productinfo}|${payload.firstname}|${payload.email}|${payload.udf1}|${payload.udf2}|${payload.udf3}|${payload.udf4}|${payload.udf5}||||||${payload.salt}`;
    const expectedHash = crypto.createHash('sha512').update(expectedHashString).digest('hex');

    assert.strictEqual(calculatedHash, expectedHash);
    assert.strictEqual(calculatedHash.length, 128); // 128 hex chars for SHA-512
    assert.match(calculatedHash, /^[a-f0-9]{128}$/);
  });

  it('should verify legitimate PayU callback reverse hash successfully', () => {
    const responsePayload = {
      key: testKey,
      txnid: 'TXN_2026_0001_8888',
      amount: '799.00',
      productinfo: 'Custom NFC Review Stand',
      firstname: 'Rahul',
      email: 'rahul.sharma@example.com',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      status: 'success',
      salt: testSalt
    };

    // Calculate valid reverse response hash
    const reverseString = `${responsePayload.salt}|${responsePayload.status}||||||${responsePayload.udf5}|${responsePayload.udf4}|${responsePayload.udf3}|${responsePayload.udf2}|${responsePayload.udf1}|${responsePayload.email}|${responsePayload.firstname}|${responsePayload.productinfo}|${responsePayload.amount}|${responsePayload.txnid}|${responsePayload.key}`;
    const validHash = crypto.createHash('sha512').update(reverseString).digest('hex');

    const isValid = verifyPayUHash({
      ...responsePayload,
      responseHash: validHash
    });

    assert.strictEqual(isValid, true);
  });

  it('should reject tampered transaction parameters (e.g. altered amount)', () => {
    const responsePayload = {
      key: testKey,
      txnid: 'TXN_2026_0001_8888',
      amount: '799.00',
      productinfo: 'Custom NFC Review Stand',
      firstname: 'Rahul',
      email: 'rahul.sharma@example.com',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      status: 'success',
      salt: testSalt
    };

    const reverseString = `${responsePayload.salt}|${responsePayload.status}||||||${responsePayload.udf5}|${responsePayload.udf4}|${responsePayload.udf3}|${responsePayload.udf2}|${responsePayload.udf1}|${responsePayload.email}|${responsePayload.firstname}|${responsePayload.productinfo}|${responsePayload.amount}|${responsePayload.txnid}|${responsePayload.key}`;
    const validHash = crypto.createHash('sha512').update(reverseString).digest('hex');

    // Attacker modifies amount from 799.00 to 1.00
    const isTamperedValid = verifyPayUHash({
      ...responsePayload,
      amount: '1.00',
      responseHash: validHash
    });

    assert.strictEqual(isTamperedValid, false);
  });

  it('should handle case-insensitive response hash comparison', () => {
    const responsePayload = {
      key: testKey,
      txnid: 'TXN_2026_0002_1111',
      amount: '1499.00',
      productinfo: 'Dual Stand Bundle',
      firstname: 'Sneha',
      email: 'sneha.patil@example.com',
      udf1: '',
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
      status: 'success',
      salt: testSalt
    };

    const reverseString = `${responsePayload.salt}|${responsePayload.status}||||||${responsePayload.udf5}|${responsePayload.udf4}|${responsePayload.udf3}|${responsePayload.udf2}|${responsePayload.udf1}|${responsePayload.email}|${responsePayload.firstname}|${responsePayload.productinfo}|${responsePayload.amount}|${responsePayload.txnid}|${responsePayload.key}`;
    const uppercaseHash = crypto.createHash('sha512').update(reverseString).digest('hex').toUpperCase();

    const isValid = verifyPayUHash({
      ...responsePayload,
      responseHash: uppercaseHash
    });

    assert.strictEqual(isValid, true);
  });
});
