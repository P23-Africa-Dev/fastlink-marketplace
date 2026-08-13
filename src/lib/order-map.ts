import type { ApiOrder, SellerDisplayStatus } from "@/types/order";

export interface DashboardOrderItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface DashboardOrder {
  id: string;
  rawId: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: SellerDisplayStatus;
  itemsCount: number;
  paymentMethod: string;
  trackingNumber: string;
  items: DashboardOrderItem[];
}

export type Order = DashboardOrder;
export type OrderItem = DashboardOrderItem;

export function formatOrderDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDashboardOrder(order: ApiOrder): DashboardOrder {
  const address = [
    order.shippingAddress.street,
    order.shippingAddress.city,
    order.shippingAddress.state,
  ]
    .filter(Boolean)
    .join(", ");

  const status = (["Successful", "Pending", "Shipped", "Delivered", "Refunded"] as const).includes(
    order.displayStatus as SellerDisplayStatus,
  )
    ? (order.displayStatus as SellerDisplayStatus)
    : "Pending";

  return {
    id: order.reference.startsWith("#") ? order.reference : `#${order.reference}`,
    rawId: order.reference.replace(/^#/, ""),
    date: formatOrderDate(order.createdAt),
    customerName: order.buyer.name,
    email: order.buyer.email,
    phone: order.buyer.phone || order.shippingAddress.phone || "—",
    address: address || "—",
    amount: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    status,
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    paymentMethod: order.paymentMethod === "demo" ? "Demo payment" : order.paymentMethod || "—",
    trackingNumber: order.trackingNumber || "—",
    items: order.items.map((item) => ({
      id: item.id,
      title: item.productName,
      sku: item.sku ? `SKU: ${item.sku}` : "—",
      price: item.price,
      quantity: item.quantity,
      image: item.productImage || "",
    })),
  };
}
