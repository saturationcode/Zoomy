// Admin Bot — creates a local (non-Supabase) welcome chat shown to new users
// The bot's messages are stored in Zustand only, no DB writes

import type { Profile, Message } from '../types';

export const ADMIN_BOT_ID = 'lighty-admin-bot';

export const ADMIN_BOT_PROFILE: Profile = {
  id: ADMIN_BOT_ID,
  username: 'lighty',
  display_name: 'Lighty',
  bio: null,
  avatar_url: null,
  avatar_color: '#7c3aed',
  status: 'online',
  last_seen: null,
  wallet_address: null,
  is_anonymous: false,
  stars_balance: 0,
  created_at: new Date(0).toISOString(),
};

export const ADMIN_BOT_CHAT_ID = 'lighty-admin-bot-chat';

export function getWelcomeMessages(userId: string): Message[] {
  const now = Date.now();
  const min = 60_000;

  return [
    {
      id: 'welcome-1',
      chat_id: ADMIN_BOT_CHAT_ID,
      sender_id: ADMIN_BOT_ID,
      content: 'Welcome to Lighty! ✦',
      type: 'system',
      media_url: null,
      media_meta: null,
      reply_to_id: null,
      is_pinned: false,
      is_deleted: false,
      edited_at: null,
      created_at: new Date(now - 2 * min).toISOString(),
      sender: ADMIN_BOT_PROFILE,
      reactions: [],
    },
    {
      id: 'welcome-2',
      chat_id: ADMIN_BOT_CHAT_ID,
      sender_id: ADMIN_BOT_ID,
      content: [
        "I'm your Lighty assistant. Here's what you can do:",
        '',
        '• 💬 Send messages, images, voice notes, and files',
        '• 👥 Create group chats or start direct conversations',
        '• 🎁 Send collectible Gifts to your friends',
        '• ⭐ Buy Stars — the in-app currency — and spend them on gifts',
        '• 🛒 Browse the Marketplace for anonymous numbers and NFT usernames',
        '• 👻 Chat anonymously using a ghost identity',
      ].join('\n'),
      type: 'text',
      media_url: null,
      media_meta: null,
      reply_to_id: null,
      is_pinned: false,
      is_deleted: false,
      edited_at: null,
      created_at: new Date(now - 90_000).toISOString(),
      sender: ADMIN_BOT_PROFILE,
      reactions: [],
    },
    {
      id: 'welcome-3',
      chat_id: ADMIN_BOT_CHAT_ID,
      sender_id: ADMIN_BOT_ID,
      content: [
        '⭐ Stars & Gifts',
        '',
        'Stars are Lighty\'s premium currency. You can purchase Stars packages from the Stars tab, then use them to send animated Gifts to any user — from Common to Legendary rarity.',
        'Every gift is unique and appears in your recipient\'s gift gallery.',
      ].join('\n'),
      type: 'text',
      media_url: null,
      media_meta: null,
      reply_to_id: null,
      is_pinned: false,
      is_deleted: false,
      edited_at: null,
      created_at: new Date(now - 70_000).toISOString(),
      sender: ADMIN_BOT_PROFILE,
      reactions: [],
    },
    {
      id: 'welcome-4',
      chat_id: ADMIN_BOT_CHAT_ID,
      sender_id: ADMIN_BOT_ID,
      content: [
        '📱 Anonymous Numbers & NFT Usernames',
        '',
        'Want more privacy? Pick up an anonymous +888 number from the Marketplace — it hides your real identity while still letting people reach you.',
        'You can also claim a rare NFT username that\'s truly yours on-chain. Browse the Marketplace to find one that fits your style!',
      ].join('\n'),
      type: 'text',
      media_url: null,
      media_meta: null,
      reply_to_id: null,
      is_pinned: false,
      is_deleted: false,
      edited_at: null,
      created_at: new Date(now - min).toISOString(),
      sender: ADMIN_BOT_PROFILE,
      reactions: [],
    },
  ];
}
