import { cn } from "@/lib/utils";

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Round profile photo, or initials when there is none. Decorative (aria-hidden). */
export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src: string | null;
  /** Size and initials text size, e.g. "size-10 text-body". */
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-brand-secondary light:text-brand",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- private, auth-gated image route
        <img src={src} alt="" className="size-full object-cover" decoding="async" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
