import { isEmail } from 'class-validator';

export function checkValidEmailList(emails: string[]): boolean {
  if (!emails || emails.length === 0) return false;
  for (const email of emails) {
    if (!isEmail(email)) return false;
  }
  return true;
}
