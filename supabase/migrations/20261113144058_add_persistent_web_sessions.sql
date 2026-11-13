CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO postgres;

CREATE TABLE app_private.user_sessions (
  sid text PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamptz NOT NULL
);

CREATE INDEX user_sessions_expire_idx
  ON app_private.user_sessions (expire);

REVOKE ALL ON TABLE app_private.user_sessions FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE app_private.user_sessions TO postgres;
