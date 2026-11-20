"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/user-avatar";
import { removeAvatar, uploadAvatar } from "@/features/profile/actions";
import { AVATAR_MAX_SOURCE_BYTES, AVATAR_SIZE } from "@/features/profile/avatar";

/**
 * Centre-crops the picked photo to a square and re-encodes it as a 512px
 * JPEG. Re-encoding drops EXIF data (location, camera) and keeps uploads
 * small; browsers apply the photo's rotation when decoding.
 */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.86),
  );
}

export function AvatarUploader({ name, src }: { name: string; src: string | null }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<{ blob: Blob; url: string } | null>(null);
  const [preparing, setPreparing] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same photo again
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose a photo.");
    if (file.size > AVATAR_MAX_SOURCE_BYTES) return toast.error("That photo is over 15 MB. Please choose a smaller one.");
    setPreparing(true);
    try {
      const blob = await toSquareJpeg(file);
      setPreview({ blob, url: URL.createObjectURL(blob) });
    } catch {
      toast.error("That photo format isn't supported. Try a JPEG or PNG.");
    } finally {
      setPreparing(false);
    }
  };

  const save = () => {
    if (!preview) return;
    const data = new FormData();
    data.set("avatar", new File([preview.blob], "avatar.jpg", { type: "image/jpeg" }));
    startTransition(async () => {
      const r = await uploadAvatar(data);
      if (!r.ok) return void toast.error(r.error);
      setPreview(null);
      toast.success("Profile photo updated");
    });
  };

  const remove = () =>
    startTransition(async () => {
      const r = await removeAvatar();
      if (!r.ok) return void toast.error(r.error);
      toast.success("Profile photo removed");
    });

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={preparing || pending}
        aria-label={src ? "Change profile photo" : "Add profile photo"}
        className="group relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <UserAvatar name={name} src={src} className="size-22 text-h1 transition-opacity group-hover:opacity-90" />
        <span
          aria-hidden
          className="absolute -right-0.5 -bottom-0.5 inline-flex size-8 items-center justify-center rounded-full border-2 border-background bg-brand text-fg-inverse"
        >
          {preparing ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={onPick} />
      {src && (
        <Button variant="ghost" size="sm" onClick={remove} disabled={pending}>
          Remove photo
        </Button>
      )}

      <Sheet open={preview !== null} onOpenChange={(o) => !o && !pending && setPreview(null)}>
        {preview && (
          <SheetContent title="New profile photo" description="Cropped to a square from the centre." size="sm">
            <div className="flex flex-col items-center gap-5 pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
              <img src={preview.url} alt="Preview of your new profile photo" className="size-40 rounded-full object-cover shadow-card" />
              <div className="grid w-full grid-cols-2 gap-3">
                <Button variant="secondary" size="lg" onClick={() => setPreview(null)} disabled={pending}>
                  Cancel
                </Button>
                <Button size="lg" onClick={save} loading={pending}>
                  Save photo
                </Button>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
