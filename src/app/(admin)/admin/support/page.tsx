"use client";

import { useState } from "react";
import { Loader2, Send, X, HelpCircle, MessageSquare, CheckCircle2, Clock, User, Store, ShieldCheck } from "lucide-react";

import { useAdminTicket, useAdminTicketActions, useAdminTickets } from "@/hooks/use-admin";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminSupportPage() {
  const { data, isLoading, isError } = useAdminTickets();
  const tickets = data?.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const ticketQuery = useAdminTicket(selectedId);
  const ticket = ticketQuery.data?.data;
  const actions = useAdminTicketActions();

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Helpdesk & Inquiries
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Support Tickets & Inquiries</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Resolve merchant inquiries, buyer escalation threads, and support dispatch issues.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <HelpCircle size={18} />
          <span>{openTickets.length} Open Inquiries</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Open Support Threads"
          value={openTickets.length}
          icon={<Clock size={20} />}
          variant={openTickets.length > 0 ? "amber" : "emerald"}
          badgeText={openTickets.length > 0 ? "Pending Response" : "Clear"}
          badgeType={openTickets.length > 0 ? "warning" : "success"}
          subtitle="Tickets awaiting staff reply"
        />

        <StatCard
          title="Total Inquiries Logged"
          value={tickets.length}
          icon={<MessageSquare size={20} />}
          variant="purple"
          badgeText="All Tickets"
          badgeType="neutral"
          subtitle="All user support interactions"
        />

        <StatCard
          title="Resolved Tickets"
          value={tickets.filter((t) => t.status === "resolved").length}
          icon={<CheckCircle2 size={20} />}
          variant="emerald"
          badgeText="Closed"
          badgeType="success"
          subtitle="Successfully assisted"
        />
      </div>

      {/* ── Master-Detail Inbox View ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Ticket List Table */}
        <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-3">
          <div className="border-b border-[#ebd7fa]/60 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Ticket Inquiries Queue</h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
              <p className="text-xs font-bold text-slate-400">Loading support queue...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-rose-600 font-semibold text-sm">
              Failed to retrieve support tickets.
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle size={40} className="mx-auto text-[#ebd7fa] mb-2" />
              <p className="text-sm font-bold text-slate-700">Support inbox is empty</p>
              <p className="text-xs text-slate-400 mt-1">No active support tickets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Subject & User</th>
                    <th className="px-4 py-3.5">Store Outlet</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedId === t.id ? "bg-[#f3eafb]/70 font-semibold" : "hover:bg-[#faf6ff]/70"
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{t.subject}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.user?.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        {t.store?.name ?? "Individual Account"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase",
                            t.priority === "high" || t.priority === "urgent"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {t.displayPriority ?? t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            t.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : t.status === "in_progress"
                              ? "bg-purple-50 text-[#7a3dbf] border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {t.displayStatus ?? t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Conversation Thread Drawer */}
        <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 min-h-[460px] flex flex-col shadow-sm">
          {!selectedId ? (
            <div className="m-auto text-center py-12">
              <MessageSquare size={36} className="mx-auto text-[#ebd7fa] mb-2" />
              <p className="text-xs font-bold text-slate-400">Select a ticket from the left to view conversation thread.</p>
            </div>
          ) : ticketQuery.isLoading ? (
            <div className="m-auto flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-[#7a3dbf]" size={24} />
              <p className="text-xs font-bold text-slate-400">Loading conversation...</p>
            </div>
          ) : ticket ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-[#ebd7fa]">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{ticket.subject}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{ticket.user?.email}</p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Controls */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => actions.update.mutate({ id: ticket.id, status: "in_progress" })}
                  className="px-2.5 py-1 bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] rounded-lg text-xs font-bold transition"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => actions.update.mutate({ id: ticket.id, status: "resolved" })}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition"
                >
                  Mark Resolved
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto mb-4 max-h-[300px] pr-1">
                {ticket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl p-3.5 text-xs",
                      m.fromStaff
                        ? "bg-[#7a3dbf] text-white ml-8 shadow-sm"
                        : "bg-[#faf6ff] border border-[#ebd7fa] mr-8 text-slate-800"
                    )}
                  >
                    <p className="whitespace-pre-wrap font-medium leading-relaxed">{m.body}</p>
                    <span
                      className={cn(
                        "block mt-1 text-[10px] font-semibold",
                        m.fromStaff ? "text-purple-200" : "text-slate-400"
                      )}
                    >
                      {m.fromStaff ? "Admin Staff" : "User"} · {formatOrderDate(m.createdAt)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!body.trim()) return;
                  try {
                    await actions.reply.mutateAsync({ id: ticket.id, body: body.trim() });
                    setBody("");
                  } catch (err) {
                    alert(apiErrorMessage(err, "Could not post reply."));
                  }
                }}
                className="flex gap-2 pt-2 border-t border-slate-100"
              >
                <input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type response as Admin staff..."
                  className="flex-1 bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
                  required
                />
                <button
                  type="submit"
                  disabled={actions.reply.isPending}
                  className="px-3.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-50"
                >
                  {actions.reply.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
