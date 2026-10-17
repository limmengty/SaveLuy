-- ==============================================================================
-- Migration: Add Avatars Storage Bucket and Profile Photo Update Functions
-- ==============================================================================

-- 1. Create public storage bucket 'avatars' if not exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Storage RLS Policies
drop policy if exists "Avatar public read access" on storage.objects;
create policy "Avatar public read access"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can upload own avatar" on storage.objects;
create policy "Authenticated users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Update public.handle_new_user to capture Google avatar_url and picture
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  extracted_avatar text;
  extracted_name text;
begin
  extracted_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  extracted_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'SaveLuy User'
  );

  insert into public.profiles (id, email, display_name, avatar_url, locale)
  values (
    new.id,
    new.email,
    extracted_name,
    extracted_avatar,
    'en-KH'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  insert into public.user_preferences (user_id, voice, locale, currency)
  values (new.id, 'calm', 'en-KH', 'USD')
  on conflict (user_id) do nothing;

  -- Default Quick Actions
  insert into public.quick_actions (user_id, label, emoji, amount_cents, envelope, display_order)
  values
    (new.id, 'Coffee', '☕', 150, 'fun', 1),
    (new.id, 'Meal', '🍜', 250, 'essentials', 2),
    (new.id, 'Transport', '🛺', 300, 'essentials', 3),
    (new.id, 'Drink', '🧃', 200, 'fun', 4),
    (new.id, 'Groceries', '🥬', 500, 'essentials', 5)
  on conflict do nothing;

  return new;
end;
$$;
