"use client";

import { useState } from "react";

import { MOCK_SELLER } from "@/mocks/data";

export default function DashboardStorePage() {
  const [form, setForm] = useState({
    storeName: MOCK_SELLER.storeName,
    description: MOCK_SELLER.description,
    instagram: "",
    website: "",
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-light text-foreground">Store Page</h1>

      <div className="rounded bg-card p-6 md:p-8">
        <h2 className="font-display mb-6 text-xl font-light text-foreground">Store Details</h2>
        <div className="space-y-5 max-w-lg">
          {[
            { field: "storeName", label: "Store Name" },
            { field: "instagram", label: "Instagram Handle", placeholder: "@yourstudio" },
            { field: "website", label: "Website URL", placeholder: "https://yourstudio.com" },
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
          <button className="btn-gold px-8 py-3">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
