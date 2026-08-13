"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  MessageSquare,
  Bell,
  Send,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import {
  useConversations,
  useDeleteConversation,
  useUpdateConversation,
} from "@/hooks/use-conversations";
import type { ApiConversation } from "@/types/inbox";

const STATUS_BADGE_STYLES = {
  New: "bg-red-50 text-red-600 border border-red-200",
  "In Progress": "bg-amber-50 text-amber-600 border border-amber-200",
  Resolved: "bg-green-50 text-green-600 border border-green-200",
};

function initials(name?: string | null) {
  return (name ?? "C")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function MessagesPage() {
  const { data, isLoading, isError } = useConversations();
  const update = useUpdateConversation();
  const remove = useDeleteConversation();
  const conversations = data?.data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingStatusMsg, setEditingStatusMsg] = useState<ApiConversation | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  function toast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  const filtered = conversations.filter((msg) => {
    const hay = `${msg.buyer?.name ?? ""} ${msg.subject} ${msg.preview}`.toLowerCase();
    const matchesSearch = hay.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || msg.displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  async function handleUpdateStatus(id: string, newStatus: "New" | "In Progress" | "Resolved") {
    try {
      await update.mutateAsync({ id, status: newStatus });
      setEditingStatusMsg(null);
      toast(`Status updated to ${newStatus}.`);
    } catch (err) {
      toast(apiErrorMessage(err, "Could not update status."));
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove.mutateAsync(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      toast("Conversation deleted.");
    } catch (err) {
      toast(apiErrorMessage(err, "Could not delete conversation."));
    }
  }

  async function handleBulkResolve() {
    await Promise.all(selectedIds.map((id) => update.mutateAsync({ id, status: "Resolved" })));
    setSelectedIds([]);
    toast("Selected conversations marked as Resolved.");
  }

  async function handleBulkDelete() {
    await Promise.all(selectedIds.map((id) => remove.mutateAsync(id)));
    setSelectedIds([]);
    toast("Selected conversations deleted.");
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-slate-800 text-2xl font-bold">Messages Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Read and reply to customer order inquiries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#f3eafb] flex items-center justify-center shrink-0">
            <MessageSquare className="text-[#7a3dbf]" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Total Conversations</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{conversations.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <Bell className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Unread Messages</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{unreadCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter by customer name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-bold text-slate-700"
          >
            <option value="All">All Conversations</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-[#7a3dbf]">{selectedIds.length} conversations selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkResolve} className="bg-green-50 border border-green-200 text-green-700 font-bold text-xs px-4 py-1.5 rounded-xl">
                Mark as Resolved
              </button>
              <button onClick={handleBulkDelete} className="bg-red-50 border border-red-200 text-red-600 font-bold text-xs px-4 py-1.5 rounded-xl">
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
          ) : isError ? (
            <p className="py-12 text-center text-rose-600 font-medium">Could not load conversations.</p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={(e) => setSelectedIds(e.target.checked ? filtered.map((m) => m.id) : [])}
                      className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf]"
                    />
                  </th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Last Message Preview</th>
                  <th className="py-3 px-4">Received At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
                {filtered.length > 0 ? (
                  filtered.map((msg) => (
                    <tr key={msg.id} className={cn("hover:bg-slate-50/50", selectedIds.includes(msg.id) && "bg-purple-50/20")}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(msg.id)}
                          onChange={(e) =>
                            setSelectedIds((prev) => (e.target.checked ? [...prev, msg.id] : prev.filter((id) => id !== msg.id)))
                          }
                          className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center text-xs font-black">
                            {initials(msg.buyer?.name)}
                          </div>
                          <span className="text-slate-800 font-bold">{msg.buyer?.name ?? "Customer"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/messages/${msg.id}`} className="text-slate-800 font-bold hover:text-[#7a3dbf] hover:underline">
                          {msg.subject}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium max-w-[250px] truncate">{msg.preview}</td>
                      <td className="py-4 px-4 font-medium text-slate-500">{formatOrderDate(msg.lastMessageAt)}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setEditingStatusMsg(msg)}
                          className={cn("px-3 py-1 rounded-full text-xs font-bold", STATUS_BADGE_STYLES[msg.displayStatus])}
                        >
                          {msg.displayStatus}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditingStatusMsg(msg)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-[#7a3dbf]">
                            <Edit2 size={13} />
                          </button>
                          <Link href={`/messages/${msg.id}`} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-[#7a3dbf]">
                            <Eye size={13} />
                          </Link>
                          <button onClick={() => handleDelete(msg.id)} className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No conversations yet. Buyers can message you from a product or order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingStatusMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setEditingStatusMsg(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setEditingStatusMsg(null)} className="absolute right-4 top-4 text-slate-400">
              <X size={18} />
            </button>
            <h3 className="text-slate-800 text-base font-bold">Update Message Status</h3>
            <div className="flex flex-col gap-2 pt-2">
              {(["New", "In Progress", "Resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(editingStatusMsg.id, status)}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-xl border font-bold text-sm text-left",
                    editingStatusMsg.displayStatus === status
                      ? "bg-[#7a3dbf] text-white border-[#7a3dbf]"
                      : "bg-[#faf6ff] text-slate-700 border-[#ebd7fa]",
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
