const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all channels in a workspace
router.get('/workspace/:workspaceId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
              EXISTS(SELECT 1 FROM channel_members WHERE channel_id = c.id AND user_id = $2) as is_member
       FROM channels c
       WHERE c.workspace_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.workspaceId, req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create channel
router.post('/',
  authenticateToken,
  [
    body('workspaceId').isInt(),
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('isPrivate').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workspaceId, name, description, isPrivate } = req.body;

    try {
      // Check if user is member of workspace
      const memberCheck = await pool.query(
        'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, req.user.userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not a member of this workspace' });
      }

      // Create channel
      const channelResult = await pool.query(
        'INSERT INTO channels (workspace_id, name, description, is_private, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [workspaceId, name, description || null, isPrivate, req.user.userId]
      );

      const channel = channelResult.rows[0];

      // Add creator to channel
      await pool.query(
        'INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)',
        [channel.id, req.user.userId]
      );

      res.status(201).json(channel);
    } catch (error) {
      console.error('Error creating channel:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get channel by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM channels WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join channel
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const channel = await pool.query(
      'SELECT * FROM channels WHERE id = $1',
      [req.params.id]
    );

    if (channel.rows.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if channel is private
    if (channel.rows[0].is_private) {
      return res.status(403).json({ error: 'Cannot join private channel without invitation' });
    }

    // Add user to channel
    await pool.query(
      'INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2) ON CONFLICT (channel_id, user_id) DO NOTHING',
      [req.params.id, req.user.userId]
    );

    res.json({ message: 'Joined channel successfully' });
  } catch (error) {
    console.error('Error joining channel:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave channel
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    res.json({ message: 'Left channel successfully' });
  } catch (error) {
    console.error('Error leaving channel:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get channel members
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, cm.joined_at
       FROM users u
       JOIN channel_members cm ON u.id = cm.user_id
       WHERE cm.channel_id = $1
       ORDER BY cm.joined_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching channel members:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

