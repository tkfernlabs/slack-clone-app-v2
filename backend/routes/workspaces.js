const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all workspaces for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, wm.role 
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE wm.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create workspace
router.post('/',
  authenticateToken,
  [
    body('name').notEmpty().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    
    // Auto-generate slug from name if not provided
    let slug = req.body.slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      // Check if slug already exists and make it unique if needed
      let finalSlug = slug;
      let slugExists = await pool.query(
        'SELECT * FROM workspaces WHERE slug = $1',
        [finalSlug]
      );
      
      let counter = 1;
      while (slugExists.rows.length > 0) {
        finalSlug = `${slug}-${counter}`;
        slugExists = await pool.query(
          'SELECT * FROM workspaces WHERE slug = $1',
          [finalSlug]
        );
        counter++;
      }

      // Create workspace
      const workspaceResult = await pool.query(
        'INSERT INTO workspaces (name, slug, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, finalSlug, description || null, req.user.userId]
      );

      const workspace = workspaceResult.rows[0];

      // Add creator as admin member
      await pool.query(
        'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)',
        [workspace.id, req.user.userId, 'admin']
      );

      // Create default general channel
      const channelResult = await pool.query(
        'INSERT INTO channels (workspace_id, name, description, is_private, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [workspace.id, 'general', 'General discussion channel', false, req.user.userId]
      );

      const channel = channelResult.rows[0];

      // Add creator to general channel
      await pool.query(
        'INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)',
        [channel.id, req.user.userId]
      );

      res.status(201).json({
        workspace,
        defaultChannel: channel
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get workspace by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.*, wm.role 
       FROM workspaces w
       JOIN workspace_members wm ON w.id = wm.workspace_id
       WHERE w.id = $1 AND wm.user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workspace members
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, wm.role, wm.joined_at
       FROM users u
       JOIN workspace_members wm ON u.id = wm.user_id
       WHERE wm.workspace_id = $1
       ORDER BY wm.joined_at ASC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite user to workspace
router.post('/:id/invite',
  authenticateToken,
  [body('userId').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if requester is admin
      const adminCheck = await pool.query(
        'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2 AND role = $3',
        [req.params.id, req.user.userId, 'admin']
      );

      if (adminCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Only admins can invite users' });
      }

      // Add user to workspace
      await pool.query(
        'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (workspace_id, user_id) DO NOTHING',
        [req.params.id, req.body.userId, 'member']
      );

      res.json({ message: 'User invited successfully' });
    } catch (error) {
      console.error('Error inviting user:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all channels in a workspace
router.get('/:id/channels', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
              EXISTS(SELECT 1 FROM channel_members WHERE channel_id = c.id AND user_id = $2) as is_member
       FROM channels c
       WHERE c.workspace_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id, req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create channel in workspace
router.post('/:id/channels',
  authenticateToken,
  [
    body('name').notEmpty().trim(),
    body('description').optional().trim(),
    body('isPrivate').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPrivate } = req.body;
    const workspaceId = req.params.id;

    try {
      // Check if user is member of workspace
      const memberCheck = await pool.query(
        'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, req.user.userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You must be a member of the workspace' });
      }

      // Create channel
      const channelResult = await pool.query(
        'INSERT INTO channels (workspace_id, name, description, is_private, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [workspaceId, name, description, isPrivate || false, req.user.userId]
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

module.exports = router;

