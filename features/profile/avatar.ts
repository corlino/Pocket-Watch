/** Shared profile-photo rules (client resize + server checks). */
export const AVATAR_BUCKET = "avatars";
export const AVATAR_SIZE = 512; // px, square
export const AVATAR_MAX_UPLOAD_BYTES = 1024 * 1024; // after resizing (~50–150 KB typical)
export const AVATAR_MAX_SOURCE_BYTES = 15 * 1024 * 1024; // the photo picked on the phone

/** URL the app uses to show a stored photo; the file name makes it cache-safe. */
export function avatarUrl(path: string | null): string | null {
  if (!path) return null;
  return `/api/avatar?v=${encodeURIComponent(path.split("/").pop()!)}`;
}
