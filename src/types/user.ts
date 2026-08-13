export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "buyer" | "seller" | "admin" | "rider";
  status?: "active" | "pending" | "suspended";
  phone?: string | null;
  loyaltyPoints?: number;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "buyer" | "seller";
}
