import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.get('/batch/:batchId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('batch_id', req.params.batchId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      batch_id,
      title,
      description,
      content_type,
      file_url,
      duration,
      file_size,
      order_index,
      is_published,
    } = req.body;

    let finalFileUrl = file_url;

    if (!file_url) {
      const timestamp = Date.now();
      const sanitizedTitle = title.toLowerCase().replace(/\s+/g, '_');

      if (content_type === 'video') {
        finalFileUrl = `https://stream.example.com/videos/${batch_id}/${sanitizedTitle}_${timestamp}.m3u8`;
      } else if (content_type === 'pdf') {
        finalFileUrl = `https://cdn.example.com/pdfs/${batch_id}/${sanitizedTitle}_${timestamp}.pdf`;
      }
    }

    const { data, error } = await supabase
      .from('content_items')
      .insert([
        {
          batch_id,
          title,
          description: description || '',
          content_type,
          file_url: finalFileUrl,
          duration: duration || 0,
          file_size: file_size || 0,
          order_index: order_index !== undefined ? order_index : 0,
          is_published: is_published !== undefined ? is_published : true,
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
    const {
      title,
      description,
      content_type,
      file_url,
      duration,
      file_size,
      order_index,
      is_published,
    } = req.body;

    const { data, error } = await supabase
      .from('content_items')
      .update({
        title,
        description,
        content_type,
        file_url,
        duration,
        file_size,
        order_index,
        is_published,
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
      .from('content_items')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/stream-url', async (req, res) => {
  try {
    const { data: content, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const streamUrl = content.file_url;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        stream_url: streamUrl,
        expires_at: expiresAt.toISOString(),
        content_type: content.content_type,
        duration: content.duration,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
