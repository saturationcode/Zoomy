-- ============================================================
-- Lighty Messenger — Supabase Schema
-- Run in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── 1. Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT        UNIQUE NOT NULL
                              CHECK (length(username) >= 3 AND length(username) <= 32
                                     AND username ~ '^[a-z0-9._]+$'),
  display_name    TEXT,
  bio             TEXT        DEFAULT '',
  avatar_url      TEXT,
  avatar_color    TEXT        DEFAULT '#7c3aed',
  status          TEXT        DEFAULT 'online'
                              CHECK (status IN ('online','offline','away','dnd')),
  last_seen       TIMESTAMPTZ DEFAULT NOW(),
  wallet_address  TEXT,
  is_anonymous    BOOLEAN     DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);


-- ── 2. Chats ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chats (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT        NOT NULL CHECK (type IN ('dm','group','channel')),
  name            TEXT,
  description     TEXT        DEFAULT '',
  avatar_url      TEXT,
  avatar_color    TEXT        DEFAULT '#7c3aed',
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  is_ghost        BOOLEAN     DEFAULT FALSE,  -- Ghost chat: messages auto-delete
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chats_select_members"
  ON chats FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
        AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "chats_insert_authenticated"
  ON chats FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "chats_update_members"
  ON chats FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
        AND chat_members.user_id = auth.uid()
        AND chat_members.role IN ('owner','admin')
    )
  );


-- ── 3. Chat Members ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_members (
  chat_id       UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          TEXT        DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  is_muted      BOOLEAN     DEFAULT FALSE,
  last_read_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_members_select"
  ON chat_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
              AND cm.user_id = auth.uid()));

CREATE POLICY "chat_members_insert"
  ON chat_members FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "chat_members_delete_own"
  ON chat_members FOR DELETE TO authenticated USING (user_id = auth.uid());


-- ── 4. Messages ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID        NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT,
  type        TEXT        DEFAULT 'text'
              CHECK (type IN ('text','image','file','voice','nft','system')),
  media_url   TEXT,
  media_meta  JSONB,
  reply_to_id UUID        REFERENCES messages(id) ON DELETE SET NULL,
  is_pinned   BOOLEAN     DEFAULT FALSE,
  is_deleted  BOOLEAN     DEFAULT FALSE,
  edited_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_chat_members"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
        AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_chat_members"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
        AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid());

-- Index for fast message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_chat_created
  ON messages(chat_id, created_at DESC);


-- ── 5. Message Reactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS message_reactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction    TEXT        NOT NULL
              CHECK (reaction IN ('fire','heart','like','mindblown','laugh','ghost')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, reaction)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_select"
  ON message_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "reactions_insert_own"
  ON message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reactions_delete_own"
  ON message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ── 6. NFT Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nft_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT        NOT NULL,
  description       TEXT,
  image_url         TEXT,
  contract_address  TEXT,
  token_id          TEXT,
  chain             TEXT        DEFAULT 'ethereum',
  is_featured       BOOLEAN     DEFAULT FALSE,
  metadata          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nft_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nft_items_select"
  ON nft_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "nft_items_insert_own"
  ON nft_items FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "nft_items_update_own"
  ON nft_items FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "nft_items_delete_own"
  ON nft_items FOR DELETE TO authenticated
  USING (owner_id = auth.uid());


-- ── 7. Realtime ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ── 8. Update last_message_at on new message ─────────────────
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- ── 9. Update profile last_seen ──────────────────────────────
-- Call this via Supabase Edge Function or client-side every 30s
-- profiles.last_seen is updated by the client directly via RLS policy.
