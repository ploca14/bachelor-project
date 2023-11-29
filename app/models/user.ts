import type { User as SupabaseUser } from "@supabase/supabase-js";

export default class User {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly avatar_url?: string,
  ) {}

  static fromSupabaseUser(supabaseUser: SupabaseUser): User {
    return new User(
      supabaseUser.id,
      supabaseUser.user_metadata.full_name,
      supabaseUser.user_metadata.avatar_url,
    );
  }
}
