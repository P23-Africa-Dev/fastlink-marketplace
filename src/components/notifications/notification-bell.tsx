"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { formatOrderDate } from "@/lib/order-map";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative flex items-center gap-2"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell
          size={24}
          className="stroke-[#F59E0B] stroke-[2.2] transition-transform group-hover:scale-110"
        />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="hidden text-sm font-bold text-white md:inline">Alerts</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-3 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-[#E9E0F2] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#F0E8F8] px-4 py-3">
            <p className="text-sm font-extrabold text-[#3B1C5A]">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                className="text-[11px] font-bold text-[#7a3dbf] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-8 text-center text-xs text-[#8A79A5]">Loading…</p>
            )}
            {!isLoading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-[#8A79A5]">No notifications yet.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.readAt) markRead.mutate(n.id);
                }}
                className={cn(
                  "block w-full border-b border-[#F5F1FA] px-4 py-3 text-left transition-colors hover:bg-[#FAF8FC]",
                  !n.readAt && "bg-[#FDF9FF]",
                )}
              >
                <p className="text-xs font-bold text-[#3B1C5A]">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6E627C] line-clamp-2">{n.body}</p>
                <span className="mt-1 block text-[10px] text-[#8A79A5]">
                  {formatOrderDate(n.createdAt)}
                </span>
              </button>
            ))}
          </div>

          <Link
            href="/account/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#F0E8F8] px-4 py-3 text-center text-xs font-bold text-[#7a3dbf] hover:bg-[#FAF8FC]"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
