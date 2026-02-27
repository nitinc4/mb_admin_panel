import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, is_active } = req.query;

    let query = supabase
      .from('pricing_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }

    if (entity_id) {
      query = query.eq('entity_id', entity_id);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Pricing config not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { entity_type, entity_id, price, billing_cycle } = req.body;

    const { data, error } = await supabase
      .from('pricing_config')
      .insert([
        {
          entity_type,
          entity_id,
          price,
          billing_cycle: billing_cycle || 'one_time',
          is_active: true,
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
    const { price, billing_cycle, is_active } = req.body;

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (price !== undefined) updateData.price = price;
    if (billing_cycle) updateData.billing_cycle = billing_cycle;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('pricing_config')
      .update(updateData)
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
      .from('pricing_config')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Pricing config deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
