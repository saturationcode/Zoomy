import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Chat, Message, MessageType, Profile } from '../types';

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  loadingChats: boolean;
  loadingMessages: boolean;
  subscriptions: Record<string, () => void>;
}

interface ChatActions {
  loadChats: (userId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (
    chatId: string,
    content: string,
    type?: MessageType,
    replyToId?: string
  ) => Promise<void>;
  subscribeToMessages: (chatId: string) => void;
  unsubscribeFromChat: (chatId: string) => void;
  addReaction: (
    messageId: string,
    chatId: string,
    reaction: string,
    userId: string
  ) => Promise<void>;
  removeReaction: (
    messageId: string,
    chatId: string,
    reaction: string,
    userId: string
  ) => Promise<void>;
  createDM: (myId: string, otherId: string) => Promise<string>;
  createGroup: (name: string, memberIds: string[], creatorId: string) => Promise<string>;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: {},
  loadingChats: false,
  loadingMessages: false,
  subscriptions: {},

  loadChats: async (userId) => {
    set({ loadingChats: true });
    try {
      const { data, error } = await supabase
        .from('chat_members')
        .select(`chat_id, chats(*, chat_members(user_id, profiles(*)))`)
        .eq('user_id', userId);

      if (error || !data) return;

      const chats: Chat[] = data
        .map((row: any) => {
          const chat = row.chats as any;
          if (!chat) return null;

          const members = (chat.chat_members ?? []).map((m: any) => ({
            chat_id: chat.id,
            user_id: m.user_id,
            role: m.role ?? 'member',
            joined_at: m.joined_at ?? chat.created_at,
            is_muted: m.is_muted ?? false,
            last_read_at: m.last_read_at ?? null,
            profile: m.profiles ?? null,
          }));

          let other_user: Profile | null = null;
          if (chat.type === 'dm') {
            const other = members.find((m: any) => m.user_id !== userId);
            other_user = other?.profile ?? null;
          }

          return {
            id: chat.id,
            type: chat.type,
            name: chat.name ?? null,
            description: chat.description ?? null,
            avatar_color: chat.avatar_color ?? null,
            avatar_url: chat.avatar_url ?? null,
            created_by: chat.created_by,
            last_message_at: chat.last_message_at ?? null,
            created_at: chat.created_at,
            members,
            other_user,
            unread_count: 0,
          } as Chat;
        })
        .filter(Boolean) as Chat[];

      const sorted = chats.sort((a, b) => {
        const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bTime - aTime;
      });

      set({ chats: sorted });
    } finally {
      set({ loadingChats: false });
    }
  },

  selectChat: async (chatId) => {
    set({ activeChatId: chatId });

    const { messages } = get();
    if (!messages[chatId]) {
      await get().loadMessages(chatId);
    }

    get().subscribeToMessages(chatId);
  },

  loadMessages: async (chatId) => {
    set({ loadingMessages: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, sender:profiles!sender_id(*), reactions:message_reactions(*, profile:profiles(*))`)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error || !data) return;

      set((state) => ({
        messages: { ...state.messages, [chatId]: data as Message[] },
      }));
    } finally {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (chatId, content, type = 'text', replyToId) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const now = new Date().toISOString();

    const optimistic: Message = {
      id: optimisticId,
      chat_id: chatId,
      sender_id: '',
      content,
      type,
      media_url: null,
      media_meta: null,
      reply_to_id: replyToId ?? null,
      is_pinned: false,
      is_deleted: false,
      edited_at: null,
      created_at: now,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] ?? []), optimistic],
      },
    }));

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      content,
      type,
    };
    if (replyToId) payload.reply_to_id = replyToId;

    const { data, error } = await supabase
      .from('messages')
      .insert(payload)
      .select(`*, sender:profiles!sender_id(*), reactions:message_reactions(*, profile:profiles(*))`)
      .single();

    if (error || !data) {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] ?? []).filter((m) => m.id !== optimisticId),
        },
      }));
      return;
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] ?? []).map((m) =>
          m.id === optimisticId ? (data as Message) : m
        ),
      },
    }));
  },

  subscribeToMessages: (chatId) => {
    const { subscriptions } = get();
    if (subscriptions[chatId]) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          const { data } = await supabase
            .from('messages')
            .select(`*, sender:profiles!sender_id(*), reactions:message_reactions(*, profile:profiles(*))`)
            .eq('id', newMsg.id)
            .single();

          if (!data) return;

          set((state) => {
            const existing = state.messages[chatId] ?? [];
            const alreadyExists = existing.some((m) => m.id === data.id);
            if (alreadyExists) return state;

            return {
              messages: {
                ...state.messages,
                [chatId]: [...existing, data as Message],
              },
            };
          });
        }
      )
      .subscribe();

    const cleanup = () => {
      supabase.removeChannel(channel);
    };

    set((state) => ({
      subscriptions: { ...state.subscriptions, [chatId]: cleanup },
    }));
  },

  unsubscribeFromChat: (chatId) => {
    const { subscriptions } = get();
    const cleanup = subscriptions[chatId];
    if (cleanup) {
      cleanup();
      set((state) => {
        const next = { ...state.subscriptions };
        delete next[chatId];
        return { subscriptions: next };
      });
    }
  },

  addReaction: async (messageId, chatId, reaction, userId) => {
    const { error } = await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: userId,
      reaction,
    });

    if (error) return;

    set((state) => {
      const msgs = state.messages[chatId] ?? [];
      return {
        messages: {
          ...state.messages,
          [chatId]: msgs.map((m) => {
            if (m.id !== messageId) return m;
            const newReaction = {
              id: `${messageId}-${userId}-${reaction}`,
              message_id: messageId,
              user_id: userId,
              reaction: reaction as any,
              created_at: new Date().toISOString(),
            };
            return { ...m, reactions: [...(m.reactions ?? []), newReaction] };
          }),
        },
      };
    });
  },

  removeReaction: async (messageId, chatId, reaction, userId) => {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction', reaction);

    if (error) return;

    set((state) => {
      const msgs = state.messages[chatId] ?? [];
      return {
        messages: {
          ...state.messages,
          [chatId]: msgs.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              reactions: (m.reactions ?? []).filter(
                (r) => !(r.user_id === userId && r.reaction === reaction)
              ),
            };
          }),
        },
      };
    });
  },

  createDM: async (myId, otherId) => {
    const { data: existing } = await supabase
      .from('chat_members')
      .select('chat_id, chats!inner(type)')
      .eq('user_id', myId)
      .eq('chats.type', 'dm');

    if (existing && existing.length > 0) {
      const myDmIds = existing.map((r: any) => r.chat_id);

      const { data: otherMemberships } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', otherId)
        .in('chat_id', myDmIds);

      if (otherMemberships && otherMemberships.length > 0) {
        return otherMemberships[0].chat_id;
      }
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ type: 'dm', created_by: myId })
      .select('id')
      .single();

    if (chatError || !chat) throw new Error(chatError?.message ?? 'Failed to create DM');

    await supabase.from('chat_members').insert([
      { chat_id: chat.id, user_id: myId, role: 'owner' },
      { chat_id: chat.id, user_id: otherId, role: 'member' },
    ]);

    return chat.id;
  },

  createGroup: async (name, memberIds, creatorId) => {
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({ type: 'group', name, created_by: creatorId })
      .select('id')
      .single();

    if (chatError || !chat) throw new Error(chatError?.message ?? 'Failed to create group');

    const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
    const members = allMemberIds.map((uid) => ({
      chat_id: chat.id,
      user_id: uid,
      role: uid === creatorId ? 'owner' : 'member',
    }));

    await supabase.from('chat_members').insert(members);

    return chat.id;
  },
}));
