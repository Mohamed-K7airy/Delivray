import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const AHMED_ID = '309a755e-7a22-4e89-b3a8-d05aeba46437';

async function seed() {
  console.log('--- Starting Database Seeding for Ahmed ---');

  // Since we cannot run ALTER TABLE directly from supabase-js, 
  // we will try to insert a product with a category and see if it fails.
  // If we can't add the column, we'll use the description or name as a fallback.
  // BUT the best way is to ask the user to run the SQL or try to do it via RPC if available.
  
  // For now, let's create the stores first.
  const stores = [
    { name: 'La Bella Italia', type: 'Restaurant', owner_id: AHMED_ID },
    { name: 'Sushi Zen', type: 'Restaurant', owner_id: AHMED_ID },
    { name: 'FreshMart', type: 'Supermarket', owner_id: AHMED_ID },
    { name: 'Daily Bread', type: 'Bakery', owner_id: AHMED_ID },
    { name: 'Sweet Tooth', type: 'Pastry Shop', owner_id: AHMED_ID },
    { name: 'Bean & Brew', type: 'Coffee Shop', owner_id: AHMED_ID },
  ];

  console.log('Creating stores...');
  const { data: createdStores, error: storeError } = await supabase
    .from('stores')
    .insert(stores)
    .select();

  if (storeError) {
    console.error('Error creating stores:', storeError);
    return;
  }

  console.log(`Created ${createdStores.length} stores.`);

  const productsData = {
    'La Bella Italia': [
      { name: 'Margherita Pizza', price: 120.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38', description: 'Classic mozzarella, tomato sauce, and fresh basil.' },
      { name: 'Lasagna', price: 150.00, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', description: 'Layers of pasta, bolognese sauce, and béchamel.' },
      { name: 'Spaghetti Carbonara', price: 140.00, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3', description: 'Creamy sauce with guanciale and pecorino romano.' },
      { name: 'Tiramisu', price: 85.00, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', description: 'Coffee-soaked ladyfingers with mascarpone cream.' },
      { name: 'Garlic Bread', price: 45.00, image: 'https://images.unsplash.com/photo-1573140247632-f8fd73958322', description: 'Toasted baguette with garlic butter and herbs.' },
      { name: 'Extra Cheese', price: 25.00, image: 'https://images.unsplash.com/photo-1486297678162-ad2a19b05830', description: 'Addition', is_addition: true },
      { name: 'Marinara Sauce', price: 15.00, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d', description: 'Addition', is_addition: true },
    ],
    'Sushi Zen': [
      { name: 'Salmon Nigiri', price: 180.00, image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a', description: 'Fresh salmon over seasoned rice.' },
      { name: 'California Roll', price: 120.00, image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6', description: 'Crab, avocado, and cucumber.' },
      { name: 'Miso Soup', price: 45.00, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd', description: 'Traditional Japanese miso soup with tofu.' },
      { name: 'Tempura Shrimp', price: 110.00, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6', description: 'Crispy fried shrimp with tempura dipping sauce.' },
      { name: 'Green Tea Ice Cream', price: 65.00, image: 'https://images.unsplash.com/photo-1505394033aa2-4573b6424451', description: 'Refreshing matcha flavored ice cream.' },
      { name: 'Extra Ginger', price: 15.00, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', description: 'Addition', is_addition: true },
      { name: 'Spicy Mayo', price: 15.00, image: 'https://images.unsplash.com/photo-1544333346-64e39ec2f81c', description: 'Addition', is_addition: true },
    ],
    'FreshMart': [
      { name: 'Organic Bananas', price: 35.00, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224', description: 'A bundle of fresh organic bananas.' },
      { name: 'Whole Milk', price: 45.00, image: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b', description: 'Fresh farm whole milk.' },
      { name: 'Sourdough Loaf', price: 55.00, image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb', description: 'Artisan sourdough bread.' },
      { name: 'Cage-Free Eggs', price: 85.00, image: 'https://images.unsplash.com/photo-1582722872445-44ad5c78f882', description: 'One dozen cage-free brown eggs.' },
      { name: 'Greek Yogurt', price: 75.00, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777', description: 'Thick and creamy plain Greek yogurt.' },
      { name: 'Paper Bag', price: 5.00, image: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b', description: 'Addition', is_addition: true },
      { name: 'Cooling Gel Pack', price: 25.00, image: 'https://images.unsplash.com/photo-1563636619-e910ef2a844b', description: 'Addition', is_addition: true },
    ],
    'Daily Bread': [
      { name: 'Butter Croissant', price: 45.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', description: 'Flaky, buttery French croissant.' },
      { name: 'Chocolate Muffin', price: 55.00, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35', description: 'Moist muffin with dark chocolate chips.' },
      { name: 'Baguette', price: 35.00, image: 'https://images.unsplash.com/photo-1597079910443-60c43fc4f729', description: 'Classic French baguette with a crusty exterior.' },
      { name: 'Cinnamon Roll', price: 65.00, image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812', description: 'Soft roll with cinnamon and sugar glaze.' },
      { name: 'Cheesecake Slice', price: 85.00, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad', description: 'Rich and creamy New York style cheesecake.' },
      { name: 'Extra Jam', price: 15.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', description: 'Addition', is_addition: true },
      { name: 'Clotted Cream', price: 25.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', description: 'Addition', is_addition: true },
    ],
    'Sweet Tooth': [
      { name: 'Macaron Box 6pcs', price: 180.00, image: 'https://images.unsplash.com/photo-1569864358642-9d1619702661', description: 'Assorted flavors of French macarons.' },
      { name: 'Red Velvet Cupcake', price: 65.00, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', description: 'Classic red velvet with cream cheese frosting.' },
      { name: 'Fruit Tart', price: 85.00, image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13', description: 'Shortcrust pastry with custard and fresh fruit.' },
      { name: 'Éclair', price: 75.00, image: 'https://images.unsplash.com/photo-1511520668407-75f85057f893', description: 'Pastry filled with cream and topped with chocolate.' },
      { name: 'Brownie Delight', price: 55.00, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e', description: 'Fudgy chocolate brownie with walnuts.' },
      { name: 'Birthday Candle', price: 10.00, image: 'https://images.unsplash.com/photo-1569864358642-9d1619702661', description: 'Addition', is_addition: true },
      { name: 'Greeting Card', price: 35.00, image: 'https://images.unsplash.com/photo-1569864358642-9d1619702661', description: 'Addition', is_addition: true },
    ],
    'Bean & Brew': [
      { name: 'Caramel Macchiato', price: 85.00, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2', description: 'Espresso with steamed milk and caramel.' },
      { name: 'Flat White', price: 65.00, image: 'https://images.unsplash.com/photo-1574457547512-5b1646994eea', description: 'Smooth espresso with velvety microfoam.' },
      { name: 'Cold Brew', price: 75.00, image: 'https://images.unsplash.com/photo-1517701604599-bb24b580ad74', description: 'Steeped for 24 hours for a smooth finish.' },
      { name: 'Avocado Toast', price: 140.00, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8', description: 'Toasted sourdough with avocado and poached egg.' },
      { name: 'Lemon Loaf', price: 55.00, image: 'https://images.unsplash.com/photo-1519869325930-281384150729', description: 'Sweet zesty lemon cake slice.' },
      { name: 'Oat Milk', price: 15.00, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2', description: 'Addition', is_addition: true },
      { name: 'Extra Shot Espresso', price: 25.00, image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2', description: 'Addition', is_addition: true },
    ],
  };

  const allProducts = [];
  for (const store of createdStores) {
    const products = productsData[store.name] || [];
    for (const p of products) {
      allProducts.push({
        ...p,
        store_id: store.id,
        // If we can't use 'category' column, we will use 'description' to store category-like info
        // and later update the frontend to check description.
        description: p.is_addition ? `[Addition] ${p.description}` : p.description,
      });
    }
  }

  // Remove the temporary is_addition flag before inserting
  const finalProducts = allProducts.map(({ is_addition, ...rest }) => rest);

  console.log('Inserting products...');
  const { error: productError } = await supabase
    .from('products')
    .insert(finalProducts);

  if (productError) {
    console.error('Error inserting products:', productError);
  } else {
    console.log(`Inserted ${finalProducts.length} products total.`);
  }

  console.log('--- Seeding Completed ---');
}

seed();
