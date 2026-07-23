import { create } from "zustand";

export interface ChatMessage {
  sender: "customer" | "merchant";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  preview: string;
  receivedAt: string;
  status: "New" | "In Progress" | "Resolved";
  orderInfo: {
    id: string;
    date: string;
    amount: string;
    item: string;
  };
  chatHistory: ChatMessage[];
}

interface MessagesStore {
  conversations: Conversation[];
  replyToConversation: (id: string, text: string) => void;
  updateConversationStatus: (id: string, status: "New" | "In Progress" | "Resolved") => void;
  deleteConversation: (id: string) => void;
  bulkDeleteConversations: (ids: string[]) => void;
  bulkResolveConversations: (ids: string[]) => void;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "M-5001",
    senderName: "Customer Pholles",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pholles",
    senderEmail: "pholles.c@example.com",
    senderPhone: "+1-555-0199",
    subject: "Order #1234 inquiry",
    preview: "Okay, thank you.",
    receivedAt: "Jul 21, 2023, 3:26 PM",
    status: "New",
    orderInfo: {
      id: "Order #1234",
      date: "Jul 15, 2023",
      amount: "$150.00",
      item: "Premium Wireless Mouse"
    },
    chatHistory: [
      { sender: "customer", text: "Hi, I haven't received my item yet. Can you check my order?", time: "Jul 21, 2023, 3:26 PM" },
      { sender: "merchant", text: "Hi Pholles, looking into it now. Please wait while I pull up your order.", time: "Jul 21, 2023, 3:28 PM" },
      { sender: "customer", text: "Okay, thank you.", time: "Jul 21, 2023, 3:30 PM" },
      { sender: "merchant", text: "The order seems to be with the carrier. Let me contact them...", time: "Jul 21, 2023, 3:32 PM" }
    ]
  },
  {
    id: "M-5002",
    senderName: "Karia Grurton",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karia",
    senderEmail: "karia.g@example.com",
    senderPhone: "+1-555-0210",
    subject: "Missing item",
    preview: "When will my item ship? I need it before Friday.",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "In Progress",
    orderInfo: {
      id: "Order #1235",
      date: "Jul 18, 2023",
      amount: "$49.00",
      item: "USB-C Fast Charger"
    },
    chatHistory: [
      { sender: "customer", text: "Hi team, I received my delivery today but the charging cable was missing.", time: "Jul 21, 2023, 3:10 PM" },
      { sender: "merchant", text: "Hello Karia! We apologize for this mistake. Let us check our warehouse dispatch log.", time: "Jul 21, 2023, 3:18 PM" },
      { sender: "customer", text: "When will my item ship? I need it before Friday.", time: "Jul 21, 2023, 3:23 PM" }
    ]
  },
  {
    id: "M-5003",
    senderName: "Jana Geagre",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jana",
    senderEmail: "jana.geagre@example.com",
    senderPhone: "+1-555-0322",
    subject: "Shipping time question",
    preview: "When will my item ship? I ordered yesterday.",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "Resolved",
    orderInfo: {
      id: "Order #1236",
      date: "Jul 20, 2023",
      amount: "$120.00",
      item: "Ergonomic Office Pillow"
    },
    chatHistory: [
      { sender: "customer", text: "When will my item ship? I ordered yesterday.", time: "Jul 21, 2023, 3:23 PM" },
      { sender: "merchant", text: "Hi Jana, all orders are processed within 24 hours. Your shipment is already on its way!", time: "Jul 21, 2023, 3:30 PM" }
    ]
  },
  {
    id: "M-5004",
    senderName: "Cliavin Donar",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cliavin",
    senderEmail: "cliavin.d@example.com",
    senderPhone: "+1-555-0811",
    subject: "Order #1234 inquiry",
    preview: "Is it possible to change my shipping address?",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "In Progress",
    orderInfo: {
      id: "Order #1237",
      date: "Jul 19, 2023",
      amount: "$85.50",
      item: "Premium Desk Mat"
    },
    chatHistory: [
      { sender: "customer", text: "Is it possible to change my shipping address?", time: "Jul 21, 2023, 3:23 PM" }
    ]
  },
  {
    id: "M-5005",
    senderName: "Roken Balan",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roken",
    senderEmail: "roken.b@example.com",
    senderPhone: "+1-555-0955",
    subject: "Shipping time question",
    preview: "Do you ship internationally to Canada?",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "Resolved",
    orderInfo: {
      id: "Order #1238",
      date: "Jul 12, 2023",
      amount: "$210.00",
      item: "Mechanical Keyboard"
    },
    chatHistory: [
      { sender: "customer", text: "Do you ship internationally to Canada?", time: "Jul 21, 2023, 3:23 PM" },
      { sender: "merchant", text: "Yes Roken, we offer global shipping! Shipping costs will show at checkout.", time: "Jul 21, 2023, 3:45 PM" }
    ]
  },
  {
    id: "M-5006",
    senderName: "Malan Birany",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Malan",
    senderEmail: "malan.b@example.com",
    senderPhone: "+1-555-0722",
    subject: "Order #1234 inquiry",
    preview: "Please cancel order #1234. I bought the wrong model.",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "Resolved",
    orderInfo: {
      id: "Order #1239",
      date: "Jul 20, 2023",
      amount: "$320.00",
      item: "Samsung Curved Monitor"
    },
    chatHistory: [
      { sender: "customer", text: "Please cancel order #1234. I bought the wrong model.", time: "Jul 21, 2023, 3:23 PM" },
      { sender: "merchant", text: "Done! Your order cancellation has been approved and a refund is initiated.", time: "Jul 21, 2023, 4:00 PM" }
    ]
  },
  {
    id: "M-5007",
    senderName: "Junan Smith",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Junan",
    senderEmail: "junan.s@example.com",
    senderPhone: "+1-555-0834",
    subject: "Order #1234 inquiry",
    preview: "My voucher code is not working at checkout.",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "Resolved",
    orderInfo: {
      id: "Order #1240",
      date: "Jul 21, 2023",
      amount: "$45.00",
      item: "Artisan Coffee Beans"
    },
    chatHistory: [
      { sender: "customer", text: "My voucher code is not working at checkout.", time: "Jul 21, 2023, 3:23 PM" }
    ]
  },
  {
    id: "M-5008",
    senderName: "John Kennes",
    senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    senderEmail: "john.k@example.com",
    senderPhone: "+1-555-0901",
    subject: "Shipping time question",
    preview: "Where can I find the invoice for my order?",
    receivedAt: "Jul 21, 2023, 3:23 PM",
    status: "Resolved",
    orderInfo: {
      id: "Order #1241",
      date: "Jul 14, 2023",
      amount: "$60.00",
      item: "Premium Leather Belt"
    },
    chatHistory: [
      { sender: "customer", text: "Where can I find the invoice for my order?", time: "Jul 21, 2023, 3:23 PM" }
    ]
  }
];

export const useMessagesStore = create<MessagesStore>((set) => ({
  conversations: INITIAL_CONVERSATIONS,
  
  replyToConversation: (id, text) =>
    set((state) => ({
      conversations: state.conversations.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              preview: text,
              status: "Resolved",
              chatHistory: [
                ...msg.chatHistory,
                {
                  sender: "merchant",
                  text,
                  time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                }
              ]
            }
          : msg
      )
    })),
    
  updateConversationStatus: (id, status) =>
    set((state) => ({
      conversations: state.conversations.map((msg) =>
        msg.id === id ? { ...msg, status } : msg
      )
    })),
    
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((msg) => msg.id !== id)
    })),
    
  bulkDeleteConversations: (ids) =>
    set((state) => ({
      conversations: state.conversations.filter((msg) => !ids.includes(msg.id))
    })),
    
  bulkResolveConversations: (ids) =>
    set((state) => ({
      conversations: state.conversations.map((msg) =>
        ids.includes(msg.id) ? { ...msg, status: "Resolved" } : msg
      )
    }))
}));
