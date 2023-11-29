alter table "public"."files" add column "user_id" uuid not null default auth.uid();

alter table "public"."files" add constraint "files_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."files" validate constraint "files_user_id_fkey";

create policy "Enable select for users based on user_id"
on "public"."files"
as permissive
for select
to public
using ((auth.uid() = user_id));

create policy "Enable insert for users based on user_id"
on "public"."files"
as permissive for insert
to public
with check ((auth.uid() = user_id));

create policy "Enable delete for users based on user_id"
on "public"."files"
as permissive
for delete
to public
using ((auth.uid() = user_id));

create policy "Enable update for users based on user_id"
on "public"."files"
as permissive
for update
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create a function to delete a file and its documents
create function delete_file_and_documents (
  file_id bigint
) returns void
language plpgsql
as $$
begin
  delete from documents where documents.metadata ->> 'file_id' = file_id::text;
  delete from files where files.id = file_id;
end;
$$;