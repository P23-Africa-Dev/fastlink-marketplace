"use client";

import { NotificationsInbox } from "@/components/notifications/notifications-inbox";

export default function AdminNotificationsPage() {
  return (
    <NotificationsInbox
      title="Notifications"
      subtitle="Verification, payout, and platform alerts for admins."
    />
  );
}
