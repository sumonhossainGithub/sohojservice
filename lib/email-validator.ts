/**
 * Strict RFC 5322 regex and real domain validator.
 * Rejects invalid syntax, missing top-level domains, and throwaway/disposable domains.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "getairmail.com",
  "throwawaymail.com",
  "maildrop.cc",
  "crazymailing.com",
  "fakeinbox.com",
  "emailondeck.com",
  "temp-mail.org",
  "mytemp.email",
  "nada.ltd",
  "tempail.com",
  "burnermail.io",
  "mohmal.com",
  "generator.email",
]);

export function validateRealEmail(emailStr: string): {
  valid: boolean;
  error?: string;
  normalizedEmail: string;
} {
  const email = (emailStr || "").trim().toLowerCase();

  if (!email) {
    return { valid: false, error: "Email address is required.", normalizedEmail: "" };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email address is too long.", normalizedEmail: email };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      valid: false,
      error: "Please enter a valid real email address (e.g. name@gmail.com, you@company.com).",
      normalizedEmail: email,
    };
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return { valid: false, error: "Invalid email structure.", normalizedEmail: email };
  }

  const [, domain] = parts;

  // Domain checks
  if (!domain.includes(".")) {
    return {
      valid: false,
      error: "Email must have a valid top-level domain (e.g. .com, .org, .edu, .net).",
      normalizedEmail: email,
    };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return {
      valid: false,
      error: "Email domain must end with a valid extension (e.g. .com, .edu, .org).",
      normalizedEmail: email,
    };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Temporary or disposable throwaway email domains are not allowed. Please use your real email.",
      normalizedEmail: email,
    };
  }

  return { valid: true, normalizedEmail: email };
}
