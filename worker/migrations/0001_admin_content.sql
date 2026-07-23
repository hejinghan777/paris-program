CREATE TABLE IF NOT EXISTS managed_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  restaurant_overrides TEXT NOT NULL DEFAULT '{}',
  attraction_overrides TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT
);

INSERT OR IGNORE INTO managed_content (
  id,
  restaurant_overrides,
  attraction_overrides,
  updated_at
) VALUES (1, '{}', '{}', NULL);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at
  ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
