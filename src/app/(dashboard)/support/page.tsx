"use client";

import { useState } from "react";
import {
  Search,
  HelpCircle,
  PlusCircle,
  Send,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import {
  useCreateTicket,
  useReplyTicket,
  useSellerTicket,
  useSellerTickets,
} from "@/hooks/use-inbox";

const CATEGORIES = ["Billing", "Account", "Inventory Sync", "Payouts", "Other"];
const PRIORITIES = ["High", "Medium", "Low"] as const;

export default function SupportPage() {
  const { data, isLoading, isError } = useSellerTickets();
  const createTicket = useCreateTicket();
  const replyTicket = useReplyTicket();
  const tickets = data?.data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [activeModal, setActiveModal] = useState<"create" | "chat" | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ticketQuery = useSellerTicket(activeModal === "chat" ? selectedId : null);
  const selectedTicket = ticketQuery.data?.data;

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("Billing");
  const [newPriority, setNewPriority] = useState<(typeof PRIORITIES)[number]>("Medium");
  const [newDescription, setNewDescription] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  function toast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  const filtered = tickets.filter((t) => {
    const matchesSearch = `${t.id} ${t.subject}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.displayStatus === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.displayPriority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  async function handleCreateTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        body: newDescription,
      });
      setActiveModal(null);
      setNewSubject("");
      setNewDescription("");
      toast("Support ticket successfully filed!");
    } catch (err) {
      toast(apiErrorMessage(err, "Could not create ticket."));
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !inputMessage.trim()) return;
    try {
      await replyTicket.mutateAsync({ id: selectedId, body: inputMessage });
      setInputMessage("");
    } catch (err) {
      toast(apiErrorMessage(err, "Could not send message."));
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2">
          <Send size={16} />
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center">
            <HelpCircle className="text-[#7a3dbf]" size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open tickets</span>
            <span className="text-2xl font-extrabold text-slate-800">{tickets.filter((t) => t.status !== "resolved").length}</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <MessageSquare className="text-[#2e7d32]" size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total tickets</span>
            <span className="text-2xl font-extrabold text-slate-800">{tickets.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[#7a3dbf] text-xl font-bold mr-2">Support Inquiries & Tickets</h2>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-1.5 text-xs font-bold">
              <option value="All">All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-1.5 text-xs font-bold">
              <option value="All">All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by subject..." className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2 text-sm" />
            </div>
            <button onClick={() => setActiveModal("create")} className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
              <PlusCircle size={15} /> Create New Ticket
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : isError ? (
          <p className="py-12 text-center text-rose-600">Could not load tickets.</p>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm font-semibold">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="py-4 px-4 text-[#7a3dbf] font-bold">#{t.id}</td>
                  <td className="py-4 px-4 text-slate-500">{formatOrderDate(t.createdAt)}</td>
                  <td className="py-4 px-4 font-bold">{t.subject}</td>
                  <td className="py-4 px-4 text-slate-500">{t.category}</td>
                  <td className="py-4 px-4">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", t.displayPriority === "High" ? "bg-red-50 text-red-700 border-red-200" : t.displayPriority === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-slate-50 text-slate-600 border-slate-200")}>
                      {t.displayPriority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", t.displayStatus === "Open" ? "bg-blue-50 text-blue-700 border-blue-200" : t.displayStatus === "Resolved" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200")}>
                      {t.displayStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => {
                        setSelectedId(t.id);
                        setActiveModal("chat");
                      }}
                      className="text-[#7a3dbf] text-xs font-bold"
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No support tickets yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {activeModal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateTicketSubmit} className="relative z-10 bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 border border-[#ebd7fa]">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400"><X size={18} /></button>
            <h3 className="font-bold text-slate-800">Create support ticket</h3>
            <input required value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject" className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as (typeof PRIORITIES)[number])} className="rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-3 py-2 text-sm">
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <textarea required rows={4} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Describe the issue" className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2.5 text-sm" />
            <button type="submit" disabled={createTicket.isPending} className="w-full rounded-xl bg-[#7a3dbf] text-white font-bold py-2.5 text-sm disabled:opacity-70">
              {createTicket.isPending ? "Filing…" : "Submit ticket"}
            </button>
          </form>
        </div>
      )}

      {activeModal === "chat" && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/35" onClick={() => setActiveModal(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#ebd7fa]">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{selectedTicket?.subject ?? "Ticket"}</h3>
                <p className="text-xs text-slate-400">{selectedTicket?.displayStatus}</p>
              </div>
              <button onClick={() => setActiveModal(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
              {ticketQuery.isLoading && <Loader2 className="animate-spin text-[#7a3dbf] mx-auto mt-10" />}
              {selectedTicket?.messages.map((m) => (
                <div key={m.id} className={cn("max-w-[85%] rounded-2xl p-3 text-xs", m.fromStaff ? "bg-white border border-[#ebd7fa] mr-auto" : "bg-[#7a3dbf] text-white ml-auto")}>
                  <p className="font-semibold whitespace-pre-wrap">{m.body}</p>
                  <span className={cn("block mt-1 text-[9px]", m.fromStaff ? "text-slate-400" : "text-purple-200")}>{formatOrderDate(m.createdAt)}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Add an update…" className="flex-1 rounded-xl border border-[#ebd7fa] bg-[#faf6ff] px-4 py-2 text-xs" required />
              <button type="submit" disabled={replyTicket.isPending} className="bg-[#7a3dbf] text-white rounded-xl px-4 text-xs font-bold">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
