const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get messages for a channel
router.get('/channel/:channelId', authenticateToken, async (req, res) => {
  const { channelId } = req.params;
  const { limit = 50, before } = req.query;

  try {
    // Check if user is member of channel
    const memberCheck = await pool.query(
      'SELECT * FROM channel_members WHERE channel_id = $1 AND user_id = $2',
      [channelId, req.user.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this channel' });
    }

    let query = `
      SELECT m.*, u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM messages WHERE thread_id = m.id) as reply_count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.channel_id = $1 AND m.thread_id IS NULL
    `;
    
    const params = [channelId];
    
    if (before) {
      query += ` AND m.id < $2`;
      params.push(before);
    }
    
    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create message
router.post('/',
  authenticateToken,
  [
    body('channelId').isInt(),
    body('content').notEmpty().trim(),
    body('threadId').optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { channelId, content, threadId } = req.body;

    try {
      // Check if user is member of channel
      const memberCheck = await pool.query(
        'SELECT * FROM channel_members WHERE channel_id = $1 AND user_id = $2',
        [channelId, req.user.userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not a member of this channel' });
      }

      // Create message
      const result = await pool.query(
        'INSERT INTO messages (channel_id, user_id, content, thread_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [channelId, req.user.userId, content, threadId || null]
      );

      const message = result.rows[0];

      // Get user info
      const userResult = await pool.query(
        'SELECT username, display_name, avatar_url FROM users WHERE id = $1',
        [req.user.userId]
      );

      res.status(201).json({
        ...message,
        ...userResult.rows[0]
      });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get thread messages
router.get('/thread/:messageId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.username, u.display_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.messageId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update message
router.put('/:id',
  authenticateToken,
  [body('content').notEmpty().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user owns the message
      const messageCheck = await pool.query(
        'SELECT * FROM messages WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.userId]
      );

      if (messageCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Cannot edit this message' });
      }

      const result = await pool.query(
        'UPDATE messages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [req.body.content, req.params.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user owns the message
    const messageCheck = await pool.query(
      'SELECT * FROM messages WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Cannot delete this message' });
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add reaction to message
router.post('/:id/reactions',
  authenticateToken,
  [body('emoji').notEmpty().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await pool.query(
        'INSERT INTO reactions (message_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT (message_id, user_id, emoji) DO NOTHING',
        [req.params.id, req.user.userId, req.body.emoji]
      );

      res.json({ message: 'Reaction added successfully' });
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Remove reaction from message
router.delete('/:id/reactions/:emoji', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3',
      [req.params.id, req.user.userId, req.params.emoji]
    );

    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reactions for a message
router.get('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.emoji, COUNT(*) as count, 
              array_agg(json_build_object('id', u.id, 'username', u.username, 'display_name', u.display_name)) as users
       FROM reactions r
       JOIN users u ON r.user_id = u.id
       WHERE r.message_id = $1
       GROUP BY r.emoji`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

