import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function cleanup() {
  console.log('--- Starting Data Cleanup & Image Refinement ---');

  // 1. Delete MINI-FPL
  console.log('Deleting MINI-FPL store...');
  const { error: deleteError } = await supabase
    .from('stores')
    .delete()
    .eq('name', 'MINI-FPL');

  if (deleteError) {
    console.error('Error deleting MINI-FPL:', deleteError);
  } else {
    console.log('Successfully deleted MINI-FPL.');
  }

  // 2. Update Store Images (Note: We use type-based logic in frontend, but we can also set specific images if we have a field)
  // Since the schema doesn't have a 'image' column for stores (we check schema.sql), 
  // and the frontend currently uses type-based mock images, we should check if we can add an image column 
  // or just rely on the frontend changes we already made.
  // Wait, looking at StorePage.tsx, it uses type-based images:
  // src={`https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=1200&auto=format&fit=crop`}
  
  // I should update the StorePage.tsx to use better images based on name OR add an image column to stores.
  // Let's add an 'image_url' column to 'stores' table first if possible, or just hardcode better logic in frontend.
  // Hardcoding in frontend for these specific stores is easier and faster for the user.

  // 3. Update Product Images
  const productUpdates = [
    { name: 'Margherita Pizza', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80&auto=format&fit=crop' },
    { name: 'Garlic Bread', image: 'https://images.unsplash.com/photo-1573140247632-f8fd73958322?w=600&q=80&auto=format&fit=crop' },
    { name: 'Extra Cheese', image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=600&q=80&auto=format&fit=crop' },
    { name: 'Green Tea Ice Cream', image: 'https://images.unsplash.com/photo-1505394033aa2-4573b6424451?w=600&q=80&auto=format&fit=crop' },
    { name: 'Spicy Mayo', image: 'https://images.unsplash.com/photo-1544333346-64e39ec2f81c?w=600&q=80&auto=format&fit=crop' },
    { name: 'Whole Milk', image: 'https://images.unsplash.com/photo-1550583724-125581cc2586?w=600&q=80&auto=format&fit=crop' },
    { name: 'Sourdough Loaf', image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&q=80&auto=format&fit=crop' },
    { name: 'Cage-Free Eggs', image: 'https://images.unsplash.com/photo-1582722872445-44ad5c78f882?w=600&q=80&auto=format&fit=crop' },
    { name: 'Paper Bag', image: 'https://images.unsplash.com/photo-1530587191167-7344e1b4b1ed?w=600&q=80&auto=format&fit=crop' },
    { name: 'Cooling Gel Pack', image: 'https://images.unsplash.com/photo-1590483734724-38817540c131?w=600&q=80&auto=format&fit=crop' }
  ];

  console.log('Updating product images...');
  for (const update of productUpdates) {
    const { error } = await supabase
      .from('products')
      .update({ image: update.image })
      .eq('name', update.name);
    
    if (error) {
      console.error(`Error updating ${update.name}:`, error);
    } else {
      console.log(`Updated image for ${update.name}`);
    }
  }

  console.log('--- Cleanup Completed ---');
}

cleanup();
