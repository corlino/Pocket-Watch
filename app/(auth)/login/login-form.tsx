"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { login, type LoginState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string | undefined }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {/* Lets password managers associate the saved credential with this site. */}
      <input type="text" name="username" autoComplete="username" value="Pocket Watch" readOnly hidden />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-caption font-medium text-fg-secondary">
          Password
        </label>
        <div className="relative">
          <LockKeyhole aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-fg-muted" />
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={state?.error ? true : undefined}
            aria-describedby={state?.error ? "password-error" : undefined}
            className={cn(controlClasses, "h-12 pr-12 pl-10 text-body-lg")}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-brand"
          >
            {visible ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
          </button>
        </div>
        {state?.error && (
          <p id="password-error" role="alert" className="text-caption font-medium text-expense">
            {state.error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" block loading={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
