export type UserRole = "customer" | "vendor" | "rider";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  userId: string;
  rating: number;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  vendorId: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mall {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export type OrderStatus = "pending" | "preparing" | "on-the-way" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  riderId?: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}
