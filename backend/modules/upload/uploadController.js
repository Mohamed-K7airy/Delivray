import { supabase } from '../../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Upload file to Supabase Storage
// @route   POST /upload
// @access  Private (Merchant/Admin)
// Helper for unified upload logic
const handleUpload = async (req, res, folder) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('delivray-images') // User specifically requested 'delivray-images' bucket
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      return res.status(500).json({ message: `Storage error: ${error.message}` });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('delivray-images')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl, path: fileName });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const uploadStoreImage = (req, res) => handleUpload(req, res, 'stores');
export const uploadProductImage = (req, res) => handleUpload(req, res, 'products');
export const uploadProfileImage = (req, res) => handleUpload(req, res, 'profiles');
export const uploadFile = (req, res) => handleUpload(req, res, 'general');
