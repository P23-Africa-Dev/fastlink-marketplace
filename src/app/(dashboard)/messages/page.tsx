"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Bell,
  Clock,
  Smile,
  Calendar,
  Download,
  Send
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useMessagesStore, type Conversation } from "@/store/messages-store";

const STATUS_BADGE_STYLES = {
  New: "bg-red-50 text-red-600 border border-red-200",
  "In Progress": "bg-amber-50 text-amber-600 border border-amber-200",
  Resolved: "bg-green-50 text-green-600 border border-green-200"
};

export default function MessagesPage() {
  const {
    conversations,
    updateConversationStatus,
    deleteConversation,
    bulkDeleteConversations,
    bulkResolveConversations,
    replyToConversation
  } = useMessagesStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("Last 30 Days");
  
  // Selected rows
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals & Drawers
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [editingStatusMsg, setEditingStatusMsg] = useState<Conversation | null>(null);
  
  // Inputs
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const activeChat = conversations.find(c => c.id === activeChatId) || null;

  // Filtering logic
  const filtered = conversations.filter((msg) => {
    const matchesSearch =
      msg.senderName.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject.toLowerCase().includes(search.toLowerCase()) ||
      msg.preview.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Table row select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    if (activeChatId === id) setActiveChatId(null);
    setToastMessage("Conversation deleted.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteConversations(selectedIds);
    setSelectedIds([]);
    setToastMessage("Selected conversations deleted.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleBulkResolve = () => {
    if (selectedIds.length === 0) return;
    bulkResolveConversations(selectedIds);
    setSelectedIds([]);
    setToastMessage("Selected conversations marked as Resolved.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatId) return;

    replyToConversation(activeChatId, replyText);
    setReplyText("");
    setToastMessage("Reply sent successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: "New" | "In Progress" | "Resolved") => {
    updateConversationStatus(id, newStatus);
    setEditingStatusMsg(null);
    setToastMessage(`Status updated to ${newStatus}.`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleExport = () => {
    setToastMessage("Conversations exported to CSV.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Stats calculation
  const totalConversations = conversations.length + 442;
  const unreadCount = conversations.filter((m) => m.status === "New").length + 21;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold">Messages Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Read and reply to customer order inquiries and support tickets</p>
        </div>
      </div>

      {/* Metric Cards Grid - Matching Image Layout exactly (Solid colors, no gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Conversations */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-[#f3eafb] flex items-center justify-center shrink-0">
            <MessageSquare className="text-[#7a3dbf]" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Total Conversations</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalConversations}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+5% vs last month</span>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <Bell className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Unread Messages</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{unreadCount}</p>
            <span className="text-[10px] font-bold text-red-500 mt-0.5 block">+10% vs last month</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Clock className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Avg. Response Time</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">15 min</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">-3% vs last month</span>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Smile className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider">Customer Satisfaction</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">4.8 / 5</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+2% vs last month</span>
          </div>
        </div>

      </div>

      {/* Main Inbox Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Filter by customer name or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-between min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
              >
                <option value="All">All Conversations</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-slate-500">▼</div>
            </div>

            {/* Time Filter */}
            <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-between min-w-[150px]">
              <Calendar className="text-[#7a3dbf] mr-1.5 shrink-0" size={14} />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
              >
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 24 Hours">Last 24 Hours</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-slate-500">▼</div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="bg-[#faf6ff] hover:bg-slate-50 text-slate-700 border border-[#ebd7fa] rounded-xl px-4 py-2 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs shadow-sm active:scale-95"
            >
              <Download size={14} className="text-[#7a3dbf]" />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Action Panel (appears when checkboxes are active) */}
        {selectedIds.length > 0 && (
          <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4 flex items-center justify-between gap-4 animate-slideIn">
            <span className="text-xs font-bold text-[#7a3dbf]">
              {selectedIds.length} conversations selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkResolve}
                className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-xs px-4 py-1.5 rounded-xl transition-all"
              >
                Mark as Resolved
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-4 py-1.5 rounded-xl transition-all"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-bold text-xs px-4 py-1.5 rounded-xl transition-all"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
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
                filtered.map((msg) => {
                  const isChecked = selectedIds.includes(msg.id);
                  return (
                    <tr key={msg.id} className={cn("hover:bg-slate-50/50 transition-colors", isChecked && "bg-purple-50/20")}>
                      
                      {/* Checkbox cell */}
                      <td className="py-4 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(msg.id, e.target.checked)}
                          className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                        />
                      </td>

                      {/* Sender Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                            <Image
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-slate-800 font-bold leading-tight block">{msg.senderName}</span>
                        </div>
                      </td>

                      {/* Subject - Dynamic Routing Link to Detail Page */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/messages/${msg.id}`}
                          className="text-slate-800 font-bold hover:text-[#7a3dbf] text-left hover:underline"
                        >
                          {msg.subject}
                        </Link>
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-4 text-slate-500 font-medium max-w-[250px] truncate" title={msg.preview}>
                        {msg.preview}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-medium text-slate-500">{msg.receivedAt}</td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setEditingStatusMsg(msg)}
                          className={cn("px-3 py-1 rounded-full text-xs font-bold leading-none block hover:scale-105 transition-transform", STATUS_BADGE_STYLES[msg.status])}
                          title="Change status"
                        >
                          {msg.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingStatusMsg(msg)}
                            className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90"
                            title="Edit Status"
                          >
                            <Edit2 size={13} />
                          </button>
                          <Link
                            href={`/messages/${msg.id}`}
                            className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90 flex items-center justify-center"
                            title="View Chat Details Page"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="p-2 border border-slate-200 hover:border-red-500 rounded-lg text-slate-400 hover:text-red-500 transition-all bg-white shadow-sm active:scale-90"
                            title="Delete Conversation"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No conversations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length} to {filtered.length} of {conversations.length + 112} conversations
          </p>
          
          <div className="flex items-center gap-1 select-none">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#7a3dbf] text-white shadow-md">
              1
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              2
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              3
            </button>
            <span className="text-slate-400 px-1 font-bold">...</span>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              114
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* DRAWER: Chat Console Drawer */}
      {activeChat && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay background */}
          <div className="absolute inset-0 bg-black/35 transition-opacity" onClick={() => setActiveChatId(null)} />
          
          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-[#ebd7fa]">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full border border-slate-100 bg-slate-50 overflow-hidden">
                    <Image
                      src={activeChat.senderAvatar}
                      alt={activeChat.senderName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold leading-tight">{activeChat.senderName}</h3>
                    <p className="text-slate-400 text-xs font-semibold">{activeChat.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider", STATUS_BADGE_STYLES[activeChat.status])}>
                    {activeChat.status}
                  </span>
                  <button
                    onClick={() => setActiveChatId(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Message Logs (Scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {activeChat.chatHistory.map((item, index) => {
                  const isMerchant = item.sender === "merchant";
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm",
                        isMerchant
                          ? "bg-[#7a3dbf] text-white self-end ml-auto rounded-tr-none"
                          : "bg-white text-slate-800 border border-[#ebd7fa] self-start mr-auto rounded-tl-none"
                      )}
                    >
                      <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{item.text}</p>
                      <span
                        className={cn(
                          "text-[9px] font-bold mt-1.5 self-end block",
                          isMerchant ? "text-purple-200" : "text-slate-400"
                        )}
                      >
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Send Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send size={12} />
                  Reply
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Status Editor Popup */}
      {editingStatusMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setEditingStatusMsg(null)} />
          
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              onClick={() => setEditingStatusMsg(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold">Update Message Status</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a new conversation status for {editingStatusMsg.senderName}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {(["New", "In Progress", "Resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(editingStatusMsg.id, status)}
                  className={cn(
                    "w-full py-2.5 px-4 rounded-xl border font-bold text-sm text-left transition-all active:scale-95 flex items-center justify-between",
                    editingStatusMsg.status === status
                      ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-md"
                      : "bg-[#faf6ff] text-slate-700 border-[#ebd7fa] hover:bg-slate-50"
                  )}
                >
                  <span>{status}</span>
                  {editingStatusMsg.status === status && <span className="text-white text-xs font-black">✓</span>}
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingStatusMsg(null)}
                className="px-5 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
