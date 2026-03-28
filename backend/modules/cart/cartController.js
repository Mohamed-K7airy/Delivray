import { supabase } from '../../config/supabase.js';

// Helper: Ensure user has a cart
const getOrCreateCart = async (userId) => {
  let { data: cart } = await supabase
    .from('cart')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId }])
      .select('id')
      .single();
    if (error) throw error;
    cart = newCart;
  }
  return cart.id;
};

// @desc    Get user's cart
// @route   GET /cart
// @access  Private/Customer
export const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.id);

    // Fetch cart items with product details
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products (
          id, name, price, image, store_id
        )
      `)
      .eq('cart_id', cartId);

    if (error) throw error;

    // Calculate total price structure
    let total = 0;
    items.forEach(item => {
      total += item.quantity * (item.products?.price || 0);
    });

    res.json({ cart_id: cartId, items, total });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /cart/add
// @access  Private/Customer
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const cartId = await getOrCreateCart(req.user.id);

    // Check if product exists and is available
    const { data: product } = await supabase
      .from('products')
      .select('id, store_id, availability')
      .eq('id', product_id)
      .maybeSingle();

    if (!product || !product.availability) {
      return res.status(400).json({ message: 'Product is unavailable' });
    }

    // Check if user has items from a DIFFERENT store in their cart
    // We use a join here to be more efficient and get the store_id of existing items
    const { data: cartStoreCheck } = await supabase
      .from('cart_items')
      .select('products(store_id)')
      .eq('cart_id', cartId)
      .limit(1);
      
    if (cartStoreCheck && cartStoreCheck.length > 0) {
      const currentStoreId = cartStoreCheck[0].products?.store_id;
      if (currentStoreId && currentStoreId !== product.store_id) {
         return res.status(400).json({ 
           message: 'Your cart contains items from another store. Please clear your cart to add items from this store.',
           clear_cart_required: true 
         });
      }
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();
      if (error) throw error;
      return res.json(updatedItem);
    } else {
      // Insert new
      const { data: newItem, error } = await supabase
        .from('cart_items')
        .insert([{ cart_id: cartId, product_id, quantity }])
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update cart item quantity
// @route   PATCH /cart/update
// @access  Private/Customer
export const updateCartItem = async (req, res) => {
  try {
    const { item_id, quantity } = req.body;
    
    if (quantity <= 0) {
       return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const cartId = await getOrCreateCart(req.user.id);
    
    // Verify item belongs to user's cart
    const { data: item, error: fetchErr } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', item_id)
      .eq('cart_id', cartId)
      .maybeSingle();
      
    if (!item || fetchErr) return res.status(404).json({ message: 'Item not found in your cart' });

    const { data: updated, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', item_id)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /cart/remove
// @access  Private/Customer
export const removeFromCart = async (req, res) => {
  try {
    const { item_id } = req.body; 

    const cartId = await getOrCreateCart(req.user.id);
    
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', item_id)
      .eq('cart_id', cartId);

    if (error) throw error;
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
