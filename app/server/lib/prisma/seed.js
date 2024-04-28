import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a function that creates a new user in the users table
  await prisma.$executeRaw`
    create function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer set search_path = public
    as $$
    begin
      insert into public.users (id, name, email, "avatarUrl")
      values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'avatar_url');
      return new;
    end;
    $$;
  `;

  // Create a trigger that calls the function when a new user is created
  await prisma.$executeRaw`
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  `;

  // Create a function that deletes a user from the users table
  await prisma.$executeRaw`
    create function public.handle_user_deleted()
    returns trigger
    language plpgsql
    security definer set search_path = public
    as $$
    begin
      delete from public.users where id = old.id;
      return old;
    end;
    $$;
  `;

  // Create a trigger that calls the function when a user is deleted
  await prisma.$executeRaw`
    create trigger on_auth_user_deleted
    after delete on auth.users
    for each row execute procedure public.handle_user_deleted();
  `;

  // Create a bucket for files
  await prisma.$executeRaw`
    insert into storage.buckets (id, name, public, avif_autodetection, allowed_mime_types, file_size_limit)
    values('files', 'files', FALSE, FALSE, ARRAY ['application/pdf'], 20971520);
  `;

  // Create a policy that allows authenticated users to upload files to their own folder in the storage bucket.
  await prisma.$executeRaw`
    create policy "Allow users to upload files to their own top level folder named as uid"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'files' and
      (storage.foldername(name))[1] = auth.uid()::text
    );
  `;

  await prisma.$executeRaw`
    create policy "Allow users to read files from their own top level folder named as uid"
    on storage.objects
    for select
    to authenticated
    using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
  `;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
