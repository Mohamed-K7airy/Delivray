import { supabase } from '../../config/supabase.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product_images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product_images')
      .getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
