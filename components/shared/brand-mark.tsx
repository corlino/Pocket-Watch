import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Pocket Watch logo. Light artwork on the dark theme, dark artwork on the
 * light theme — swapped with CSS so it never flashes.
 */
export function BrandMark({ size = 32, priority, className }: { size?: number; priority?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }}>
      <Image src="/brand/logo-light.png" alt="" width={size} height={size} priority={priority} className="light:hidden" />
      <Image src="/brand/logo-dark.png" alt="" width={size} height={size} priority={priority} className="hidden light:block" />
    </span>
  );
}
