import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_tiers (
          id,
          name,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_tiers (
          id,
          name,
          price
        )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, is_active } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          full_name,
          phone: phone || '',
          fcm_token: fcm_token || '',
          tier_id: tier_id || null,
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, is_active } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        full_name,
        phone,
        fcm_token,
        tier_id,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
