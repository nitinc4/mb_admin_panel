import express from 'express';
import ContentItem from '../models/ContentItem.js';

const router = express.Router();

router.get('/batch/:batchId', async (req, res) => {
  try {
    const data = await ContentItem.find({ batch: req.params.batchId })
      .sort({ orderIndex: 1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await ContentItem.findById(req.params.id);

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
      batch_id, title, description, content_type, file_url,
      duration, file_size, order_index, is_published,
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

    const data = await ContentItem.create({
      batch: batch_id,
      title,
      description: description || '',
      contentType: content_type,
      fileUrl: finalFileUrl,
      duration: duration || 0,
      fileSize: file_size || 0,
      orderIndex: order_index !== undefined ? order_index : 0,
      isPublished: is_published !== undefined ? is_published : true,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      title, description, content_type, file_url, duration,
      file_size, order_index, is_published,
    } = req.body;

    const data = await ContentItem.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        contentType: content_type,
        fileUrl: file_url,
        duration,
        fileSize: file_size,
        orderIndex: order_index,
        isPublished: is_published,
      },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await ContentItem.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/stream-url', async (req, res) => {
  try {
    const content = await ContentItem.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }

    const streamUrl = content.fileUrl;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      data: {
        stream_url: streamUrl,
        expires_at: expiresAt.toISOString(),
        content_type: content.contentType,
        duration: content.duration,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;