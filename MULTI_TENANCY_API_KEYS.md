# Multi-Tenancy API Key Management

This document describes the implementation of user-specific API key management for the AiAppsy Web Studio.

## Overview

Each user brings their own OpenRouter API key to use AI features. This ensures:
- **Privacy**: Each user's API key is stored securely and used only for their requests
- **Cost Control**: Users pay only for their own AI usage
- **Scalability**: No shared API limits or costs
- **Security**: API keys are encrypted and isolated per user

## Database Schema

```prisma
model User {
  id         String      @id @default(cuid())
  email      String      @unique
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  name       String?
  openRouterApiKey String? // User's personal OpenRouter API key
  sessions   Session[]
  workspaces Workspace[]
}
```

## API Endpoints

### GET /api/user/api-key
Returns the user's API key status (masked for security).

**Response:**
```json
{
  "hasApiKey": true,
  "apiKey": "sk-*******************abc123"
}
```

### POST /api/user/api-key
Updates or sets the user's API key.

**Request:**
```json
{
  "apiKey": "sk-or-v1-..."
}
```

**Response:**
```json
{
  "message": "API key updated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### DELETE /api/user/api-key
Removes the user's API key.

**Response:**
```json
{
  "message": "API key removed successfully"
}
```

## AI Endpoints

All AI endpoints now use the user's personal API key:

- `/api/ai/chat` - Chat completion
- `/api/ai/code-completion` - Code completion
- `/api/ai/generate-code` - Code generation

If a user hasn't set up their API key, they receive:
```json
{
  "error": "API key required",
  "message": "Please set up your OpenRouter API key in settings to use AI features"
}
```

## Frontend Components

### ApiKeySettings Component
Located at `/src/components/ApiKeySettings.tsx`

Features:
- Display current API key status (masked)
- Add/update API key
- Remove API key
- Validation and error handling
- Security-focused UI with masked display

### AIAssistant Component
Updated to check API key status and show setup prompt if needed.

## Security Features

1. **API Key Masking**: API keys are always masked in the UI (`sk-*******************abc123`)
2. **Server-Side Validation**: All API keys validated server-side before storage
3. **Encryption**: API keys stored securely in database
4. **User Isolation**: Each user can only access their own API key
5. **Input Validation**: API key format validation before storage

## User Experience

1. **New Users**: See API key setup prompt in AI Assistant
2. **Existing Users**: Can manage API keys in settings panel
3. **Error Handling**: Clear error messages for missing/invalid API keys
4. **Security**: API keys never exposed in logs or client-side code

## Implementation Notes

- Uses NextAuth.js for session management
- Prisma ORM for database operations
- JWT tokens for secure authentication
- Multi-tenancy architecture ensures data isolation
- All API endpoints require authentication

## Benefits

✅ **Cost Transparency**: Users see their own AI usage costs
✅ **Privacy**: No API key sharing between users
✅ **Scalability**: No centralized API limits
✅ **Security**: Each user's data is isolated
✅ **Flexibility**: Users can choose their AI models and providers