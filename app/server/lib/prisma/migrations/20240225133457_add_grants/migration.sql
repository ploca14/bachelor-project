-- Restore default grants
GRANT usage ON schema public TO postgres, anon, authenticated, service_role;

GRANT all privileges ON all tables IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT all privileges ON all functions IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT all privileges ON all sequences IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT privileges IN SCHEMA public GRANT all ON tables TO postgres, anon, authenticated, service_role;
ALTER DEFAULT privileges IN SCHEMA public GRANT all ON functions TO postgres, anon, authenticated, service_role;
ALTER DEFAULT privileges IN SCHEMA public GRANT all ON sequences TO postgres, anon, authenticated, service_role;

-- Revoke all privileges from anon
REVOKE ALL PRIVILEGES ON DATABASE "postgres" FROM "anon";
REVOKE ALL PRIVILEGES ON SCHEMA "public" FROM "anon";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "anon";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "anon";
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "public" FROM "anon";
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM PUBLIC;