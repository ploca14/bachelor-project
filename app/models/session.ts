import type { Session as SupabaseSession } from "@supabase/supabase-js";
import User from "./user";

export default class Session {
  readonly user: User;
  readonly expires_at?: number;
  readonly access_token: string;
  readonly refresh_token: string;

  constructor(supabaseSession: SupabaseSession) {
    this.user = new User(supabaseSession.user);
    this.expires_at = supabaseSession.expires_at;
    this.access_token = supabaseSession.access_token;
    this.refresh_token = supabaseSession.refresh_token;
  }
}
