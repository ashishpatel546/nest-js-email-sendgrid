import { isEmail } from 'class-validator';

/**
 * Validates an array of email addresses
 * @param emails - Array of email addresses to validate
 * @returns boolean indicating if all emails are valid
 */
export function checkValidEmailList(emails: string[]): boolean {
  if (!emails || emails.length === 0) return false;
  for (const email of emails) {
    if (!isEmail(email)) return false;
  }
  return true;
}
