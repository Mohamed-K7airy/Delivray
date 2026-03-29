import { supabase } from './config/supabase.js';

async function initStorage() {
  console.log('--- Initializing Storage Protocol ---');
  
  const bucketName = 'delivray-images';

  // 1. Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Failed to list buckets:', listError.message);
    process.exit(1);
  }

  const exists = buckets.find(b => b.name === bucketName);

  if (exists) {
    console.log(`Bucket '${bucketName}' already online.`);
  } else {
    console.log(`Bucket '${bucketName}' not found. Attempting creation...`);
    
    // 2. Create bucket (public: true)
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    });

    if (createError) {
      console.error('Creation failed:', createError.message);
      console.log('NOTE: You may need to create the bucket manually in the Supabase Dashboard if the key permissions are insufficient.');
      process.exit(1);
    }
    
    console.log(`Bucket '${bucketName}' successfully initialized.`);
  }

  process.exit(0);
}

initStorage();
