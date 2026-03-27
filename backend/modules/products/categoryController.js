import { supabase } from '../../config/supabase.js';

// @desc    Create a category
// @route   POST /categories
export const createCategory = async (req, res) => {
  try {
    const { name, store_id } = req.body;
    
    // Check if store belongs to user
    const { data: store } = await supabase.from('stores').select('owner_id').eq('id', store_id).single();
    if (!store || store.owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { data: category, error } = await supabase
      .from('categories')
      .insert([{ name, store_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get categories for a store
// @route   GET /categories/store/:storeId
export const getCategories = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId);

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check ownership (simplified check via store_id joining categories)
    const { data: cat } = await supabase.from('categories').select('store_id, stores(owner_id)').eq('id', id).single();
    if (!cat || cat.stores.owner_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
