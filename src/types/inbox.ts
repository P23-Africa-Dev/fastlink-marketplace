export interface ConversationMessage {
  id: string;
  body: string;
  senderRole: "customer" | "merchant";
  senderId: string;
  mine: boolean;
  createdAt: string;
}

export interface ApiConversation {
  id: string;
  status: "open" | "in_progress" | "resolved";
  displayStatus: "New" | "In Progress" | "Resolved";
  subject: string;
  preview: string;
  lastMessageAt: string | null;
  unreadCount: number;
  buyer?: { id: string; name: string; email: string; phone?: string | null; avatar?: string | null } | null;
  store?: { id: string; name: string; slug: string } | null;
  order?: { id: string; reference: string; total: number; createdAt: string } | null;
  messages: ConversationMessage[];
}

export interface ApiTicketMessage {
  id: string;
  body: string;
  senderId: string;
  senderName?: string | null;
  fromStaff: boolean;
  createdAt: string;
}

export interface ApiSupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  displayPriority: string;
  status: string;
  displayStatus: string;
  store?: { id: string; name: string } | null;
  user?: { id: string; name: string; email: string } | null;
  messages: ApiTicketMessage[];
  createdAt: string;
}

export interface SellerAnalytics {
  range: string;
  revenue: number;
  revenueChange: string;
  visitors: number;
  visitorsChange: string;
  orders: number;
  ordersChange: string;
  conversion: number;
  conversionChange: string;
  chartRevenue: Array<{ name: string; value: number }>;
  chartTraffic: Array<{ name: string; visitors: number }>;
}

export interface ApiCampaign {
  id: string;
  name: string;
  channel: string;
  platform: string;
  spend: number;
  conversions: number;
  roi: number;
  status: string;
  displayStatus: string;
  startsAt: string | null;
  createdAt: string;
}

export interface ApiRider {
  id: string;
  status: string;
  phone: string;
  vehicleType: string;
  city?: string | null;
  user?: { id: string; name: string; email: string } | null;
  createdAt: string;
}
