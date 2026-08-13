"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import {
  useConversation,
  useMarkConversationRead,
  useReplyConversation,
  useUpdateConversation,
} from "@/hooks/use-conversations";

const STATUS_PILL_STYLES = {
  New: "bg-red-100 text-red-700 border-red-200",
  "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
  Resolved: "bg-green-100 text-green-700 border-green-200",
};

export default function MessageDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data, isLoading, isError } = useConversation(params.id);
  const conversation = data?.data;
  const reply = useReplyConversation();
  const update = useUpdateConversation();
  const markRead = useMarkConversationRead();
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (conversation?.id && conversation.unreadCount > 0) {
      markRead.mutate(conversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  function toast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center max-w-lg mx-auto border border-[#ebd7fa] space-y-6 mt-12">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <X size={32} />
        </div>
        <h2 className="text-slate-800 text-xl font-bold">Conversation Not Found</h2>
        <Link href="/messages" className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#7a3dbf] text-white font-bold text-sm rounded-xl">
          <ArrowLeft size={16} />
          Back to Inbox
        </Link>
      </div>
    );
  }

  const thread = conversation;

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await reply.mutateAsync({ id: thread.id, body: replyText });
      setReplyText("");
      toast("Message sent successfully!");
    } catch (err) {
      toast(apiErrorMessage(err, "Could not send message."));
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Link href="/messages" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7a3dbf]">
          <ArrowLeft size={14} /> Inbox
        </Link>
        <select
          value={conversation.displayStatus}
          onChange={(e) => update.mutate({ id: thread.id, status: e.target.value })}
          className={cn("px-3 py-1 rounded-full text-xs font-bold border", STATUS_PILL_STYLES[thread.displayStatus])}
        >
          <option>New</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{thread.buyer?.name ?? "Customer"}</h2>
          <p className="text-xs text-slate-400 font-semibold">{thread.subject}</p>
          {thread.buyer?.email && <p className="text-xs text-slate-400 mt-1">{thread.buyer.email}</p>}
        </div>
        <div className="p-6 space-y-4 bg-slate-50/50 min-h-[320px]">
          {thread.messages.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">No messages yet.</p>
          )}
          {thread.messages.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm",
                item.mine
                  ? "bg-[#7a3dbf] text-white self-end ml-auto rounded-tr-none"
                  : "bg-white text-slate-800 border border-[#ebd7fa] self-start mr-auto rounded-tl-none",
              )}
            >
              <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{item.body}</p>
              <span className={cn("text-[9px] font-bold mt-1.5 self-end", item.mine ? "text-purple-200" : "text-slate-400")}>
                {formatOrderDate(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a message to reply..."
            className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50"
            required
          />
          <button
            type="submit"
            disabled={reply.isPending}
            className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-70"
          >
            {reply.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Reply
          </button>
        </form>
      </div>
    </div>
  );
}
