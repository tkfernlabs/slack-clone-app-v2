# Testing Checklist

**Application URLs**:
- Frontend: https://frontend-app-morphvm-q7b1njcb.http.cloud.morph.so
- Backend: https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so

**Test Credentials**:
- Username: `johnsmith`
- Password: `password123`

---

## ✅ Issue 1: Emoji Reactions Fix

### Test Steps
1. [ ] Navigate to https://frontend-app-morphvm-q7b1njcb.http.cloud.morph.so
2. [ ] Login with test credentials (johnsmith / password123)
3. [ ] Select a workspace from the sidebar
4. [ ] Select a channel with existing messages
5. [ ] Click the 😊 button on any message
6. [ ] Select an emoji from the picker (e.g., 👍)
7. [ ] **VERIFY**: Emoji appears immediately below the message without refresh
8. [ ] Open the same channel in a second browser/incognito window
9. [ ] Add a reaction from the first window
10. [ ] **VERIFY**: Reaction appears instantly in the second window
11. [ ] Add another reaction (different emoji) to the same message
12. [ ] **VERIFY**: Both reactions display with correct counts

### Expected Results
- ✅ Reactions appear instantly without page refresh
- ✅ All users in the channel see reactions in real-time
- ✅ Multiple reactions can be added to same message
- ✅ Reaction counts increment correctly
- ✅ No console errors related to reactions

---

## ✅ Issue 2: Direct Messages Implementation

### Test Steps - View Toggle
1. [ ] Login to the application
2. [ ] **VERIFY**: See "Channels" and "DMs" buttons in the header
3. [ ] Click "DMs" button
4. [ ] **VERIFY**: Left sidebar shows DirectMessageList component
5. [ ] **VERIFY**: No JavaScript errors in console
6. [ ] Click "Channels" button
7. [ ] **VERIFY**: Returns to normal channel view

### Test Steps - Starting a New DM
1. [ ] Click "DMs" button in header
2. [ ] Click the "+" button in DirectMessageList
3. [ ] **VERIFY**: User search modal appears
4. [ ] **VERIFY**: Can see list of other users (not yourself)
5. [ ] Type a name in the search box
6. [ ] **VERIFY**: User list filters as you type
7. [ ] Click on a user from the list
8. [ ] **VERIFY**: Modal closes
9. [ ] **VERIFY**: DirectMessageView opens for that user
10. [ ] **VERIFY**: User's name and avatar appear in header
11. [ ] **VERIFY**: See "Start your conversation with [user]" empty state

### Test Steps - Sending DMs
1. [ ] In an open DM conversation, type a message
2. [ ] Click "Send" button
3. [ ] **VERIFY**: Message appears immediately in the conversation
4. [ ] **VERIFY**: Message shows your name and timestamp
5. [ ] Open a second browser/incognito window
6. [ ] Login as a different user
7. [ ] Navigate to DMs view
8. [ ] **VERIFY**: See the conversation in the list
9. [ ] Click on the conversation
10. [ ] **VERIFY**: See the message you sent from the first user
11. [ ] Send a reply from the second user
12. [ ] **VERIFY**: Reply appears in first user's window instantly
13. [ ] Continue conversation back and forth
14. [ ] **VERIFY**: All messages appear in real-time for both users

### Test Steps - DM List Features
1. [ ] Send messages in multiple DM conversations
2. [ ] Navigate back to DM list
3. [ ] **VERIFY**: All conversations appear in the list
4. [ ] **VERIFY**: Last message preview shows for each conversation
5. [ ] **VERIFY**: Timestamps show for last messages
6. [ ] **VERIFY**: Online/offline status dots appear
7. [ ] Click different conversations
8. [ ] **VERIFY**: Can switch between conversations smoothly
9. [ ] **VERIFY**: Messages persist when switching back

### Test Steps - Integration with Channels
1. [ ] In DMs view, send a message
2. [ ] Click "Channels" button
3. [ ] **VERIFY**: Returns to channels view
4. [ ] Send a message in a channel
5. [ ] Click "DMs" button
6. [ ] **VERIFY**: Returns to DMs view
7. [ ] **VERIFY**: Previous DM conversation still visible
8. [ ] **VERIFY**: No data loss when switching views

---

## General Application Tests

### Performance Tests
1. [ ] Check browser console for errors
2. [ ] **VERIFY**: No 404 errors for missing resources
3. [ ] **VERIFY**: No CORS warnings
4. [ ] **VERIFY**: WebSocket connection established
5. [ ] Check Network tab for API calls
6. [ ] **VERIFY**: API responses are under 500ms
7. [ ] **VERIFY**: WebSocket messages deliver instantly

### UI/UX Tests
1. [ ] **VERIFY**: All buttons have hover effects
2. [ ] **VERIFY**: Avatar initials display correctly
3. [ ] **VERIFY**: Timestamps format correctly
4. [ ] **VERIFY**: Scrolling works smoothly in message lists
5. [ ] **VERIFY**: Loading states appear during operations
6. [ ] **VERIFY**: Empty states show helpful messages
7. [ ] **VERIFY**: UI is responsive and professional

### Error Handling Tests
1. [ ] Try to send empty message
2. [ ] **VERIFY**: Send button disabled when input empty
3. [ ] Try rapid clicking of buttons
4. [ ] **VERIFY**: No duplicate messages or errors
5. [ ] Refresh page during operations
6. [ ] **VERIFY**: Application recovers gracefully

---

## Backend API Tests

### Emoji Reactions API
```bash
# Test reaction endpoint
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/messages/{message_id}/reactions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"emoji":"👍"}'
```
**Expected**: 200 OK, returns updated reactions array

### Direct Messages API
```bash
# Test get all users
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/users \
  -H "Authorization: Bearer {token}"
```
**Expected**: 200 OK, returns array of users

```bash
# Test get conversations
curl https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages/conversations \
  -H "Authorization: Bearer {token}"
```
**Expected**: 200 OK, returns array of conversations

```bash
# Test send DM
curl -X POST https://backend-api-morphvm-q7b1njcb.http.cloud.morph.so/api/direct-messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":2,"content":"Hello!"}'
```
**Expected**: 201 Created, returns message object

---

## WebSocket Tests

### Test WebSocket Connection
1. [ ] Open browser DevTools → Network tab
2. [ ] Filter by "WS" (WebSocket)
3. [ ] **VERIFY**: Connection to backend WebSocket established
4. [ ] **VERIFY**: "authenticated" event received
5. [ ] Send a message or reaction
6. [ ] **VERIFY**: See WebSocket event in DevTools
7. [ ] **VERIFY**: See corresponding event in console logs

### Test Real-time Events
1. [ ] Monitor console for WebSocket events:
   - `new_message` - When messages sent
   - `new_reaction` - When reactions added
   - `new_direct_message` - When DMs sent
   - `user_status` - When users connect/disconnect
2. [ ] **VERIFY**: All events fire correctly
3. [ ] **VERIFY**: No event duplication
4. [ ] **VERIFY**: Events trigger UI updates

---

## Regression Tests

### Existing Features Still Work
1. [ ] Workspace creation
2. [ ] Channel creation
3. [ ] Channel messaging
4. [ ] Channel switching
5. [ ] Workspace switching
6. [ ] User authentication
7. [ ] User registration
8. [ ] Logout functionality

---

## Pass/Fail Criteria

### PASS ✅
- All test steps complete successfully
- No console errors
- Real-time updates work
- UI is responsive and professional
- All existing features still work

### FAIL ❌
- Any critical functionality broken
- Console errors appearing
- WebSocket connection failures
- UI broken or unresponsive
- Data loss or corruption

---

## Issue Reporting

If any tests fail, please report with:
1. Test step number that failed
2. Expected behavior
3. Actual behavior
4. Browser console errors (if any)
5. Screenshots (if applicable)
6. Browser and OS version

---

## Status

**Date Tested**: _____________
**Tested By**: _____________
**Overall Result**: ☐ PASS ☐ FAIL
**Notes**: _____________________________________________

