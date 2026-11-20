-- =============================================================================
-- Profile photo (decisions.md). The image lives in a PRIVATE Storage bucket
-- under "<user id>/avatar-<timestamp>.jpg"; profiles.avatar_path points at
-- the current one. The app resizes to a 512px square JPEG (stripping location
-- and camera data) before upload, so files are small.
-- =============================================================================

alter table public.profiles
  add column avatar_path text
    check (avatar_path is null or avatar_path ~ '^[0-9a-f-]{36}/avatar-[0-9]{10,16}\.jpg$');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Each user can only touch files inside their own folder.
create policy "avatars: owner can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: owner can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: owner can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: owner can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
