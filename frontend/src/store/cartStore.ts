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
    const existing = state.items.find((i) => i.product_id === newItem.product_id);
    if (existing) {
      // If we already have the item, we use the quantity as the NEW total or INCREMENT?
      // Based on audit, the system might pass the new TOTAL quantity.
      // To be safe, we check if the quantity is unusually large or if we should always use diff.
      // Actually, standardizing on REPLACE if found or INCREMENT?
      // The audit says: (newItem.quantity - existing.quantity) * price.
      const diff = newItem.quantity - existing.quantity;
      if (diff === 0) return state; // No change

      return {
        items: state.items.map((i) => i.product_id === newItem.product_id ? { ...i, quantity: newItem.quantity } : i),
        total: state.total + (diff * existing.products.price)
      };
    }
    return {
      items: [...state.items, newItem],
      total: state.total + (newItem.quantity * newItem.products.price)
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
