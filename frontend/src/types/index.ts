export type UserStatus = 'online' | 'offline' | 'away' | 'dnd';

export type ChatType = 'dm' | 'group' | 'channel';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'nft' | 'system';

export type ReactionType = 'fire' | 'heart' | 'like' | 'mindblown' | 'laugh' | 'ghost';

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
  created_at: string;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string | null;
  description: string | null;
  avatar_color: string | null;
  avatar_url: string | null;
  created_by: string;
  last_message_at: string | null;
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
