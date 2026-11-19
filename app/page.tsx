import Image from "next/image";

/**
 * Temporary foundation page. Replaced by the auth redirect (→ /login or /home)
 * once authentication lands.
 */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/brand/logo-light.png" alt="" width={96} height={96} priority />
      <div className="space-y-1">
        <h1 className="text-h2 font-semibold text-fg">Pocket Watch</h1>
        <p className="text-body text-fg-muted">Foundation is set up. Screens are on the way.</p>
      </div>
      <dl className="grid w-full grid-cols-2 gap-3 text-left">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-caption text-fg-muted">Income</dt>
          <dd className="money text-h3 font-semibold text-income">+$4,953.92</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-caption text-fg-muted">Expenses</dt>
          <dd className="money text-h3 font-semibold text-expense">-$2,514.22</dd>
        </div>
      </dl>
      <p className="text-caption text-fg-muted">Sample figures for the design check only.</p>
    </main>
  );
}
