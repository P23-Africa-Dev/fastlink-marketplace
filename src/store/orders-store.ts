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
  {
    id: "#ORD-1008",
    rawId: "ORD-1008",
    date: "Jul 01, 2026, 11:45 AM",
    customerName: "Femi Adebayo",
    email: "femi.a@example.com",
    phone: "+234 803 999 1122",
    address: "12 Allen Avenue, Ikeja, Lagos",
    amount: 65000,
    status: "Successful",
    itemsCount: 1,
    paymentMethod: "Debit Card (Visa)",
    trackingNumber: "FL-TRK-987218",
    items: [
      {
        id: "item-9",
        title: "Smart Fitness Watch with Heart Rate Monitor",
        sku: "SKU: WCH-SMT-05",
        price: 65000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1009",
    rawId: "ORD-1009",
    date: "Jul 02, 2026, 03:15 PM",
    customerName: "Grace Okafor",
    email: "grace.o@example.com",
    phone: "+234 814 222 3344",
    address: "34 Bodija Market Rd, Ibadan",
    amount: 145000,
    status: "Shipped",
    itemsCount: 2,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987219",
    items: [
      {
        id: "item-10",
        title: "Portable Espresso Coffee Machine",
        sku: "SKU: KTC-COF-01",
        price: 145000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1010",
    rawId: "ORD-1010",
    date: "Jul 03, 2026, 09:30 AM",
    customerName: "Kelechi Nwosu",
    email: "k.nwosu@example.com",
    phone: "+234 703 888 7766",
    address: "59 Independence Layout, Enugu",
    amount: 320000,
    status: "Delivered",
    itemsCount: 3,
    paymentMethod: "FastLink Wallet",
    trackingNumber: "FL-TRK-987220",
    items: [
      {
        id: "item-11",
        title: "Ultra-Wide Curved Gaming Monitor 34\"",
        sku: "SKU: MON-UW-34",
        price: 320000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1011",
    rawId: "ORD-1011",
    date: "Jul 04, 2026, 02:00 PM",
    customerName: "Tunde Bakare",
    email: "tunde.b@example.com",
    phone: "+234 805 111 2233",
    address: "9 Ring Road, Challenge, Ibadan",
    amount: 52000,
    status: "Pending",
    itemsCount: 1,
    paymentMethod: "USSD Payment",
    trackingNumber: "FL-TRK-987221",
    items: [
      {
        id: "item-12",
        title: "Wireless Ergonomic Vertical Mouse",
        sku: "SKU: MSE-ERG-01",
        price: 52000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1012",
    rawId: "ORD-1012",
    date: "Jul 05, 2026, 10:45 AM",
    customerName: "Blessing Okon",
    email: "blessing.o@example.com",
    phone: "+234 813 444 5566",
    address: "77 Eburu Street, Calabar",
    amount: 98000,
    status: "Successful",
    itemsCount: 2,
    paymentMethod: "Debit Card",
    trackingNumber: "FL-TRK-987222",
    items: [
      {
        id: "item-13",
        title: "Designer Leather Handbag",
        sku: "SKU: BAG-LTH-09",
        price: 98000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1013",
    rawId: "ORD-1013",
    date: "Jul 06, 2026, 04:10 PM",
    customerName: "Ibrahim Musa",
    email: "ibrahim.m@example.com",
    phone: "+234 802 999 4455",
    address: "21 BUK Road, Kano",
    amount: 175000,
    status: "Shipped",
    itemsCount: 1,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987223",
    items: [
      {
        id: "item-14",
        title: "Smart Home Security Camera System 4K",
        sku: "SKU: SEC-CAM-4K",
        price: 175000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1014",
    rawId: "ORD-1014",
    date: "Jul 07, 2026, 01:25 PM",
    customerName: "Zainab Bello",
    email: "zainab.b@example.com",
    phone: "+234 816 777 8899",
    address: "14 Ahmadu Bello Way, Kaduna",
    amount: 42000,
    status: "Refunded",
    itemsCount: 1,
    paymentMethod: "Debit Card",
    trackingNumber: "FL-TRK-987224",
    items: [
      {
        id: "item-15",
        title: "Stainless Steel Thermal Travel Mug",
        sku: "SKU: MUG-THR-02",
        price: 42000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1015",
    rawId: "ORD-1015",
    date: "Jul 08, 2026, 08:50 AM",
    customerName: "Victor Obinna",
    email: "victor.o@example.com",
    phone: "+234 809 333 1144",
    address: "50 Stadium Road, Owerri",
    amount: 680000,
    status: "Delivered",
    itemsCount: 3,
    paymentMethod: "Mastercard",
    trackingNumber: "FL-TRK-987225",
    items: [
      {
        id: "item-16",
        title: "Apple iPad Air 11-inch M2 Chip",
        sku: "SKU: TAB-IPD-AIR",
        price: 680000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1016",
    rawId: "ORD-1016",
    date: "Jul 09, 2026, 12:15 PM",
    customerName: "Nneka Nnamdi",
    email: "nneka.n@example.com",
    phone: "+234 810 555 4433",
    address: "10 Abakaliki Road, Enugu",
    amount: 115000,
    status: "Successful",
    itemsCount: 2,
    paymentMethod: "FastLink Wallet",
    trackingNumber: "FL-TRK-987226",
    items: [
      {
        id: "item-17",
        title: "Pro Air Purifier with HEPA Filter",
        sku: "SKU: HOM-AIR-01",
        price: 115000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1017",
    rawId: "ORD-1017",
    date: "Jul 10, 2026, 05:40 PM",
    customerName: "Osas Ighodaro",
    email: "osas.i@example.com",
    phone: "+234 803 222 9900",
    address: "8 Airport Road, Benin City",
    amount: 88000,
    status: "Pending",
    itemsCount: 1,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987227",
    items: [
      {
        id: "item-18",
        title: "Wireless Bluetooth Soundbar",
        sku: "SKU: AUD-SND-04",
        price: 88000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1018",
    rawId: "ORD-1018",
    date: "Jul 11, 2026, 09:00 AM",
    customerName: "Segun Arinze",
    email: "segun.a@example.com",
    phone: "+234 812 666 4411",
    address: "44 Toyin Street, Ikeja, Lagos",
    amount: 240000,
    status: "Shipped",
    itemsCount: 2,
    paymentMethod: "Visa Card",
    trackingNumber: "FL-TRK-987228",
    items: [
      {
        id: "item-19",
        title: "4K Action Camera Waterproof",
        sku: "SKU: CAM-ACT-4K",
        price: 240000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1019",
    rawId: "ORD-1019",
    date: "Jul 12, 2026, 02:30 PM",
    customerName: "Halima Abubakar",
    email: "halima.a@example.com",
    phone: "+234 807 888 2211",
    address: "6 Gwarinpa Estate, Abuja",
    amount: 55000,
    status: "Successful",
    itemsCount: 1,
    paymentMethod: "Debit Card",
    trackingNumber: "FL-TRK-987229",
    items: [
      {
        id: "item-20",
        title: "Electric Milk Frother & Coffee Heater",
        sku: "SKU: KTC-FRT-02",
        price: 55000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&auto=format",
      },
    ],
  },
  {
    id: "#ORD-1020",
    rawId: "ORD-1020",
    date: "Jul 13, 2026, 11:10 AM",
    customerName: "Emeka Onuorah",
    email: "emeka.o@example.com",
    phone: "+234 815 111 9988",
    address: "18 Onitsha Main Market Rd, Anambra",
    amount: 190000,
    status: "Delivered",
    itemsCount: 3,
    paymentMethod: "Bank Transfer",
    trackingNumber: "FL-TRK-987230",
    items: [
      {
        id: "item-21",
        title: "Professional Studio Condenser Mic",
        sku: "SKU: AUD-MIC-PRO",
        price: 190000,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format",
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
