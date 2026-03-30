import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  store_id: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products: Product;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  total: number;
  loading: boolean;
  setCart: (cartId: string, items: CartItem[], total: number) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartId: null,
  items: [],
  total: 0,
  loading: false,
  
  setCart: (cartId, items, total) => set({ cartId, items, total }),
  
  addItem: (newItem) => set((state) => {
    // Restrict cart to a single store at a time
    if (state.items.length > 0) {
      if (newItem.products?.store_id && state.items[0].products?.store_id !== newItem.products.store_id) {
        console.error('Cross-store cart addition blocked');
        throw new Error('Cannot add items from a different store');
      }
    }

    // Check if the product already exists in the cart by product_id
    const existing = state.items.find((i) => i.product_id === newItem.product_id);
    
    if (existing) {
      const diff = newItem.quantity - existing.quantity;
      if (diff === 0) return state;

      return {
        items: state.items.map((i) => i.product_id === newItem.product_id ? { ...i, quantity: newItem.quantity } : i),
        total: Math.max(0, state.total + (diff * (existing.products?.price || 0)))
      };
    }

    // New item entry - ensure it has a unique cart_item id
    return {
      items: [...state.items, { ...newItem, id: newItem.id || Math.random().toString(36).substr(2, 9) }],
      total: state.total + (newItem.quantity * (newItem.products?.price || 0))
    };
  }),

  updateItemQuantity: (itemId, quantity) => set((state) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return state;
    
    const priceDiff = (quantity - item.quantity) * item.products.price;
    
    return {
      items: state.items.map(i => i.id === itemId ? { ...i, quantity } : i),
      total: state.total + priceDiff
    };
  }),

  removeItem: (itemId) => set((state) => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return state;

    return {
      items: state.items.filter(i => i.id !== itemId),
      total: state.total - (item.quantity * item.products.price)
    };
  }),

  clearCart: () => set({ cartId: null, items: [], total: 0 }),
  
  setLoading: (loading) => set({ loading })
}));
