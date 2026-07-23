"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  Send,
  X,
  MessageSquare,
  Clock,
  User,
  Zap
} from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatMessage {
  sender: "merchant" | "engineer";
  timestamp: string;
  text: string;
}

interface SupportTicket {
  id: string;
  dateCreated: string;
  subject: string;
  category: "Billing" | "API Webhooks" | "Account" | "Inventory Sync";
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  chatHistory: ChatMessage[];
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "#TKT-4101",
    dateCreated: "May 27, 2026",
    subject: "Stripe payout webhook failures",
    category: "API Webhooks",
    priority: "High",
    status: "Open",
    chatHistory: [
      { sender: "merchant", timestamp: "5:30 PM", text: "Hello! We are seeing 500 server errors on webhook deliveries from Stripe to our endpoint `/api/webhook`." },
      { sender: "engineer", timestamp: "5:35 PM", text: "Hi there! I am examining the webhook payload logs. It looks like the signature verification is failing because of a mismatch in the signing secret. Let me check the config variables." }
    ]
  },
  {
    id: "#TKT-4102",
    dateCreated: "May 25, 2026",
    subject: "Update store billing credit card",
    category: "Billing",
    priority: "Medium",
    status: "In Progress",
    chatHistory: [
      { sender: "merchant", timestamp: "11:00 AM", text: "I need to link my company credit card to the store account but the input field throws a zip code error." },
      { sender: "engineer", timestamp: "11:15 AM", text: "Understood. The zip code validation has been refreshed. Can you try saving the credit card details in General Settings again? Let me know if the warning persists." }
    ]
  },
  {
    id: "#TKT-4103",
    dateCreated: "May 20, 2026",
    subject: "Bulk CSV importer timeout issues",
    category: "Inventory Sync",
    priority: "Low",
    status: "Resolved",
    chatHistory: [
      { sender: "merchant", timestamp: "9:00 AM", text: "CSV files with more than 500 items timeout when uploading products." },
      { sender: "engineer", timestamp: "10:30 AM", text: "We have increased the request payload execution time limits to 60 seconds on the server. Large product inventories will upload without timeouts now." },
      { sender: "merchant", timestamp: "10:45 AM", text: "Great, it works! Thanks." }
    ]
  }
];

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "In Progress" | "Resolved">("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

  const [activeModal, setActiveModal] = useState<"create" | "chat" | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket state
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<SupportTicket["category"]>("Billing");
  const [newPriority, setNewPriority] = useState<SupportTicket["priority"]>("Medium");
  const [newDescription, setNewDescription] = useState("");

  // Chat message input state
  const [inputMessage, setInputMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Chat drawer trigger
  const handleOpenChat = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setActiveModal("chat");
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const newTicket: SupportTicket = {
      id: `#TKT-${Math.floor(4000 + Math.random() * 1000)}`,
      dateCreated: "Today (Just now)",
      subject: newSubject,
      category: newCategory,
      priority: newPriority,
      status: "Open",
      chatHistory: [
        {
          sender: "merchant",
          timestamp: "Just now",
          text: newDescription
        },
        {
          sender: "engineer",
          timestamp: "Just now",
          text: "Hi! Thanks for filing a ticket. A support engineer will review your inquiry shortly. Feel free to add any details here."
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setActiveModal(null);
    setNewSubject("");
    setNewDescription("");
    triggerToast("Support ticket successfully filed!");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !inputMessage.trim()) return;

    const updatedMessage: ChatMessage = {
      sender: "merchant",
      timestamp: "Just now",
      text: inputMessage
    };

    // Update specific ticket history
    const updatedHistory = [...selectedTicket.chatHistory, updatedMessage];
    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id ? { ...t, chatHistory: updatedHistory } : t
      )
    );

    // Update active modal reference
    setSelectedTicket(prev => prev ? { ...prev, chatHistory: updatedHistory } : null);
    const sentText = inputMessage;
    setInputMessage("");

    // Simulate tech engineer automated support response after 1.5 seconds
    setTimeout(() => {
      let responseText = "Got your update. Our system operations unit has logged this and we are verifying immediately.";
      if (sentText.toLowerCase().includes("stripe") || sentText.toLowerCase().includes("webhook")) {
        responseText = "I've checked the Stripe webhook endpoints. We detected that the webhook secret variable `STRIPE_WEBHOOK_SECRET` was updated on the Stripe dashboard but not in the environment variables. Updating that should fix the signatures immediately.";
      } else if (sentText.toLowerCase().includes("billing") || sentText.toLowerCase().includes("card")) {
        responseText = "We've bypass-approved the card validation check in the mock gateway. Please try saving now; it should save successfully.";
      }

      const engineerResponse: ChatMessage = {
        sender: "engineer",
        timestamp: "Just now",
        text: responseText
      };

      setTickets(prev =>
        prev.map(t =>
          t.id === selectedTicket.id
            ? { ...t, chatHistory: [...t.chatHistory, engineerResponse] }
            : t
        )
      );

      setSelectedTicket(prev =>
        prev ? { ...prev, chatHistory: [...prev.chatHistory, engineerResponse] } : null
      );
    }, 1500);
  };

  const handleResolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: "Resolved" } : t))
    );
    triggerToast(`Ticket ${id} marked as resolved.`);
  };

  const handleReopenTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: "Open" } : t))
    );
    triggerToast(`Ticket ${id} reopened.`);
  };

  // Filter logic
  const filtered = tickets.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Telemetry Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Support score */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Zap className="text-[#7a3dbf]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CSAT Rating</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              4.9 / 5.0
            </span>
            <span className="text-[10px] font-bold text-slate-450 block mt-0.5">98% positive satisfaction</span>
          </div>
        </div>

        {/* Open tickets */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e3f2fd] flex items-center justify-center shrink-0">
            <MessageSquare className="text-[#1565c0]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Tickets</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              {tickets.filter(t => t.status !== "Resolved").length}
            </span>
            <span className="text-[10px] font-bold text-blue-500 block mt-0.5">Assigned to tech engineers</span>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <Clock className="text-[#2e7d32]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg. Resolution Time</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              2h 15m
            </span>
            <span className="text-[10px] font-bold text-green-500 block mt-0.5">SLA response time is &lt; 30m</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <CheckCircle className="text-[#e65100]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SLA Compliance</span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 block">
              99.4%
            </span>
            <span className="text-[10px] font-bold text-slate-455 block mt-0.5">Target score is &gt;99%</span>
          </div>
        </div>

      </div>

      {/* Tickets Center Panel */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
            <h2 className="text-[#7a3dbf] text-xl font-bold">Support Inquiries & Tickets</h2>
            
            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All" | "Open" | "In Progress" | "Resolved")}
                className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as "All" | "High" | "Medium" | "Low")}
                className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search by ID or Subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-inner"
              />
            </div>

            {/* Create new ticket */}
            <button
              onClick={() => setActiveModal("create")}
              className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-center"
            >
              <PlusCircle size={15} />
              <span>Create New Ticket</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Ticket ID */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleOpenChat(t)}
                        className="text-[#7a3dbf] font-bold underline hover:text-[#682fad] text-xs"
                      >
                        {t.id}
                      </button>
                    </td>

                    {/* Date Created */}
                    <td className="py-4 px-4 font-medium text-slate-500">{t.dateCreated}</td>

                    {/* Subject */}
                    <td className="py-4 px-4 font-bold text-slate-800">{t.subject}</td>

                    {/* Category */}
                    <td className="py-4 px-4 font-semibold text-slate-500">{t.category}</td>

                    {/* Priority badge */}
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        t.priority === "High" && "bg-red-50 text-red-700 border-red-200",
                        t.priority === "Medium" && "bg-yellow-50 text-yellow-700 border-yellow-200",
                        t.priority === "Low" && "bg-slate-50 text-slate-600 border-slate-200"
                      )}>
                        {t.priority}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        t.status === "Open" && "bg-blue-50 text-blue-700 border-blue-200",
                        t.status === "In Progress" && "bg-orange-50 text-orange-700 border-orange-200",
                        t.status === "Resolved" && "bg-green-50 text-green-700 border-green-200"
                      )}>
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleOpenChat(t)}
                          className="flex items-center gap-1 text-[#7a3dbf] hover:text-[#682fad] text-xs font-bold active:scale-95 transition-all"
                        >
                          <MessageSquare size={13} />
                          <span>Chat</span>
                        </button>

                        {t.status !== "Resolved" ? (
                          <button
                            onClick={() => handleResolveTicket(t.id)}
                            className="text-slate-400 hover:text-green-600 text-xs font-bold active:scale-95 transition-all"
                          >
                            Resolve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopenTicket(t.id)}
                            className="text-slate-400 hover:text-blue-600 text-xs font-bold active:scale-95 transition-all"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No support tickets match the filtered criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Support Ticket */}
      {activeModal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <form onSubmit={handleCreateTicketSubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button type="button" onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <HelpCircle className="text-[#7a3dbf]" size={20} />
                <span>Create Support Ticket</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Submit an issue directly to our developer team.</p>
            </div>

            <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Issue Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe webhook verification failing"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SupportTicket["category"])}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Billing">Billing</option>
                    <option value="API Webhooks">API Webhooks</option>
                    <option value="Account">Account</option>
                    <option value="Inventory Sync">Inventory Sync</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as SupportTicket["priority"])}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Description of Issue</label>
                <textarea
                  rows={4}
                  placeholder="Explain the error in detail. Include any steps or logs to replicate the problem."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Interactive Dialogue Chat Console */}
      {activeModal === "chat" && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => {
            setActiveModal(null);
            setSelectedTicket(null);
          }} />
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 border border-[#ebd7fa] overflow-hidden flex flex-col h-[520px]">
            
            {/* Header info */}
            <div className="bg-[#7a3dbf] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-purple-200">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold block leading-tight">{selectedTicket.subject}</span>
                  <span className="text-[10px] text-purple-200 font-semibold block mt-0.5">
                    Ticket ID: {selectedTicket.id} | Priority: <strong>{selectedTicket.priority}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedTicket(null);
                }}
                className="text-white hover:text-purple-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Support Message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {selectedTicket.chatHistory.map((msg, i) => {
                const isMerchant = msg.sender === "merchant";
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col space-y-1 max-w-[80%]",
                      isMerchant ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-xs font-semibold leading-normal shadow-sm",
                      isMerchant
                        ? "bg-[#7a3dbf] text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
            </div>

            {/* Input field footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask your support engineer a question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                required
              />
              <button
                type="submit"
                className="bg-[#7a3dbf] hover:bg-[#682fad] text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
