"use client";

import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";

import { formatOrderDate } from "@/lib/order-map";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";

export default function AccountNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
              <Bell size={22} className="text-[#7a3dbf]" />
              Notifications
            </h1>
            <p className="text-sm text-[#8A79A5] mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-bold text-[#7a3dbf] hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <Link href="/account/orders" className="text-xs font-bold text-[#6D349F] hover:underline">
          ← Back to account
        </Link>

        <div className="rounded-2xl border border-[#EBD7FA] bg-white divide-y divide-[#F5F1FA]">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#7a3dbf]" />
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <p className="py-12 text-center text-sm text-[#8A79A5]">No notifications yet.</p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (!n.readAt) markRead.mutate(n.id);
              }}
              className={cn(
                "block w-full px-5 py-4 text-left hover:bg-[#FAF8FC] transition-colors",
                !n.readAt && "bg-[#FDF9FF]",
              )}
            >
              <p className="text-sm font-bold text-[#3B1C5A]">{n.title}</p>
              <p className="mt-1 text-sm text-[#6E627C]">{n.body}</p>
              <span className="mt-2 block text-xs text-[#8A79A5]">{formatOrderDate(n.createdAt)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
