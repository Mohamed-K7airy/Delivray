import { supabase } from '../../config/supabase.js';

// @desc    Validate a promo code
// @route   POST /promos/validate
export const validatePromo = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !promo) return res.status(404).json({ message: 'Invalid promo code' });

    // 1. Check if active
    if (!promo.is_active) {
      return res.status(400).json({ message: 'Promo code is no longer active' });
    }

    // 2. Check expiry
    if (new Date(promo.expiry_date) < new Date()) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    // 3. Check usage limit
    if (promo.current_usage >= promo.usage_limit) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    // 4. Check min_subtotal
    if (subtotal < (promo.min_subtotal || 0)) {
      return res.status(400).json({ message: `Minimum order of $${promo.min_subtotal} required` });
    }

    // 3. Calculate discount
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (subtotal * promo.value) / 100;
    } else {
      discount = Math.min(promo.value, subtotal);
    }

    res.json({
      valid: true,
      code: promo.code,
      discount: Number(discount.toFixed(2)),
      newSubtotal: Number((subtotal - discount).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Create promo code (admin only)
export const createPromo = async (req, res) => {
  try {
    const { code, type, value, expiry_date, usage_limit, min_subtotal } = req.body;

    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{
        code: code.toUpperCase(),
        type,
        value,
        expiry_date,
        usage_limit: usage_limit || 100,
        min_subtotal: min_subtotal || 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
