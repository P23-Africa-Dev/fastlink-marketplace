"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Flag,
  MessageSquare,
  Star,
  X,
  Send,
  Trash2,
  AlertTriangle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { useReplyToReview, useSellerReviews, useUpdateReviewStatus } from "@/hooks/use-dashboard";
import type { ProductReview } from "@/types/seller";

interface ReviewReply {
  author: string;
  date: string;
  comment: string;
}

interface ReviewRecord {
  id: string;
  reviewerName: string;
  avatarSeed: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  status: "Approved" | "Pending" | "Flagged";
  reply?: ReviewReply;
}

function toReviewRecord(review: ProductReview): ReviewRecord {
  return {
    id: review.id,
    reviewerName: review.buyer.name,
    avatarSeed: review.buyer.name,
    productName: review.productName || "Product",
    rating: review.rating,
    date: formatOrderDate(review.createdAt),
    comment: review.body || "",
    status: (review.displayStatus as ReviewRecord["status"]) || "Approved",
    reply: review.reply
      ? {
          author: "Store",
          date: formatOrderDate(review.reply.createdAt),
          comment: review.reply.body,
        }
      : undefined,
  };
}

export default function ReviewsPage() {
  const { data: reviewPage } = useSellerReviews();
  const replyMutation = useReplyToReview();
  const statusMutation = useUpdateReviewStatus();
  const reviews = (reviewPage?.data ?? []).map(toReviewRecord);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "flagged">("all");
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [selectedReviewForReply, setSelectedReviewForReply] = useState<ReviewRecord | null>(null);
  const [replyText, setReplyText] = useState("");

  const [selectedReviewForFlag, setSelectedReviewForFlag] = useState<ReviewRecord | null>(null);
  const [flagReason, setFlagReason] = useState("Spam");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForReply || !replyText.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: selectedReviewForReply.id, body: replyText });
      setSelectedReviewForReply(null);
      setReplyText("");
      triggerToast("Reply posted successfully!");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not post reply."));
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForFlag) return;
    try {
      await statusMutation.mutateAsync({ id: selectedReviewForFlag.id, status: "flagged" });
      setSelectedReviewForFlag(null);
      triggerToast("Review flagged for moderator review.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not flag review."));
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await statusMutation.mutateAsync({ id, status: "hidden" });
      triggerToast("Review hidden from the public listing.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not hide review."));
    }
  };

  // Filter reviews
  const filtered = reviews.filter(rev => {
    // Search
    const matchesSearch =
      rev.reviewerName.toLowerCase().includes(search.toLowerCase()) ||
      rev.productName.toLowerCase().includes(search.toLowerCase()) ||
      rev.comment.toLowerCase().includes(search.toLowerCase());

    // Tab Filter
    if (activeTab === "pending") return matchesSearch && rev.status === "Pending";
    if (activeTab === "flagged") return matchesSearch && rev.status === "Flagged";
    return matchesSearch;
  });

  // Telemetry Calculations
  const totalCount = reviews.length;
  const averageRating = totalCount > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) : "0.0";
  
  const ratingCounts = [1, 2, 3, 4, 5].reduce((acc, r) => {
    acc[r] = reviews.filter(rev => rev.rating === r).length;
    return acc;
  }, {} as Record<number, number>);

  const positivePercent = Math.round(
    (reviews.filter(rev => rev.rating >= 4).length / (totalCount || 1)) * 100
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Send size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Layout Grid: Rating breakdown & sentiment telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Average score card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Rating Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-slate-800 tracking-tight">{averageRating}</span>
            <span className="text-slate-400 font-bold">/ 5.0</span>
          </div>
          
          <div className="flex gap-1 text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Based on <strong className="text-slate-600">{totalCount * 12} store purchases</strong>
          </span>
        </div>

        {/* Breakdown bar card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-3 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rating distribution</span>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const percent = Math.round((count / (totalCount || 1)) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="w-12 shrink-0">{stars} Stars</span>
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#7a3dbf] h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-right shrink-0">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment score card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Net Customer Sentiment</span>
          
          <div className="relative h-24 w-24 flex items-center justify-center">
            {/* Visual Circular solid representation */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#7a3dbf]"
                strokeWidth="3.5"
                strokeDasharray={`${positivePercent}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="text-xl font-extrabold text-slate-800">{positivePercent}%</span>
          </div>

          <span className="text-xs font-bold text-green-500 block">Highly Positive Feedback</span>
        </div>

      </div>

      {/* Bottom Section: Reviews Console */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Controls: Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 border-b border-transparent">
            {[
              { id: "all", label: "All Reviews" },
              { id: "pending", label: "Pending Action" },
              { id: "flagged", label: "Flagged" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "all" | "pending" | "flagged")}
                className={cn(
                  "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all",
                  activeTab === tab.id
                    ? "bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Reviews List layout */}
        <div className="space-y-6">
          {filtered.length > 0 ? (
            filtered.map((rev) => (
              <div
                key={rev.id}
                className="border border-[#ebd7fa] rounded-2xl p-5 bg-[#faf6ff] hover:shadow-sm transition-all space-y-4"
              >
                {/* Header: Reviewer info, date, product, status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.avatarSeed}`}
                        alt={rev.reviewerName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">{rev.reviewerName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Product: <strong className="text-slate-600">{rev.productName}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    {/* Stars */}
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-slate-400">{rev.date}</span>

                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                      rev.status === "Approved" && "bg-green-50 text-green-700 border-green-200",
                      rev.status === "Pending" && "bg-blue-50 text-blue-700 border-blue-200",
                      rev.status === "Flagged" && "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {rev.status}
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed font-sans">
                  &ldquo;{rev.comment}&rdquo;
                </p>

                {/* Inline replies */}
                {rev.reply && (
                  <div className="pl-4 border-l-2 border-[#7a3dbf] bg-white rounded-r-xl p-3.5 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7a3dbf]">{rev.reply.author}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rev.reply.date}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-normal">
                      {rev.reply.comment}
                    </p>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-100/50">
                  {!rev.reply && (
                    <button
                      onClick={() => setSelectedReviewForReply(rev)}
                      className="flex items-center gap-1 text-[#7a3dbf] hover:text-[#682fad] font-bold text-xs transition-colors active:scale-95"
                    >
                      <MessageSquare size={13} />
                      <span>Reply</span>
                    </button>
                  )}

                  {rev.status !== "Flagged" && (
                    <button
                      onClick={() => setSelectedReviewForFlag(rev)}
                      className="flex items-center gap-1 text-slate-400 hover:text-red-500 font-bold text-xs transition-colors active:scale-95"
                    >
                      <Flag size={12} />
                      <span>Flag Review</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="flex items-center gap-1 text-slate-400 hover:text-red-600 font-bold text-xs transition-colors active:scale-95"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 font-medium">
              No customer reviews match your active filter.
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Reply Composer */}
      {selectedReviewForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedReviewForReply(null)} />
          <form onSubmit={handleReplySubmit} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              type="button"
              onClick={() => setSelectedReviewForReply(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-lg font-bold flex items-center gap-1.5">
                <MessageSquare className="text-[#7a3dbf]" size={20} />
                <span>Write Store Reply</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Respond to review left by {selectedReviewForReply.reviewerName}.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 font-semibold leading-relaxed max-h-[100px] overflow-y-auto">
              &ldquo;{selectedReviewForReply.comment}&rdquo;
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your response text</label>
              <textarea
                rows={4}
                placeholder="Thank you for your feedback! We are constantly working to improve..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedReviewForReply(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Post Reply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Flag Review */}
      {selectedReviewForFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setSelectedReviewForFlag(null)} />
          <form onSubmit={handleFlagSubmit} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 border border-[#ebd7fa] space-y-4">
            <button
              type="button"
              onClick={() => setSelectedReviewForFlag(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-slate-800 text-base font-bold flex items-center gap-1.5">
                <AlertTriangle className="text-red-500" size={18} />
                <span>Flag Review for Abuse</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Report review left by {selectedReviewForFlag.reviewerName}.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reason for Flagging</label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="Spam">Spam or promotional links</option>
                  <option value="Hate Speech">Harassment or abusive language</option>
                  <option value="Irrelevant">Irrelevant (not about the product)</option>
                  <option value="Fake">Suspected fake or competitor review</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReviewForFlag(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
