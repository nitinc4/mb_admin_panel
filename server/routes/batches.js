import express from 'express';
 

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: batches, error: batchesError } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (batchesError) throw batchesError;

    const batchesWithTiers = await Promise.all(
      batches.map(async (batch) => {
        const { data: tierAccess } = await supabase
          .from('batch_tier_access')
          .select(`
            user_tiers (
              id,
              name
            )
          `)
          .eq('batch_id', batch.id);

        const { data: contentCount } = await supabase
          .from('content_items')
          .select('id', { count: 'exact', head: true })
          .eq('batch_id', batch.id);

        return {
          ...batch,
          allowed_tiers: tierAccess?.map((ta) => ta.user_tiers) || [],
          content_count: contentCount || 0,
        };
      })
    );

    res.json({ success: true, data: batchesWithTiers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (batchError) throw batchError;
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const { data: tierAccess } = await supabase
      .from('batch_tier_access')
      .select(`
        user_tiers (
          id,
          name
        )
      `)
      .eq('batch_id', batch.id);

    const { data: content } = await supabase
      .from('content_items')
      .select('*')
      .eq('batch_id', batch.id)
      .order('order_index', { ascending: true });

    res.json({
      success: true,
      data: {
        ...batch,
        allowed_tiers: tierAccess?.map((ta) => ta.user_tiers) || [],
        content_items: content || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, start_date, end_date, is_active, tier_ids } = req.body;

    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .insert([
        {
          name,
          description: description || '',
          start_date: start_date || null,
          end_date: end_date || null,
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (batchError) throw batchError;

    if (tier_ids && tier_ids.length > 0) {
      const tierAccessRecords = tier_ids.map((tier_id) => ({
        batch_id: batch.id,
        tier_id,
      }));

      const { error: tierError } = await supabase
        .from('batch_tier_access')
        .insert(tierAccessRecords);

      if (tierError) throw tierError;
    }

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, start_date, end_date, is_active, tier_ids } = req.body;

    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .update({
        name,
        description,
        start_date,
        end_date,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (batchError) throw batchError;

    await supabase
      .from('batch_tier_access')
      .delete()
      .eq('batch_id', req.params.id);

    if (tier_ids && tier_ids.length > 0) {
      const tierAccessRecords = tier_ids.map((tier_id) => ({
        batch_id: req.params.id,
        tier_id,
      }));

      const { error: tierError } = await supabase
        .from('batch_tier_access')
        .insert(tierAccessRecords);

      if (tierError) throw tierError;
    }

    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
