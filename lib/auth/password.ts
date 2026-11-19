/**
 * Password policy (docs/decisions.md): at least 6 characters with upper-case,
 * lower-case and a number. Mirrored in scripts/admin-account.mts.
 */
export const PASSWORD_MIN = 6;

export function passwordProblem(pw: string): string | null {
  if (pw.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (pw.length > 72) return "Use 72 characters or fewer.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) {
    return "Include an upper-case letter, a lower-case letter and a number.";
  }
  return null;
}
