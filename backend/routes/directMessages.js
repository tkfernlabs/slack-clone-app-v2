const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get direct message conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (other_user_id) 
              other_user_id,
              u.username,
              u.display_name,
              u.avatar_url,
              u.status,
              dm.content as last_message,
              dm.created_at as last_message_at
       FROM (
         SELECT 
           CASE 
             WHEN sender_id = $1 THEN recipient_id
             ELSE sender_id
           END as other_user_id,
           content,
           created_at
         FROM direct_messages
         WHERE sender_id = $1 OR recipient_id = $1
       ) dm
       JOIN users u ON u.id = dm.other_user_id
       ORDER BY other_user_id, dm.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get direct messages with a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { limit = 50, before } = req.query;

  try {
    let query = `
      SELECT dm.*, 
             sender.username as sender_username,
             sender.display_name as sender_display_name,
             sender.avatar_url as sender_avatar_url
      FROM direct_messages dm
      JOIN users sender ON dm.sender_id = sender.id
      WHERE (dm.sender_id = $1 AND dm.recipient_id = $2)
         OR (dm.sender_id = $2 AND dm.recipient_id = $1)
    `;
    
    const params = [req.user.userId, userId];
    
    if (before) {
      query += ` AND dm.id < $3`;
      params.push(before);
    }
    
    query += ` ORDER BY dm.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json(result.rows.reverse());
  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send direct message
router.post('/',
  authenticateToken,
  [
    body('recipientId').isInt(),
    body('content').notEmpty().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content } = req.body;

    try {
      // Check if recipient exists
      const recipientCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [recipientId]
      );

      if (recipientCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Create direct message
      const result = await pool.query(
        'INSERT INTO direct_messages (sender_id, recipient_id, content) VALUES ($1, $2, $3) RETURNING *',
        [req.user.userId, recipientId, content]
      );

      const message = result.rows[0];

      // Get sender info
      const senderResult = await pool.query(
        'SELECT username, display_name, avatar_url FROM users WHERE id = $1',
        [req.user.userId]
      );

      res.status(201).json({
        ...message,
        sender_username: senderResult.rows[0].username,
        sender_display_name: senderResult.rows[0].display_name,
        sender_avatar_url: senderResult.rows[0].avatar_url
      });
    } catch (error) {
      console.error('Error sending direct message:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update direct message
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
        'SELECT * FROM direct_messages WHERE id = $1 AND sender_id = $2',
        [req.params.id, req.user.userId]
      );

      if (messageCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Cannot edit this message' });
      }

      const result = await pool.query(
        'UPDATE direct_messages SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [req.body.content, req.params.id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating direct message:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete direct message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user owns the message
    const messageCheck = await pool.query(
      'SELECT * FROM direct_messages WHERE id = $1 AND sender_id = $2',
      [req.params.id, req.user.userId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Cannot delete this message' });
    }

    await pool.query('DELETE FROM direct_messages WHERE id = $1', [req.params.id]);

    res.json({ message: 'Direct message deleted successfully' });
  } catch (error) {
    console.error('Error deleting direct message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

