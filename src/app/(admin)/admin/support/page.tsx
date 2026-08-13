"use client";

import { useState } from "react";
import { Loader2, Send, X } from "lucide-react";

import { useAdminTicket, useAdminTicketActions, useAdminTickets } from "@/hooks/use-admin";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminSupportPage() {
  const { data, isLoading } = useAdminTickets();
  const tickets = data?.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const ticketQuery = useAdminTicket(selectedId);
  const ticket = ticketQuery.data?.data;
  const actions = useAdminTicketActions();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Support queue</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                  <th className="p-4">Subject</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className={cn("border-b border-slate-50 cursor-pointer", selectedId === t.id && "bg-[#faf6ff]")}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <td className="p-4 font-bold">{t.subject}</td>
                    <td className="p-4 text-xs">{t.store?.name ?? t.user?.email}</td>
                    <td className="p-4 text-xs font-bold uppercase">{t.displayPriority}</td>
                    <td className="p-4 text-xs font-black uppercase">{t.displayStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-[#e3d4f0] p-5 min-h-[420px] flex flex-col">
          {!selectedId && <p className="m-auto text-sm text-slate-400">Select a ticket</p>}
          {selectedId && ticket && (
            <>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-black text-[#14081c]">{ticket.subject}</p>
                  <p className="text-xs text-slate-400">{ticket.user?.email}</p>
                </div>
                <button onClick={() => setSelectedId(null)}><X size={16} className="text-slate-400" /></button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto mb-3">
                {ticket.messages.map((m) => (
                  <div key={m.id} className={cn("rounded-xl p-3 text-xs", m.fromStaff ? "bg-[#14081c] text-white ml-6" : "bg-[#faf6ff] border border-[#e3d4f0] mr-6")}>
                    <p className="font-semibold whitespace-pre-wrap">{m.body}</p>
                    <span className="block mt-1 text-[9px] opacity-70">{formatOrderDate(m.createdAt)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => actions.update.mutate({ id: ticket.id, status: "in_progress" })} className="text-[10px] font-black uppercase rounded-lg border px-3 py-1">In progress</button>
                <button onClick={() => actions.update.mutate({ id: ticket.id, status: "resolved" })} className="text-[10px] font-black uppercase rounded-lg border px-3 py-1">Resolve</button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await actions.reply.mutateAsync({ id: ticket.id, body });
                    setBody("");
                  } catch (err) {
                    alert(apiErrorMessage(err, "Could not reply."));
                  }
                }}
                className="flex gap-2"
              >
                <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply as admin…" className="flex-1 rounded-xl border border-[#e3d4f0] px-3 py-2 text-sm" required />
                <button type="submit" className="rounded-xl bg-[#14081c] text-white px-3"><Send size={14} /></button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
