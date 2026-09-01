"use client";

import { useEffect, useState } from "react";

import { apiErrorMessage } from "@/lib/api";
import { useSellerStore, useUpdateSellerStore } from "@/hooks/use-dashboard";

export default function DashboardStorePage() {
  const { data } = useSellerStore();
  const updateStore = useUpdateSellerStore();
  const store = data?.data;

  const [form, setForm] = useState({
    storeName: "",
    description: "",
    location: "",
    headline: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!store) return;
    setForm({
      storeName: store.name,
      description: store.description || "",
      location: store.location || "",
      headline: store.headline || "",
    });
  }, [store]);

  async function handleSave() {
    try {
      await updateStore.mutateAsync({
        name: form.storeName,
        description: form.description,
        location: form.location,
        headline: form.headline,
      });
      setMessage("Store details saved.");
    } catch (error) {
      setMessage(apiErrorMessage(error, "Could not save store."));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-light text-foreground">Store Page</h1>

      <div className="rounded bg-card p-6 md:p-8">
        <h2 className="font-display mb-6 text-xl font-light text-foreground">Store Details</h2>
        <div className="space-y-5 max-w-lg">
          {[
            { field: "storeName", label: "Store Name" },
            { field: "location", label: "Location", placeholder: "Kano Municipal" },
            { field: "headline", label: "Headline", placeholder: "Same-day electronics" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                {label}
              </label>
              <input
                value={form[field as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
              Store Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full rounded border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>
          {message && <p className="text-xs font-semibold text-[#7a3dbf]">{message}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={updateStore.isPending}
            className="btn-gold px-8 py-3 disabled:opacity-60"
          >
            {updateStore.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
