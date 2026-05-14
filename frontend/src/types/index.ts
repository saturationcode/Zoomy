// ── Primitives ───────────────────────────────────────────────────────────────
export type UserStatus   = 'online' | 'offline' | 'away' | 'dnd';
export type ChatType     = 'dm' | 'group' | 'channel';
export type MessageType  = 'text' | 'image' | 'file' | 'voice' | 'nft' | 'gift' | 'system';
export type ReactionType = 'fire' | 'heart' | 'like' | 'mindblown' | 'laugh' | 'ghost';
export type Rarity       = 'common' | 'rare' | 'epic' | 'legendary';

// ── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_color: string;
  status: UserStatus;
  last_seen: string | null;
  wallet_address: string | null;
  is_anonymous: boolean;
  stars_balance: number;
  created_at: string;
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  description: string | null;
  avatar_color: string | null;
  avatar_url: string | null;
  created_by: string;
  last_message_at: string | null;
  is_ghost: boolean;
  created_at: string;
  members?: ChatMember[];
  last_message?: Message | null;
  unread_count?: number;
  other_user?: Profile | null;
}

export interface ChatMember {
  chat_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  is_muted: boolean;
  last_read_at: string | null;
  profile?: Profile | null;
}

// ── Message ──────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  type: MessageType;
  media_url: string | null;
  media_meta: Record<string, unknown> | null;
  reply_to_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  sender?: Profile | null;
  reactions?: MessageReaction[];
  reply_to?: Message | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
  profile?: Profile | null;
}

// ── NFT (legacy gallery) ──────────────────────────────────────────────────────
export interface NFTItem {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  image_url: string;
  contract_address: string;
  token_id: string;
  chain: string;
  is_featured: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Gifts ────────────────────────────────────────────────────────────────────
export interface GiftType {
  id: string;
  name: string;
  description: string | null;
  emoji_fallback: string; // SVG icon name to use (no real emoji)
  animation_url: string | null;
  image_url: string | null;
  rarity: Rarity;
  stars_price: number;
  supply_limit: number | null;
  total_minted: number;
  gradient: string; // CSS gradient for card background
  created_at: string;
}

export interface Gift {
  id: string;
  gift_type_id: string;
  gift_type?: GiftType;
  from_user_id: string;
  to_user_id: string;
  chat_id: string | null;
  message_id: string | null;
  is_displayed: boolean;
  received_at: string;
  from_user?: Profile;
  to_user?: Profile;
}

// ── Stars (internal currency) ─────────────────────────────────────────────────
export interface StarsTier {
  stars: number;
  price_usd: number;
  label: string;
  popular?: boolean;
  bonus?: string;
}

export interface StarsTransaction {
  id: string;
  user_id: string;
  amount: number;       // positive = receive, negative = spend
  type: 'purchase' | 'gift_send' | 'gift_receive' | 'username_buy' | 'number_buy' | 'promo';
  reference_id: string | null;
  description: string;
  created_at: string;
}

// ── Marketplace ───────────────────────────────────────────────────────────────
export interface AnonymousNumber {
  id: string;
  number: string;         // e.g. "+888 xxx xxxx"
  owner_id: string | null;
  stars_price: number;
  is_available: boolean;
  rarity: Rarity;
  flag: string;           // country/style tag
  created_at: string;
}

export interface NFTUsername {
  id: string;
  username: string;
  owner_id: string | null;
  stars_price: number;
  is_listed: boolean;
  rarity: Rarity;
  created_at: string;
}

// ── Rarity helpers ────────────────────────────────────────────────────────────
export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; glow: string; bg: string }> = {
  common:    { label: 'Common',    color: '#6b7280', glow: 'rgba(107,114,128,.3)',  bg: 'rgba(107,114,128,.08)' },
  rare:      { label: 'Rare',      color: '#3b82f6', glow: 'rgba(59,130,246,.4)',   bg: 'rgba(59,130,246,.1)'  },
  epic:      { label: 'Epic',      color: '#a855f7', glow: 'rgba(168,85,247,.45)',  bg: 'rgba(168,85,247,.12)' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,.5)',   bg: 'rgba(245,158,11,.12)' },
};
