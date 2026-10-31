const dns = require('dns');

// Configure reliable public DNS servers for MX record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Use default system DNS if setServers is restricted
}

// Comprehensive blocklist of disposable, temporary, and fake email domains
const DISPOSABLE_DOMAINS = new Set([
  // Popular temporary email services
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailaddress.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'suremail.info',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minmail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.me',
  'throwawaymail.com', 'sharklasers.com', 'getairmail.com', 'dispostable.com',
  'mytemp.email', 'fakemailgenerator.com', 'tempail.com', 'burnermail.io',
  'crazymailing.com', 'mohmal.com', 'inboxkitten.com', 'generator.email',
  'emailondeck.com', 'dropmail.me', 'nada.ltd', 'nada.email', 'getnada.com',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu',
  'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'fakeinbox.com', 'fake-box.com', 'fakemail.net', 'fakeemail.net',
  'emailfake.com', 'generator-email.com', 'temporarymail.com', 'throwaway.email',
  'maildrop.cc', 'harakirimail.com', 'trashmail.de', 'spamgourmet.com',
  'zillamail.com', 'bupkis.org', 'spambog.com', 'wegwerfmail.de', 'trash-mail.at',

  // Junk, dummy, and test domains
  'test.com', 'example.com', 'fake.com', 'sample.com', 'none.com', 'noemail.com',
  'dummy.com', 'random.com', 'temp.com', 'asdf.com', 'qwerty.com', 'xyz.com', 'abc.com',
  'invalid.com', 'local.com', 'localhost.com', 'user.com', 'test.in', 'fake.in'
]);

// Well-known trusted mail provider domains - fast path, skip network DNS
const WELL_KNOWN_VALID_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'zoho.com', 'zoho.in', 'zohomail.com',
  'proton.me', 'protonmail.com',
  'rediffmail.com', 'aol.com'
]);

// Blocked dummy local parts
const JUNK_LOCAL_PARTS = new Set([
  'test', 'testing', 'asdf', 'fake', 'dummy', 'random', 'temp', 'temporary',
  'admin', 'user', 'nobody', 'none', 'noemail', '12345', '123456', 'qwerty',
  'sample', 'example', 'junk', 'trash', 'null', 'undefined'
]);

/**
 * Validate email format, fake domain blocklist, and active DNS MX records.
 * @param {string} email
 * @returns {Promise<{ isValid: boolean, error?: string, normalizedEmail?: string }>}
 */
async function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();

  // 1. Length checks
  if (clean.length < 5 || clean.length > 254) {
    return { isValid: false, error: 'Email address must be between 5 and 254 characters.' };
  }

  // 2. RFC 5322 syntax validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address format (e.g. name@company.com).' };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email address structure.' };
  }

  const [localPart, domain] = parts;

  // 3. Local part checks
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email username cannot exceed 64 characters.' };
  }
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, error: 'Email address contains invalid dot placement.' };
  }
  if (JUNK_LOCAL_PARTS.has(localPart)) {
    return { isValid: false, error: 'Placeholder or test email usernames are not permitted.' };
  }

  // 4. Domain & TLD checks
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { isValid: false, error: 'Email domain must have a valid top-level domain (e.g. .com, .in, .org).' };
  }

  // 5. Disposable / Fake domain blocklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Temporary, disposable, or fake email domains are not accepted. Please use your official business or personal email address.'
    };
  }

  // 6. Check for wildcard subdomains of disposable services
  for (const disposable of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + disposable)) {
      return {
        isValid: false,
        error: 'Temporary or disposable email provider detected. Please provide a verified active email.'
      };
    }
  }

  // 7. Fast path: Well-known trusted providers are already known to have valid MX
  if (WELL_KNOWN_VALID_DOMAINS.has(domain)) {
    return { isValid: true, normalizedEmail: clean };
  }

  // 8. Active DNS MX Record Check for custom domains with 3.5s timeout
  try {
    const mxPromise = dns.promises.resolveMx(domain);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error('DNS_TIMEOUT');
        err.code = 'ETIMEOUT';
        reject(err);
      }, 3500);
    });

    const mxRecords = await Promise.race([mxPromise, timeoutPromise]);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: `The domain "${domain}" has no mail server (MX records) configured and cannot receive emails.`
      };
    }
  } catch (dnsErr) {
    // If domain doesn't exist in DNS
    if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
      return {
        isValid: false,
        error: `The domain "${domain}" does not exist or has no active mail servers. Please check for spelling mistakes.`
      };
    }
    // For timeout or sandbox network restrictions, log warning and allow format-valid emails
    console.warn(`DNS MX check note for ${domain}:`, dnsErr.message);
  }

  return { isValid: true, normalizedEmail: clean };
}

module.exports = {
  validateEmail,
  DISPOSABLE_DOMAINS,
  WELL_KNOWN_VALID_DOMAINS
};
