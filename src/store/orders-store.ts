import { create } from "zustand";

export interface OrderItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  rawId: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  status: "Successful" | "Pending" | "Shipped" | "Delivered" | "Refunded";
  itemsCount: number;
  paymentMethod: string;
  trackingNumber: string;
  items: OrderItem[];
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "#ORD-1001",
    rawId: "ORD-1001",
    date: "Jun 25, 2026, 11:30 AM",
    customerName: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 803 123 4567",
    address: "123 Maple St, Ikeja, Lagos",
    amount: 180000,
    status: "Successful",
    itemsCount: 2,
    paymentMethod: "Debit Card (Mastercard)",
    trackingNumber: "FL-TRK-987211",
    items: [
      {
        id: "item-1",
        title: "Highlander Men's Chronograph Watch",
        sku: "SKU: HLC-CHR-001",
        price: 49000,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&auto=format",
      },
      {
        id: "item-2",
        title: "Nike Air Max 270 React Sneakers",
        sku: "SKU: NKE-AM270-W",
        price: 82000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1002",
    rawId: "ORD-1002",
    date: "Jun 26, 2026, 09:15 AM",
    customerName: "Sarah Chen",
    email: "sarah.c@example.com",
    phone: "+234 812 987 6543",
    address: "456 Oak Ave, Lekki Phase 1, Lagos",
    amount: 225500,
    status: "Pending",
    itemsCount: 1,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987212",
    items: [
      {
        id: "item-3",
        title: 'Samsung 65" 4K Crystal UHD Smart TV',
        sku: "SKU: SAM-65-4K",
        price: 225500,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1003",
    rawId: "ORD-1003",
    date: "Jun 26, 2026, 02:45 PM",
    customerName: "Michael Brown",
    email: "m.brown@example.com",
    phone: "+234 701 555 0192",
    address: "789 Pine Rd, GRA, Port Harcourt",
    amount: 99990,
    status: "Shipped",
    itemsCount: 3,
    paymentMethod: "FastLink Wallet",
    trackingNumber: "FL-TRK-987213",
    items: [
      {
        id: "item-4",
        title: "Wireless Noise-Canceling Headphones",
        sku: "SKU: AUD-HD-900",
        price: 33330,
        quantity: 3,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1004",
    rawId: "ORD-1004",
    date: "Jun 27, 2026, 10:00 AM",
    customerName: "David Lee",
    email: "david.l@example.com",
    phone: "+234 809 444 8811",
    address: "101 Cedar Ln, Maitama, Abuja",
    amount: 315750,
    status: "Delivered",
    itemsCount: 4,
    paymentMethod: "Visa Card",
    trackingNumber: "FL-TRK-987214",
    items: [
      {
        id: "item-5",
        title: 'Apple MacBook Pro 16" M3 Max',
        sku: "SKU: APP-MBP-16",
        price: 315750,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1005",
    rawId: "ORD-1005",
    date: "Jun 28, 2026, 08:30 AM",
    customerName: "Emily Wong",
    email: "emily.w@example.com",
    phone: "+234 815 333 9922",
    address: "202 Elm Ct, Victoria Island, Lagos",
    amount: 210000,
    status: "Refunded",
    itemsCount: 1,
    paymentMethod: "Debit Card",
    trackingNumber: "FL-TRK-987215",
    items: [
      {
        id: "item-6",
        title: "Ergonomic Leather Gaming Chair",
        sku: "SKU: FUR-CHR-88",
        price: 210000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1006",
    rawId: "ORD-1006",
    date: "Jun 29, 2026, 04:20 PM",
    customerName: "Amina Yusuf",
    email: "amina.y@example.com",
    phone: "+234 802 777 3344",
    address: "15 Maitland Rd, Asokoro, Abuja",
    amount: 450000,
    status: "Successful",
    itemsCount: 2,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987216",
    items: [
      {
        id: "item-7",
        title: "Sony PlayStation 5 Slim Console",
        sku: "SKU: GME-PS5-SLIM",
        price: 450000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1007",
    rawId: "ORD-1007",
    date: "Jun 30, 2026, 01:10 PM",
    customerName: "Chidi Eze",
    email: "chidi.eze@example.com",
    phone: "+234 818 666 2200",
    address: "88 Marina Street, Lagos Island",
    amount: 128000,
    status: "Pending",
    itemsCount: 1,
    paymentMethod: "USSD Payment",
    trackingNumber: "FL-TRK-987217",
    items: [
      {
        id: "item-8",
        title: "Mechanical RGB Keyboard & Gaming Mouse Combo",
        sku: "SKU: GAM-KBD-99",
        price: 128000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&auto=format",
      },
    ],
  },
];

interface OrdersState {
  orders: Order[];
  updateOrderStatus: (id: string, newStatus: Order["status"]) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: INITIAL_ORDERS,
  updateOrderStatus: (id: string, newStatus: Order["status"]) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id || o.rawId === id ? { ...o, status: newStatus } : o
      ),
    }));
  },
  getOrderById: (id: string) => {
    const cleanId = id.replace(/^#/, "").toLowerCase();
    return get().orders.find(
      (o) =>
        o.id.toLowerCase() === id.toLowerCase() ||
        o.rawId.toLowerCase() === cleanId ||
        o.id.replace(/^#/, "").toLowerCase() === cleanId
    );
  },
}));
