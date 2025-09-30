# CRITICAL ISSUES TO FIX

**Last Updated**: January 30, 2025
**Status**: 🚨 IN PROGRESS - 3 issues to fix

---

## Issue 1: Direct Messages (DMs) Support Missing 🚨 HIGH PRIORITY
**Severity**: HIGH - Core feature missing
**Status**: 🚧 NOT FIXED - Needs implementation
**Added**: January 30, 2025

### Description
The application currently lacks direct message (1-on-1) functionality. Users should be able to send private messages to other users outside of channels.

### Required Implementation

#### Backend Requirements
- [ ] Create/verify `direct_messages` table in database
- [ ] GET `/api/users` - List all users (for DM recipient selection)
- [ ] GET `/api/direct-messages/conversations` - List all DM conversations
- [ ] GET `/api/direct-messages/user/:userId` - Get messages with specific user
- [ ] POST `/api/direct-messages` - Send message to user
- [ ] WebSocket: `send_direct_message` event handler for real-time delivery

#### Frontend Requirements
- [ ] DirectMessageView component - Display DM conversation
- [ ] DirectMessageList component - Show list of conversations
- [ ] User selection modal for starting new DMs
- [ ] Integration into Workspace component
- [ ] Real-time message updates via WebSocket
- [ ] CSS styling for DM interface

### Expected Behavior
- Users can click "DMs" button to switch to direct messages view
- Click "+" or "New DM" to see list of all users
- Search/select user to start conversation
- Send messages in real-time
- Receive messages via WebSocket instantly
- See list of all active conversations

### Priority
**HIGH** - Critical feature for chat application

---

## Issue 2: Emoji Reactions - Button Not Visible 🐛 HIGH PRIORITY
**Severity**: HIGH - Feature exists but UI is not visible
**Status**: 🚧 IN PROGRESS - Investigation complete
**Added**: January 30, 2025

### Investigation Findings
✅ Backend WebSocket emission: WORKING (line 238 in messages.js)
✅ Frontend WebSocket listener: WORKING (line 24 in ChannelView.jsx)
✅ Message component has reaction button: EXISTS (line 87-92 in Message.jsx)
❌ UI Issue: Reaction button (😊) not visible in the UI

### Root Cause
The `.message-actions` div containing the reaction button exists in the Message component but is NOT VISIBLE in the rendered page. This could be due to:
1. CSS display/visibility issue
2. Z-index/positioning problem
3. Component not rendering the actions div
4. CSS being overridden

### Required Fix

#### Investigation Needed
- [ ] Check if `.message-actions` div is actually rendered in DOM (use browser inspector)
- [ ] Check computed CSS for `.btn-reaction` button
- [ ] Verify if there's CSS hiding the actions on initial render
- [ ] Check if hover state is required to show actions

#### Potential Fixes
- [ ] Add CSS to make `.message-actions` visible by default OR on hover
- [ ] Ensure z-index is correct for `.message-actions`
- [ ] Add `display: flex` or `display: block` to `.message-actions`
- [ ] Test if opacity or visibility is hiding the button

### Expected Behavior (After Fix)
- User sees 😊 button below each message (or on hover)
- User clicks button → emoji picker appears with common emojis
- User selects emoji → API call succeeds
- WebSocket broadcasts to all channel members
- Reaction appears instantly for all users WITHOUT page refresh

### Priority
**HIGH** - WebSocket functionality is already working, just need to make UI visible

---

## Issue 3: Workspace Creation Fails in Frontend 🚨 HIGH PRIORITY
**Severity**: HIGH - Core functionality broken
**Status**: 🚧 NOT FIXED - Needs investigation and fix
**Added**: January 30, 2025

### Description
Creating a new workspace fails in the frontend. Need to investigate whether:
1. The API endpoint works correctly
2. The frontend properly calls the API
3. Error handling is working
4. UI updates after successful creation

### Investigation Needed
- [ ] Test workspace creation API endpoint directly
- [ ] Check frontend form submission code
- [ ] Review error handling and validation
- [ ] Verify database schema supports workspace creation
- [ ] Test end-to-end flow

### Expected Behavior
- User clicks "Create Workspace" button
- Modal opens with form
- User enters workspace name
- Form submits successfully
- New workspace appears in sidebar
- User is redirected to new workspace

### Priority
**HIGH** - Core functionality must work

---

## TRACKING SUMMARY

### Total Issues: 3
- ✅ Fixed: 0
- 🚧 In Progress: 3 (Direct Messages, Emoji Reactions, Workspace Creation)
- 🚨 Blocked: 0

### Work To Do
1. 🚧 Implement direct messages backend and frontend
2. 🚧 Fix emoji reactions real-time broadcast
3. 🚧 Fix workspace creation functionality
4. Test all fixes thoroughly
5. Commit and push to GitHub

---

## Notes
- Previous "fixed" issues cleared as user confirmed they are NOT actually fixed
- Must address ALL issues before terminating
- Will add any new issues discovered during development

