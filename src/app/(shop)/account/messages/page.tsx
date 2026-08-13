"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MessageSquare, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import {
  useConversation,
  useConversations,
  useMarkConversationRead,
  useReplyConversation,
} from "@/hooks/use-conversations";

function AccountMessagesInner() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError } = useConversations();
  const threads = data?.data ?? [];
  const [activeId, setActiveId] = useState<string | null>(searchParams.get("thread"));
  const detail = useConversation(activeId ?? "");
  const reply = useReplyConversation();
  const markRead = useMarkConversationRead();
  const conversation = detail.data?.data;
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fromQuery = searchParams.get("thread");
    if (fromQuery) setActiveId(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (conversation?.id && conversation.unreadCount > 0) {
      markRead.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !body.trim()) return;
    setError("");
    try {
      await reply.mutateAsync({ id: activeId, body });
      setBody("");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not send message."));
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6D349F]">Messages</h1>
          <p className="text-sm text-[#8A79A5] mt-1">Threads with sellers on Fastlink.</p>
        </div>

        {isLoading && <Loader2 className="animate-spin text-[#7a3dbf]" />}
        {isError && <p className="text-rose-600 text-sm">Could not load messages.</p>}

        {!isLoading && threads.length === 0 && (
          <div className="rounded-2xl border border-[#EBD7FA] bg-white p-10 text-center space-y-3">
            <MessageSquare className="mx-auto text-[#7a3dbf]" />
            <p className="font-bold text-[#3B1C5A]">No conversations yet</p>
            <p className="text-sm text-[#8A79A5]">Message a seller from a product page or an order.</p>
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-4">
          <ul className="space-y-2">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(thread.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border p-4 bg-white",
                    activeId === thread.id ? "border-[#7a3dbf]" : "border-[#EBD7FA]",
                  )}
                >
                  <p className="font-bold text-sm text-[#3B1C5A]">{thread.store?.name ?? "Store"}</p>
                  <p className="text-xs text-[#8A79A5] truncate">{thread.preview}</p>
                  {thread.unreadCount > 0 && (
                    <span className="mt-1 inline-block text-[10px] font-black uppercase text-[#7a3dbf]">
                      {thread.unreadCount} new
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-[#EBD7FA] bg-white min-h-[360px] flex flex-col">
            {!activeId && <p className="m-auto text-sm text-[#8A79A5]">Select a conversation</p>}
            {activeId && conversation && (
              <>
                <div className="p-4 border-b border-[#EBD7FA]">
                  <p className="font-bold text-[#3B1C5A]">{conversation.store?.name ?? "Store"}</p>
                  <p className="text-xs text-[#8A79A5]">{conversation.subject}</p>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {conversation.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[80%] rounded-2xl p-3 text-xs",
                        m.mine ? "bg-[#7a3dbf] text-white ml-auto" : "bg-[#faf6ff] border border-[#ebd7fa]",
                      )}
                    >
                      <p className="whitespace-pre-wrap font-semibold">{m.body}</p>
                      <span className={cn("block mt-1 text-[9px]", m.mine ? "text-purple-200" : "text-slate-400")}>
                        {formatOrderDate(m.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="p-4 border-t border-[#EBD7FA] flex gap-2">
                  {error && <p className="text-xs text-rose-600">{error}</p>}
                  <input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a reply…"
                    className="flex-1 rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2 text-sm"
                    required
                  />
                  <button type="submit" className="rounded-xl bg-[#7a3dbf] text-white px-4 text-xs font-bold inline-flex items-center gap-1">
                    <Send size={12} /> Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountMessagesPage() {
  return (
    <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>}>
      <AccountMessagesInner />
    </Suspense>
  );
}
