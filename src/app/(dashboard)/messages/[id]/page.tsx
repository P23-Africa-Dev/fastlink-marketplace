"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Mail,
  MoreVertical,
  Edit,
  Send,
  ArrowLeft,
  X,
  FileText,
  ExternalLink
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/store/messages-store";

const STATUS_PILL_STYLES = {
  New: "bg-red-100 text-red-700 border-red-200",
  "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
  Resolved: "bg-green-100 text-green-700 border-green-200"
};

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  const { conversations, replyToConversation, updateConversationStatus } = useMessagesStore();
  const conversation = conversations.find((c) => c.id === params.id) || null;

  // Input states
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  
  // Interactive mock dialogs states
  const [activeModal, setActiveModal] = useState<"call" | "email" | "externalMsg" | "whatsapp" | "editSubject" | null>(null);
  
  // Custom states for dialogs
  const [subjectText, setSubjectText] = useState(conversation?.subject || "");
  const [customEmailSubject, setCustomEmailSubject] = useState("");
  const [customEmailBody, setCustomEmailBody] = useState("");
  const [customExternalMsg, setCustomExternalMsg] = useState("");

  if (!conversation) {
    return (
      <div className="bg-white rounded-[2rem] p-12 text-center max-w-lg mx-auto border border-[#ebd7fa] space-y-6 mt-12 font-sans shadow-sm">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <X size={32} />
        </div>
        <div>
          <h2 className="text-slate-800 text-xl font-bold">Conversation Not Found</h2>
          <p className="text-slate-400 text-sm mt-2">The message thread ID you are looking for does not exist or has been deleted.</p>
        </div>
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
        >
          <ArrowLeft size={16} />
          Back to Inbox
        </Link>
      </div>
    );
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    replyToConversation(conversation.id, replyText);
    setReplyText("");
    
    setToastMessage("Message sent successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleStatusChange = (newStatus: "New" | "In Progress" | "Resolved") => {
    updateConversationStatus(conversation.id, newStatus);
    setToastMessage(`Status updated to ${newStatus}`);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const triggerActionMessage = (message: string) => {
    setActiveModal(null);
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Row (Call, External Msg, Email, WhatsApp) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Call Button */}
        <button
          onClick={() => setActiveModal("call")}
          className="bg-white hover:bg-slate-50 border border-[#ebd7fa] rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-sm active:scale-95 text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#7a3dbf] block">Call</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{conversation.senderPhone}</span>
          </div>
        </button>

        {/* Message External Button */}
        <button
          onClick={() => setActiveModal("externalMsg")}
          className="bg-white hover:bg-slate-50 border border-[#ebd7fa] rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-sm active:scale-95 text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#7a3dbf] block">Message (external)</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Send SMS / Network</span>
          </div>
        </button>

        {/* Email Button */}
        <button
          onClick={() => setActiveModal("email")}
          className="bg-white hover:bg-slate-50 border border-[#ebd7fa] rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-sm active:scale-95 text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Mail size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#7a3dbf] block">Email</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{conversation.senderEmail}</span>
          </div>
        </button>

        {/* Active WhatsApp Button */}
        <button
          onClick={() => setActiveModal("whatsapp")}
          className="bg-white hover:bg-slate-50 border border-[#ebd7fa] rounded-2xl p-4 flex items-center justify-between gap-2.5 transition-all shadow-sm active:scale-95 text-left group"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {/* SVG representation of WhatsApp */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.07 1.01 11.5 1.012c-5.443 0-9.865 4.379-9.869 9.808-.001 1.776.49 3.51 1.42 5.048L1.998 21.3l5.65-1.478-.001-.004-.001-.001zm11.238-6.195c-.3-.15-1.774-.875-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-1.04-.519-1.81-1.002-2.53-2.226-.19-.327-.06-.51.05-.675.1-.15.225-.3.35-.45.125-.15.166-.25.25-.425.083-.175.041-.325-.02-.475-.06-.15-.675-1.625-.925-2.225-.244-.588-.493-.508-.675-.518-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275.975-1.05 3.1-.15 4.15-.9.05-1.725-1.05-2.675-2.125-1.637-1.85-2.875-3.325-3.475-4.45-.6-.975-.625-1.475-.425-1.675.2-.2.375-.45.525-.675.15-.225.2-.375.3-.625.1-.25.05-.475-.025-.625-.075-.15-.675-1.625-.925-2.225-.244-.588-.493-.508-.675-.518-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275.975-1.05 3.1-.15 4.15-.9.05-1.725-1.05-2.675-2.125-1.637-1.85-2.875-3.325-3.475-4.45-.6-.975-.625-1.475-.425-1.675z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-[#2e7d32] block">Active WhatsApp</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate">WhatsApp Web Sync</span>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-green-500 shrink-0 shadow shadow-green-500/50" />
        </button>

      </div>

      {/* Main Grid: Left Chat Panel, Right Customer Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Chat Inbox Console */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-[#ebd7fa] flex flex-col justify-between h-[650px] lg:col-span-2 overflow-hidden">
          
          {/* Console Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <h2 className="text-slate-800 text-lg font-bold truncate max-w-[85%]">{conversation.subject}</h2>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSubjectText(conversation.subject);
                  setActiveModal("editSubject");
                }}
                className="p-2 text-slate-400 hover:text-[#7a3dbf] rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                title="Edit Subject Title"
              >
                <Edit size={16} />
              </button>
              <button className="p-2 text-slate-400 hover:text-[#7a3dbf] rounded-lg hover:bg-slate-50 transition-all">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Chat Bubble Logs (Scrollable, Solid bubble colors, no gradients) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/50 select-none">
            
            <div className="text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Subject: {conversation.subject}
            </div>

            {conversation.chatHistory.map((chat, idx) => {
              const isMerchant = chat.sender === "merchant";
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 max-w-[85%]",
                    isMerchant ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative h-9 w-9 rounded-full border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                    <Image
                      src={isMerchant ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" : conversation.senderAvatar}
                      alt={isMerchant ? "Support Admin" : conversation.senderName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Message Bubble Body */}
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl p-4 shadow-sm text-xs font-semibold leading-relaxed",
                        isMerchant
                          ? "bg-[#7a3dbf] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-[#ebd7fa] rounded-tl-none"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{chat.text}</p>
                    </div>

                    <div className={cn("flex items-center gap-1.5 text-[9px] font-bold text-slate-400 px-1", isMerchant && "justify-end")}>
                      <span>{isMerchant ? "Support Admin" : conversation.senderName}</span>
                      <span>•</span>
                      <span>{chat.time}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Input reply form bar */}
          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <form onSubmit={handleSendReply} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type your message or select an action..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-4 pr-10 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all shadow-inner"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#7a3dbf] transition-all p-1 active:scale-90"
                  title="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
              
              <button
                type="submit"
                className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center shrink-0"
              >
                Send
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-3.5 text-center">
              <Link
                href="/messages"
                className="text-xs font-bold text-[#7a3dbf] hover:underline"
              >
                Return to Inbox
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Customer Context & associated tickets */}
        <div className="space-y-6">
          
          {/* Customer Context widget */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-5">
            <h3 className="text-slate-800 text-sm font-extrabold uppercase tracking-wider border-b border-slate-100 pb-3">
              Customer Context
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                <Image
                  src={conversation.senderAvatar}
                  alt={conversation.senderName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-slate-800 font-black text-base">{conversation.senderName}</h4>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Customer Shopper</span>
              </div>
            </div>

            <div className="space-y-3 bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-4">
              <h5 className="text-[10px] font-extrabold text-[#7a3dbf] uppercase tracking-wider">Contact info</h5>
              
              <div className="space-y-2 text-xs font-semibold">
                <p className="text-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Email</span>
                  <span className="text-slate-800 font-bold block">{conversation.senderEmail}</span>
                </p>

                <p className="text-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Phone</span>
                  <span className="text-slate-800 font-bold flex items-center gap-1">
                    {conversation.senderPhone}
                    {/* Tiny green WhatsApp logo indicator */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#2e7d32">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24z" />
                    </svg>
                  </span>
                </p>
                
                <button
                  onClick={() => triggerActionMessage("WhatsApp status sync successful. Chat log refreshed.")}
                  className="text-[#2e7d32] hover:underline text-[10px] font-bold block mt-1"
                >
                  WhatsApp Status
                </button>
              </div>
            </div>

            {/* Order contextual metadata block */}
            <div className="space-y-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText size={12} className="text-[#7a3dbf]" />
                <span>Contextual Purchase</span>
              </h5>

              <div className="text-xs font-semibold text-slate-600 space-y-1">
                <p className="text-slate-800 font-bold">
                  {conversation.orderInfo.id} | {conversation.orderInfo.date} | {conversation.orderInfo.amount}
                </p>
                <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                  Item: <span className="text-slate-700">{conversation.orderInfo.item}</span>
                </p>
              </div>
            </div>

          </div>

          {/* Associated Tickets / Status Changer */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
            <h3 className="text-slate-800 text-sm font-extrabold uppercase tracking-wider border-b border-slate-100 pb-3">
              Associated Tickets
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Message status</span>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold shadow-sm leading-none border", STATUS_PILL_STYLES[conversation.status])}>
                  {conversation.status}
                </span>
              </div>

              {/* Status Update Trigger select dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Set Ticket Status</label>
                <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs text-slate-800 shadow-inner flex items-center justify-between cursor-pointer">
                  <select
                    value={conversation.status}
                    onChange={(e) => handleStatusChange(e.target.value as "New" | "In Progress" | "Resolved")}
                    className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-bold appearance-none text-slate-700"
                  >
                    <option value="New">New Inquiry</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <div className="absolute right-3.5 pointer-events-none text-slate-500 text-[10px]">▼</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* POPUP MODAL: Call Simulator */}
      {activeModal === "call" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] text-center space-y-6">
            <div className="h-16 w-16 bg-[#f3eafb] text-[#7a3dbf] rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="text-slate-800 text-lg font-bold">Outgoing Call Simulator</h3>
              <p className="text-slate-400 text-sm mt-1">Dialing customer phone {conversation.senderPhone}...</p>
              <span className="text-[11px] font-bold text-green-500 mt-2 block bg-green-50 px-3 py-1 rounded-full border border-green-100 max-w-max mx-auto">Connected (Mock)</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => triggerActionMessage("Call disconnected.")}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs rounded-xl transition-all"
              >
                Disconnect Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: External Message Writer */}
      {activeModal === "externalMsg" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <MessageCircle className="text-[#7a3dbf]" size={18} />
                <span>Send SMS Message (External Gateway)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Send a cell network SMS to {conversation.senderPhone}</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Message content</label>
                <textarea
                  rows={4}
                  placeholder="Type SMS text..."
                  value={customExternalMsg}
                  onChange={(e) => setCustomExternalMsg(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => triggerActionMessage(`SMS successfully queued for dispatch to ${conversation.senderPhone}`)}
                  className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Send SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Email Dispatcher */}
      {activeModal === "email" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <Mail className="text-[#7a3dbf]" size={18} />
                <span>Send Direct Email Inquiries</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Send a message to customer&apos;s inbox: {conversation.senderEmail}</p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Action required on Order #1234..."
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Message Body</label>
                <textarea
                  rows={5}
                  placeholder="Type mail body..."
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => triggerActionMessage(`Email successfully dispatched to ${conversation.senderEmail}`)}
                  className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: WhatsApp Info */}
      {activeModal === "whatsapp" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] text-center space-y-5">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
            <div className="h-16 w-16 bg-[#e8f5e9] text-[#2e7d32] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.07 1.01 11.5 1.012c-5.443 0-9.865 4.379-9.869 9.808-.001 1.776.49 3.51 1.42 5.048L1.998 21.3l5.65-1.478-.001-.004-.001-.001zm11.238-6.195c-.3-.15-1.774-.875-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-1.04-.519-1.81-1.002-2.53-2.226-.19-.327-.06-.51.05-.675.1-.15.225-.3.35-.45.125-.15.166-.25.25-.425.083-.175.041-.325-.02-.475-.06-.15-.675-1.625-.925-2.225-.244-.588-.493-.508-.675-.518-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275.975-1.05 3.1-.15 4.15-.9.05-1.725-1.05-2.675-2.125-1.637-1.85-2.875-3.325-3.475-4.45-.6-.975-.625-1.475-.425-1.675z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-slate-800 text-lg font-bold">WhatsApp Integration Link</h3>
              <p className="text-slate-400 text-sm mt-1">This contact is fully synchronized. Click below to view external WhatsApp dashboard.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <a
                href={`https://wa.me/${conversation.senderPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-[#2e7d32] hover:bg-[#205722] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                Open Chat
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Subject Editor */}
      {activeModal === "editSubject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
            <div>
              <h3 className="text-slate-800 text-base font-bold">Edit Conversation Subject</h3>
              <p className="text-xs text-slate-400 mt-0.5">Update the subject line for ticket {conversation.id}</p>
            </div>
            <div className="space-y-4 pt-2">
              <input
                type="text"
                value={subjectText}
                onChange={(e) => setSubjectText(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/50 transition-all"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    useMessagesStore.setState((state) => ({
                      conversations: state.conversations.map((c) =>
                        c.id === conversation.id ? { ...c, subject: subjectText } : c
                      )
                    }));
                    triggerActionMessage("Conversation subject updated successfully.");
                  }}
                  className="px-5 py-2 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Save Subject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
