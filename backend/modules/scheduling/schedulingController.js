import { supabase } from '../../config/supabase.js';

// @desc    Get driver's own shifts
// @route   GET /scheduling/shifts
// @access  Private/Driver
export const getMyShifts = async (req, res) => {
  try {
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', req.user.id).single();
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    const { data, error } = await supabase
      .from('driver_shifts')
      .select('*')
      .eq('driver_id', driver.id)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a shift
// @route   POST /scheduling/shifts
// @access  Private/Driver
export const createShift = async (req, res) => {
  try {
    const { date, start_time, end_time } = req.body;
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', req.user.id).single();
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

    // TODO: Add overlap validation logic here

    const { data, error } = await supabase
      .from('driver_shifts')
      .insert([{ driver_id: driver.id, date, start_time, end_time }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a shift
// @route   DELETE /scheduling/shifts/:id
// @access  Private/Driver
export const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: driver } = await supabase.from('drivers').select('id').eq('user_id', req.user.id).single();
    
    const { error } = await supabase
      .from('driver_shifts')
      .delete()
      .eq('id', id)
      .eq('driver_id', driver.id);

    if (error) throw error;
    res.json({ message: 'Shift removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all shifts for Admin
// @route   GET /scheduling/admin/all
// @access  Private/Admin
export const getAllShifts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('driver_shifts')
      .select('*, drivers(users(name))')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
