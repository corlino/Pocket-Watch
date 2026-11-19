import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { BrandMark } from "@/components/shared/brand-mark";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pt-safe pb-safe">
      {/* Subtle teal glow — the only decorative gradient on the screen. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size={72} priority />
          <h1 className="mt-6 text-h2 font-semibold text-fg">Hello Colin, password please.</h1>
          <p className="mt-2 text-body text-fg-muted">Pocket Watch</p>
        </div>
        <Suspense fallback={<LoginForm next={undefined} />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginFormWithNext({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return <LoginForm next={next} />;
}
