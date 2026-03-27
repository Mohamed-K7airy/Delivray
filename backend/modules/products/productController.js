import { supabase } from '../../config/supabase.js';

// Helper to check if merchant owns the store
const checkStoreOwnership = async (store_id, owner_id) => {
  const { data: store } = await supabase
    .from('stores')
    .select('owner_id')
    .eq('id', store_id)
    .maybeSingle();
  
  return store && store.owner_id === owner_id;
};

// @desc    Create product
// @route   POST /products
// @access  Private/Merchant
export const createProduct = async (req, res) => {
  try {
    const { store_id, name, price, image, description, availability, category_id } = req.body;

    // Check ownership
    const isOwner = await checkStoreOwnership(store_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Not authorized to add products to this store' });

    const { data: product, error } = await supabase
      .from('products')
      .insert([{ store_id, name, price, image, description, availability, category_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get products (Filter by store_id)
// @route   GET /products?store_id=
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { store_id, limit = 20, page = 1 } = req.query;
    
    let query = supabase.from('products').select('*, categories(name)');
    if (store_id) query = query.eq('store_id', store_id);

    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data: products, error } = await query;
    if (error) throw error;

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update a product
// @route   PATCH /products/:id
// @access  Private/Merchant
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !product) return res.status(404).json({ message: 'Product not found' });
    
    // Check ownership
    const isOwner = await checkStoreOwnership(product.store_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /products/:id
// @access  Private/Merchant
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('store_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !product) return res.status(404).json({ message: 'Product not found' });
    
    const isOwner = await checkStoreOwnership(product.store_id, req.user.id);
    if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
