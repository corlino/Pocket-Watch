"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword, type ChangePasswordState } from "@/features/auth/actions";
import { PASSWORD_MIN } from "@/lib/auth/password";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Password changed");
      formRef.current?.reset();
    } else {
      toast.error(state.error);
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  const errors = state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form ref={formRef} action={action} noValidate className="flex flex-col gap-4">
      <input type="text" name="username" autoComplete="username" value="Pocket Watch" readOnly hidden />
      <Field label="Current password" id="current" error={errors.current}>
        <Input name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field
        label="New password"
        id="next"
        error={errors.next}
        hint={`At least ${PASSWORD_MIN} characters, with upper-case, lower-case and a number.`}
      >
        <Input name="next" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password" id="confirm" error={errors.confirm}>
        <Input name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="md:self-start">
        Change Password
      </Button>
    </form>
  );
}
