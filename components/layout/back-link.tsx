import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Back navigation for sub-pages (e.g. Profile → Categories). */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-body font-medium text-fg-secondary hover:text-fg focus-visible:outline-2 focus-visible:outline-brand"
    >
      <ChevronLeft className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
