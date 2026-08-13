import type { Product } from "./product";

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: {
    size?: string;
    color?: string;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  discount?: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export type ApiOrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type SellerDisplayStatus = "Successful" | "Pending" | "Shipped" | "Delivered" | "Refunded";

export interface ApiOrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  sku: string | null;
  quantity: number;
  price: number;
  variants?: Record<string, unknown> | null;
}

export interface ApiOrderEvent {
  id: string;
  status: string;
  title: string;
  createdAt: string;
}

export interface ApiOrder {
  id: string;
  reference: string;
  groupId: string;
  status: ApiOrderStatus;
  displayStatus: SellerDisplayStatus | string;
  paymentStatus: string;
  paymentMethod: string | null;
  deliveryMethod: string;
  trackingNumber: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  store?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  rider?: {
    id: string;
    name?: string | null;
    phone?: string | null;
    status?: string;
  } | null;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string | null;
    country: string;
    phone: string | null;
  };
  items: ApiOrderItem[];
  events?: ApiOrderEvent[];
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  estimatedDelivery?: string;
}

export interface CheckoutResult {
  groupId: string;
  orders: ApiOrder[];
}

export interface CheckoutQuoteStore {
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutQuote {
  groupPreview: boolean;
  orderCount: number;
  stores: CheckoutQuoteStore[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  deliveryZone?: { id: string; name: string; fee: number } | null;
}

export interface AddressPayload {
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}
