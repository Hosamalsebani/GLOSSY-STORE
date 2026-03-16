import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

export interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
}

interface AppState {
  cart: CartItem[];
  wishlist: Product[];
  isAuthenticated: boolean;
  user: AppUser | null;
  homepageSlides: Slide[];
  recentlyViewedIds: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  setUser: (user: AppUser | null) => void;
  login: () => void;
  logout: () => void;
  updateSlides: (slides: Slide[]) => void;
  trackProductView: (productId: string) => void;
}

const defaultSlides: Slide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&q=80&w=2000',
    title: 'The Signature Collection',
    subtitle: 'Elevate your daily routine with our premium skincare essentials.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=2000',
    title: 'Radiant Glow Beauty',
    subtitle: 'Discover the latest in high-end cosmetics and makeup.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=2000',
    title: 'Luxury Fragrances',
    subtitle: 'Captivating scents designed for the modern elegant woman.',
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      isAuthenticated: false,
      user: null,
      homepageSlides: defaultSlides,
      recentlyViewedIds: [],
      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          if (exists) {
            return {
              wishlist: state.wishlist.filter((item) => item.id !== product.id),
            };
          }
          return { wishlist: [...state.wishlist, product] };
        }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateSlides: (slides) => set({ homepageSlides: slides }),
      trackProductView: (productId) =>
        set((state) => {
          const filtered = state.recentlyViewedIds.filter((id) => id !== productId);
          return {
            recentlyViewedIds: [productId, ...filtered].slice(0, 12),
          };
        }),
    }),
    {
      name: 'glossy-storage',
    }
  )
);
