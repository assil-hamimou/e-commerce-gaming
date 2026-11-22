import { Game, Category, Platform, CartState, User, Review, Order } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Erreur serveur (${response.status})`);
  }

  return data as T;
}

// Games API
export const gamesApi = {
  getAll: (params: {
    category?: string;
    platform?: string;
    search?: string;
    featured?: boolean;
    new?: boolean;
    promo?: boolean;
    sort?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.platform) query.append('platform', params.platform);
    if (params.search) query.append('search', params.search);
    if (params.featured !== undefined) query.append('featured', params.featured ? '1' : '0');
    if (params.new !== undefined) query.append('new', params.new ? '1' : '0');
    if (params.promo !== undefined) query.append('promo', params.promo ? '1' : '0');
    if (params.sort) query.append('sort', params.sort);
    if (params.min_price !== undefined) query.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) query.append('max_price', params.max_price.toString());
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    return request<{
      success: boolean;
      games: Game[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/games.php?${query.toString()}`);
  },

  getByIdOrSlug: (identifier: string | number) => {
    const param = typeof identifier === 'number' ? `id=${identifier}` : `slug=${encodeURIComponent(identifier)}`;
    return request<{
      success: boolean;
      game: Game;
      reviews: Review[];
      similar: Game[];
    }>(`/games.php?${param}`);
  },
};

// Categories API
export const categoriesApi = {
  getAll: () => request<{ success: boolean; categories: Category[] }>('/categories.php'),
};

// Platforms API
export const platformsApi = {
  getAll: () => request<{ success: boolean; platforms: Platform[] }>('/platforms.php'),
};

// Cart API
export const cartApi = {
  get: () => request<{ success: boolean; cart: CartState }>('/cart.php'),
  
  add: (gameId: number, quantity: number = 1) =>
    request<{ success: boolean; message: string; cart: CartState }>('/cart.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'add', game_id: gameId, quantity }),
    }),

  update: (cartItemId: number, quantity: number) =>
    request<{ success: boolean; message: string; cart: CartState }>('/cart.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'update', cart_item_id: cartItemId, quantity }),
    }),

  remove: (cartItemId: number) =>
    request<{ success: boolean; message: string; cart: CartState }>('/cart.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'remove', cart_item_id: cartItemId }),
    }),

  clear: () =>
    request<{ success: boolean; message: string; cart: CartState }>('/cart.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'clear' }),
    }),
};

// Auth API
export const authApi = {
  me: () => request<{ success: boolean; authenticated: boolean; user: User | null }>('/auth.php?action=me'),

  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; message: string; user: User }>('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', ...credentials }),
    }),

  register: (payload: { username: string; email: string; password: string; first_name?: string; last_name?: string }) =>
    request<{ success: boolean; message: string; user: User }>('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'register', ...payload }),
    }),

  logout: () =>
    request<{ success: boolean; message: string }>('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout' }),
    }),
};

// Orders API
export const ordersApi = {
  getAll: () => request<{ success: boolean; orders: Order[] }>('/orders.php'),

  create: (payload: { shipping_address: string; payment_method: string }) =>
    request<{ success: boolean; message: string; order_id: number; total: number }>('/orders.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
