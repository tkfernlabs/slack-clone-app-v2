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

    // Get reactions for all messages
    const messageIds = result.rows.map(row => row.id);
    let messagesWithReactions = result.rows;

    if (messageIds.length > 0) {
      const reactionsResult = await pool.query(
        `SELECT r.direct_message_id, r.emoji, COUNT(*) as count
         FROM reactions r
         WHERE r.direct_message_id = ANY($1)
         GROUP BY r.direct_message_id, r.emoji`,
        [messageIds]
      );

      // Group reactions by message
      const reactionsByMessage = {};
      reactionsResult.rows.forEach(r => {
        if (!reactionsByMessage[r.direct_message_id]) {
          reactionsByMessage[r.direct_message_id] = [];
        }
        reactionsByMessage[r.direct_message_id].push({
          emoji: r.emoji,
          count: parseInt(r.count)
        });
      });

      // Add reactions to messages
      messagesWithReactions = result.rows.map(msg => ({
        ...msg,
        reactions: reactionsByMessage[msg.id] || []
      }));
    }

    res.json(messagesWithReactions.reverse());
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

// Add reaction to direct message
router.post('/:id/reactions',
  authenticateToken,
  [body('emoji').notEmpty().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get direct message info including sender and recipient
      const dmResult = await pool.query(
        'SELECT sender_id, recipient_id FROM direct_messages WHERE id = $1',
        [req.params.id]
      );

      if (dmResult.rows.length === 0) {
        return res.status(404).json({ error: 'Direct message not found' });
      }

      const dm = dmResult.rows[0];
      
      // Verify user is part of this DM conversation
      if (dm.sender_id !== req.user.userId && dm.recipient_id !== req.user.userId) {
        return res.status(403).json({ error: 'Not authorized to react to this message' });
      }

      // Add reaction
      await pool.query(
        'INSERT INTO reactions (direct_message_id, user_id, emoji) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [req.params.id, req.user.userId, req.body.emoji]
      );

      // Get updated reactions for this direct message
      const reactionsResult = await pool.query(
        `SELECT r.emoji, COUNT(*) as count
         FROM reactions r
         WHERE r.direct_message_id = $1
         GROUP BY r.emoji`,
        [req.params.id]
      );

      const reactionData = {
        messageId: parseInt(req.params.id),
        isDm: true,
        senderId: dm.sender_id,
        recipientId: dm.recipient_id,
        reactions: reactionsResult.rows
      };

      // Emit WebSocket event for real-time updates to both sender and recipient
      if (req.io) {
        console.log(`Emitting dm_reaction to user_${dm.sender_id} and user_${dm.recipient_id}:`, reactionData);
        req.io.to(`user_${dm.sender_id}`).emit('dm_reaction', reactionData);
        req.io.to(`user_${dm.recipient_id}`).emit('dm_reaction', reactionData);
      }

      res.json({ message: 'Reaction added successfully', reactions: reactionsResult.rows });
    } catch (error) {
      console.error('Error adding reaction to DM:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Remove reaction from direct message
router.delete('/:id/reactions/:emoji', authenticateToken, async (req, res) => {
  try {
    // Get direct message info
    const dmResult = await pool.query(
      'SELECT sender_id, recipient_id FROM direct_messages WHERE id = $1',
      [req.params.id]
    );

    if (dmResult.rows.length === 0) {
      return res.status(404).json({ error: 'Direct message not found' });
    }

    const dm = dmResult.rows[0];

    await pool.query(
      'DELETE FROM reactions WHERE direct_message_id = $1 AND user_id = $2 AND emoji = $3',
      [req.params.id, req.user.userId, req.params.emoji]
    );

    // Get updated reactions
    const reactionsResult = await pool.query(
      `SELECT r.emoji, COUNT(*) as count
       FROM reactions r
       WHERE r.direct_message_id = $1
       GROUP BY r.emoji`,
      [req.params.id]
    );

    const reactionData = {
      messageId: parseInt(req.params.id),
      isDm: true,
      senderId: dm.sender_id,
      recipientId: dm.recipient_id,
      reactions: reactionsResult.rows
    };

    // Emit WebSocket event for real-time updates
    if (req.io) {
      req.io.to(`user_${dm.sender_id}`).emit('dm_reaction', reactionData);
      req.io.to(`user_${dm.recipient_id}`).emit('dm_reaction', reactionData);
    }

    res.json({ message: 'Reaction removed successfully', reactions: reactionsResult.rows });
  } catch (error) {
    console.error('Error removing reaction from DM:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reactions for a direct message
router.get('/:id/reactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.emoji, COUNT(*) as count, 
              array_agg(json_build_object('id', u.id, 'username', u.username, 'display_name', u.display_name)) as users
       FROM reactions r
       JOIN users u ON r.user_id = u.id
       WHERE r.direct_message_id = $1
       GROUP BY r.emoji`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching DM reactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

