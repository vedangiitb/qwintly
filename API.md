# Qwintly API Documentation

Welcome to the **Qwintly API Reference**. This document provides comprehensive documentation for all 23 active API endpoints within the `/api` directory of the Qwintly project.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Authentication](#authentication)
- [Response Wrappers & Formats](#response-wrappers--formats)
- [API Route Reference](#api-route-reference)
  - [1. Account Endpoints](#1-account-endpoints)
  - [2. Bring Your Own Key (BYOK) Endpoints](#2-bring-your-own-key-byok-endpoints)
  - [3. Chat Endpoints](#3-chat-endpoints)
  - [4. Generation & Deployment Endpoints](#4-generation--deployment-endpoints)
  - [5. Preferences Endpoints](#5-preferences-endpoints)

---

## Overview & Architecture

Qwintly's backend is powered by Next.js API Routes (using the App Router). It implements a service-repository pattern, delegating business logic to features-specific service files. All route files are dynamically executed in the standard Node.js runtime unless stated otherwise.

---

## Authentication

All protected endpoints require authentication using a **Supabase JWT**.

- **Header Format**: `Authorization: Bearer <Supabase_JWT_Token>`
- **Token Verification**: Handled by `@/lib/verifyToken` which validates the signature using Supabase credentials and retrieves the authenticated user's ID via `supabase.auth.getUser()`.
- **Unauthorized Status**: Returns an `HTTP 401 Unauthorized` error if the token is missing, expired, or invalid.

---

## Response Wrappers & Formats

Most endpoints are wrapped using standard helper wrappers defined in `@/lib/apiHandler.ts`. This ensures uniform response formatting.

### 1. Standard Success Response
Returned by `ApiResponse.success` with an `HTTP 200` status:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### 2. Standard Error Response
Returned by `ApiResponse.error` with a `4xx` or `5xx` status:
```json
{
  "success": false,
  "data": null,
  "error": "Detailed error message describing the failure"
}
```

### 3. Server-Sent Events (SSE) Stream
Streaming routes use the `streamHandler` wrapper or return a custom stream. These return a `text/event-stream` response with the following headers:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no` (critical for Nginx/reverse proxy setups)

---

## API Route Reference

### 1. Account Endpoints

#### `GET /api/account/daily-messages`
Retrieves the authenticated user's message usage count for the current day.
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response Data (`data` field)**:
  ```json
  {
    "used": 15,
    "limit": 100,
    "remaining": 85
  }
  ```

---

### 2. Bring Your Own Key (BYOK) Endpoints

These endpoints allow users to configure and use their own LLM API keys.

#### `POST /api/byok/create-new-key`
Stores a new API provider key for the user.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `provider` | `string` | Yes | The LLM provider (e.g., `"openai"`, `"anthropic"`, `"google"`). |
  | `apiKey` | `string` | Yes | The secret API key from the provider. |
- **Response Data (`data` field)**:
  ```json
  {
    "keyId": "key_uuid_12345",
    "provider": "openai",
    "createdAt": "2026-05-28T19:33:00.000Z"
  }
  ```

#### `POST /api/byok/delete-key`
Removes a stored LLM key by ID.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `keyId` | `string` | Yes | The unique identifier of the key to delete. |
- **Response Data (`data` field)**:
  ```json
  {
    "success": true,
    "message": "API key successfully removed"
  }
  ```

#### `GET /api/byok/get-key-details`
Lists all registered BYOK credentials for the authenticated user (with masked credentials).
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response Data (`data` field)**:
  ```json
  [
    {
      "keyId": "key_uuid_12345",
      "provider": "openai",
      "createdAt": "2026-05-28T14:03:00Z"
    }
  ]
  ```

#### `GET /api/byok/get-models`
Fetches a list of LLM models available to the authenticated user based on their BYOK providers.
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response Data (`data` field)**:
  ```json
  [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "openai"
    },
    {
      "id": "claude-3-5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "provider": "anthropic"
    }
  ]
  ```

#### `POST /api/byok/update-key`
Updates the provider or credentials for an existing key.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `keyId` | `string` | Yes | The unique identifier of the key to update. |
  | `apiKey` | `string` | Yes | The new secret API key value. |
  | `provider` | `string` | Yes | The provider type (e.g., `"openai"`). |
- **Response Data (`data` field)**:
  ```json
  {
    "keyId": "key_uuid_12345",
    "provider": "openai",
    "updatedAt": "2026-05-28T19:33:00.000Z"
  }
  ```

---

### 3. Chat Endpoints

Handles conversational agents, thread persistence, and streaming responses.

#### `POST /api/chat/create-new-chat`
Initializes a new conversational chat thread.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `prompt` | `string` | Yes | The initial prompt or instruction to start the chat. |
- **Response Data (`data` field)**:
  ```json
  {
    "id": "chat_uuid_98765"
  }
  ```

#### `GET /api/chat/fetch-chat-info`
Retrieves structural metadata and current status for a specific chat.
- **Auth Required**: Yes
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat. |
- **Response Data (`data` field)**:
  ```json
  {
    "questionAnswers": [],
    "plans": [],
    "siteUrl": "https://example.com/site",
    "previewUrl": "https://example.com/preview",
    "isGenerating": false
  }
  ```

#### `GET /api/chat/fetch-chat-messages`
Fetches a paginated history of messages in a given chat thread.
- **Auth Required**: Yes
- **Query Parameters**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | - | The unique identifier of the chat. |
  | `limit` | `number` | No | `10` | Number of messages to retrieve (clamped `1` to `50`). |
  | `cursor` | `string` | No | - | Cursor token for pagination. |
- **Response Data (`data` field)**:
  ```json
  {
    "messages": [
      {
        "id": "msg_01",
        "role": "user",
        "content": "Hello, build me a website",
        "createdAt": "2026-05-28T14:10:00Z"
      }
    ],
    "nextCursor": "cursor_token_abc123"
  }
  ```

#### `GET /api/chat/fetch-user-chats`
Retrieves a paginated list of all chat threads created by the authenticated user.
- **Auth Required**: Yes
- **Query Parameters**:
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `limit` | `number` | No | `10` | Number of chats to retrieve (clamped `1` to `50`). |
  | `cursor` | `string` | No | - | Cursor token for pagination. |
- **Response Data (`data` field)**:
  ```json
  {
    "chats": [
      {
        "id": "chat_uuid_98765",
        "title": "Build me a portfolio",
        "createdAt": "2026-05-28T14:00:00Z"
      }
    ],
    "nextCursor": "cursor_token_xyz789"
  }
  ```

#### `POST /api/chat/stream`
Sends a message to the website generator agent and streams the response via Server-Sent Events (SSE).
- **Auth Required**: Yes
- **Format**: Server-Sent Events (`text/event-stream`)
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The ID of the current chat thread. |
  | `message` | `string` | Yes | The user's message input. |
- **Event Stream Payloads**:
  - **Text Delta (Token streaming)**:
    ```
    data: {"type":"text","delta":"Indeed, let me start by..."}
    
    ```
  - **Complete (Finished message)**:
    ```
    data: {"type":"done","agentMessageId":"msg_agent_999","response":"Full response text","toolCall":null}
    
    ```
  - **Error handling**:
    ```
    data: {"type":"error","message":"Detailed error string"}
    
    ```

#### `POST /api/chat/submit-answers`
Submits user answers to the onboarding/preference questions and triggers agent stream responses.
- **Auth Required**: Yes
- **Format**: Server-Sent Events (`text/event-stream`)
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The ID of the current chat thread. |
  | `answers` | `Array` | Yes | An array of user responses to questions. |
  | `questionSetId`| `string` | No | Optional identifier for the set of questions answered. |
- **Event Stream Payloads**:
  - **Text Delta**:
    ```
    data: {"type":"text","delta":"Parsing your input..."}
    
    ```
  - **Complete**:
    ```
    data: {"type":"done","agentMessageId":"msg_agent_001","response":"Full agent plan outline","toolCall":null,"status":"success","questionSetId":"set_123"}
    
    ```
  - **Error handling**:
    ```
    data: {"type":"error","message":"Invalid answers array format"}
    
    ```

---

### 4. Generation & Deployment Endpoints

Handles generation tasks, layout approvals, live progress streaming, and hosting deployments.

#### `POST /api/generate/approve-plan`
Approves a proposed code plan for a chat thread, starting the code generation sequence.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat thread. |
  | `planId` | `string` | Yes | The ID of the plan being approved. |
- **Response Data (`data` field)**:
  ```json
  {
    "success": true,
    "generationId": "gen_session_abcde",
    "status": "triggered"
  }
  ```

#### `POST /api/generate/deploy-app`
Triggers production deployment of the generated web application.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat thread. |
  | `sessionId` | `string` | Yes | The generation session ID to deploy. |
- **Response Data (`data` field)**:
  ```json
  {
    "deploymentId": "deploy_12345",
    "url": "https://qwintly.app/deployments/deploy_12345",
    "status": "initiating"
  }
  ```

#### `GET /api/generate/fetch-gen-summary`
Fetches a detailed summary description of the generated site for a specific generation task.
- **Auth Required**: Yes
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `msgId` | `string` | Yes | The message ID associated with the generation task. |
- **Response Data (`data` field)**:
  ```json
  {
    "summary": "This site contains a beautiful pricing page and integration guidelines...",
    "files": ["index.html", "style.css", "script.js"],
    "featuresAdded": ["Dark mode toggle", "Contact Form"]
  }
  ```

#### `GET /api/generate/fetch-status`
A dedicated Server-Sent Events (SSE) route to track real-time status and logs of a code generation or deployment run.
- **Auth Required**: Yes (using Bearer token)
- **Format**: Server-Sent Events (`text/event-stream`)
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat. |
  | `sessionId` | `string` | No | The specific session ID to monitor. |
- **Response Headers**: Returns custom SSE headers. Does not use standard `getHandler` wrapper.
- **Event Stream Example**:
  ```
  data: {"status":"generating","percentage":45,"step":"Generating components...","logs":["Writing index.html","Creating main.css"]}
  
  ```

#### `POST /api/generate/retry-deploy`
Attempts to redeploy a failed deployment by referencing its prior failed session deployment ID.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat. |
  | `sessionId` | `string` | Yes | The failed deployment ID to retry. |
- **Response Data (`data` field)**:
  ```json
  {
    "deploymentId": "deploy_retry_67890",
    "status": "triggered"
  }
  ```

#### `POST /api/generate/retry-generate`
Attempts to regenerate a prior code generation step that failed or was cancelled.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `chatId` | `string` | Yes | The unique identifier of the chat. |
  | `sessionId` | `string` | Yes | The failed generation session ID. |
- **Response Data (`data` field)**:
  ```json
  {
    "generationId": "gen_retry_78901",
    "status": "retrying"
  }
  ```

#### `POST /api/generate/save-edits`
Saves manual edits made to code components inside a preview session.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `route` | `string` | Yes | The route or file path where edits are being applied (e.g. `"/index.html"`). |
  | `operations` | `Array` | Yes | A list of granular edit operations/patches to apply. |
  | `genId` | `string` | No | The generation identifier of the target snapshot. |
- **Response Data (`data` field)**:
  ```json
  {
    "success": true,
    "updatedAt": "2026-05-28T19:33:00.000Z",
    "snapshotId": "snapshot_uuid_9999"
  }
  ```

---

### 5. Preferences Endpoints

Manages active configurations, default parameters, and AI model choices.

#### `GET /api/preferences/byok-toggle`
Toggles and sets the Bring Your Own Key state for the user using a URL parameter.
- **Auth Required**: Yes
- **Query Parameters**:
  | Parameter | Type | Required | Values | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `byokEnabled` | `string` | Yes | `"true"`, `"false"` | Toggles whether BYOK is activated. |
- **Response Data (`data` field)**:
  ```json
  {
    "byokEnabled": true
  }
  ```

#### `POST /api/preferences/byok-toggle`
Toggles the Bring Your Own Key state for the user using a JSON body request.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `byokEnabled` | `boolean` | Yes | `true` or `false` to toggle BYOK mode. |
- **Response Data (`data` field)**:
  ```json
  {
    "byokEnabled": true
  }
  ```

#### `GET /api/preferences/get-preferences`
Retrieves all preferred workspace configurations (selected model, default provider, BYOK status).
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response Data (`data` field)**:
  ```json
  {
    "preferredModel": "claude-3-5-sonnet",
    "preferredProvider": "anthropic",
    "byokEnabled": true
  }
  ```

#### `POST /api/preferences/update-model`
Updates the user's preferred LLM model choice.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `model` | `string` | Yes | The identifier of the preferred model (e.g. `"gpt-4o"`). |
- **Response Data (`data` field)**:
  ```json
  {
    "preferredModel": "gpt-4o"
  }
  ```

#### `POST /api/preferences/update-provider`
Updates the user's preferred LLM provider choice.
- **Auth Required**: Yes
- **Request Body**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `provider` | `string` | Yes | The identifier of the preferred provider (e.g. `"openai"`). |
- **Response Data (`data` field)**:
  ```json
  {
    "preferredProvider": "openai"
  }
  ```
