"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { trustApi, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function ReportListingButton({
  subjectType,
  subjectId,
  label = "Report listing",
}: {
  subjectType: "product" | "store";
  subjectId: string;
  label?: string;
}) {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isAuthenticated) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await trustApi.report({
        subject_type: subjectType,
        subject_id: Number(subjectId),
        reason: reason.trim(),
        details: details.trim() || undefined,
      });
      setMessage("Report submitted. Our team will review it.");
      setReason("");
      setDetails("");
      setTimeout(() => setOpen(false), 2000);
    } catch (err) {
      setMessage(apiErrorMessage(err, "Could not submit report."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A79A5] hover:text-rose-600"
      >
        <Flag size={14} />
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <form
            onSubmit={submit}
            className="relative bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl"
          >
            <h3 className="font-bold text-[#3B1C5A]">Report this listing</h3>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (e.g. counterfeit, misleading)"
              className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
            />
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
            />
            {message && <p className="text-sm text-[#6D349F]">{message}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="text-xs font-bold text-[#8A79A5]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#7a3dbf] text-white text-xs font-bold px-4 py-2"
              >
                Submit report
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
