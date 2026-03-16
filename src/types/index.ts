export interface Product {
  id: string;
  slug?: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  price: number;
  category: "Makeup" | "Skincare" | "Perfumes" | "Accessories" | "Watches" | string;
  images?: string[];
  additional_images?: string[];
  image_url?: string;
  brand?: string;
  rating?: number;
  review_count?: number;
  ingredients?: string;
  ingredients_ar?: string;
  usage?: string;
  usage_ar?: string;
  inStock?: boolean;
  stock?: number;
  discount_percentage?: number;
  sale_end_date?: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  savedAddresses: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  shippingAddress: Address;
}
