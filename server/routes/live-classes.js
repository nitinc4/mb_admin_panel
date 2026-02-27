import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('live_classes')
      .select(`
        *,
        batches (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
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
      .from('live_classes')
      .select(`
        *,
        batches (
          id,
          name,
          description
        )
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Live class not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { batch_id, title, scheduled_at, duration } = req.body;

    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('name')
      .eq('id', batch_id)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const meetingId = `MantrikaBrahma_${batch.name.replace(/\s+/g, '_')}_${Date.now()}`;
    const meetingUrl = `https://meet.jit.si/${meetingId}`;

    const { data, error } = await supabase
      .from('live_classes')
      .insert([
        {
          batch_id,
          title: title || `Live Class - ${batch.name}`,
          meeting_url: meetingUrl,
          meeting_id: meetingId,
          scheduled_at: scheduled_at || null,
          duration: duration || 60,
          status: 'scheduled',
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

router.post('/:id/start', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('live_classes')
      .update({
        status: 'live',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Live class started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/end', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('live_classes')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Live class ended' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, scheduled_at, duration, is_active } = req.body;

    const { data, error } = await supabase
      .from('live_classes')
      .update({
        title,
        scheduled_at,
        duration,
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
      .from('live_classes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Live class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
