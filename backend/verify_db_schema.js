import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('orders')
    .select('confirmation_code, driver_signal')
    .limit(1);

  if (error) {
    if (error.message.includes('column "confirmation_code" does not exist')) {
      console.error("ERROR: confirmation_code column is missing!");
    } else if (error.message.includes('column "driver_signal" does not exist')) {
      console.error("ERROR: driver_signal column is missing!");
    } else {
      console.error("Database Error:", error.message);
    }
  } else {
    console.log("Success: Columns exist in 'orders' table.");
  }
}

checkSchema();
