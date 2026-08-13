"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { useAddresses, useCreateAddress } from "@/hooks/use-orders";
import type { AddressPayload } from "@/types/order";

const EMPTY: AddressPayload = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
  phone: "",
  isDefault: false,
};

export default function AccountAddressesPage() {
  const { data, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const addresses = data?.data ?? [];
  const [form, setForm] = useState<AddressPayload>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createAddress.mutateAsync(form);
      setForm(EMPTY);
      setShowForm(false);
    } catch {
      setError("Could not save address.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B1C5A]">Saved addresses</h1>
          <p className="text-sm text-[#8A79A5] mt-1">Use these at checkout for faster delivery.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
        >
          <Plus size={14} /> Add address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#EBD7FA] bg-white p-5 space-y-3">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {(
            [
              ["label", "Label"],
              ["street", "Street"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal code"],
              ["phone", "Phone"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="text-xs font-bold text-[#6D349F]">{label}</span>
              <input
                required={key !== "postalCode"}
                value={form[key] ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[#EBD7FA] px-3 py-2"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
            />
            Default address
          </label>
          <button type="submit" className="rounded-xl bg-[#7a3dbf] text-white font-bold px-4 py-2 text-sm">
            Save address
          </button>
        </form>
      )}

      {isLoading && <Loader2 className="animate-spin text-[#7a3dbf]" />}
      {!isLoading && addresses.length === 0 && (
        <p className="text-sm text-[#8A79A5]">No saved addresses yet.</p>
      )}
      <ul className="space-y-3">
        {addresses.map((addr) => (
          <li key={addr.id} className="rounded-2xl border border-[#EBD7FA] bg-white p-4 text-sm">
            <p className="font-bold text-[#3B1C5A]">{addr.label ?? "Address"}</p>
            <p className="text-[#5F6C72] mt-1">
              {[addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(", ")}
            </p>
            {addr.isDefault && (
              <span className="inline-block mt-2 text-[10px] font-black uppercase text-[#7a3dbf]">Default</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
