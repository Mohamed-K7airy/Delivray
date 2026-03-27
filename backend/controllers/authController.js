import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const generateToken = (res, userId, role) => {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is missing in production environment');
  }
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'dev_secret_only', {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

// @desc    Register a new user (Customer, Merchant, Driver)
// @route   POST /auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, phone, password, role, email, store_name, store_type, location, vehicle_type } = req.body;

  try {
    // 1. Check if user exists
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (userExists) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Determine status
    const status = (role === 'customer' || role === 'admin') ? 'active' : 'pending';

    // 4. Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ name, phone, email, password: hashedPassword, role, status }])
      .select()
      .single();

    if (userError) throw userError;

    // 5. Handle Role Specific data
    if (role === 'merchant') {
      const { error: storeError } = await supabase
        .from('stores')
        .insert([{ 
          owner_id: user.id, 
          name: store_name, 
          type: store_type,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null
        }]);
      if (storeError) throw storeError;
    } else if (role === 'driver') {
      const { error: driverError } = await supabase
        .from('drivers')
        .insert([{ 
          user_id: user.id, 
          vehicle_type,
          is_available: false
        }]);
      if (driverError) throw driverError;
    }

    // 6. Return response
    if (status === 'active') {
      generateToken(res, user.id, user.role);
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      message: status === 'active' ? 'Registration successful' : 'Registration successful, pending admin approval',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account is banned' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Account is pending admin approval' });
    }

    const token = generateToken(res, user.id, user.role);

    let store_id = null;
    if (user.role === 'merchant') {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).maybeSingle();
      store_id = store?.id;
    }

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      store_id,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, email, role, status')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
