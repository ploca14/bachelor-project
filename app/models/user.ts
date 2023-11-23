import type { User as SupabaseUser } from "@supabase/supabase-js";

export default class User {
  readonly id: string;
  readonly name: string;
  readonly avatar_url?: string;

  constructor(supabaseUser: SupabaseUser) {
    this.id = supabaseUser.id;
    this.name = supabaseUser.user_metadata.full_name;
    this.avatar_url = supabaseUser.user_metadata.avatar_url;
  }
}
