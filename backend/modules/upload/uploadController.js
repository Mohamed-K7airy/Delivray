import { supabase } from '../../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Upload file to Supabase Storage
// @route   POST /upload
// @access  Private (Merchant/Admin)
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { folder = 'general' } = req.body;
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('delivray') // Assumes bucket named 'delivray'
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      
      // Additional debugging: list existing buckets
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketNames = buckets?.map(b => b.name).join(', ') || 'none';
      console.log(`[Debug] Available buckets in Supabase: ${bucketNames}`);

      return res.status(500).json({ 
        message: `Storage error: ${error.message} (Available buckets: ${bucketNames})` 
      });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('delivray')
      .getPublicUrl(fileName);

    res.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      path: fileName
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
