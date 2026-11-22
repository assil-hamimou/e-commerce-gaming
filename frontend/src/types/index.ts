export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: string | number;
  old_price?: string | number | null;
  stock: number;
  category_id: number;
  platform_id: number;
  image?: string | null;
  publisher?: string;
  release_date?: string;
  rating?: string;
  is_featured: boolean | number;
  is_new: boolean | number;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  platform_name?: string;
  platform_slug?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  games_count?: number;
}

export interface Platform {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  games_count?: number;
}

export interface CartItem {
  cart_item_id: number;
  game_id: number;
  quantity: number;
  title: string;
  slug: string;
  price: string | number;
  old_price?: string | number | null;
  stock: number;
  image?: string | null;
  category_name?: string;
  platform_name?: string;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalCount: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'client' | 'admin';
}

export interface Review {
  id: number;
  game_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  game_id: number;
  quantity: number;
  unit_price: number | string;
  title: string;
  slug: string;
  image?: string | null;
  platform_name?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number | string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method?: string;
  created_at: string;
  items_count?: number;
  items?: OrderItem[];
}
