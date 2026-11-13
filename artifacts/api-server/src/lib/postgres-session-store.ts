import session from "express-session";
import { pool } from "@workspace/db";
import { logger } from "./logger";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function sessionExpiry(sessionData: session.SessionData): Date {
  const expires = sessionData.cookie.expires;
  return expires ? new Date(expires.getTime()) : new Date(Date.now() + SESSION_TTL_MS);
}

export class PostgresSessionStore extends session.Store {
  constructor() {
    super();

    const cleanupTimer = setInterval(() => {
      void pool
        .query("DELETE FROM app_private.user_sessions WHERE expire <= NOW()")
        .catch((err: unknown) => {
          logger.error({ err }, "Failed to clean up expired sessions");
        });
    }, CLEANUP_INTERVAL_MS);

    cleanupTimer.unref();
  }

  get(
    sid: string,
    callback: (err: any, sessionData?: session.SessionData | null) => void,
  ): void {
    void pool
      .query<{ sess: session.SessionData }>(
        "SELECT sess FROM app_private.user_sessions WHERE sid = $1 AND expire > NOW()",
        [sid],
      )
      .then(({ rows }) => callback(null, rows[0]?.sess ?? null))
      .catch((err: unknown) => callback(err));
  }

  set(
    sid: string,
    sessionData: session.SessionData,
    callback?: (err?: any) => void,
  ): void {
    void pool
      .query(
        `INSERT INTO app_private.user_sessions (sid, sess, expire)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (sid) DO UPDATE
         SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`,
        [sid, JSON.stringify(sessionData), sessionExpiry(sessionData)],
      )
      .then(() => callback?.())
      .catch((err: unknown) => {
        if (callback) callback(err);
        else logger.error({ err }, "Failed to save session");
      });
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    void pool
      .query("DELETE FROM app_private.user_sessions WHERE sid = $1", [sid])
      .then(() => callback?.())
      .catch((err: unknown) => {
        if (callback) callback(err);
        else logger.error({ err }, "Failed to destroy session");
      });
  }

  touch(
    sid: string,
    sessionData: session.SessionData,
    callback?: () => void,
  ): void {
    void pool
      .query(
        "UPDATE app_private.user_sessions SET expire = $2 WHERE sid = $1",
        [sid, sessionExpiry(sessionData)],
      )
      .then(() => callback?.())
      .catch((err: unknown) => {
        logger.error({ err }, "Failed to refresh session expiry");
        callback?.();
      });
  }
}
