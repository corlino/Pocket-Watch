"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import type { ActionResult } from "@/features/transactions/types";
import { AVATAR_BUCKET, AVATAR_MAX_UPLOAD_BYTES } from "./avatar";

/**
 * Profile photo upload / removal. The browser has already cropped and
 * re-encoded the picture as a small JPEG; we re-check type, size and the JPEG
 * signature, and RLS on storage.objects limits writes to the user's folder.
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  if (file.size > AVATAR_MAX_UPLOAD_BYTES) return { ok: false, error: "That photo is too large. Please try another." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type !== "image/jpeg" || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return { ok: false, error: "That file isn't a supported image." };
  }

  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", userId).maybeSingle();
  const path = `${userId}/avatar-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (uploadError) {
    console.error("[avatar] upload", uploadError);
    return { ok: false, error: "Your photo couldn't be uploaded. Please try again." };
  }

  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
  if (error) {
    console.error("[avatar] save", error);
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    return { ok: false, error: "Your photo couldn't be saved. Please try again." };
  }
  if (profile?.avatar_path) await supabase.storage.from(AVATAR_BUCKET).remove([profile.avatar_path]);
  refresh();
  return { ok: true };
}

export async function removeAvatar(): Promise<ActionResult> {
  const { supabase, userId } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", userId).maybeSingle();
  const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", userId);
  if (error) {
    console.error("[avatar] remove", error);
    return { ok: false, error: "Your photo couldn't be removed. Please try again." };
  }
  if (profile?.avatar_path) await supabase.storage.from(AVATAR_BUCKET).remove([profile.avatar_path]);
  refresh();
  return { ok: true };
}
