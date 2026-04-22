import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Circle, Loader2, ShoppingBag, Briefcase, MapPin, Store } from "lucide-react";
import { messagesService, type ChatRow, type MessageRow } from "@/services/messages.service";
import { useChatRealtime, useChatsRealtime } from "@/hooks/useChatRealtime";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const KIND_META: Record<string, { icon: typeof ShoppingBag; label: string }> = {
  product: { icon: ShoppingBag, label: "Product" },
  service: { icon: Briefcase, label: "Service" },
  local: { icon: MapPin, label: "Local" },
  shop: { icon: Store, label: "Shop" },
};

export default function Messages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const initialChat = params.get("chat");
  const [activeId, setActiveId] = useState<string | null>(initialChat);

  const chatsQ = useQuery({ queryKey: ["chats"], queryFn: () => messagesService.listChats() });
  useChatsRealtime(user?.id ?? null);

  // Resolve display profiles for the other side of every chat
  const peerIds = useMemo(() => {
    if (!chatsQ.data || !user) return [] as string[];
    return chatsQ.data.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id));
  }, [chatsQ.data, user]);

  const profilesQ = useQuery({
    queryKey: ["chat-profiles", peerIds.join(",")],
    queryFn: () => messagesService.resolveProfiles(peerIds),
    enabled: peerIds.length > 0,
  });

  // Auto-pick the first chat if none selected
  useEffect(() => {
    if (!activeId && chatsQ.data && chatsQ.data[0]) {
      setActiveId(chatsQ.data[0].id);
    }
  }, [chatsQ.data, activeId]);

  // Keep ?chat=… in URL
  useEffect(() => {
    if (!activeId) return;
    setParams((p) => { const n = new URLSearchParams(p); n.set("chat", activeId); return n; }, { replace: true });
  }, [activeId, setParams]);

  const activeChat = chatsQ.data?.find((c) => c.id === activeId) ?? null;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-gradient">Messages</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time conversations across every marketplace.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Chat list */}
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-border/40 p-3">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inbox</h2>
          </div>
          <ScrollArea className="h-[60vh]">
            {chatsQ.isLoading ? (
              <div className="grid place-items-center p-6 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : !chatsQ.data?.length ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <MessageCircle className="mx-auto mb-2 h-6 w-6 opacity-50" />
                No conversations yet. Open one from a marketplace listing.
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {chatsQ.data.map((c) => {
                  const peerId = c.buyer_id === user?.id ? c.seller_id : c.buyer_id;
                  const peer = profilesQ.data?.[peerId];
                  const unread = c.buyer_id === user?.id ? c.buyer_unread : c.seller_unread;
                  const Icon = KIND_META[c.listing_kind]?.icon ?? MessageCircle;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-secondary/40",
                          activeId === c.id && "bg-secondary/60",
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={peer?.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {(peer?.full_name ?? "U").slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{peer?.full_name ?? "Unknown"}</p>
                            {unread > 0 && (
                              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{unread}</span>
                            )}
                          </div>
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Icon className="h-3 w-3" />
                            {c.last_preview ?? "New conversation"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        </GlassCard>

        {/* Active chat */}
        {activeChat && user ? (
          <ChatPanel
            chat={activeChat}
            currentUserId={user.id}
            peerLabel={profilesQ.data?.[activeChat.buyer_id === user.id ? activeChat.seller_id : activeChat.buyer_id]?.full_name ?? "Conversation"}
            peerAvatar={profilesQ.data?.[activeChat.buyer_id === user.id ? activeChat.seller_id : activeChat.buyer_id]?.avatar_url ?? null}
            onMarked={() => qc.invalidateQueries({ queryKey: ["chats"] })}
          />
        ) : (
          <GlassCard className="grid place-items-center p-10 text-center text-sm text-muted-foreground">
            <div>
              <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
              Select a conversation to start chatting.
            </div>
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}

function ChatPanel({
  chat, currentUserId, peerLabel, peerAvatar, onMarked,
}: {
  chat: ChatRow;
  currentUserId: string;
  peerLabel: string;
  peerAvatar: string | null;
  onMarked: () => void;
}) {
  const peerId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id;
  const messagesQ = useQuery({
    queryKey: ["chat-messages", chat.id],
    queryFn: () => messagesService.listMessages(chat.id),
  });
  useChatRealtime(chat.id);

  // Mark messages read when the chat opens or new ones arrive
  useEffect(() => {
    messagesService.markRead(chat.id).then(onMarked).catch(() => undefined);
  }, [chat.id, messagesQ.data?.length, onMarked]);

  // Presence + typing — Supabase Realtime channel
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const ch = supabase.channel(`presence:${chat.id}`, { config: { presence: { key: currentUserId } } });
    channelRef.current = ch;
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      setPeerOnline(Object.keys(state).some((k) => k === peerId));
    });
    ch.on("broadcast", { event: "typing" }, (payload) => {
      const from = (payload.payload as { from?: string })?.from;
      if (from && from !== currentUserId) {
        setPeerTyping(true);
        window.clearTimeout((channelRef as { _t?: number })._t);
        (channelRef as { _t?: number })._t = window.setTimeout(() => setPeerTyping(false), 1500);
      }
    });
    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ user_id: currentUserId, online_at: new Date().toISOString() });
    });
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [chat.id, currentUserId, peerId]);

  // Auto-scroll on new messages
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesQ.data?.length, peerTyping]);

  // Composer
  const [draft, setDraft] = useState("");
  const sendMut = useMutation({
    mutationFn: () => messagesService.send(chat.id, draft),
    onSuccess: () => setDraft(""),
    onError: (e: Error) => toast.error(e.message),
  });

  const onChange = (v: string) => {
    setDraft(v);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { from: currentUserId } });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sendMut.isPending) return;
    sendMut.mutate();
  };

  const KindIcon = KIND_META[chat.listing_kind]?.icon ?? MessageCircle;

  return (
    <GlassCard className="flex h-[60vh] flex-col overflow-hidden p-0">
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={peerAvatar ?? undefined} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {peerLabel.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-sm font-semibold">{peerLabel}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Circle className={cn("h-2 w-2", peerOnline ? "fill-success text-success" : "fill-muted text-muted")} />
              {peerOnline ? "Online" : "Offline"} · <KindIcon className="h-3 w-3" /> {KIND_META[chat.listing_kind]?.label}
            </p>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-3">
        {messagesQ.isLoading ? (
          <div className="grid place-items-center py-10 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : !messagesQ.data?.length ? (
          <div className="grid place-items-center py-10 text-sm text-muted-foreground">Say hi 👋</div>
        ) : (
          <ul className="space-y-2">
            {messagesQ.data.map((m) => <Bubble key={m.id} m={m} mine={m.sender_id === currentUserId} />)}
            {peerTyping && (
              <li className="flex justify-start">
                <span className="inline-flex items-center gap-1 rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:240ms]" />
                  typing…
                </span>
              </li>
            )}
            <div ref={endRef} />
          </ul>
        )}
      </ScrollArea>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border/40 p-3">
        <Input
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write a message…"
          maxLength={4000}
          className="bg-secondary/40"
        />
        <Button type="submit" disabled={!draft.trim() || sendMut.isPending} className="bg-gradient-primary text-primary-foreground">
          {sendMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </GlassCard>
  );
}

function Bubble({ m, mine }: { m: MessageRow; mine: boolean }) {
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
          mine
            ? "bg-gradient-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary/60 text-foreground rounded-bl-sm",
        )}
      >
        {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
        <p className={cn("mt-1 text-[10px] opacity-70", mine ? "text-right" : "text-left")}>
          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {mine && m.read_at ? " · seen" : ""}
        </p>
      </div>
    </li>
  );
}
